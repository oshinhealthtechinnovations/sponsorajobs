import { NextRequest, NextResponse } from "next/server";
import { getAdminSecret, ADMIN_COOKIE_CONFIG } from "@/lib/services/adminAuth";

export const runtime = "edge";

// In-memory rate limiting map for edge runtime: IP -> { attempts: number, lastAttempt: number }
const loginRateLimitMap = new Map<string, { attempts: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginRateLimitMap.get(ip);

  if (!record) return false;

  if (now > record.resetAt) {
    loginRateLimitMap.delete(ip);
    return false;
  }

  return record.attempts >= 5;
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = loginRateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    loginRateLimitMap.set(ip, {
      attempts: 1,
      resetAt: now + 15 * 60 * 1000, // 15 minutes window
    });
  } else {
    record.attempts += 1;
  }
}

function resetRateLimit(ip: string) {
  loginRateLimitMap.delete(ip);
}

/**
 * Constant-time comparison to prevent timing attacks
 */
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";

  try {
    const body = await request.json();
    const { secret, action } = body;

    // Handle logout
    if (action === "logout") {
      const response = NextResponse.json({ success: true, message: "Logged out." });
      response.cookies.delete(ADMIN_COOKIE_CONFIG.name);
      return response;
    }

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed authentication attempts. Account locked for 15 minutes.",
        },
        { status: 429 }
      );
    }

    const serverSecret = getAdminSecret();

    if (!secret || typeof secret !== "string" || !timingSafeCompare(secret.trim(), serverSecret.trim())) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid admin secret key.",
        },
        { status: 401 }
      );
    }

    // Success: reset rate limit & issue secure session cookie
    resetRateLimit(ip);
    const response = NextResponse.json({ success: true, message: "Authentication successful." });
    response.cookies.set(ADMIN_COOKIE_CONFIG.name, serverSecret, ADMIN_COOKIE_CONFIG.options);
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
