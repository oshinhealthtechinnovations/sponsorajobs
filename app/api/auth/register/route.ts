import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories/userRepository";
import { telegramService } from "@/lib/services/telegramService";
import { EmailService } from "@/lib/services/emailService";
import { authRateLimiter } from "@/lib/security/rateLimiter";

export async function POST(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";
  try {
    // CSRF — validate origin
    const origin = request.headers.get("origin");
    if (origin && !origin.includes("sponsorajobs.com") && !origin.includes("localhost")) {
      return NextResponse.json({ success: false, error: "Request origin not allowed." }, { status: 403 });
    }

    // Rate limit registrations per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limitCheck = authRateLimiter.check(`register_${ip}`);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { action, email, password, name, profession, promoCode, otpCode } = body;

    // ─────────────────────────────────────────────────────────────
    // STEP 2: VERIFY OTP CODE & ACTIVATE ACCOUNT
    // ─────────────────────────────────────────────────────────────
    if (action === "verify_otp" || otpCode) {
      if (!email || !otpCode || otpCode.trim().length < 6) {
        return NextResponse.json(
          { success: false, error: "Please enter the complete 6-digit verification code." },
          { status: 400 }
        );
      }

      const user = await userRepository.verifyAndCreateUser(email, otpCode.trim());

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
        isEmailVerified: true,
        createdAt: user.createdAt,
      };

      const response = NextResponse.json({
        success: true,
        message: "Email verified and account successfully activated!",
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
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 2B: RESEND REGISTRATION OTP
    // ─────────────────────────────────────────────────────────────
    if (action === "resend_otp") {
      if (!email) {
        return NextResponse.json({ success: false, error: "Email is required to resend code." }, { status: 400 });
      }

      const freshCode = await userRepository.resendRegistrationOtp(email);
      const emailService = new EmailService();
      await emailService.sendVerificationCodeEmail(email, freshCode);

      return NextResponse.json({
        success: true,
        message: "A fresh 6-digit verification code has been dispatched to your email.",
      });
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 1: VALIDATE DETAILS & SEND INITIAL 6-DIGIT OTP
    // ─────────────────────────────────────────────────────────────
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

    // Create pending registration and send 6-digit OTP code
    const { otpCode: generatedCode } = await userRepository.createPendingRegistration({
      name,
      email,
      password,
      profession,
      promoCode,
    });

    const emailService = new EmailService();
    const dispatch = await emailService.sendVerificationCodeEmail(email, generatedCode, name);

    return NextResponse.json({
      success: true,
      step: "otp_required",
      email: email.trim().toLowerCase(),
      user: {
        id: "pending",
        name: name.trim(),
        email: email.trim().toLowerCase(),
        profession: profession.trim(),
        promoCodeUsed: promoCode ? promoCode.trim().toLowerCase() : "",
      },
      message: `A 6-digit verification code has been sent to ${email}.`,
      provider: dispatch.provider,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: isDev ? (err.message || "Registration failed.") : (err.message || "Registration failed. Please try again.") },
      { status: 400 }
    );
  }
}
