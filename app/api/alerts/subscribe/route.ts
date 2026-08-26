import { NextRequest, NextResponse } from "next/server";
import { AlertRepository } from "@/lib/repositories/alertRepository";
import { EmailService } from "@/lib/services/emailService";
import { JobRepository } from "@/lib/repositories/jobRepository";

import { CloudStorageService } from "@/lib/services/cloudStorageService";
import { publicApiRateLimiter } from "@/lib/security/rateLimiter";
import { telegramService } from "@/lib/services/telegramService";

export const runtime = "edge";

interface AlertSubscriptionPayload {
  email: string;
  role?: string;
  keyword?: string;
  country?: string;
  category?: string;
  frequency?: "instant" | "daily" | "weekly";
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("cf-connecting-ip") || "anonymous_subscriber";
    const limitCheck = publicApiRateLimiter.check(`alert_${ip}`);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many requests. Please try again in ${limitCheck.resetTime} seconds.` },
        { status: 429 }
      );
    }

    const body = (await req.json()) as AlertSubscriptionPayload;

    if (!body?.email || !body.email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const keyword = body.keyword || body.role;
    const country = body.country || "all";
    const category = body.category || "all";
    const frequency = body.frequency || "daily";

    // 1. Save subscription to database
    const alertRepo = new AlertRepository();
    const alertRecord = await alertRepo.createAlert({
      email: body.email,
      keyword,
      country,
      category,
      frequency,
    });

    // 2. Persist to Free Cloud DB Storage (Upstash / Supabase)
    await CloudStorageService.saveSubscriber({
      id: alertRecord.id,
      email: alertRecord.email,
      keyword: alertRecord.keyword,
      country: alertRecord.country_code,
      category: alertRecord.category_id,
      frequency: alertRecord.frequency,
      created_at: alertRecord.created_at,
      active: 1,
    });

    // 2. Fetch live matching jobs for the instant welcome confirmation email
    const jobRepo = new JobRepository();
    const searchRes = await jobRepo.search({
      q: keyword,
      country: country !== "all" ? country : undefined,
      category: category !== "all" ? category : undefined,
      limit: 4,
      sort: "sponsorship",
    });

    const sampleJobs = searchRes.jobs.length > 0 
      ? searchRes.jobs 
      : (searchRes.fallbackJobs || (await jobRepo.getLatestJobs(4)));

    // 3. Dispatch immediate confirmation & welcome email
    const emailService = new EmailService();
    const emailResult = await emailService.sendWelcomeAlertEmail({
      toEmail: alertRecord.email,
      keyword: alertRecord.keyword,
      country: alertRecord.country_code,
      category: alertRecord.category_id,
      frequency: alertRecord.frequency,
      sampleJobs,
    });

    // Notify Telegram
    try {
      telegramService.notifySubscriberJoined({
        email: alertRecord.email,
        keyword: alertRecord.keyword || undefined,
        country: alertRecord.country_code || undefined,
        category: alertRecord.category_id || undefined,
        frequency: alertRecord.frequency || undefined,
      }).catch(console.error);
    } catch (e) {
      console.error(e);
    }

    return NextResponse.json({
      success: true,
      message: `Visa job alerts activated! Confirmation email sent to ${alertRecord.email}`,
      emailSent: emailResult.success,
      provider: emailResult.provider,
      alert: alertRecord,
      matchedJobsCount: sampleJobs.length,
    });
  } catch (err: any) {
    console.error("[Alerts:Subscribe] Error handling subscription:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
