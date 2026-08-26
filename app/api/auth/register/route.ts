import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories/userRepository";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, profession, promoCode } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400 }
      );
    }

    if (!profession || profession.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Please enter your profession / target role." },
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
          error: "Invalid or missing invite promo code. An authorized promo code ('sumit_raj_linkedin') is required to create an account immediately. Alternatively, please request Free Trial Access or message Sumit Raj on LinkedIn for a direct referral code.",
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
      httpOnly: false, // Allow client reading for instant UI reactivity
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Registration failed." },
      { status: 400 }
    );
  }
}
