import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories/userRepository";
import { telegramService } from "@/lib/services/telegramService";
import { authRateLimiter } from "@/lib/security/rateLimiter";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";
  try {
    // MED-005: CSRF — validate origin
    const origin = request.headers.get("origin");
    if (origin && !origin.includes("sponsorajobs.com") && !origin.includes("localhost")) {
      return NextResponse.json({ success: false, error: "Request origin not allowed." }, { status: 403 });
    }

    // MED-002: Rate limit registrations per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limitCheck = authRateLimiter.check(`register_${ip}`);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, password, profession, promoCode } = body;

    if (!email || !email.includes("@") || email.length > 254) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { success: false, error: "Password must be 6–128 characters long." },
        { status: 400 }
      );
    }

    if (!name || name.trim().length === 0 || name.length > 100) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name (max 100 characters)." },
        { status: 400 }
      );
    }

    if (!profession || profession.trim().length === 0 || profession.length > 200) {
      return NextResponse.json(
        { success: false, error: "Please enter your profession / target role (max 200 characters)." },
        { status: 400 }
      );
    }

    // ── PROMO CODE VERIFICATION (sumit_raj_linkedin) ──
    const isValidCode = userRepository.isValidPromoCode(promoCode);
    if (!isValidCode) {
      return NextResponse.json(
        {
          success: false,
          requireTrial: true,
          error: "Invalid or missing invite promo code. A valid authorized promo code is required to register immediately. Alternatively, please request Free Trial Access.",
        },
        { status: 403 }
      );
    }

    const user = await userRepository.createUser({
      name,
      email,
      password,
      profession,
      promoCode,
    });

    // Notify Telegram in background
    try {
      telegramService.notifyUserRegistered({
        name: user.name,
        email: user.email,
        profession: user.profession,
        promoCode: user.promoCodeUsed,
      }).catch(console.error);
    } catch (e) {
      console.error(e);
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      profession: user.profession,
      promoCodeUsed: user.promoCodeUsed,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      message: "Account successfully created and verified!",
      user: sessionPayload,
    });

    // Set user session cookie (30 days)
    response.cookies.set("sa_user_session", JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: isDev ? (err.message || "Registration failed.") : "Registration failed. Please try again." },
      { status: 400 }
    );
  }
}
