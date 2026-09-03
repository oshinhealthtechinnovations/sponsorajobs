import { NextRequest, NextResponse } from "next/server";
import { multiCountryHarvesterService } from "@/lib/services/multiCountryHarvesterService";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for multi-source parallel ATS harvest

/**
 * Autonomous Multi-Country Harvester Trigger Endpoint (US, UK, AU, CA, NZ)
 * 
 * Invoked by:
 * - Vercel Cron daily schedule
 * - GitHub Actions automated workflows
 * - External monitoring / webhook triggers
 * - Admin manual triggers
 */
export async function GET(request: NextRequest) {
  return handleHarvestRun(request);
}

export async function POST(request: NextRequest) {
  return handleHarvestRun(request);
}

async function handleHarvestRun(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get("dryRun") === "true";

    const result = await multiCountryHarvesterService.runHarvestCycle({ dryRun });

    return NextResponse.json(
      {
        success: true,
        message: "Autonomous multi-country harvester cycle completed successfully (US, UK, AU, CA, NZ)",
        result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[CronHarvestMultiCountry] Execution failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Multi-country harvester cycle execution error",
      },
      { status: 500 }
    );
  }
}
