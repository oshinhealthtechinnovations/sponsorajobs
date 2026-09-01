import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/client";
import { SourceRegistry } from "@/sources/registry";


/**
 * Production Health & Diagnostic Telemetry Endpoint
 * Reference: Section 148
 */
export async function GET() {
  const startTime = Date.now();
  let dbStatus = "healthy";
  let dbLatencyMs = 0;
  let activeJobsCount = 0;
  let activeCountriesCount = 0;

  try {
    const db = getDatabase();
    const queryStart = Date.now();

    // Query core metrics
    const jobsRow = await db.prepare(
      "SELECT COUNT(*) as count FROM jobs WHERE status = 'active'"
    ).first<{ count: number }>();

    const countriesRow = await db.prepare(
      "SELECT COUNT(*) as count FROM countries WHERE active = 1"
    ).first<{ count: number }>();

    dbLatencyMs = Date.now() - queryStart;
    activeJobsCount = jobsRow?.count || 0;
    activeCountriesCount = countriesRow?.count || 0;
  } catch (err: any) {
    dbStatus = "unhealthy";
    console.error("[Health] Database check failed:", err);
  }

  const registry = new SourceRegistry();
  const allAdapters = registry.getAllAdapters();
  const activeAdapters = registry.getActiveAdapters();

  const isOverallHealthy = dbStatus === "healthy";
  const statusCode = isOverallHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isOverallHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      platform: "SponsorAJobs",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "production",
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          activeJobs: activeJobsCount,
          activeCountries: activeCountriesCount,
        },
        sources: {
          registeredCount: allAdapters.length,
          activeCount: activeAdapters.length,
          adapters: allAdapters.map((a) => ({
            id: a.getSourceId(),
            name: a.getName(),
            enabled: a.isEnabled(),
            rateLimitPerMin: a.getRateLimitPerMinute(),
            attributionRequired: a.isAttributionRequired(),
          })),
        },
        memory: {
          status: "healthy",
          totalDurationMs: Date.now() - startTime,
        },
      },
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
