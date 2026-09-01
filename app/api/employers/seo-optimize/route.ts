import { NextRequest, NextResponse } from "next/server";
import { FastRankEngine } from "@/lib/seo/fastRankEngine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, company, location, country, description, salary, visaTier } = body;

    if (!title || !company || !description) {
      return NextResponse.json(
        { success: false, error: "Job title, company name, and job description are required for SEO analysis." },
        { status: 400 }
      );
    }

    const analysis = FastRankEngine.analyzeJobListing({
      title,
      company,
      location: location || "Remote / Hybrid",
      country: country || "UK",
      description,
      salary,
      visaTier,
    });

    return NextResponse.json({
      success: true,
      seoExpert: {
        name: "Sumit Raj",
        title: "Chief SEO & Fast-Rank Growth Strategist",
        specialization: "7-Day Google Page 1 Job Portal Acceleration",
      },
      analysis,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to analyze job SEO." },
      { status: 500 }
    );
  }
}
