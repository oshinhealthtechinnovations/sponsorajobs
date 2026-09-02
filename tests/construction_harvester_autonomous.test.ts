import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConstructionHarvesterService } from "@/lib/services/constructionHarvesterService";
import { GET as harvestCronHandler, POST as harvestCronPostHandler } from "@/app/api/cron/harvest-construction/route";
import { POST as harvestAdminHandler } from "@/app/api/admin/harvest/construction/route";
import { NextRequest } from "next/server";

describe("Autonomous Construction Harvester Engine & Cron Integration", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      const urlStr = String(url);
      if (urlStr.includes("ekfa.fa.em2.oraclecloud.com")) {
        // Costain
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: [{ requisitionList: [{ Id: "9999", Title: "Mock Site Engineer" }] }] }),
        };
      }
      if (urlStr.includes("wsp.wd3.myworkdayjobs.com")) {
        // WSP
        return {
          ok: true,
          status: 200,
          json: async () => ({ jobPostings: [{ title: "Mock Civil Lead", bulletFields: ["wsp_mock_1"] }] }),
        };
      }
      if (urlStr.includes("careers.laingorourke.com")) {
        // Laing
        return {
          ok: true,
          status: 200,
          text: async () => '<html><body><a href="/job/uk/98765/">Project Manager</a></body></html>',
        };
      }
      if (urlStr.includes("morgansindallinfrastructure.com")) {
        // Morgan Sindall
        return {
          ok: true,
          status: 200,
          json: async () => ({ jobs: [{ reference: "MS_MOCK_1", title: "Site Supervisor" }] }),
        };
      }
      if (urlStr.includes("skanska.avature.net")) {
        // Skanska
        return {
          ok: true,
          status: 200,
          text: async () => '<article class="article article--result"><a href="https://skanska.avature.net/JobDetail/9911">Planner</a></article>',
        };
      }
      if (urlStr.includes("bamcareers.com")) {
        // BAM
        return {
          ok: true,
          status: 200,
          text: async () => 'var data = {"eagerLoadRefineSearch":true,"jobs":[{"jobSeqNo":"BAM_MOCK_1","title":"Junior Quantity Surveyor"}]};',
        };
      }
      if (urlStr.includes("cbct.fa.em2.oraclecloud.com")) {
        // Galliford Try
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: [{ requisitionList: [{ Id: "8888", Title: "Fitter Operative" }] }] }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should run a dryRun harvest cycle and return all 7 Tier 1 contractors with telemetry", async () => {
    const service = new ConstructionHarvesterService();
    const result = await service.runHarvestCycle({ dryRun: true });

    expect(result).toBeDefined();
    expect(result.cycleId).toMatch(/^harv_cycle_/);
    expect(result.contractorStats).toHaveLength(7);

    const contractorNames = result.contractorStats.map((s) => s.sourceName);
    expect(contractorNames).toContain("Costain Group");
    expect(contractorNames).toContain("WSP UK");
    expect(contractorNames).toContain("Laing O'Rourke");
    expect(contractorNames).toContain("Morgan Sindall");
    expect(contractorNames).toContain("Skanska UK");
    expect(contractorNames).toContain("BAM UK");
    expect(contractorNames).toContain("Galliford Try");

    expect(result.totalFetched).toBeGreaterThanOrEqual(7);
    expect(result.status).toBe("success");
  });

  it("should serve /api/cron/harvest-construction GET request with dryRun=true", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/harvest-construction?dryRun=true");
    const response = await harvestCronHandler(req);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("Autonomous construction harvester");
    expect(json.result.contractorStats.length).toBe(7);
  });

  it("should serve /api/cron/harvest-construction POST request", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/harvest-construction?dryRun=true", { method: "POST" });
    const response = await harvestCronPostHandler(req);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.result.contractorStats.length).toBe(7);
  });

  it("should serve /api/admin/harvest/construction POST request", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/harvest/construction?dryRun=true", { method: "POST" });
    const response = await harvestAdminHandler(req);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("Manual construction harvester");
    expect(json.result.contractorStats.length).toBe(7);
  });
});
