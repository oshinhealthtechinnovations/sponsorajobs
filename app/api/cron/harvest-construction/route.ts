import { NextRequest, NextResponse } from "next/server";
import { constructionHarvesterService } from "@/lib/services/constructionHarvesterService";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s — parallel harvest of 7 contractors takes ~6-12s

/**
 * Autonomous Construction Harvester Trigger Endpoint
 * 
 * Invoked by:
 * - Vercel Cron daily schedule (e.g. 0 4 * * *)
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

    const result = await constructionHarvesterService.runHarvestCycle({ dryRun });

    return NextResponse.json(
      {
        success: true,
        message: "Autonomous construction harvester cycle completed successfully",
        result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[CronHarvestConstruction] Execution failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Construction harvester cycle execution error",
      },
      { status: 500 }
    );
  }
}
