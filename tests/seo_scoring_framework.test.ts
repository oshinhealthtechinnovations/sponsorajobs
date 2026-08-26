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

  it("should have all 16 parameter definitions totaling 100 max points across 4 pillars", async () => {
    const { SEO_SCORING_PARAMETERS } = await import("../lib/seo/scoringEngine");
    expect(SEO_SCORING_PARAMETERS.length).toBe(16);
    const totalMax = SEO_SCORING_PARAMETERS.reduce((acc, p) => acc + p.maxPoints, 0);
    expect(totalMax).toBe(100);
  });

  it("should calculate high keyword match score and rank potential for keyword-targeted content", () => {
    const kwMatch = seoScoringEngine.calculateKeywordMatch(
      "UK Skilled Worker visa jobs with visa sponsorship in London and Manchester.",
      ["uk skilled worker visa", "jobs with visa sponsorship"]
    );
    expect(kwMatch).toBeGreaterThanOrEqual(90);

    const rankPotential = seoScoringEngine.calculateRankPotential(100, kwMatch, 850, true);
    expect(rankPotential).toBeGreaterThanOrEqual(95);
  });
});
