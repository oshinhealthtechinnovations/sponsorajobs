"use client";

import { useState, useEffect } from "react";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  profession?: string;
  isEmailVerified?: boolean;
}

interface UseSessionResult {
  user: SessionUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

/**
 * Reads the sa_user_session cookie on the client to determine auth state.
 * Makes a lightweight call to /api/auth/me — cached for 30s in-memory
 * so every JobCard doesn't hammer the server.
 */
let _cache: { user: SessionUser | null; ts: number } | null = null;
const CACHE_TTL_MS = 30_000;

export function useSession(): UseSessionResult {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // Use in-memory cache to avoid redundant requests
      if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS) {
        if (!cancelled) {
          setUser(_cache.user);
          setIsLoading(false);
        }
        return;
      }

      // Quick cookie check before hitting the network
      const hasCookie = document.cookie.includes("sa_user_session=");
      if (!hasCookie) {
        _cache = { user: null, ts: Date.now() };
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        const resolved = data.success && data.user ? data.user : null;
        _cache = { user: resolved, ts: Date.now() };
        if (!cancelled) {
          setUser(resolved);
        }
      } catch {
        _cache = { user: null, ts: Date.now() };
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    // Invalidate cache on auth events
    const invalidate = () => {
      _cache = null;
      load();
    };
    window.addEventListener("user-session-changed", invalidate);

    return () => {
      cancelled = true;
      window.removeEventListener("user-session-changed", invalidate);
    };
  }, []);

  return { user, isLoggedIn: !!user, isLoading };
}
