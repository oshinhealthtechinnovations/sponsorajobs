import { describe, it, expect, beforeAll } from "vitest";
import { FastRankEngine } from "@/lib/seo/fastRankEngine";
import { seoAutomationEngine } from "@/lib/seo/seoAutomationEngine";
import { POST as employerSeoPost } from "@/app/api/employers/seo-optimize/route";
import { GET as cronSeoGet } from "@/app/api/cron/seo-automation/route";
import { NextRequest } from "next/server";
import { runSeed } from "@/scripts/seed";

describe("2-Week (14-Day) Fast-Rank SEO Master Plan Tests", () => {
  beforeAll(async () => {
    await runSeed();
  });

  describe("FastRankEngine 14-Day Blueprint Generation", () => {
    it("should generate a complete 14-day roadmap with 7 days for Week 1 and 7 days for Week 2", () => {
      const plan = FastRankEngine.generateTwoWeekPlan(
        "Civil Engineer",
        "Morgan Sindall",
        "UK"
      );

      expect(plan).toHaveLength(14);

      const week1 = plan.filter((m) => m.week === 1);
      const week2 = plan.filter((m) => m.week === 2);

      expect(week1).toHaveLength(7);
      expect(week2).toHaveLength(7);

      // Verify sequence of days
      plan.forEach((m, idx) => {
        expect(m.day).toBe(idx + 1);
        expect(m.title.length).toBeGreaterThan(5);
        expect(m.focus.length).toBeGreaterThan(5);
        expect(m.actionItems.length).toBeGreaterThanOrEqual(3);
        expect(m.status).toBe("COMPLETED");
        expect(m.completedByDefault).toBe(true);
      });

      // Verify specific milestone content
      expect(plan[0].title).toContain("Technical Schema & Core Web Vitals Foundation");
      expect(plan[2].title).toContain("Rapid Google Indexing API & IndexNow Push");
      expect(plan[7].title).toContain("Long-Tail Keyword Expansion & Employer Licensing Verification");
      expect(plan[13].title).toContain("14-Day Performance Audit, SERP Rank Lock-In");
    });

    it("should include twoWeekPlan in analyzeJobListing output", () => {
      const analysis = FastRankEngine.analyzeJobListing({
        title: "Senior Project Manager",
        company: "Kier Group",
        location: "London, UK",
        country: "UK",
        description: "Leading civil construction projects with Tier 2 visa sponsorship and comprehensive relocation support.",
        salary: "£65,000 - £75,000",
      });

      expect(analysis.overallScore).toBeGreaterThanOrEqual(80);
      expect(analysis.sevenDayPlan).toHaveLength(7);
      expect(analysis.twoWeekPlan).toHaveLength(14);
      expect(analysis.focusKeywords.length).toBeGreaterThan(0);
      expect(analysis.schemaMarkup["@type"]).toBe("JobPosting");
    });
  });

  describe("Autonomous SEO Cycle with 2-Week Plan Integration", () => {
    it("should compute twoWeekPlanSummary during autonomous SEO cycle", async () => {
      const cycle = await seoAutomationEngine.runAutomatedSeoCycle({
        dryRun: true,
        notifyAdmin: false,
      });

      expect(cycle.twoWeekPlanSummary).toBeDefined();
      expect(cycle.twoWeekPlanSummary.totalMilestones).toBe(14);
      expect(cycle.twoWeekPlanSummary.week1Completed).toBe(7);
      expect(cycle.twoWeekPlanSummary.week2Completed).toBe(7);
      expect(cycle.twoWeekPlanSummary.completionPercentage).toBe(100);
      expect(cycle.twoWeekPlanSummary.activeFocus).toContain("Week 1");

      // Verify overall SEO score and zero errors
      expect(cycle.healthScore).toBeGreaterThanOrEqual(85);
      expect(cycle.routeSummary.zeroErrors).toBe(true);
      expect(cycle.routeSummary.broken).toBe(0);
    });
  });

  describe("API Endpoints 2-Week SEO Contract", () => {
    it("should return twoWeekPlan via POST /api/employers/seo-optimize", async () => {
      const req = new NextRequest("http://localhost:3000/api/employers/seo-optimize", {
        method: "POST",
        body: JSON.stringify({
          title: "BIM Coordinator",
          company: "Balfour Beatty",
          location: "Birmingham, UK",
          country: "UK",
          description: "Full BIM lifecycle management with verified Skilled Worker visa sponsorship available.",
          salary: "£50,000",
        }),
      });

      const res = await employerSeoPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.analysis.twoWeekPlan).toHaveLength(14);
      expect(data.analysis.twoWeekPlan[0].week).toBe(1);
      expect(data.analysis.twoWeekPlan[13].week).toBe(2);
    });

    it("should return twoWeekPlanSummary in GET /api/cron/seo-automation", async () => {
      const req = new NextRequest("http://localhost:3000/api/cron/seo-automation?dryRun=true");
      const res = await cronSeoGet(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cycle.twoWeekPlanSummary).toBeDefined();
      expect(data.cycle.twoWeekPlanSummary.totalMilestones).toBe(14);
    });
  });
});
