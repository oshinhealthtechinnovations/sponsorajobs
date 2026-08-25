import { NextRequest, NextResponse } from "next/server";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { publicApiRateLimiter } from "@/lib/security/rateLimiter";
import { sanitizeSearchQuery } from "@/lib/security/sanitize";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // 1. Rate Limiting Check (Section 54, 110)
  const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || "anonymous";
  const rateLimit = publicApiRateLimiter.check(clientIp);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too Many Requests", message: "Rate limit exceeded. Please retry shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.resetTime),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);

  const rawQ = searchParams.get("q") || undefined;
  const q = rawQ ? sanitizeSearchQuery(rawQ) : undefined;
  const country = searchParams.get("country") || undefined;
  const category = searchParams.get("category") || undefined;
  const city = searchParams.get("city") || undefined;
  const remoteType = searchParams.get("remoteType") || undefined;
  const employmentType = searchParams.get("employmentType") || undefined;
  const sponsorship = searchParams.get("sponsorship") || undefined;
  const minSalary = searchParams.get("minSalary") ? Number(searchParams.get("minSalary")) : undefined;
  const maxSalary = searchParams.get("maxSalary") ? Number(searchParams.get("maxSalary")) : undefined;
  const datePosted = searchParams.get("datePosted") || undefined;
  const sort = (searchParams.get("sort") as any) || "newest";
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const limit = searchParams.get("limit") ? Math.min(50, Number(searchParams.get("limit"))) : 20;

  const jobRepo = new JobRepository();
  const results = await jobRepo.search({
    q,
    country,
    category,
    city,
    remoteType,
    employmentType,
    sponsorship,
    minSalary,
    maxSalary,
    datePosted,
    sort,
    page,
    limit,
  });

  return NextResponse.json(
    {
      success: true,
      data: results.jobs,
      pagination: {
        total: results.total,
        page: results.page,
        limit: results.limit,
        totalPages: results.totalPages,
        hasNext: results.page < results.totalPages,
        hasPrev: results.page > 1,
      },
      appliedFilters: {
        q: q || null,
        country: country || null,
        category: category || null,
        city: city || null,
        remoteType: remoteType || null,
        employmentType: employmentType || null,
        sponsorship: sponsorship || null,
        minSalary: minSalary || null,
        maxSalary: maxSalary || null,
        datePosted: datePosted || null,
        sort,
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    }
  );
}
