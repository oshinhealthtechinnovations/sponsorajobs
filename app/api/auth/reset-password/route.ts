import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories/userRepository";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otpCode, newPassword, resetToken } = body || {};

    if (!email || !otpCode || !newPassword) {
      return NextResponse.json(
        { error: "Email, 6-digit verification code, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Verify OTP and reset password
    const user = await userRepository.verifyAndResetPassword(
      email.trim().toLowerCase(),
      otpCode.trim(),
      newPassword,
      resetToken
    );

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      profession: user.profession,
      promoCodeUsed: user.promoCodeUsed,
      createdAt: user.createdAt,
    };

    const res = NextResponse.json({
      success: true,
      message: "Password reset successful! You are now logged in.",
      user: sessionPayload,
    });

    res.cookies.set("sa_user_session", JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to reset password. Please check your code." },
      { status: 400 }
    );
  }
}
