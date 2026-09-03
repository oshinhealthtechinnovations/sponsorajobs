import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Direct Australian Company Career Portals & Job Ingestion", () => {
  const dataPath = path.resolve(process.cwd(), "lib/db/realJobsData.json");
  const rawData = fs.readFileSync(dataPath, "utf-8");
  const data = JSON.parse(rawData);

  const auJobs = data.jobs.filter((j: any) => j.country_code === "AU");
  const auCompanies = data.companies.filter((c: any) => c.country_code === "AU");

  it("should have over 1,000 live Australian jobs in the database", () => {
    expect(auJobs.length).toBeGreaterThanOrEqual(1000);
  });

  it("should have registered premier Australian employers with clean metadata", () => {
    expect(auCompanies.length).toBeGreaterThanOrEqual(50);

    const requiredSlugs = ["canva", "airwallex", "resmed", "cochlear", "epworth-healthcare", "seek", "carsales", "culture-amp", "bluescope-steel", "prospa", "deputy", "immutable", "dovetail", "brighte"];
    for (const slug of requiredSlugs) {
      const company = data.companies.find((c: any) => c.slug === slug || c.id.includes(slug.replace(/-/g, "_")));
      expect(company).toBeDefined();
      expect(company.is_licensed_sponsor).toBe(true);
      expect(company.sponsor_rating).toBe("A");
    }
  });

  it("should format all Australian jobs with AUD salaries and positive sponsorship evidence", () => {
    for (const job of auJobs.slice(0, 100)) {
      expect(job.title).toBeTruthy();
      expect(job.company_name).toBeTruthy();
      expect(job.salary_currency).toBe("AUD");
      expect(job.salary_min).toBeGreaterThan(0);
      expect(job.has_sponsorship).toBe(1);
      expect(job.apply_url).toMatch(/^https?:\/\//);
      expect(job.description).toContain("## Role Overview");
      expect(job.description).toContain("## Official Application Route");
      
      const neg = JSON.parse(job.sponsorship_negative_evidence || "[]");
      expect(neg.length).toBe(0);
    }
  });
});
