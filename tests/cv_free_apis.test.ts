import { describe, it, expect } from "vitest";
import { CvIntelligenceSuite } from "@/lib/services/cvIntelligenceSuite";
import { POST as coverLetterPost } from "@/app/api/tools/cv-cover-letter/route";
import { POST as bulletOptimizerPost } from "@/app/api/tools/cv-bullet-optimizer/route";
import { GET as occupationsGet } from "@/app/api/tools/cv-occupations/route";
import { NextRequest } from "next/server";

describe("Free CV Intelligence Suite & APIs", () => {
  describe("1. Visa Sponsorship Cover Letter Generator", () => {
    it("should generate a complete visa sponsorship cover letter addressing the employer", async () => {
      const result = await CvIntelligenceSuite.generateCoverLetter({
        candidateName: "David Chen",
        jobTitle: "Senior DevOps Engineer",
        companyName: "Monzo Bank",
        countryCode: "UK",
        experienceYears: 7,
        keySkills: ["Kubernetes", "Terraform", "AWS", "Go"],
      });

      expect(result).toBeDefined();
      expect(result.coverLetter).toContain("Monzo Bank");
      expect(result.coverLetter).toContain("Senior DevOps Engineer");
      expect(result.coverLetter).toContain("Skilled Worker");
      expect(result.subjectLine).toContain("Monzo Bank");
      expect(result.keySellingPoints.length).toBeGreaterThan(0);
      expect(result.recommendedSponsorshipArguments.length).toBeGreaterThan(0);
    });

    it("should execute via API route /api/tools/cv-cover-letter", async () => {
      const req = new NextRequest("http://localhost:3000/api/tools/cv-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: "Sarah Connor",
          jobTitle: "Cloud Architect",
          companyName: "Stripe",
          countryCode: "US",
        }),
      });

      const res = await coverLetterPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.coverLetter).toContain("Stripe");
      expect(data.data.coverLetter).toContain("H-1B");
    });
  });

  describe("2. CV Bullet Point Impact & Action Verb Optimizer", () => {
    it("should transform passive phrases like 'responsible for' into quantified action verbs", () => {
      const bullet = "Responsible for building backend services in Node.js";
      const optimized = CvIntelligenceSuite.optimizeBulletPoint(bullet);

      expect(optimized).toBeDefined();
      expect(optimized.original).toBe(bullet);
      expect(optimized.optimized).not.toContain("Responsible for");
      expect(optimized.actionVerbUsed).toBeDefined();
      expect(optimized.score).toBeGreaterThan(40);
    });

    it("should reward bullets that already contain measurable metrics", () => {
      const strongBullet = "Architected high-throughput payment pipeline processing $5M daily with 99.99% uptime";
      const analysis = CvIntelligenceSuite.optimizeBulletPoint(strongBullet);

      expect(analysis.metricsPresent).toBe(true);
      expect(analysis.score).toBeGreaterThanOrEqual(75);
    });

    it("should execute via API route /api/tools/cv-bullet-optimizer", async () => {
      const req = new NextRequest("http://localhost:3000/api/tools/cv-bullet-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullets: [
            "Assisted with customer onboarding database migration",
            "Helped the frontend team design new checkout screens",
          ],
        }),
      });

      const res = await bulletOptimizerPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(2);
      expect(data.results[0].optimized).not.toContain("Assisted with");
    });
  });

  describe("3. Immigration Occupation Codes (SOC / NOC / ANZSCO)", () => {
    it("should match relevant occupation codes for Software Engineer", () => {
      const results = CvIntelligenceSuite.matchOccupationCodes("software");

      expect(results.length).toBeGreaterThan(0);
      const sw = results[0];
      expect(sw.ukSocCode).toContain("2136");
      expect(sw.canadaNocCode).toContain("21232");
      expect(sw.australiaAnzscoCode).toContain("261313");
      expect(sw.isShortageList).toBe(true);
    });

    it("should execute via API route /api/tools/cv-occupations", async () => {
      const req = new NextRequest("http://localhost:3000/api/tools/cv-occupations?query=nurse");
      const res = await occupationsGet(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.occupations.length).toBeGreaterThan(0);
      expect(data.occupations[0].title).toContain("Nurse");
    });
  });
});
