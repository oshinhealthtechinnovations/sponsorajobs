import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories/userRepository";
import { EmailService } from "@/lib/services/emailService";
import { authRateLimiter } from "@/lib/security/rateLimiter";

/**
 * POST /api/auth/verify-email -> Verify 6-digit OTP code
 * PUT /api/auth/verify-email -> Request a new 6-digit OTP verification code
 */

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limitCheck = authRateLimiter.check(`verify_${ip}`);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many verification attempts. Please retry shortly." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: "Email and verification code are required." },
        { status: 400 }
      );
    }

    const isVerified = await userRepository.verifyEmailCode(email, code);
    if (!isVerified) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    const user = await userRepository.findByEmail(email);

    // Update active user session cookie with verified status
    const sessionPayload = {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      profession: user?.profession,
      promoCodeUsed: user?.promoCodeUsed,
      isEmailVerified: true,
      createdAt: user?.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      message: "Email address verified successfully!",
      user: sessionPayload,
    });

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
      { success: false, error: err.message || "Failed to verify email." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No candidate account found with this email." },
        { status: 404 }
      );
    }

    const code = await userRepository.generateVerificationCode(email);
    const emailService = new EmailService();
    const dispatch = await emailService.sendVerificationCodeEmail(email, code, user.name);

    return NextResponse.json({
      success: true,
      message: "A new 6-digit verification code has been sent to your email.",
      provider: dispatch.provider,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate verification code." },
      { status: 500 }
    );
  }
}
