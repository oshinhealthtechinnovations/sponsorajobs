import { NextRequest, NextResponse } from "next/server";
import { CountryIntelligenceService } from "@/lib/services/countryIntelligenceService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country") || "GB";

    const profile = await CountryIntelligenceService.getCountryProfile(country);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Country not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch country info" },
      { status: 500 }
    );
  }
}
