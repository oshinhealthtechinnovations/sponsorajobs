import { describe, it, expect } from "vitest";
import {
  JobIntelligenceEngine,
  CandidateProfile,
  StructuredJobIntelligence,
} from "@/lib/services/jobIntelligenceEngine";
import { PublicJobDTO } from "@/lib/types/job";

describe("SponsorAJobs Central Job Intelligence Engine Tests", () => {
  const sampleConstructionCV = `
John Doe
Assistant Project Manager
London, UK | john.doe@example.com | +44 7700 900077

SUMMARY
Results-oriented Assistant Project Manager with 4 years of experience delivering commercial build and civil infrastructure projects. Skilled in contractor coordination, budget management, scheduling, risk logs, and AutoCAD.

EXPERIENCE
Assistant Project Manager | Balfour Beatty Construction | London (2022 - Present)
• Coordinated subcontractors, track budgets up to £3.5M, and managed weekly scheduling using MS Project.
• Monitored on-site safety compliance and resolved site queries with structural design teams.
• Developed comprehensive risk management logs and contractor progress reports.

Project Coordinator | Costain Group | Birmingham (2020 - 2022)
• Assisted project managers with documentation, procurement scheduling, and meeting minutes.

EDUCATION
B.Sc in Civil Engineering (Honours)
University of Leeds (2016 - 2020)

CERTIFICATIONS
• PRINCE2 Practitioner
• CSCS Card
`;

  const sampleMechanicalCV = `
Jane Smith
Mechanical Engineer
jane.smith@example.com | +44 7800 123456

SUMMARY
Mechanical Engineer with 5 years experience specializing in mechanical design, SolidWorks, FEA, CAD modeling, and preventative maintenance for manufacturing systems.

EXPERIENCE
Mechanical Design Engineer | Siemens UK | Manchester (2021 - Present)
• Created 3D CAD models and detailed engineering drawings in SolidWorks.
• Performed tolerance analysis and structural FEA for industrial automation components.

EDUCATION
Bachelor of Engineering (B.Eng) in Mechanical Engineering
University of Sheffield
`;

  describe("1. Candidate Profile Extraction", () => {
    it("should extract structured candidate profile from Construction CV", () => {
      const profile = JobIntelligenceEngine.extractCandidateProfile(sampleConstructionCV);

      expect(profile.currentRole).toBe("Assistant Project Manager");
      expect(profile.normalizedRole).toBe("Assistant Project Manager");
      expect(profile.yearsOfExperience).toBeGreaterThanOrEqual(3);
      expect(profile.highestDegree).toBe("Bachelor's");
      expect(profile.primaryIndustry).toContain("Construction");

      // Check detected skills
      expect(profile.coreSkills).toContain("project management");
      expect(profile.coreSkills).toContain("budget management");
      expect(profile.coreSkills).toContain("risk management");
      expect(profile.coreSkills).toContain("autocad");
      expect(profile.coreSkills).toContain("ms project");

      // Check transferable roles
      expect(profile.transferablePotentialRoles.length).toBeGreaterThan(0);
      expect(profile.transferablePotentialRoles).toContain("Project Manager");
    });

    it("should extract structured candidate profile from Mechanical CV and identify transferable roles", () => {
      const profile = JobIntelligenceEngine.extractCandidateProfile(sampleMechanicalCV);

      expect(profile.currentRole.toLowerCase()).toContain("mechanical");
      expect(profile.yearsOfExperience).toBeGreaterThanOrEqual(4);
      expect(profile.highestDegree).toBe("Bachelor's");

      // Check transferable roles include related branches of mechanical engineering
      expect(profile.transferablePotentialRoles.length).toBeGreaterThan(0);
      const rolesLower = profile.transferablePotentialRoles.map((r) => r.toLowerCase());
      expect(
        rolesLower.some((r) => r.includes("design") || r.includes("maintenance") || r.includes("reliability") || r.includes("project"))
      ).toBe(true);
    });
  });

  describe("2. Role Relationship & Transferable Roles Graph", () => {
    it("should recognize non-exact career progressions with high similarity", () => {
      // Assistant PM -> Project Manager
      const apmToPm = JobIntelligenceEngine.computeRoleSimilarity(
        "Assistant Project Manager",
        "Project Manager"
      );
      expect(apmToPm).toBeGreaterThanOrEqual(80);

      // Project Coordinator -> Assistant Project Manager
      const coordToApm = JobIntelligenceEngine.computeRoleSimilarity(
        "Project Coordinator",
        "Assistant Project Manager"
      );
      expect(coordToApm).toBeGreaterThanOrEqual(80);

      // Mechanical Engineer -> Mechanical Design Engineer
      const mechToDesign = JobIntelligenceEngine.computeRoleSimilarity(
        "Mechanical Engineer",
        "Mechanical Design Engineer"
      );
      expect(mechToDesign).toBeGreaterThanOrEqual(80);

      // Civil Engineer -> Structural Engineer
      const civilToStruct = JobIntelligenceEngine.computeRoleSimilarity(
        "Civil Engineer",
        "Structural Engineer"
      );
      expect(civilToStruct).toBeGreaterThanOrEqual(80);
    });
  });

  describe("3. Multi-Factor Explainable Scoring", () => {
    const mockProjectManagerJob: PublicJobDTO = {
      id: "job_test_pm_001",
      slug: "project-manager-balfour",
      title: "Project Manager - Infrastructure",
      company_id: "comp_balfour",
      company_name: "Balfour Beatty",
      company_slug: "balfour-beatty",
      country_code: "GB",
      location: "London, UK",
      city: "London",
      category_id: "cat_const",
      category_slug: "construction",
      category_name: "Construction",
      employment_type: "FULL_TIME",
      remote_type: "HYBRID",
      experience_level: "Mid-Level",
      salary_min: 55000,
      salary_max: 75000,
      salary_currency: "GBP",
      salary_interval: "yearly",
      has_salary: true,
      description: `
We are seeking an experienced Project Manager to deliver critical rail and civil infrastructure projects.
Key Requirements:
• 4+ years experience in project delivery
• Required skills: Project Management, Budget Management, Risk Management, MS Project
• Degree in Civil Engineering or related field
• We provide UK Skilled Worker visa sponsorship for eligible candidates.
`,
      apply_url: "https://balfourbeatty.com/careers/job123",
      source_id: "official_career_page",
      source_name: "Balfour Beatty Careers",
      is_direct: true,
      sponsorship_score: 100,
      sponsorship_label: "Strong",
      has_sponsorship: 1,
      sponsorship_negative_evidence: "[]",
      visa_sponsorship_eligible: true,
      quality_score: 95,
      status: "active",
      published_at: new Date().toISOString(),
      first_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it("should compute transparent 7-score breakdown and explainable matching reasons", () => {
      const candidateProfile = JobIntelligenceEngine.extractCandidateProfile(sampleConstructionCV);
      const jobIntel = JobIntelligenceEngine.extractJobIntelligence(mockProjectManagerJob);

      const match = JobIntelligenceEngine.calculateDetailedMatch(candidateProfile, jobIntel);

      // Verify all 7 metric scores exist and are reasonable
      expect(match.overallMatchScore).toBeGreaterThanOrEqual(75);
      expect(match.skillsMatchScore).toBeGreaterThanOrEqual(75);
      expect(match.experienceMatchScore).toBeGreaterThanOrEqual(80);
      expect(match.roleSimilarityScore).toBeGreaterThanOrEqual(80);
      expect(match.qualificationMatchScore).toBeGreaterThanOrEqual(90);
      expect(match.visaMatchScore).toBeGreaterThanOrEqual(90);
      expect(match.atsCompatibilityScore).toBeGreaterThanOrEqual(80);

      // Verify Sponsorship Certainty is confirmed
      expect(match.sponsorshipStatus.certainty).toBe("CONFIRMED_IN_LISTING");
      expect(match.sponsorshipStatus.badgeLabel).toBe("Confirmed Sponsorship");

      // Verify Explainability sections
      expect(match.whyYouMatch.length).toBeGreaterThan(0);
      expect(match.whyYouMatch.some((r) => r.includes("Skills") || r.includes("Role Alignment"))).toBe(true);
      expect(match.howToImprove.length).toBeGreaterThan(0);
    });

    it("should accurately flag unverified sponsorship when listing has no visa clause", () => {
      const nonSponsoredJob: PublicJobDTO = {
        ...mockProjectManagerJob,
        has_sponsorship: 0,
        is_direct: false,
        sponsorship_score: 0,
        description: "General project manager position. Must have right to work in the UK.",
      };

      const jobIntel = JobIntelligenceEngine.extractJobIntelligence(nonSponsoredJob);
      expect(jobIntel.sponsorshipCertainty).toBe("NO_SPONSORSHIP_FOUND");
    });
  });
});
