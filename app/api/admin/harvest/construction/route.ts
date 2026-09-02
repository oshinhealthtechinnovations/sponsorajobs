import { NextRequest, NextResponse } from "next/server";
import { constructionHarvesterService } from "@/lib/services/constructionHarvesterService";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get("dryRun") === "true";

    const result = await constructionHarvesterService.runHarvestCycle({ dryRun });

    return NextResponse.json(
      {
        success: true,
        message: "Manual construction harvester trigger executed successfully",
        result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Manual harvest trigger error" },
      { status: 500 }
    );
  }
}
