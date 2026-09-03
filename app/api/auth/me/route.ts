import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/lib/repositories/userRepository";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("sa_user_session");
  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ success: false, user: null });
  }

  try {
    const cookieUser = JSON.parse(sessionCookie.value);
    if (cookieUser?.email) {
      const dbUser = await userRepository.findByEmail(cookieUser.email).catch(() => null);
      if (dbUser) {
        const mergedUser = {
          ...cookieUser,
          name: dbUser.name || cookieUser.name,
          profession: dbUser.profession || cookieUser.profession,
          isEmailVerified: dbUser.isEmailVerified ?? cookieUser.isEmailVerified,
          subscriptionTier: dbUser.subscriptionTier || cookieUser.subscriptionTier || (dbUser.isTrial ? "PRO" : "FREE"),
          subscriptionStatus: dbUser.subscriptionStatus || cookieUser.subscriptionStatus || "ACTIVE",
          subscriptionStartedAt: dbUser.subscriptionStartedAt || cookieUser.subscriptionStartedAt || dbUser.createdAt,
          proExpiresAt: dbUser.proExpiresAt || cookieUser.proExpiresAt,
          planCode: dbUser.planCode || cookieUser.planCode,
          planLabel: dbUser.planLabel || cookieUser.planLabel,
          amountPaid: dbUser.amountPaid ?? cookieUser.amountPaid,
          currencyPaid: dbUser.currencyPaid || cookieUser.currencyPaid,
          createdAt: dbUser.createdAt || cookieUser.createdAt,
        };
        const response = NextResponse.json({ success: true, user: mergedUser });
        // Refresh session cookie with up-to-date subscription tier and pro expiry
        response.cookies.set("sa_user_session", JSON.stringify(mergedUser), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 365 * 24 * 60 * 60,
          path: "/",
        });
        return response;
      }
    }
    return NextResponse.json({ success: true, user: cookieUser });
  } catch {
    return NextResponse.json({ success: false, user: null });
  }
}
