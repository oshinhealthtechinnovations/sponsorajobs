import { NextRequest, NextResponse } from "next/server";
import { seoAutomationEngine } from "@/lib/seo/seoAutomationEngine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const notifyAdmin = body.notify !== false; // default true for admin manual trigger
    const dryRun = body.dryRun === true;

    const result = await seoAutomationEngine.runAutomatedSeoCycle({
      notifyAdmin,
      dryRun,
    });

    return NextResponse.json({
      success: true,
      message: `Autonomous SEO cycle triggered successfully (Score: ${result.healthScore}/100, Grade ${result.grade})`,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to run SEO cycle" },
      { status: 500 }
    );
  }
}
