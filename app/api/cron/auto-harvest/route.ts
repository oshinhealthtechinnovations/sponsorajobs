import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { constructionHarvesterService } from "@/lib/services/constructionHarvesterService";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for live API calls

/**
 * Unified Auto-Harvest & Cache Revalidation Endpoint
 * 
 * Invoked by:
 * - Vercel Cron schedule
 * - GitHub Actions post-harvest webhook
 * - Admin manual triggers
 */
export async function GET(request: NextRequest) {
  return handleAutoHarvest(request);
}

export async function POST(request: NextRequest) {
  return handleAutoHarvest(request);
}

async function handleAutoHarvest(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get("dryRun") === "true";

    // 1. Run harvest cycle across licensed sponsor contractors
    const harvestResult = await constructionHarvesterService.runHarvestCycle({ dryRun });

    // 2. Revalidate live job listing pages and company directory cache
    try {
      revalidatePath("/jobs");
      revalidatePath("/companies");
      revalidatePath("/");
    } catch (revalErr: any) {
      console.warn("[AutoHarvest] Cache revalidation warning:", revalErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Autonomous live harvest and cache revalidation completed successfully",
      harvestResult,
      revalidatedPaths: ["/jobs", "/companies", "/"],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[AutoHarvest] Execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Auto harvest cycle failed",
      },
      { status: 500 }
    );
  }
}
