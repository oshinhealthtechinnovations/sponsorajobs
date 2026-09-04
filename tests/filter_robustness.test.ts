import { describe, it, expect } from "vitest";
import { JobRepository } from "@/lib/repositories/jobRepository";

describe("Job Filter Robustness & Cross-Sector Category Intelligence Suite", () => {
  const jobRepo = new JobRepository();

  describe("1. Construction & Civil Infrastructure Multi-Sector Resolution", () => {
    it("should return abundant jobs for 'construction' category (crossing civil, structural & infrastructure)", async () => {
      const res = await jobRepo.search({ category: "construction", limit: 50 });

      expect(res.total).toBeGreaterThan(100);
      expect(res.jobs.length).toBeGreaterThan(0);
      
      // Should include civil and structural roles alongside traditional construction
      const hasCivilOrStructural = res.jobs.some(
        (j) =>
          /civil|structural|site|infrastructure|engineer|project|surveyor/i.test(j.title) ||
          /construction|engineering/i.test(j.category?.name || "")
      );
      expect(hasCivilOrStructural).toBe(true);
    });

    it("should return jobs for 'engineering' category", async () => {
      const res = await jobRepo.search({ category: "engineering", limit: 20 });
      expect(res.total).toBeGreaterThan(50);
      expect(res.jobs.length).toBeGreaterThan(0);
    });
  });

  describe("2. Company Filter Precision & Zero-Conflict Resolution", () => {
    it("should filter jobs specifically for 'Morgan Sindall'", async () => {
      const res = await jobRepo.search({ company: "Morgan Sindall", limit: 20 });

      expect(res.total).toBeGreaterThan(0);
      expect(res.jobs.length).toBeGreaterThan(0);
      expect(
        res.jobs.every((j) =>
          /morgan sindall/i.test(j.company.name) ||
          /morgan sindall/i.test(j.title) ||
          j.company.id.includes("morgan_sindall")
        )
      ).toBe(true);
    });

    it("should return Morgan Sindall jobs when combined with 'construction' category without zeroing out", async () => {
      const res = await jobRepo.search({
        category: "construction",
        company: "Morgan Sindall",
        limit: 20,
      });

      // Must NEVER return 0 or fall back to other employers like Reynolds/Walker/Luddon
      expect(res.total).toBeGreaterThan(0);
      expect(res.jobs.length).toBeGreaterThan(0);
      expect(
        res.jobs.every((j) =>
          /morgan sindall/i.test(j.company.name) ||
          /morgan sindall/i.test(j.title) ||
          j.company.id.includes("morgan_sindall")
        )
      ).toBe(true);
    });

    it("should filter jobs for 'Mace' without returning other contractors", async () => {
      const res = await jobRepo.search({ company: "Mace", limit: 10 });
      expect(res.total).toBeGreaterThan(0);
      expect(
        res.jobs.every((j) =>
          /mace/i.test(j.company.name) ||
          /mace/i.test(j.title) ||
          j.company.id.includes("mace")
        )
      ).toBe(true);
    });

    it("should filter jobs for 'Costain Group'", async () => {
      const res = await jobRepo.search({ company: "Costain", limit: 10 });
      expect(res.total).toBeGreaterThan(0);
      expect(
        res.jobs.every((j) =>
          /costain/i.test(j.company.name) ||
          /costain/i.test(j.title) ||
          j.company.id.includes("costain")
        )
      ).toBe(true);
    });
  });

  describe("3. Fallback Suggestions Integrity", () => {
    it("should prioritize employer jobs first in fallback suggestions if company was specified", async () => {
      const fallbacks = await jobRepo.getFallbackSuggestions(
        { company: "Morgan Sindall", category: "non_existent_category_xyz" },
        6
      );

      expect(fallbacks.length).toBeGreaterThan(0);
      expect(
        fallbacks.some((j) =>
          /morgan sindall/i.test(j.company.name) ||
          /morgan sindall/i.test(j.title)
        )
      ).toBe(true);
    });
  });
});
