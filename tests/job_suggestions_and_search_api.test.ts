import { describe, it, expect } from "vitest";
import { JobSuggestionEngine } from "@/lib/services/jobSuggestionEngine";
import { GET as jobSuggestionsGet } from "@/app/api/tools/job-suggestions/route";
import { POST as smartJobMatchPost } from "@/app/api/tools/smart-job-match/route";
import { NextRequest } from "next/server";

describe("Job Suggestion, Autocomplete & Semantic Search Suite", () => {
  describe("1. Predictive Autocomplete Engine (JobSuggestionEngine)", () => {
    it("should return high-priority default suggestions for an empty query", async () => {
      const suggestions = await JobSuggestionEngine.getAutocompleteSuggestions("");

      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThanOrEqual(3);
      expect(suggestions.some((s) => s.type === "role")).toBe(true);
      expect(suggestions.some((s) => s.type === "company")).toBe(true);
    });

    it("should match roles and skills when typing 'engineer'", async () => {
      const suggestions = await JobSuggestionEngine.getAutocompleteSuggestions("engineer");

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.type === "role")).toBe(true);
      expect(suggestions[0].label.toLowerCase()).toContain("engineer");
    });

    it("should execute via GET /api/tools/job-suggestions", async () => {
      const req = new NextRequest("http://localhost:3000/api/tools/job-suggestions?q=software&country=GB");
      const res = await jobSuggestionsGet(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.suggestions.length).toBeGreaterThan(0);
      expect(data.suggestions[0].paramKey).toBeDefined();
    });
  });

  describe("2. AI Smart Job Matcher (JobSuggestionEngine.smartMatch)", () => {
    it("should extract skills and country intent from natural language candidate prompt", async () => {
      const prompt = "Senior React and Node.js developer with 5 years experience looking for UK jobs";
      const result = await JobSuggestionEngine.smartMatch(prompt);

      expect(result).toBeDefined();
      expect(result.detectedIntent.skills).toContain("React");
      expect(result.detectedIntent.skills).toContain("Node.js");
      expect(result.detectedIntent.targetCountry).toBe("GB");
      expect(result.matchedJobs.length).toBeGreaterThan(0);

      const topMatch = result.matchedJobs[0];
      expect(topMatch.matchScore).toBeGreaterThanOrEqual(70);
      expect(topMatch.reasons.length).toBeGreaterThan(0);
    });

    it("should execute via POST /api/tools/smart-job-match", async () => {
      const req = new NextRequest("http://localhost:3000/api/tools/smart-job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Cloud architect with AWS and Kubernetes experience seeking visa sponsorship",
          limit: 4,
        }),
      });

      const res = await smartJobMatchPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.matchedJobs.length).toBeGreaterThan(0);
      expect(data.data.matchedJobs.length).toBeLessThanOrEqual(4);
    });

    it("should never recommend physicians or duplicates for Data Analyst Python/SQL search", async () => {
      const prompt = "Data Analyst with SQL and Python seeking US H-1B sponsorship opportunities";
      const result = await JobSuggestionEngine.smartMatch(prompt);

      expect(result.detectedIntent.targetRole).toContain("Data Analyst");
      expect(result.detectedIntent.skills).toContain("Python");
      expect(result.detectedIntent.skills).toContain("SQL");
      expect(result.detectedIntent.targetCountry).toBe("US");

      // Verify no healthcare jobs are returned
      for (const item of result.matchedJobs) {
        const title = item.job.title.toLowerCase();
        expect(title).not.toContain("physician");
        expect(title).not.toContain("doctor");
        expect(title).not.toContain("hospital-employed");
      }

      // Verify deduplication
      const titles = result.matchedJobs.map((m) => `${m.job.company.name}::${m.job.title}`);
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(titles.length);
    });
  });

  describe("3. Alternative Roles & Career Pathways Engine", () => {
    it("should suggest higher-sponsorship alternative roles for QA testers", () => {
      const alternatives = JobSuggestionEngine.getAlternativeRoles("qa");

      expect(alternatives.length).toBeGreaterThan(0);
      expect(alternatives[0].alternativeRole).toContain("SDET");
      expect(alternatives[0].sponsorshipAdvantage).toContain("RQF 3+");
    });
  });
});
