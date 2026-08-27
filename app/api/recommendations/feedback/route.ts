import { NextRequest, NextResponse } from "next/server";
import { RecommendationRepository } from "@/lib/repositories/recommendationRepository";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateId, jobId, feedbackType, reason } = body;

    if (!candidateId || !jobId || !feedbackType) {
      return NextResponse.json(
        { success: false, error: "Missing required feedback fields" },
        { status: 400 }
      );
    }

    const repo = new RecommendationRepository();
    const record = await repo.logFeedback(candidateId, jobId, feedbackType, reason);

    return NextResponse.json({
      success: true,
      feedbackId: record.id,
    });
  } catch (error: any) {
    console.error("[Feedback API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to log feedback" },
      { status: 500 }
    );
  }
}
