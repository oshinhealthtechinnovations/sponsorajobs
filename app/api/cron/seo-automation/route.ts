import { NextRequest, NextResponse } from "next/server";
import { seoAutomationEngine } from "@/lib/seo/seoAutomationEngine";

export const dynamic = "force-dynamic";

/**
 * Autonomous SEO Trigger Endpoint
 * 
 * Invoked by:
 * - GitHub Actions automated workflows
 * - External cron / webhook triggers
 * - Admin manual triggers
 */
export async function GET(request: NextRequest) {
  return handleSeoRun(request);
}

export async function POST(request: NextRequest) {
  return handleSeoRun(request);
}

async function handleSeoRun(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notifyAdmin = searchParams.get("notify") === "true";
    const dryRun = searchParams.get("dryRun") === "true";

    const result = await seoAutomationEngine.runAutomatedSeoCycle({
      notifyAdmin,
      dryRun,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Autonomous SEO cycle executed successfully",
        cycle: result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[SEO Automation API] Error executing SEO cycle:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error during SEO cycle",
      },
      { status: 500 }
    );
  }
}
