import { describe, it, expect } from "vitest";
import { normalizeSkill, getSkillMatchWeight } from "@/lib/data/skillsTaxonomy";
import { normalizeOccupation, getOccupationMatchWeight } from "@/lib/data/occupationsTaxonomy";
import { rankJobsForCandidate, extractJobRequirements } from "@/lib/services/cvJobMatchEngine";
import { CandidateProfileRecord } from "@/lib/types/database";
import { PublicJobDTO } from "@/lib/types/job";

describe("CV Job Match (CV-to-Job Recommendation Engine)", () => {
  const mockCandidate: CandidateProfileRecord = {
    id: "cand_test123",
    user_id: null,
    candidate_email: "alex.tech@example.com",
    primary_occupation: "Senior Software Engineer",
    primary_soc_code: "2134",
    seniority: "Senior",
    total_experience_years: 6.5,
    highest_degree: "Bachelor's",
    degree_field: "Computer Science",
    detected_skills: ["typescript", "javascript", "react", "node.js", "aws", "docker", "postgresql", "redis"],
    preferred_country: "GB",
    sponsorship_preference: "required",
    profile_version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockSoftwareJob: PublicJobDTO = {
    id: "job_dev_1",
    slug: "senior-fullstack-engineer-fintech",
    title: "Senior Full Stack Engineer (TypeScript / AWS)",
    company: { id: "comp_1", name: "Monzo FinTech" },
    location: { country: "GB", city: "London", formatted: "London, UK" },
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    category: { id: "cat_tech", name: "Software Engineering", slug: "software-engineering" },
    sponsorship: {
      label: "Strong",
      evidenceMessage: "Explicit Certificate of Sponsorship (CoS) provided",
      positiveEvidence: ["Certificate of Sponsorship (CoS)", "Tier 2 / Skilled Worker Visa"],
      negativeEvidence: [],
      visaKeywords: ["sponsorship", "cos", "skilled worker"],
    },
    postedAt: "2026-08-25T00:00:00Z",
    applyUrl: "https://example.com/apply/dev",
    sourceName: "Arbeitnow",
  };

  const mockNursingJob: PublicJobDTO = {
    id: "job_nurse_2",
    slug: "staff-nurse-healthcare-nhs",
    title: "Registered Staff Nurse - Acute Care",
    company: { id: "comp_2", name: "NHS Foundation Trust" },
    location: { country: "GB", city: "Manchester", formatted: "Manchester, UK" },
    remoteType: "ONSITE",
    employmentType: "FULL_TIME",
    category: { id: "cat_health", name: "Healthcare", slug: "healthcare" },
    sponsorship: {
      label: "Strong",
      evidenceMessage: "Health and Care Worker Visa Sponsorship Available",
      positiveEvidence: ["Health and Care Worker Visa", "CoS Provided"],
      negativeEvidence: [],
      visaKeywords: ["sponsorship", "health and care visa"],
    },
    postedAt: "2026-08-25T00:00:00Z",
    applyUrl: "https://example.com/apply/nurse",
    sourceName: "NHS Jobs",
  };

  describe("1. Skills & Occupations Taxonomies", () => {
    it("should resolve skill aliases into canonical representations", () => {
      expect(normalizeSkill("k8s")?.canonicalKey).toBe("kubernetes");
      expect(normalizeSkill("postgres")?.canonicalKey).toBe("postgresql");
      expect(normalizeSkill("Amazon Web Services")?.canonicalKey).toBe("aws");
      expect(normalizeSkill("js")?.canonicalKey).toBe("javascript");
    });

    it("should assign appropriate match weights between related skills", () => {
      expect(getSkillMatchWeight("typescript", "typescript")).toBe(1.0);
      expect(getSkillMatchWeight("typescript", "javascript")).toBe(0.80);
      expect(getSkillMatchWeight("docker", "kubernetes")).toBe(0.85);
      expect(getSkillMatchWeight("python", "registered_nurse")).toBe(0.0);
    });

    it("should resolve occupation aliases and map SOC codes", () => {
      const occ = normalizeOccupation("Full Stack Developer");
      expect(occ?.id).toBe("software_engineer");
      expect(occ?.ukSocCode).toBe("2134");

      const architectOcc = normalizeOccupation("Cloud Solutions Architect");
      expect(architectOcc?.id).toBe("solutions_architect");
      expect(architectOcc?.ukSocCode).toBe("2133");
    });

    it("should assign appropriate match weights between related occupations", () => {
      expect(getOccupationMatchWeight("software_engineer", "software_engineer")).toBe(1.0);
      expect(getOccupationMatchWeight("software_engineer", "devops_engineer")).toBe(0.75);
      expect(getOccupationMatchWeight("software_engineer", "registered_nurse")).toBe(0.0);
    });
  });

  describe("2. Recommendation Engine & Ranking Logic", () => {
    it("should prioritize Candidate-Job Relevance over pure sponsorship (Section 101)", () => {
      const output = rankJobsForCandidate(
        mockCandidate,
        [mockNursingJob, mockSoftwareJob],
        { countries: ["GB"], sponsorship: "required" }
      );

      expect(output.totalMatches).toBe(2);
      // Software engineer job MUST rank #1, even though both have strong sponsorship
      expect(output.recommendations[0].job.id).toBe("job_dev_1");
      expect(output.recommendations[0].sponsorJobMatchScore).toBeGreaterThanOrEqual(85);
      expect(output.recommendations[0].recommendationTier).toBe("EXCELLENT");

      // Nursing job MUST rank second with a low score (< 50%) due to occupation mismatch
      expect(output.recommendations[1].job.id).toBe("job_nurse_2");
      expect(output.recommendations[1].sponsorJobMatchScore).toBeLessThan(55);
      expect(output.recommendations[1].recommendationTier).toBe("LOW");
    });

    it("should calculate non-linear experience adequacy scores", () => {
      const juniorCandidate: CandidateProfileRecord = {
        ...mockCandidate,
        total_experience_years: 1.0,
        seniority: "Junior",
      };

      const output = rankJobsForCandidate(
        juniorCandidate,
        [mockSoftwareJob],
        { countries: ["GB"] }
      );

      expect(output.recommendations[0].experienceMatchScore).toBeLessThan(80);
    });

    it("should generate deterministic explainability reasons without LLMs", () => {
      const output = rankJobsForCandidate(
        mockCandidate,
        [mockSoftwareJob],
        { countries: ["GB"] }
      );

      const rec = output.recommendations[0];
      expect(rec.reasons.length).toBeGreaterThanOrEqual(2);
      expect(rec.reasons.some((r) => r.includes("core technical requirements matched"))).toBe(true);
      expect(rec.reasons.some((r) => r.includes("sponsorship confirmed"))).toBe(true);
    });

    it("should extract job requirements and calculate data quality", () => {
      const reqs = extractJobRequirements(mockSoftwareJob);
      expect(reqs.requiredSkills.length).toBeGreaterThan(0);
      expect(reqs.dataQualityScore).toBeGreaterThanOrEqual(80);
    });
  });
});
