import { NextRequest, NextResponse } from "next/server";
import { JobSuggestionEngine } from "@/lib/services/jobSuggestionEngine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, country, minSalary, limit } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { success: false, error: "Candidate background prompt is required." },
        { status: 400 }
      );
    }

    const result = await JobSuggestionEngine.smartMatch(prompt, {
      country,
      minSalary,
      limit: limit ? Number(limit) : 6,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to perform smart match" },
      { status: 500 }
    );
  }
}
