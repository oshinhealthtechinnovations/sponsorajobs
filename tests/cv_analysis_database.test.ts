import { describe, it, expect } from "vitest";
import { CVAnalysisRepository } from "@/lib/repositories/cvAnalysisRepository";
import { analyzeCVIntelligence } from "@/lib/services/atsIntelligenceEngine";

describe("CV Intelligence Database & Repository Layer", () => {
  const repo = new CVAnalysisRepository();

  const mockCV = `
    Jane Doe
    Lead Cloud Solutions Architect
    London, UK | jane.doe@cloudtech.io | +44 20 7946 0958 | linkedin.com/in/janedoe-cloud | github.com/janedoe-cloud

    SUMMARY
    Lead Architect with 10+ years of enterprise experience designing scalable Kubernetes clusters on AWS and GCP.

    TECHNICAL SKILLS
    AWS, GCP, Kubernetes, Docker, Terraform, Python, Go, CI/CD, PostgreSQL, Redis, Microservices

    EXPERIENCE
    Lead Solutions Architect | CloudScale Global (2020 - Present)
    • Architected multi-region Kubernetes platform reducing infrastructure costs by 35% ($450k annually).
    • Led engineering team of 12 specialists delivering 99.99% uptime for 2M+ active daily users.

    EDUCATION
    Master of Science (MSc) in Computer Science, Imperial College London
  `;

  it("should persist a full CV intelligence analysis into the database", async () => {
    const intelligence = analyzeCVIntelligence(mockCV, null, "GB");
    const saved = await repo.saveAnalysis(intelligence, {
      rawText: mockCV,
      targetCountry: "GB",
    });

    expect(saved.id).toBeDefined();
    expect(saved.id.startsWith("cva_")).toBe(true);
    expect(saved.candidate_email).toBe("jane.doe@cloudtech.io");
    expect(["Senior", "Lead / Manager"]).toContain(saved.seniority);
    expect(saved.highest_degree).toBe("Master's");
    expect(["2134", "2133"]).toContain(saved.soc_code);
    expect(saved.overall_score).toBeGreaterThanOrEqual(75);
    expect(saved.share_token).toBeDefined();
  });

  it("should fetch saved analysis by ID and by share token", async () => {
    const intelligence = analyzeCVIntelligence(mockCV, null, "GB");
    const saved = await repo.saveAnalysis(intelligence, {
      rawText: mockCV,
      targetCountry: "GB",
    });

    const fetchedById = await repo.getById(saved.id);
    expect(fetchedById).not.toBeNull();
    expect(fetchedById?.id).toBe(saved.id);
    expect(fetchedById?.candidate_email).toBe("jane.doe@cloudtech.io");

    const fetchedByToken = await repo.getByShareToken(saved.share_token);
    expect(fetchedByToken).not.toBeNull();
    expect(fetchedByToken?.id).toBe(saved.id);
  });

  it("should calculate platform-wide aggregate intelligence statistics", async () => {
    const stats = await repo.getAggregateStats();

    expect(stats.totalAnalyzed).toBeGreaterThanOrEqual(1);
    expect(stats.averageOverallScore).toBeGreaterThan(0);
    expect(stats.topSkills.length).toBeGreaterThan(0);
    expect(stats.countryDistribution.length).toBeGreaterThan(0);
  });
});
