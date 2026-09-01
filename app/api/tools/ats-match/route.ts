import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeATS, matchResumeWithJobs } from "@/lib/services/atsScanner";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { publicApiRateLimiter } from "@/lib/security/rateLimiter";


export async function POST(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";
  try {
    // 1. Rate limiting per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "anonymous_ats";
    const limitCheck = publicApiRateLimiter.check(`ats_${ip}`);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many analysis requests. Please try again in ${limitCheck.resetTime} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    let { text, targetCountry, targetCategory } = body;

    if (!text || typeof text !== "string" || text.trim().length < 15) {
      return NextResponse.json(
        { success: false, error: "Please provide valid resume or CV text (at least 15 characters)." },
        { status: 400 }
      );
    }

    // Cleanly truncate text to first 25,000 characters to prevent buffer overflow while allowing full resumes
    if (text.length > 25000) {
      text = text.slice(0, 25000);
    }

    // 2. Perform deep ATS & Visa Readiness Analysis
    const analysis = analyzeResumeATS(text);

    // 3. Query live database jobs for recommendations
    const jobRepo = new JobRepository();
    const searchRes = await jobRepo.search({
      country: targetCountry && targetCountry !== "all" ? targetCountry : undefined,
      category: targetCategory && targetCategory !== "all" ? targetCategory : undefined,
      limit: 20,
      sort: "sponsorship",
    });

    // 4. Compute candidate-job compatibility matches
    const matches = matchResumeWithJobs(analysis, text, searchRes.jobs, 6);

    return NextResponse.json({
      success: true,
      analysis,
      matches,
    });
  } catch (err: any) {
    console.error("[ATS:Match] Error analyzing resume:", err);
    return NextResponse.json(
      { success: false, error: isDev ? (err?.message || "Failed to analyze resume") : "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}
