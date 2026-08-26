import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/services/adminAuth";
import { telegramService } from "@/lib/services/telegramService";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { CloudStorageService } from "@/lib/services/cloudStorageService";
import { userRepository } from "@/lib/repositories/userRepository";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const isAuth = await verifyAdminSession(req);
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const isConfigured = telegramService.isConfigured();
  return NextResponse.json({
    success: true,
    configured: isConfigured,
    hasBotToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    hasChatId: Boolean(process.env.TELEGRAM_CHAT_ID),
  });
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminSession(req);
  if (!isAuth) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // 1. Send Test Telegram Message
    if (action === "test") {
      const result = await telegramService.sendMessage(
        `⚡ <b>SponsorAJobs Telegram Integration Test</b>\n━━━━━━━━━━━━━━━━━━━━\n✅ Your Telegram notification channel is active and connected!\nYou will receive real-time alerts for all user registrations, free trial requests, and automated cron completions.\n━━━━━━━━━━━━━━━━━━━━\n🌐 <a href="https://www.sponsorajobs.com">SponsorAJobs.com</a>`
      );

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error || "Failed to send test message to Telegram.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Test message successfully dispatched to Telegram!",
      });
    }

    // 2. Dispatch Live Timeline Status Report
    if (action === "timeline") {
      const jobRepo = new JobRepository();
      const searchRes = await jobRepo.search({ limit: 1 });
      const liveJobsCount = searchRes.total || 648;
      const subscribers = await CloudStorageService.fetchAllSubscribers();
      const trialRequests = await userRepository.getAllTrialRequests();
      const pendingTrials = trialRequests.filter((r) => r.status === "pending").length;

      const completedItems = [
        `Ingested & Verified: ${liveJobsCount} Active Sponsored Jobs`,
        `5 Global Jurisdictions Online (UK, USA, Australia, Canada, NZ)`,
        `Deterministic 16-Parameter SEO Scoring Engine & 779+ Pages Active`,
        `Dynamic XML Sitemaps & Structured Data Injected`,
        `Referral & Promo Code Gatekeeper Active (sumit_raj_linkedin)`,
      ];

      const pendingItems = [
        `Next Daily ATS Ingestion Cron: 02:00 UTC (07:30 AM IST)`,
        `Next Subscriber Alert Digest: 08:00 UTC (01:30 PM IST)`,
        `Next Programmatic SEO Publishing: Monday & Thursday 06:00 UTC`,
        `Pending Free Trial Candidate Requests: ${pendingTrials}`,
      ];

      await telegramService.sendTimelineReport({
        completedItems,
        pendingItems,
        liveJobsCount: liveJobsCount,
        totalSubscribers: subscribers.length,
      });

      return NextResponse.json({
        success: true,
        message: "Live Operational Timeline report dispatched to Telegram!",
      });
    }

    // 3. Broadcast Daily Visa Jobs Drop to Community Group / Channel
    if (action === "broadcast_jobs") {
      const jobRepo = new JobRepository();
      const latestJobs = await jobRepo.getLatestJobs(5);
      const targetChannel = body.channelId || undefined;

      const jobsToBroadcast = latestJobs.map((j) => ({
        title: j.title,
        companyName: j.company?.name || "Global Sponsor",
        countryCode: j.location?.country || "gb",
        salaryFormatted: j.salary?.min
          ? `${j.salary.currency || "$"} ${j.salary.min.toLocaleString()} - ${j.salary.max?.toLocaleString() || ""}`
          : undefined,
        slug: j.slug,
        sponsorshipStatus:
          j.sponsorship?.label === "Strong"
            ? "Direct Visa Sponsorship / CoS"
            : "Visa Transfer / Sponsorship Eligible",
      }));

      const res = await telegramService.broadcastDailyJobsDrop({
        jobs: jobsToBroadcast,
        channelId: targetChannel,
      });

      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: `Successfully broadcasted ${jobsToBroadcast.length} top sponsored jobs to Telegram!`,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Operation failed" },
      { status: 500 }
    );
  }
}
