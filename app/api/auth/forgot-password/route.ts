import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories/userRepository";
import { EmailService } from "@/lib/services/emailService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body || {};

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Generate 6-digit Reset OTP
    const { resetCode, resetToken, user } = await userRepository.createPasswordResetRequest(cleanEmail);

    // 2. Dispatch Reset Email via Hybrid Engine (Resend + Gmail SMTP)
    const emailService = new EmailService();
    const dispatch = await emailService.sendPasswordResetEmail(cleanEmail, resetCode, user.name);

    return NextResponse.json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${cleanEmail}.`,
      resetToken,
      otpPreview: dispatch.provider === "simulated" ? resetCode : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process password reset request." },
      { status: 400 }
    );
  }
}
