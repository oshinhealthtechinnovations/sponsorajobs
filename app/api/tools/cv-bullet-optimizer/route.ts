import { NextRequest, NextResponse } from "next/server";
import { CvIntelligenceSuite } from "@/lib/services/cvIntelligenceSuite";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bullets: string[] = Array.isArray(body.bullets) ? body.bullets : [body.bullet || ""];

    const results = bullets.filter(Boolean).map((b) => CvIntelligenceSuite.optimizeBulletPoint(b));

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to optimize bullet points" },
      { status: 500 }
    );
  }
}
