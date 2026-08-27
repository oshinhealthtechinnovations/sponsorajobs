import { NextRequest, NextResponse } from "next/server";
import { CVAnalysisRepository } from "@/lib/repositories/cvAnalysisRepository";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const repo = new CVAnalysisRepository();
    const [recentResult, stats] = await Promise.all([
      repo.listRecent(limit, offset),
      repo.getAggregateStats(),
    ]);

    return NextResponse.json({
      success: true,
      stats,
      analyses: recentResult.analyses,
      total: recentResult.total,
    });
  } catch (error: any) {
    console.error("[CV Analytics API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load CV analytics" },
      { status: 500 }
    );
  }
}
