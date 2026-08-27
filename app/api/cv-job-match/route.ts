import { NextRequest, NextResponse } from "next/server";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { extractTextFromPDFBuffer } from "@/lib/services/pdfExtractor";
import { analyzeCVIntelligence, detectCandidateOccupationFromCV } from "@/lib/services/atsIntelligenceEngine";
import { rankJobsForCandidate, CandidateMatchingPreferences } from "@/lib/services/cvJobMatchEngine";
import { CandidateProfileRecord } from "@/lib/types/database";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawTextParam = formData.get("text") as string | null;
    const country = (formData.get("country") as string) || "GB";
    const sponsorship = (formData.get("sponsorship") as any) || "required";
    const workArrangement = (formData.get("workArrangement") as any) || "any";
    const minimumSalary = formData.get("minSalary") ? parseInt(formData.get("minSalary") as string, 10) : null;

    let extractedText = "";

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
        extractedText = extractTextFromPDFBuffer(buffer);
      } else {
        extractedText = buffer.toString("utf-8");
      }
    } else if (rawTextParam) {
      extractedText = rawTextParam;
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        { success: false, error: "Could not extract readable text from document. Please upload a clear PDF, DOCX, or paste text." },
        { status: 400 }
      );
    }

    // 1. Structured Candidate Profile Extraction
    const intelligence = analyzeCVIntelligence(
      extractedText,
      null,
      country === "all" ? "GB" : country
    );

    const detectedOcc = detectCandidateOccupationFromCV(extractedText);
    const candidateId = `cand_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const candidateProfile: CandidateProfileRecord = {
      id: candidateId,
      user_id: null,
      candidate_email: intelligence.profile.email || null,
      primary_occupation: detectedOcc.name || intelligence.jobMatchDiagnostics.targetRoleTitle || "Civil / Structural / Infrastructure Engineer",
      primary_soc_code: detectedOcc.ukSocCode || intelligence.sponsorshipDiagnostics.occupationRule.socCode || "2121",
      seniority: intelligence.profile.seniority,
      total_experience_years: intelligence.profile.estimatedYearsExperience,
      highest_degree: intelligence.profile.highestDegree,
      degree_field: intelligence.profile.degreeField || "Engineering / STEM",
      detected_skills: intelligence.profile.technicalSkills,
      preferred_country: country,
      sponsorship_preference: sponsorship,
      profile_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 2. Fetch Live Jobs from Job Repository
    const jobRepo = new JobRepository();
    const searchRes = await jobRepo.search({
      country: country !== "all" && country !== "GLOBAL" ? country : undefined,
      limit: 100,
      sort: "sponsorship",
    });

    const preferences: CandidateMatchingPreferences = {
      countries: country !== "all" ? [country] : ["GLOBAL"],
      sponsorship,
      workArrangement,
      minimumSalary,
    };

    // 3. Execute 2-Stage Matching Engine
    const result = rankJobsForCandidate(candidateProfile, searchRes.jobs, preferences);

    return NextResponse.json({
      success: true,
      profile: {
        candidateId: candidateProfile.id,
        primary_occupation: candidateProfile.primary_occupation,
        primary_soc_code: candidateProfile.primary_soc_code,
        seniority: candidateProfile.seniority,
        experience_years: candidateProfile.total_experience_years,
        highest_degree: candidateProfile.highest_degree,
        top_skills: candidateProfile.detected_skills.slice(0, 8),
        target_country: candidateProfile.preferred_country,
        sponsorship_preference: candidateProfile.sponsorship_preference,
      },
      total_matches: result.totalMatches,
      results: result.recommendations,
      algorithm_version: result.algorithmVersion,
      job_dataset_version: result.jobDatasetVersion,
    });
  } catch (error: any) {
    console.error("[CV Job Match API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to match CV with jobs" },
      { status: 500 }
    );
  }
}
