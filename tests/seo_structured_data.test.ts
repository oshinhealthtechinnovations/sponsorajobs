import { describe, it, expect, beforeAll } from "vitest";
import { generateJobPostingSchema, generateBreadcrumbSchema, generateWebsiteSchema } from "../lib/seo/schema";
import { constructMetadata } from "../lib/seo/metadata";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { runSeed } from "../scripts/seed";

describe("Phase 8: Programmatic SEO & Structured Data Tests (Sections 41-49, 139, 140, 141)", () => {
  beforeAll(async () => {
    await runSeed();
  });

  // 1. Google JobPosting Schema Test (Section 46)
  describe("JobPosting JSON-LD Schema", () => {
    it("should generate a valid Google JobPosting schema object", () => {
      const mockJob: any = {
        id: "job_test_123",
        title: "Staff Software Engineer - Cloud Platform",
        company_name: "Atlassian",
        company_website: "https://atlassian.com",
        company_logo_url: "https://atlassian.com/logo.png",
        description: "Join our cloud team. Skilled Worker visa sponsorship available.",
        description_clean: "Join our cloud team. Skilled Worker visa sponsorship available.",
        city: "London",
        region: "Greater London",
        country_code: "GB",
        remote_type: "REMOTE",
        employment_type: "FULL_TIME",
        salary_min: 95000,
        salary_max: 130000,
        salary_currency: "GBP",
        published_at: "2026-08-01T00:00:00Z",
        created_at: "2026-08-01T00:00:00Z",
      };

      const schema = generateJobPostingSchema(mockJob);
      expect(schema).not.toBeNull();
      if (!schema) return;

      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("JobPosting");
      expect(schema.title).toBe("Staff Software Engineer - Cloud Platform");
      expect(schema.datePosted).toBeDefined();
      expect(schema.validThrough).toBeDefined();
      expect(schema.directApply).toBe(true);

      // Hiring Organization
      expect(schema.hiringOrganization["@type"]).toBe("Organization");
      expect(schema.hiringOrganization.name).toBe("Atlassian");

      // Location & Remote
      expect(schema.jobLocationType).toBe("TELECOMMUTE");
      expect(schema.applicantLocationRequirements["@type"]).toBe("Country");

      // Salary QuantitativeValue
      expect(schema.baseSalary["@type"]).toBe("MonetaryAmount");
      expect(schema.baseSalary.currency).toBe("GBP");
      expect(schema.baseSalary.value.minValue).toBe(95000);
      expect(schema.baseSalary.value.maxValue).toBe(130000);
    });
  });

  // 2. BreadcrumbList Schema Test
  describe("BreadcrumbList Schema", () => {
    it("should generate valid hierarchical breadcrumb list items", () => {
      const breadcrumbs = generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "United Kingdom", url: "/jobs/gb" },
        { name: "Engineering", url: "/jobs/gb/engineering" },
      ]);

      expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
      expect(breadcrumbs.itemListElement.length).toBe(3);
      expect(breadcrumbs.itemListElement[0].position).toBe(1);
      expect(breadcrumbs.itemListElement[0].item).toBe("https://sponsorajobs.com/");
      expect(breadcrumbs.itemListElement[2].item).toBe("https://sponsorajobs.com/jobs/gb/engineering");
    });
  });

  // 3. Robots.txt Directives Test (Section 47)
  describe("robots.ts Directives", () => {
    it("should allow root and disallow admin/api paths while referencing sitemap", () => {
      const res = robots();
      expect(res.sitemap).toBe("https://sponsorajobs.com/sitemap.xml");

      const rules: any = res.rules;
      const rule = Array.isArray(rules) ? rules[0] : rules;

      expect(rule.allow).toBe("/");
      expect(rule.disallow).toContain("/admin/");
      expect(rule.disallow).toContain("/api/");
    });
  });

  // 4. Dynamic Sitemap Completeness Test (Section 48 & 49)
  describe("sitemap.ts Generator", () => {
    it("should include core landing pages, country hubs, category hubs, and matrix combinations", async () => {
      const entries = await sitemap();
      expect(entries.length).toBeGreaterThan(50);

      const urls = entries.map((e) => e.url);

      // Core pages
      expect(urls).toContain("https://sponsorajobs.com");
      expect(urls).toContain("https://sponsorajobs.com/jobs");
      expect(urls).toContain("https://sponsorajobs.com/visa-sponsorship");

      // 5 Countries
      expect(urls).toContain("https://sponsorajobs.com/jobs/gb");
      expect(urls).toContain("https://sponsorajobs.com/jobs/us");
      expect(urls).toContain("https://sponsorajobs.com/jobs/au");
      expect(urls).toContain("https://sponsorajobs.com/jobs/ca");
      expect(urls).toContain("https://sponsorajobs.com/jobs/nz");

      // Programmatic matrix hubs
      expect(urls).toContain("https://sponsorajobs.com/jobs/gb/engineering");
      expect(urls).toContain("https://sponsorajobs.com/jobs/us/information-technology");
    });
  });

  // 5. Thin Content NoIndex Safeguard Test (Section 44 & 140)
  describe("Metadata & Thin Content Protection (Section 140)", () => {
    it("should set robots: { index: false } when jobCount < 5", () => {
      const meta = constructMetadata({
        title: "Niche Subcategory Jobs",
        description: "Test description",
        path: "/jobs/nz/niche",
        jobCount: 2, // Less than 5 jobs
      });

      expect(meta.robots).toEqual(
        expect.objectContaining({
          index: false,
          follow: true,
        })
      );
    });

    it("should allow index when jobCount >= 5", () => {
      const meta = constructMetadata({
        title: "Engineering Jobs in UK",
        description: "Test description",
        path: "/jobs/gb/engineering",
        jobCount: 12,
      });

      expect(meta.robots).toEqual(
        expect.objectContaining({
          index: true,
          follow: true,
        })
      );
    });
  });
});
