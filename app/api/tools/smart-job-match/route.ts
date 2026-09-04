import { NextRequest, NextResponse } from "next/server";
import { JobIntelligenceEngine } from "@/lib/services/jobIntelligenceEngine";
import { JobSuggestionEngine } from "@/lib/services/jobSuggestionEngine";
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

    // 1. Intelligent Candidate Profile Extraction
    const candidateProfile = JobIntelligenceEngine.extractCandidateProfile(rawInput);
    const effectiveCountry = (country && country !== "ALL")
      ? country
      : (candidateProfile.targetCountry || undefined);

    // 2. Rank Opportunities across Database using Deep Intelligence
    const rankedOpportunities = await JobIntelligenceEngine.rankMatchingJobsForCandidate(
      candidateProfile,
      {
        country: effectiveCountry,
        limit,
      }
    );

    // Fallback to suggestion engine if database returns fewer than 3 results
    let matchedJobs = rankedOpportunities.map((opp) => ({
      job: opp.job,
      matchScore: opp.matchScore,
      atsScore: opp.atsScore,
      breakdown: opp.breakdown,
      visaViable: opp.breakdown.visaMatchScore >= 80,
      reasons: opp.breakdown.whyYouMatch.length > 0 ? opp.breakdown.whyYouMatch : [opp.recommendationReason],
      recommendationReason: opp.recommendationReason,
      matchedSkills: opp.breakdown.matchedSkills,
      missingSkills: opp.breakdown.missingRequiredSkills,
      sponsorshipStatus: opp.breakdown.sponsorshipStatus,
    }));

    if (matchedJobs.length < 3) {
      try {
        const fallback = await JobSuggestionEngine.smartMatch(rawInput, {
          country: effectiveCountry,
          minSalary,
          limit,
        });

        if (fallback.matchedJobs && fallback.matchedJobs.length > 0) {
          const existingIds = new Set(matchedJobs.map((m) => m.job.id));
          for (const fallbackJob of fallback.matchedJobs) {
            if (!existingIds.has(fallbackJob.job.id)) {
              const intel = JobIntelligenceEngine.extractJobIntelligence(fallbackJob.job);
              const breakdown = JobIntelligenceEngine.calculateDetailedMatch(candidateProfile, intel);

              // Don't add obvious cross-domain mismatches
              if (breakdown.overallMatchScore < 30 || (breakdown.skillsMatchScore === 0 && breakdown.roleSimilarityScore < 20)) {
                continue;
              }

              matchedJobs.push({
                job: fallbackJob.job,
                matchScore: fallbackJob.matchScore || breakdown.overallMatchScore,
                atsScore: breakdown.atsCompatibilityScore,
                breakdown,
                visaViable: fallbackJob.visaViable,
                reasons: fallbackJob.reasons,
                recommendationReason: `Matched via semantic similarity (${intel.normalizedTitle})`,
                matchedSkills: breakdown.matchedSkills,
                missingSkills: breakdown.missingRequiredSkills,
                sponsorshipStatus: breakdown.sponsorshipStatus,
              });
            }
          }
        }
      } catch (err) {
        // Keep rankedOpportunities
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        candidateProfile,
        transferableRoles: candidateProfile.transferablePotentialRoles,
        detectedIntent: {
          targetRole: candidateProfile.normalizedRole,
          skills: candidateProfile.coreSkills,
          targetCountry: effectiveCountry,
          experienceLevel: candidateProfile.seniority,
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
