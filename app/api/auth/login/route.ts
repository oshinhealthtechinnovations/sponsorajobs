import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories/userRepository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, clientAccountFallback } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await userRepository.authenticate(cleanEmail, password);

    // If not found in database or memory (e.g. serverless cold start before Supabase table is created)
    if (!user) {
      const existingUser = await userRepository.findByEmail(cleanEmail);
      if (!existingUser) {
        // Self-Healing: If client provided cached registration or a valid password, restore / auto-create account
        const fallbackName = clientAccountFallback?.name || cleanEmail.split("@")[0].replace(/[._]/g, " ");
        const fallbackProfession = clientAccountFallback?.profession || "Candidate";
        const fallbackPromo = clientAccountFallback?.promoCodeUsed || "";

        try {
          user = await userRepository.createUser({
            name: fallbackName,
            email: cleanEmail,
            password: password,
            profession: fallbackProfession,
            promoCode: fallbackPromo,
          });
        } catch {
          // If creation failed because account actually existed with different password
          return NextResponse.json(
            {
              success: false,
              error: "No account found with this email. Please switch to 'Create Account' or use 'Forgot Password?' to set up your password.",
              noAccount: true,
            },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: "Incorrect password. You can reset it using 'Forgot Password?' below." },
          { status: 401 }
        );
      }
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      profession: user.profession,
      promoCodeUsed: user.promoCodeUsed,
      isEmailVerified: user.isEmailVerified,
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
