import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "sa_admin_session";

export function getAdminSecret(): string {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    // Only used in local dev without env var set
    return "__dev_only_change_in_production__";
  }
  return secret;
}

export function isValidAdminSecret(secret: string): boolean {
  if (!secret || typeof secret !== "string") return false;
  const cleanSecret = secret.trim();
  const configuredSecret = process.env.ADMIN_SECRET?.trim();
  if (!configuredSecret) return false;
  return cleanSecret === configuredSecret;
}

/**
 * Validate admin session from Request or Next.js Cookies
 */
export async function verifyAdminSession(req?: NextRequest): Promise<boolean> {
  const adminSecret = getAdminSecret();

  // 1. Check Authorization header (for API calls)
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader === `Bearer ${adminSecret}`) {
      return true;
    }
  }

  // 2. Check HTTP-only cookie
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (sessionCookie && sessionCookie.value === adminSecret) {
      return true;
    }
  } catch {
    // In environments where cookies() cannot be read synchronously
  }

  return false;
}

export const ADMIN_COOKIE_CONFIG = {
  name: ADMIN_COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
