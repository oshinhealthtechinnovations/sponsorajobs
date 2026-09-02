import { NextRequest, NextResponse } from "next/server";
import { routeHealthMonitor } from "@/lib/services/routeHealthMonitor";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const healthSummary = await routeHealthMonitor.auditAllSystemRoutes();
    return NextResponse.json({
      success: true,
      data: healthSummary,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to audit system routes",
      },
      { status: 500 }
    );
  }
}
