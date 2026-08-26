import { NextRequest, NextResponse } from "next/server";
import { getAdminSecret, isValidAdminSecret, ADMIN_COOKIE_CONFIG } from "@/lib/services/adminAuth";

export const runtime = "edge";

// In-memory rate limiting map for edge runtime: IP -> { attempts: number, resetAt: number }
const loginRateLimitMap = new Map<string, { attempts: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginRateLimitMap.get(ip);

  if (!record) return false;

  if (now > record.resetAt) {
    loginRateLimitMap.delete(ip);
    return false;
  }

  return record.attempts >= 10;
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = loginRateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    loginRateLimitMap.set(ip, {
      attempts: 1,
      resetAt: now + 5 * 60 * 1000, // 5 minutes window
    });
  } else {
    record.attempts += 1;
  }
}

function resetRateLimit(ip: string) {
  loginRateLimitMap.delete(ip);
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

    // Check valid secret first (if correct password provided, grant access and clear lockout)
    if (secret && typeof secret === "string" && isValidAdminSecret(secret)) {
      resetRateLimit(ip);
      const serverSecret = getAdminSecret();
      const response = NextResponse.json({ success: true, message: "Authentication successful." });
      response.cookies.set(ADMIN_COOKIE_CONFIG.name, serverSecret, ADMIN_COOKIE_CONFIG.options);
      return response;
    }

    // Check rate limit for failed attempts
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many failed attempts. Please check your password and try again in a few minutes.",
        },
        { status: 429 }
      );
    }

    recordFailedAttempt(ip);
    return NextResponse.json(
      {
        success: false,
        error: "Invalid admin secret key.",
      },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
