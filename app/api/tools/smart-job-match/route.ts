import { NextRequest, NextResponse } from "next/server";
import { CareerIntelligenceEngine } from "@/lib/services/careerIntelligenceEngine";
import { extractTextFromPDFBuffer, isRawPdfSyntax } from "@/lib/services/pdfExtractor";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let rawInput = "";
    let country: string | undefined;
    let minSalary: number | undefined;
    let limit = 8;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const textParam = formData.get("text") as string | null;
      const promptParam = formData.get("prompt") as string | null;
      country = (formData.get("country") as string) || undefined;
      const limitParam = formData.get("limit") as string | null;
      if (limitParam) limit = Number(limitParam) || 8;

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
          rawInput = await extractTextFromPDFBuffer(buffer);
        } else {
          rawInput = buffer.toString("utf-8");
        }
      } else if (textParam) {
        rawInput = textParam;
      } else if (promptParam) {
        rawInput = promptParam;
      }
    } else {
      const body = await request.json();
      const { prompt, cvText, country: countryBody, minSalary: minSalaryBody, limit: limitBody } = body;
      rawInput = (cvText || prompt || "").trim();
      country = countryBody;
      minSalary = minSalaryBody;
      if (limitBody) limit = Number(limitBody) || 8;
    }

    rawInput = rawInput.trim();

    if (!rawInput || rawInput.length < 15 || isRawPdfSyntax(rawInput)) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not extract readable text from this document. Please ensure your PDF has an embedded text layer (not a scanned flat image) or paste your background/skills directly.",
        },
        { status: 400 }
      );
    }

    // 1. Universal Capability Profile Extraction via CIE-v2
    const profile = CareerIntelligenceEngine.extractCandidateProfile(rawInput);
    const effectiveCountry = (country && country !== "ALL")
      ? country
      : (profile.identity.targetCountry || undefined);

    // 2. Rank Opportunities across Database using Universal Engine
    const rankedOpportunities = await CareerIntelligenceEngine.rankMatchingJobs(
      profile,
      {
        country: effectiveCountry,
        limit,
      }
    );

    const matchedJobs = rankedOpportunities.map((opp) => ({
      job: opp.job,
      matchTier: opp.matchTier,
      tierBadgeLabel: opp.tierBadgeLabel,
      matchScore: opp.compositeRankScore,
      careerMatchScore: opp.careerMatchScore,
      sponsorshipViabilityScore: opp.sponsorshipViabilityScore,
      atsScore: opp.atsCompatibilityScore,
      breakdown: opp.breakdown,
      visaViable: opp.sponsorshipViabilityScore >= 75,
      reasons: opp.breakdown.whyYouMatch.length > 0 ? opp.breakdown.whyYouMatch : [opp.recommendationReason],
      recommendationReason: opp.recommendationReason,
      matchedSkills: Array.from(new Set([...opp.breakdown.matchedTools, ...opp.breakdown.matchedCapabilities])),
      missingSkills: opp.breakdown.missingCapabilities,
      sponsorshipStatus: opp.breakdown.sponsorshipStatus.certainty,
    }));

    // Universal Candidate Profile compatibility layer for UI
    const candidateProfile = {
      name: profile.identity.name,
      email: profile.identity.email,
      phone: profile.identity.phone,
      linkedIn: profile.identity.linkedIn,
      currentRole: profile.headlineRole,
      normalizedRole: profile.normalizedRole,
      primaryFunction: profile.primaryFunction,
      yearsOfExperience: profile.yearsOfExperience,
      seniority: profile.seniority,
      primaryIndustry: profile.primaryIndustry,
      subIndustries: profile.subIndustries,
      coreSkills: Array.from(new Set([...profile.toolsAndSoftware, ...profile.coreCapabilities])),
      technicalSkills: profile.toolsAndSoftware,
      softSkills: profile.coreCapabilities.filter((c) => c.includes("Management") || c.includes("Coordination")),
      toolsAndSoftware: profile.toolsAndSoftware,
      highestDegree: profile.highestDegree,
      degreeField: profile.degreeField,
      certifications: profile.certifications,
      transferablePotentialRoles: profile.transferableRolesList,
      transferableCareerPathways: profile.transferableCareerPathways,
      targetCountry: profile.identity.targetCountry,
    };

    return NextResponse.json({
      success: true,
      data: {
        candidateProfile,
        transferableRoles: profile.transferableRolesList,
        transferableCareerPathways: profile.transferableCareerPathways,
        detectedIntent: {
          targetRole: profile.normalizedRole,
          skills: candidateProfile.coreSkills,
          targetCountry: effectiveCountry,
          experienceLevel: profile.seniority,
        },
        matchedJobs,
        totalFound: matchedJobs.length,
      },
    });
  } catch (err: any) {
    console.error("[SmartJobMatch API] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to perform smart match" },
      { status: 500 }
    );
  }
}
