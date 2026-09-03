import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories/userRepository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await userRepository.authenticate(cleanEmail, password);

    if (!user) {
      const existingUser = await userRepository.findByEmail(cleanEmail);
      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: "No account found with this email. Please switch to 'Create Account' to register.",
            noAccount: true,
          },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Incorrect password. You can reset it using 'Forgot Password?' below." },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      profession: user.profession,
      promoCodeUsed: user.promoCodeUsed,
      isEmailVerified: user.isEmailVerified,
      subscriptionTier: user.subscriptionTier || (user.isTrial ? "PRO" : "FREE"),
      subscriptionStatus: user.subscriptionStatus || "ACTIVE",
      subscriptionStartedAt: user.subscriptionStartedAt || user.createdAt,
      proExpiresAt: user.proExpiresAt,
      planCode: user.planCode,
      planLabel: user.planLabel,
      amountPaid: user.amountPaid,
      currencyPaid: user.currencyPaid,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
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
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      { success: false, error: isDev ? (err.message || "Authentication failed.") : "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
