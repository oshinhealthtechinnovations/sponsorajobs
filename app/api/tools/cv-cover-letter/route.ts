import { NextRequest, NextResponse } from "next/server";
import { CvIntelligenceSuite, CoverLetterInput } from "@/lib/services/cvIntelligenceSuite";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body: CoverLetterInput = await request.json();

    if (!body.jobTitle || !body.companyName) {
      return NextResponse.json(
        { success: false, error: "jobTitle and companyName are required." },
        { status: 400 }
      );
    }

    const result = await CvIntelligenceSuite.generateCoverLetter(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}
