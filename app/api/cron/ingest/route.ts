import { NextRequest, NextResponse } from "next/server";
import { IngestionService } from "@/lib/services/ingestionService";
import { SourceRegistry } from "@/sources/registry";
import { telegramService } from "@/lib/services/telegramService";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  // Verify optional cron secret header for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
  }

  const registry = new SourceRegistry();
  const service = new IngestionService(undefined, registry);

  const activeAdapters = registry.getActiveAdapters();
  const reports = [];

  for (const adapter of activeAdapters) {
    const report = await service.processSource(adapter.getSourceId());
    reports.push(report);
  }

  // Run conservative stale job expiration (30 days)
  const expiredCount = await service.expireStaleJobs(30);

  // Automatic Storage Washout: Purge stale data and cap maximum retained jobs to prevent storage growth
  const washoutReport = await service.runStorageWashout({
    expiredDaysCutoff: 30,
    maxActiveRetention: 3000,
    logRetentionDays: 14,
  });

  const totalFetched = reports.reduce((acc, r) => acc + (r.jobsFetched || 0), 0);
  const totalVerified = reports.reduce((acc, r) => acc + (r.jobsInserted || 0) + (r.jobsUpdated || 0), 0);

  // Notify Telegram
  try {
    telegramService.notifyCronIngestCompleted({
      fetched: totalFetched,
      verified: totalVerified,
      expired: expiredCount,
      durationMs: Date.now() - startTime,
    }).catch(console.error);
  } catch (e) {
    console.error(e);
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    activeSourcesProcessed: activeAdapters.length,
    reports,
    staleJobsExpired: expiredCount,
    storageWashout: washoutReport,
  });
}
