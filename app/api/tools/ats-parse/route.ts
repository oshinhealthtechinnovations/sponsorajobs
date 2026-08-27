import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeATS, matchResumeToJobs } from "@/lib/services/atsScanner";
import { JobRepository } from "@/lib/repositories/jobRepository";

// Dynamic require for pdf-parse to handle CommonJS export in ESM/Next.js
const pdfParse = require("pdf-parse");

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawTextParam = formData.get("text") as string | null;
    const targetCountry = (formData.get("country") as string) || "all";

    let extractedText = "";

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".pdf")) {
        try {
          const pdfData = await pdfParse(buffer);
          extractedText = pdfData?.text || "";
        } catch (pdfErr: any) {
          console.warn("[ATS Parse] PDF parse fallback:", pdfErr?.message);
          extractedText = buffer.toString("utf-8");
        }
      } else {
        extractedText = buffer.toString("utf-8");
      }
    } else if (rawTextParam) {
      extractedText = rawTextParam;
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        { error: "Could not extract readable text from the provided document. Please upload a clear PDF, DOCX, or paste your resume text." },
        { status: 400 }
      );
    }

    // 1. Run Comprehensive ATS & Visa Analysis
    const analysis = analyzeResumeATS(extractedText);

    // 2. Fetch Live Matching Verified Jobs
    const jobRepo = new JobRepository();
    const searchRes = await jobRepo.search({
      country: targetCountry !== "all" ? targetCountry : undefined,
      limit: 50,
      sort: "sponsorship",
    });

    const matches = matchResumeToJobs(analysis, searchRes.jobs, targetCountry);

    return NextResponse.json({
      success: true,
      extractedTextLength: extractedText.length,
      wordCount: analysis.wordCount,
      analysis,
      matches,
    });
  } catch (error: any) {
    console.error("[ATS API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process and analyze resume document." },
      { status: 500 }
    );
  }
}
