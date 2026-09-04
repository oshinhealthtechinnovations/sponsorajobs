"use client";

import { useState, useEffect } from "react";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  profession?: string;
  isEmailVerified?: boolean;
  isTrial?: boolean;
  subscriptionTier?: "FREE" | "PRO" | string;
  subscriptionStatus?: string;
  subscriptionStartedAt?: string;
  proExpiresAt?: string;
  planCode?: string;
  planLabel?: string;
  amountPaid?: number;
  currencyPaid?: string;
  createdAt?: string;
}

export function checkUserIsPro(user: SessionUser | null | undefined): boolean {
  if (!user) return false;
  const tier = (user.subscriptionTier || "").toUpperCase();
  if (tier === "PRO") return true;
  if (Boolean(user.isTrial)) return true;
  if (
    user.subscriptionStatus === "ACTIVE" &&
    (Boolean(user.planCode) || Boolean(user.amountPaid) || Boolean(user.proExpiresAt))
  ) {
    return true;
  }
  if (user.proExpiresAt) {
    const expiryTime = new Date(user.proExpiresAt).getTime();
    if (!isNaN(expiryTime) && expiryTime > Date.now()) {
      return true;
    }
  }
  return false;
}

export interface UseSessionResult {
  user: SessionUser | null;
  isLoggedIn: boolean;
  isPro: boolean;
  isLoading: boolean;
}

let _cache: { user: SessionUser | null; ts: number } | null = null;
const CACHE_TTL_MS = 30_000;

export function useSession(): UseSessionResult {
  const [user, setUser] = useState<SessionUser | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sa_user");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // 1. Check in-memory cache
      if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
        if (!cancelled) {
          setUser(_cache.user);
          setIsLoading(false);
        }
        return;
      }

      // 2. Synchronous fallback to localStorage for immediate UI responsiveness
      let localFallback: SessionUser | null = null;
      try {
        const stored = localStorage.getItem("sa_user");
        if (stored) localFallback = JSON.parse(stored);
      } catch {}

      if (localFallback && !cancelled) {
        setUser(localFallback);
      }

      // 3. Verify against backend /api/auth/me (HTTP-only cookie transmitted automatically via credentials: include)
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        const resolved: SessionUser | null = data.success && data.user ? data.user : null;

        _cache = { user: resolved, ts: Date.now() };

        if (!cancelled) {
          setUser(resolved);
          if (resolved) {
            localStorage.setItem("sa_user", JSON.stringify(resolved));
          } else {
            localStorage.removeItem("sa_user");
          }
        }
      } catch {
        // In case of network glitch, preserve localFallback if valid
        _cache = { user: localFallback, ts: Date.now() };
        if (!cancelled) setUser(localFallback);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    // Invalidate cache on auth events & cross-tab storage changes
    const invalidate = () => {
      _cache = null;
      load();
    };

    window.addEventListener("user-session-changed", invalidate);
    window.addEventListener("storage", invalidate);

    return () => {
      cancelled = true;
      window.removeEventListener("user-session-changed", invalidate);
      window.removeEventListener("storage", invalidate);
    };
  }, []);

  const isPro = checkUserIsPro(user);
  return { user, isLoggedIn: !!user, isPro, isLoading };
}
