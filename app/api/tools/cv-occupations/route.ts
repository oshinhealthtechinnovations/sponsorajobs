import { NextRequest, NextResponse } from "next/server";
import { CvIntelligenceSuite } from "@/lib/services/cvIntelligenceSuite";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    const occupations = CvIntelligenceSuite.matchOccupationCodes(query);

    return NextResponse.json({
      success: true,
      query,
      count: occupations.length,
      occupations,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to match occupation codes" },
      { status: 500 }
    );
  }
}
