import { NextRequest, NextResponse } from "next/server";
import { ShortlistRepository } from "@/lib/repositories/shortlistRepository";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, candidateId, targetCountry, targetRole, sponsorshipPreference, skillsSnapshot } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const repo = new ShortlistRepository();
    const record = await repo.createRequest({
      candidateId,
      email,
      targetCountry,
      targetRole,
      sponsorshipPreference,
      skillsSnapshot,
    });

    return NextResponse.json({
      success: true,
      message: "Shortlist subscription registered successfully.",
      shortlistId: record.id,
    });
  } catch (error: any) {
    console.error("[Shortlist API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to register shortlist request" },
      { status: 500 }
    );
  }
}
