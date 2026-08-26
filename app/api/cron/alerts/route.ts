import { NextRequest, NextResponse } from "next/server";
import { CloudStorageService } from "@/lib/services/cloudStorageService";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { EmailService } from "@/lib/services/emailService";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  // 1. Verify cron secret or admin session for security
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also allow session cookie for admin triggers
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader || !cookieHeader.includes("sa_admin_session")) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }
  }

  const subscribers = await CloudStorageService.fetchAllSubscribers();
  const activeSubscribers = subscribers.filter((s) => s.active !== 0);

  const jobRepo = new JobRepository();
  const emailService = new EmailService();

  const results: Array<{
    email: string;
    keyword: string | null;
    country: string | null;
    matchedJobs: number;
    dispatched: boolean;
    provider: string;
  }> = [];

  for (const sub of activeSubscribers) {
    try {
      const searchRes = await jobRepo.search({
        q: sub.keyword || undefined,
        country: sub.country && sub.country !== "ALL" && sub.country !== "all" ? sub.country : undefined,
        category: sub.category && sub.category !== "ALL" && sub.category !== "all" ? sub.category : undefined,
        limit: 4,
        sort: "sponsorship",
      });

      const sampleJobs = searchRes.jobs.length > 0 
        ? searchRes.jobs 
        : (searchRes.fallbackJobs || (await jobRepo.getLatestJobs(4)));

      const emailRes = await emailService.sendDigestAlertEmail({
        toEmail: sub.email,
        keyword: sub.keyword,
        country: sub.country,
        category: sub.category,
        frequency: sub.frequency || "daily",
        sampleJobs,
      });

      results.push({
        email: sub.email,
        keyword: sub.keyword || null,
        country: sub.country || "ALL",
        matchedJobs: sampleJobs.length,
        dispatched: emailRes.success,
        provider: emailRes.provider,
      });
    } catch (err: any) {
      results.push({
        email: sub.email,
        keyword: sub.keyword || null,
        country: sub.country || "ALL",
        matchedJobs: 0,
        dispatched: false,
        provider: "error: " + err.message,
      });
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    totalActiveSubscribers: activeSubscribers.length,
    digestsDispatched: results.filter((r) => r.dispatched).length,
    reports: results,
  });
}
