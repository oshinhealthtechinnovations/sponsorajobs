import { NextRequest, NextResponse } from "next/server";
import { backendAdminSupervisor } from "@/lib/services/backendAdminSupervisor";

export const dynamic = "force-dynamic";

/**
 * Live Backend Command Center Status API
 * 
 * Returns real-time health checks across all 6 backend pillars
 */
export async function GET(request: NextRequest) {
  try {
    const audit = await backendAdminSupervisor.performFullSystemInspection();
    return NextResponse.json({
      success: true,
      audit,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to inspect backend" },
      { status: 500 }
    );
  }
}
