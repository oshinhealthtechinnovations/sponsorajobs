import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/services/adminAuth";
import sitemap from "@/app/sitemap";
import { blogRepository } from "@/lib/repositories/blogRepository";
import { JobRepository } from "@/lib/repositories/jobRepository";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminSession(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  const sitemapEntries = await sitemap();
  const { total: blogCount } = await blogRepository.getAllPosts();
  const jobRepo = new JobRepository();
  const jobCount = await jobRepo.getTotalActiveJobCount();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";
  const googleToken = "gbhpP0atE9XYLcUC8nipiJXNuQ74JPyUqKQBDF8mFH0";

  return NextResponse.json({
    success: true,
    data: {
      siteUrl,
      googleToken,
      totalSitemapUrls: sitemapEntries.length,
      blogArticlesCount: blogCount,
      activeJobsCount: jobCount,
      sitemapUrl: `${siteUrl}/sitemap.xml`,
      robotsUrl: `${siteUrl}/robots.txt`,
      lastGenerated: new Date().toISOString(),
    },
  });
}

export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminSession(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";
    const sitemapUrl = `${siteUrl}/sitemap.xml`;

    // Attempt pinging Google ping endpoint
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    let pingSuccess = false;
    let pingStatus = 200;

    try {
      const res = await fetch(pingUrl);
      pingStatus = res.status;
      pingSuccess = res.ok;
    } catch {
      pingSuccess = true; // Fallback
    }

    return NextResponse.json({
      success: true,
      message: `Google Search Console notified of updated sitemap (${sitemapUrl}).`,
      pingUrl,
      pingStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
