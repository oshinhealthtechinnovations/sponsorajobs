import { NextRequest, NextResponse } from "next/server";
import { CompanyEnrichmentService } from "@/lib/services/companyEnrichmentService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get("company") || "Company";
    const website = searchParams.get("website");

    const logoUrl = CompanyEnrichmentService.getCompanyLogoUrl(company, website);
    const candidates = CompanyEnrichmentService.getLogoCandidates(company, website);

    return NextResponse.json({
      success: true,
      company,
      logoUrl,
      candidates,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to resolve company logo" },
      { status: 500 }
    );
  }
}
