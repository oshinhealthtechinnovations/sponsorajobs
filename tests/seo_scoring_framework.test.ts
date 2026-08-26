import { describe, it, expect } from "vitest";
import { seoScoringEngine } from "../lib/seo/scoringEngine";

describe("SEO Scoring Engine & Page Audit Framework", () => {
  it("should calculate a perfect 100/100 score for a fully compliant page", () => {
    const report = seoScoringEngine.evaluatePage({
      url: "/blog/uk-skilled-worker-visa-sponsorship-guide-2026",
      title: "UK Skilled Worker Visa Sponsorship Guide 2026 | SponsorAJobs",
      description: "Comprehensive 2026 guide to UK Skilled Worker visa sponsorship. Learn minimum salary thresholds, Certificate of Sponsorship (CoS), eligible SOC codes, and how to apply.",
      canonicalUrl: "https://www.sponsorajobs.com/blog/uk-skilled-worker-visa-sponsorship-guide-2026",
      h1: "Complete UK Skilled Worker Visa Sponsorship Guide",
      h2s: ["Salary Threshold Rules", "Certificate of Sponsorship (CoS)", "Shortage Occupations"],
      wordCount: 1200,
      keywords: ["uk skilled worker visa", "jobs with visa sponsorship uk"],
      schemas: [
        { "@type": "BlogPosting", headline: "UK Visa Guide" },
        { "@type": "FAQPage" },
        { "@type": "BreadcrumbList" },
      ],
      hasOgTags: true,
      hasTwitterCard: true,
      isIndexable: true,
      inSitemap: true,
      hasResponsiveViewport: true,
    });

    expect(report.totalScore).toBe(100);
    expect(report.grade).toBe("A+ (100/100)");
    expect(report.pillars.metaArchitecture.score).toBe(25);
    expect(report.pillars.structuredData.score).toBe(25);
    expect(report.pillars.contentQuality.score).toBe(25);
    expect(report.pillars.technicalIndexability.score).toBe(25);
    expect(report.passedChecksCount).toBe(report.totalChecksCount);
  });

  it("should deduct points when title is too short or missing brand suffix", () => {
    const report = seoScoringEngine.evaluatePage({
      url: "/short-title",
      title: "Jobs", // Too short (<30 chars) and unbranded
      description: "A valid description that exceeds one hundred characters so it passes the meta description test length successfully.",
      canonicalUrl: "https://www.sponsorajobs.com/short-title",
      h1: "Jobs Page",
      h2s: ["Section 1"],
      wordCount: 500,
      hasOgTags: true,
      hasTwitterCard: true,
    });

    expect(report.pillars.metaArchitecture.score).toBeLessThan(25);
    expect(report.totalScore).toBeLessThan(100);
  });

  it("should deduct points when canonical tag is missing", () => {
    const report = seoScoringEngine.evaluatePage({
      url: "/missing-canonical",
      title: "Valid Title With Proper Character Length | SponsorAJobs",
      description: "A valid description that exceeds one hundred characters so it passes the meta description test length successfully.",
      canonicalUrl: "", // Missing canonical
      h1: "Proper H1 Title",
      h2s: ["Section 1"],
      wordCount: 500,
      hasOgTags: true,
      hasTwitterCard: true,
    });

    const canonicalCheck = report.pillars.metaArchitecture.checks.find((c) => c.id === "meta_canonical");
    expect(canonicalCheck?.passed).toBe(false);
    expect(canonicalCheck?.pointsAwarded).toBe(0);
  });

  it("should verify that all 7 primary website templates score 100/100", async () => {
    const batchReports = await seoScoringEngine.auditAllPageArchetypes();

    expect(batchReports.length).toBe(7);

    for (const r of batchReports) {
      expect(r.totalScore).toBe(100);
      expect(r.grade).toBe("A+ (100/100)");
      expect(r.pillars.metaArchitecture.score).toBe(25);
      expect(r.pillars.structuredData.score).toBe(25);
      expect(r.pillars.contentQuality.score).toBe(25);
      expect(r.pillars.technicalIndexability.score).toBe(25);
    }
  });
});
