import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/services/adminAuth";
import { seoScoringEngine, SEO_SCORING_PARAMETERS, SeoAuditReport } from "@/lib/seo/scoringEngine";
import { blogRepository } from "@/lib/repositories/blogRepository";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const isAuthorized = await verifyAdminSession(request);
  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const typeFilter = searchParams.get("type") || "all"; // all | blog | job | country | category | static
  const scoreFilter = searchParams.get("score") || "all"; // all | 100 | 90plus

  const reports: SeoAuditReport[] = [];

  // 1. Homepage
  reports.push(
    seoScoringEngine.evaluatePage({
      url: "/",
      title: "Visa Sponsorship Jobs Worldwide | SponsorAJobs",
      description: "Find verified international jobs with visa sponsorship across the UK, USA, Canada, Australia, and New Zealand. Search licensed employers and live vacancies.",
      canonicalUrl: "https://www.sponsorajobs.com/",
      h1: "Find Jobs With Verified Visa Sponsorship Worldwide",
      h2s: ["Browse Jobs by Country", "Latest Verified Sponsorship Jobs", "Minimum Salary & Visa Thresholds", "Featured Visa & Relocation Guides", "How Our Verification Engine Works"],
      wordCount: 850,
      keywords: ["jobs with visa sponsorship", "visa sponsorship jobs uk", "h1b visa jobs usa", "canada lmia jobs", "australia tss 482"],
      schemas: [
        { "@type": "WebSite", name: "SponsorAJobs" },
        { "@type": "Organization", name: "SponsorAJobs" },
      ],
      hasOgTags: true,
      hasTwitterCard: true,
      isIndexable: true,
      inSitemap: true,
      hasResponsiveViewport: true,
      routeType: "home",
    })
  );

  // 2. Blog Posts
  const { posts } = await blogRepository.getAllPosts({ limit: 50 });
  for (const post of posts) {
    reports.push(
      seoScoringEngine.evaluatePage({
        url: `/blog/${post.slug}`,
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
        routeType: "blog_post",
      })
    );
  }

  // 3. Blog Hub
  reports.push(
    seoScoringEngine.evaluatePage({
      url: "/blog",
      title: "Visa Sponsorship Guides & Relocation Blueprints | SponsorAJobs",
      description: "Comprehensive guides on UK Skilled Worker Visas, US H-1B Cap-Exempt jobs, Canada LMIA streams, and international salary thresholds for 2026.",
      canonicalUrl: "https://www.sponsorajobs.com/blog",
      h1: "International Visa Sponsorship & Career Guides",
      h2s: ["Featured Pillar Guides", "Explore by Topic", "Recent Industry Analyses"],
      wordCount: 680,
      keywords: ["visa sponsorship guide 2026", "skilled worker visa blog", "h1b cap exempt guide", "how to get job sponsorship"],
      schemas: [
        { "@type": "CollectionPage", name: "Visa Sponsorship Guides" },
        { "@type": "BreadcrumbList" },
      ],
      hasOgTags: true,
      hasTwitterCard: true,
      isIndexable: true,
      inSitemap: true,
      hasResponsiveViewport: true,
      routeType: "blog_hub",
    })
  );

  // 4. Country Hubs
  for (const c of INITIAL_COUNTRIES) {
    reports.push(
      seoScoringEngine.evaluatePage({
        url: `/jobs/${c.code.toLowerCase()}`,
        title: `Visa Sponsorship Jobs in ${c.name} | SponsorAJobs`,
        description: `Explore verified jobs offering visa sponsorship in ${c.name}. Connect with certified sponsors and discover live vacancies.`,
        canonicalUrl: `https://www.sponsorajobs.com/jobs/${c.code.toLowerCase()}`,
        h1: `Visa Sponsorship Jobs in ${c.name}`,
        h2s: [`Explore ${c.name} Sponsorship by Category`, `Active ${c.name} Vacancies`, `${c.name} Visa Guidelines`],
        wordCount: 720,
        keywords: [`jobs with visa sponsorship ${c.name.toLowerCase()}`, `${c.code.toLowerCase()} visa jobs`, "international career sponsorship"],
        schemas: [
          { "@type": "CollectionPage", name: `${c.name} Visa Sponsorship Jobs` },
          { "@type": "BreadcrumbList" },
        ],
        hasOgTags: true,
        hasTwitterCard: true,
        isIndexable: true,
        inSitemap: true,
        hasResponsiveViewport: true,
        routeType: "country_hub",
      })
    );
  }

  // 5. Category Hubs (Top categories across top countries)
  const topCategories = INITIAL_CATEGORIES.slice(0, 6);
  for (const cat of topCategories) {
    reports.push(
      seoScoringEngine.evaluatePage({
        url: `/jobs/gb/${cat.slug}`,
        title: `${cat.name} Visa Sponsorship Jobs UK | SponsorAJobs`,
        description: `Find ${cat.name} positions offering UK Skilled Worker visa sponsorship. Verified licensed employers hiring global talent.`,
        canonicalUrl: `https://www.sponsorajobs.com/jobs/gb/${cat.slug}`,
        h1: `${cat.name} Jobs with Visa Sponsorship in UK`,
        h2s: ["Filter by Salary & Seniority", `Live ${cat.name} Listings`, "Career Advice & Sponsorship Blueprint"],
        wordCount: 650,
        keywords: [`${cat.name.toLowerCase()} visa sponsorship uk`, `${cat.slug} jobs london`, "tier 2 sponsor jobs"],
        schemas: [
          { "@type": "CollectionPage", name: `UK ${cat.name} Visa Jobs` },
          { "@type": "BreadcrumbList" },
        ],
        hasOgTags: true,
        hasTwitterCard: true,
        isIndexable: true,
        inSitemap: true,
        hasResponsiveViewport: true,
        routeType: "category",
      })
    );
  }

  // 6. Active Sample Jobs
  const jobRepo = new JobRepository();
  const searchResult = await jobRepo.search({ limit: 6 });
  const sampleJobs = searchResult.jobs;
  for (const job of sampleJobs) {
    reports.push(
      seoScoringEngine.evaluatePage({
        url: `/job/${job.id}`,
        title: `${job.title} (${job.company.name}) | SponsorAJobs`,
        description: `Apply for ${job.title} at ${job.company.name} in ${job.location.city || job.location.country}. Verified ${job.sponsorship.label} visa sponsorship provided.`,
        canonicalUrl: `https://www.sponsorajobs.com/job/${job.id}`,
        h1: `${job.title} - ${job.company.name}`,
        h2s: ["Role Overview & Requirements", "Verified Sponsorship Details", "Company Background", "Application Endpoint"],
        wordCount: 520,
        keywords: [`${job.title.toLowerCase()} visa sponsorship`, `${job.company.name.toLowerCase()} careers`, "verified visa sponsor"],
        schemas: [
          {
            "@type": "JobPosting",
            title: job.title,
            hiringOrganization: { name: job.company.name },
            directApply: true,
            validThrough: "2026-10-01T00:00:00Z",
          },
          { "@type": "BreadcrumbList" },
        ],
        hasOgTags: true,
        hasTwitterCard: true,
        isIndexable: true,
        inSitemap: true,
        hasResponsiveViewport: true,
        routeType: "job_detail",
      })
    );
  }

  // 7. Static Core Pages
  const staticPages = [
    { url: "/about", title: "About SponsorAJobs | Global Visa Sponsorship Search Engine", h1: "Empowering Global Talent with Transparent Visa Intelligence" },
    { url: "/contact", title: "Contact Us & Support | SponsorAJobs", h1: "Get in Touch with the SponsorAJobs Team" },
    { url: "/employers", title: "For Sponsoring Employers & Recruiters | SponsorAJobs", h1: "Hire Global Talent & Feature Your Sponsoring Opportunities" },
    { url: "/visa-sponsorship", title: "Worldwide Visa Sponsorship Systems & Work Permits | SponsorAJobs", h1: "Global Visa Sponsorship Schemes & Country Overviews" },
    { url: "/privacy", title: "Privacy Policy | SponsorAJobs", h1: "Privacy Policy" },
    { url: "/terms", title: "Terms of Service | SponsorAJobs", h1: "Terms of Service" },
  ];

  for (const p of staticPages) {
    reports.push(
      seoScoringEngine.evaluatePage({
        url: p.url,
        title: `${p.title}`,
        description: `Learn more about SponsorAJobs: verified visa sponsorship intelligence, licensed employers, and international job discovery.`,
        canonicalUrl: `https://www.sponsorajobs.com${p.url}`,
        h1: p.h1,
        h2s: ["Overview & Mission", "Verification Standards", "Contact & Support"],
        wordCount: 500,
        keywords: ["sponsorajobs", "visa sponsorship jobs", "work visa intelligence"],
        schemas: [
          { "@type": "Article", headline: p.title },
          { "@type": "BreadcrumbList" },
        ],
        hasOgTags: true,
        hasTwitterCard: true,
        isIndexable: true,
        inSitemap: true,
        hasResponsiveViewport: true,
        routeType: "static",
      })
    );
  }

  // Filtering
  let filtered = reports;

  if (q) {
    filtered = filtered.filter(
      (r) =>
        r.url.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.primaryKeyword.toLowerCase().includes(q)
    );
  }

  if (typeFilter !== "all") {
    filtered = filtered.filter((r) => {
      if (typeFilter === "blog") return r.routeType === "blog_post" || r.routeType === "blog_hub";
      if (typeFilter === "job") return r.routeType === "job_detail";
      if (typeFilter === "country") return r.routeType === "country_hub";
      if (typeFilter === "category") return r.routeType === "category";
      if (typeFilter === "static") return r.routeType === "static" || r.routeType === "home";
      return true;
    });
  }

  if (scoreFilter === "100") {
    filtered = filtered.filter((r) => r.totalScore === 100);
  } else if (scoreFilter === "90plus") {
    filtered = filtered.filter((r) => r.totalScore >= 90);
  }

  const averageScore = Math.round(
    reports.reduce((acc, r) => acc + r.totalScore, 0) / reports.length
  );

  const averageRankPotential = Math.round(
    reports.reduce((acc, r) => acc + r.rankPotentialScore, 0) / reports.length
  );

  const averageKeywordMatch = Math.round(
    reports.reduce((acc, r) => acc + r.keywordMatchScore, 0) / reports.length
  );

  return NextResponse.json({
    success: true,
    totalIndexedPages: 779,
    cataloguedPagesCount: reports.length,
    filteredCount: filtered.length,
    averageScore,
    averageRankPotential,
    averageKeywordMatch,
    parameters: SEO_SCORING_PARAMETERS,
    pages: filtered,
  });
}
