import { NextRequest, NextResponse } from "next/server";
import { analyzeCVIntelligence, analyzeResumeATS, matchResumeToJobs } from "@/lib/services/atsScanner";
import { extractTextFromPDFBuffer, isRawPdfSyntax } from "@/lib/services/pdfExtractor";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { JobIntelligenceEngine } from "@/lib/services/jobIntelligenceEngine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawTextParam = formData.get("text") as string | null;
    const targetCountry = (formData.get("country") as string) || "GB";
    const targetJobId = formData.get("jobId") as string | null;

    let extractedText = "";

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
        extractedText = await extractTextFromPDFBuffer(buffer);
      } else {
        extractedText = buffer.toString("utf-8");
      }
    } else if (rawTextParam) {
      extractedText = rawTextParam;
    }

    if (!extractedText || extractedText.trim().length < 15 || isRawPdfSyntax(extractedText)) {
      return NextResponse.json(
        { success: false, error: "Could not extract readable text from the uploaded document. Please upload a clear PDF, DOCX, or paste your resume text." },
        { status: 400 }
      );
    }

    // 1. Fetch Selected Target Job if specified
    const jobRepo = new JobRepository();
    let targetJob = null;
    if (targetJobId) {
      try {
        targetJob = await jobRepo.getById(targetJobId);
      } catch (repoErr) {
        console.warn("[ATS API] Target job lookup failed:", repoErr);
      }
    }

    // 2. Central Job Intelligence Engine: Candidate Profile & Target Job Matching
    const candidateProfile = JobIntelligenceEngine.extractCandidateProfile(extractedText);
    let targetJobMatch = null;
    let targetJobIntel = null;
    if (targetJob) {
      targetJobIntel = JobIntelligenceEngine.extractJobIntelligence(targetJob);
      targetJobMatch = JobIntelligenceEngine.calculateDetailedMatch(candidateProfile, targetJobIntel);
    }

    // 3. Central Job Intelligence Engine: Deep Ranking across Job Database
    let rankedOpportunities: any[] = [];
    try {
      rankedOpportunities = await JobIntelligenceEngine.rankMatchingJobsForCandidate(
        candidateProfile,
        {
          country: targetCountry !== "all" ? targetCountry : undefined,
          limit: 10,
        }
      );
    } catch (rankErr) {
      console.warn("[ATS API] Deep ranking error:", rankErr);
    }

    // 4. Run Legacy Scanner for backward compatibility
    const intelligence = analyzeCVIntelligence(
      extractedText,
      targetJob,
      targetCountry === "all" ? "GB" : targetCountry
    );
    const legacyAnalysis = analyzeResumeATS(extractedText);

    // 5. Build unified matches list
    const unifiedMatches = rankedOpportunities.length > 0
      ? rankedOpportunities.map((r) => ({
          job: r.job,
          matchScore: r.matchScore,
          atsScore: r.atsScore,
          breakdown: r.breakdown,
          matchedSkills: r.breakdown.matchedSkills,
          missingSkills: r.breakdown.missingRequiredSkills,
          reasons: r.breakdown.whyYouMatch.length > 0 ? r.breakdown.whyYouMatch : [r.recommendationReason],
          recommendationReason: r.recommendationReason,
          visaStatus: r.breakdown.sponsorshipStatus,
        }))
      : [];

    // 6. Persist Scan into CV Intelligence Database
    const { CVAnalysisRepository } = await import("@/lib/repositories/cvAnalysisRepository");
    const cvRepo = new CVAnalysisRepository();
    let savedRecord = null;
    try {
      savedRecord = await cvRepo.saveAnalysis(intelligence, {
        rawText: extractedText,
        targetCountry,
        targetJobId,
      });
    } catch (dbErr) {
      console.warn("[ATS API] Failed to persist CV analysis to database:", dbErr);
    }

    return NextResponse.json({
      success: true,
      scanId: savedRecord?.id || null,
      shareToken: savedRecord?.share_token || null,
      extractedTextLength: extractedText.length,
      wordCount: intelligence.wordCount,
      candidateProfile,
      targetJobMatch,
      targetJobIntel,
      rankedOpportunities,
      intelligence,
      analysis: legacyAnalysis,
      matches: unifiedMatches.length > 0 ? unifiedMatches : [],
    });
  } catch (error: any) {
    console.error("[ATS Intelligence API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process and analyze resume document." },
      { status: 500 }
    );
  }
}
