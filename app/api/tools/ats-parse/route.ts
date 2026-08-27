import { NextRequest, NextResponse } from "next/server";
import { analyzeCVIntelligence, analyzeResumeATS, matchResumeToJobs } from "@/lib/services/atsScanner";
import { extractTextFromPDFBuffer } from "@/lib/services/pdfExtractor";
import { JobRepository } from "@/lib/repositories/jobRepository";

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
        extractedText = extractTextFromPDFBuffer(buffer);
      } else {
        extractedText = buffer.toString("utf-8");
      }
    } else if (rawTextParam) {
      extractedText = rawTextParam;
    }

    if (!extractedText || extractedText.trim().length < 15) {
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

    // 2. Run Comprehensive 5-Layer Deterministic Intelligence Analysis
    const intelligence = analyzeCVIntelligence(
      extractedText,
      targetJob,
      targetCountry === "all" ? "GB" : targetCountry
    );

    // 3. Backward-compatible legacy analysis structure
    const legacyAnalysis = analyzeResumeATS(extractedText);

    // 4. Fetch Live Matching Verified Jobs from Database
    let matches: any[] = [];
    try {
      const searchRes = await jobRepo.search({
        country: targetCountry !== "all" ? targetCountry : undefined,
        limit: 30,
        sort: "sponsorship",
      });
      matches = matchResumeToJobs(legacyAnalysis, searchRes.jobs, targetCountry);
    } catch (searchErr) {
      console.warn("[ATS API] Job match query failed:", searchErr);
    }

    // 5. Persist Scan into CV Intelligence Database
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
      intelligence,
      analysis: legacyAnalysis,
      matches,
    });
  } catch (error: any) {
    console.error("[ATS Intelligence API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process and analyze resume document." },
      { status: 500 }
    );
  }
}
