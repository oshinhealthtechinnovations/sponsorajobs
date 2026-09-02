import { NextRequest, NextResponse } from "next/server";
import { JobSuggestionEngine } from "@/lib/services/jobSuggestionEngine";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const country = searchParams.get("country") || undefined;

    const suggestions = await JobSuggestionEngine.getAutocompleteSuggestions(q, country);

    return NextResponse.json({
      success: true,
      query: q,
      count: suggestions.length,
      suggestions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
