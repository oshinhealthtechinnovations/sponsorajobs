import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/services/emailService";
import { AlertRepository } from "@/lib/repositories/alertRepository";
import { publicApiRateLimiter } from "@/lib/security/rateLimiter";

interface WaitlistPayload {
  email: string;
  name?: string;
  profession?: string;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("cf-connecting-ip") ||
      "anonymous_waitlist";

    const limitCheck = publicApiRateLimiter.check(`waitlist_${ip}`);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many requests. Please try again in ${limitCheck.resetTime} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = (await req.json()) as WaitlistPayload;

    if (!body?.email || !body.email.includes("@") || body.email.length > 254) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const email = body.email.trim().toLowerCase();
    const name = body.name?.trim();
    const profession = body.profession?.trim();

    // 1. Record the interest into alert repository (so they get early alerts & stay in database)
    try {
      const alertRepo = new AlertRepository();
      await alertRepo.createAlert({
        email,
        keyword: profession ? `Pro Waitlist: ${profession}` : "Pro Waitlist Candidate",
        country: "all",
        category: "all",
        frequency: "weekly",
      });
    } catch (err) {
      console.warn("[Waitlist] Error recording waitlist to DB:", err);
    }

    // 2. Dispatch the confirmation email asynchronously
    const emailService = new EmailService();
    try {
      await emailService.sendWaitlistConfirmationEmail(email, name, profession);
    } catch (err) {
      console.error("[Waitlist] Error dispatching confirmation email:", err);
    }

    return NextResponse.json({
      success: true,
      message: `🎉 You're on the waitlist! We sent a confirmation to ${email}.`,
    });
  } catch (err: any) {
    console.error("[Waitlist] API error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to join waitlist. Please try again." },
      { status: 500 }
    );
  }
}
