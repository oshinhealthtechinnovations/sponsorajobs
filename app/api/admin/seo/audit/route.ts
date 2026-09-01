import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/services/adminAuth";
import { seoScoringEngine, PageAuditInput } from "@/lib/seo/scoringEngine";
import { blogRepository } from "@/lib/repositories/blogRepository";


export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminSession(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") || "single";
  const targetPath = searchParams.get("path") || "/";

  if (mode === "batch") {
    const reports = await seoScoringEngine.auditAllPageArchetypes();
    const averageScore = Math.round(
      reports.reduce((acc, r) => acc + r.totalScore, 0) / reports.length
    );

    return NextResponse.json({
      success: true,
      mode: "batch",
      averageScore,
      totalTemplates: reports.length,
      reports,
    });
  }

  // Single URL Audit
  let auditInput: PageAuditInput = {
    url: targetPath,
    title: "Visa Sponsorship Jobs | SponsorAJobs",
    description: "Search verified international employment opportunities with visa sponsorship across the UK, USA, Australia, Canada, and New Zealand.",
    canonicalUrl: `https://www.sponsorajobs.com${targetPath.startsWith("/") ? targetPath : "/" + targetPath}`,
    h1: "Verified Visa Sponsorship Job Search Engine",
    h2s: ["Browse by Jurisdiction", "Verified Sponsorship Listings", "Immigration Salary Standards"],
    wordCount: 750,
    keywords: ["jobs with visa sponsorship", "visa sponsorship jobs", "international career sponsorship"],
    schemas: [{ "@type": "WebSite", name: "SponsorAJobs" }, { "@type": "BreadcrumbList" }],
    hasOgTags: true,
    hasTwitterCard: true,
    isIndexable: true,
    inSitemap: true,
    hasResponsiveViewport: true,
  };

  // If testing a blog URL, fetch real data
  if (targetPath.startsWith("/blog/")) {
    const slug = targetPath.replace("/blog/", "").replace(/\/$/, "");
    const post = await blogRepository.getPostBySlug(slug);
    if (post) {
      auditInput = {
        url: targetPath,
        title: `${post.metaTitle} | SponsorAJobs`,
        description: post.metaDescription,
        canonicalUrl: `https://www.sponsorajobs.com/blog/${post.slug}`,
        h1: post.title,
        h2s: post.content.split("\n").filter((l) => l.startsWith("## ")).map((l) => l.replace("## ", "")),
        wordCount: post.content.split(/\s+/).length,
        keywords: post.targetKeywords,
        schemas: [
          { "@type": "BlogPosting", headline: post.title },
          { "@type": "FAQPage" },
          { "@type": "BreadcrumbList" },
        ],
        hasOgTags: true,
        hasTwitterCard: true,
        isIndexable: true,
        inSitemap: true,
        hasResponsiveViewport: true,
      };
    }
  }

  const report = seoScoringEngine.evaluatePage(auditInput);

  return NextResponse.json({
    success: true,
    mode: "single",
    report,
  });
}
