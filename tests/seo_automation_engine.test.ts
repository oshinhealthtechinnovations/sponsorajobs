import { describe, it, expect, beforeAll } from "vitest";
import { seoAutomationEngine } from "@/lib/seo/seoAutomationEngine";
import { GET as seoCronGet, POST as seoCronPost } from "@/app/api/cron/seo-automation/route";
import { POST as seoAdminPost } from "@/app/api/admin/seo/trigger/route";
import { NextRequest } from "next/server";
import { runSeed } from "@/scripts/seed";

describe("Autonomous SEO Automation Engine & Self-Trigger Tests", () => {
  beforeAll(async () => {
    await runSeed();
  });

  describe("Core SEO Automation Engine", () => {
    it("should execute an end-to-end SEO automation cycle with high health score", async () => {
      const result = await seoAutomationEngine.runAutomatedSeoCycle({
        dryRun: true,
        notifyAdmin: false,
      });

      expect(result).toBeDefined();
      expect(result.cycleId).toContain("seo_cycle_");
      expect(result.healthScore).toBeGreaterThanOrEqual(85);
      expect(["A+", "A"]).toContain(result.grade);

      // Route audit verification
      expect(result.routeSummary.totalAudited).toBeGreaterThanOrEqual(60);
      expect(result.routeSummary.broken).toBe(0);
      expect(result.routeSummary.zeroErrors).toBe(true);

      // Schema verification
      expect(result.schemaAudit.jobPostingValid).toBe(true);
      expect(result.schemaAudit.breadcrumbValid).toBe(true);
      expect(result.schemaAudit.websiteValid).toBe(true);

      // Search engine broadcast verification
      expect(result.searchEnginePings.indexNowSubmitted).toBeGreaterThan(30);
      expect(result.searchEnginePings.googleIndexingPings).toBeGreaterThan(0);
      expect(result.searchEnginePings.sitemapPings.google).toBe(true);
      expect(result.searchEnginePings.sitemapPings.bing).toBe(true);

      // Catalog SEO metrics
      expect(result.catalogSeoStats.totalActiveJobs).toBeGreaterThan(0);
      expect(result.catalogSeoStats.totalCompanies).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Self-Trigger API Endpoints", () => {
    it("should self-trigger via GET /api/cron/seo-automation", async () => {
      const req = new NextRequest("http://localhost:3000/api/cron/seo-automation?dryRun=true");
      const res = await seoCronGet(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cycle).toBeDefined();
      expect(data.cycle.routeSummary.zeroErrors).toBe(true);
    });

    it("should self-trigger via POST /api/cron/seo-automation", async () => {
      const req = new NextRequest("http://localhost:3000/api/cron/seo-automation?dryRun=true", {
        method: "POST",
      });
      const res = await seoCronPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.cycle.healthScore).toBeGreaterThanOrEqual(85);
    });

    it("should allow manual trigger via POST /api/admin/seo/trigger", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/seo/trigger", {
        method: "POST",
        body: JSON.stringify({ dryRun: true, notify: false }),
      });
      const res = await seoAdminPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.grade).toBeDefined();
    });
  });
});
