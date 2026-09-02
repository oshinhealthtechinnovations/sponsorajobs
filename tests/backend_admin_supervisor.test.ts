import { describe, it, expect, beforeAll } from "vitest";
import { backendAdminSupervisor } from "@/lib/services/backendAdminSupervisor";
import { GET as backendHealthGet } from "@/app/api/admin/health/backend/route";
import { GET as hourlyReportGet } from "@/app/api/cron/hourly-report/route";
import { NextRequest } from "next/server";
import { runSeed } from "@/scripts/seed";

describe("Backend Admin Supervisor & Hourly Update Tests", () => {
  beforeAll(async () => {
    await runSeed();
  });

  describe("6-Pillar System Deep Inspection", () => {
    it("should audit all 6 backend pillars and return Grade A+ health", async () => {
      const audit = await backendAdminSupervisor.performFullSystemInspection();

      expect(audit).toBeDefined();
      expect(audit.auditId).toContain("supervisor_audit_");
      expect(audit.overallHealthScore).toBeGreaterThanOrEqual(90);
      expect(["A+", "A"]).toContain(audit.overallGrade);

      // Verify all 6 pillars exist and are healthy
      expect(audit.pillars.database.status).toBe("HEALTHY");
      expect(audit.pillars.database.score).toBeGreaterThanOrEqual(90);

      expect(audit.pillars.ingestion.status).toBe("HEALTHY");
      expect(audit.pillars.ingestion.score).toBeGreaterThanOrEqual(90);

      expect(audit.pillars.seo.status).toBe("HEALTHY");
      expect(audit.pillars.seo.details.brokenRoutes).toBe(0);

      expect(audit.pillars.usersAndAuth.status).toBe("HEALTHY");
      expect(audit.pillars.emailAndCommunications.status).toBe("HEALTHY");
      expect(audit.pillars.securityAndSentinels.status).toBe("HEALTHY");

      // Verify live metrics
      expect(audit.liveMetrics.activeJobs).toBeGreaterThan(1000);
      expect(audit.liveMetrics.totalCompanies).toBeGreaterThan(200);
      expect(audit.liveMetrics.totalRoutesAudited).toBeGreaterThanOrEqual(60);
      expect(audit.liveMetrics.brokenRoutesCount).toBe(0);
      expect(audit.operationalRecommendations.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Backend Command Center API (/api/admin/health/backend)", () => {
    it("should return live real-time status of all 6 pillars", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/health/backend");
      const res = await backendHealthGet(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.audit).toBeDefined();
      expect(data.audit.pillars.database).toBeDefined();
      expect(data.audit.pillars.seo.details.brokenRoutes).toBe(0);
    });
  });

  describe("Hourly Report Integration (/api/cron/hourly-report)", () => {
    it("should compile hourly update with 6-pillar telemetry", async () => {
      const req = new NextRequest("http://localhost:3000/api/cron/hourly-report?email=test.admin@sponsorajobs.com");
      const res = await hourlyReportGet(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.overallHealthScore).toBeGreaterThanOrEqual(90);
      expect(data.pillars).toBeDefined();
      expect(data.liveMetrics.brokenRoutesCount).toBe(0);
    });
  });
});
