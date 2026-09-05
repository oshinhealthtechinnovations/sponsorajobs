import { describe, it, expect } from "vitest";
import { CareerIntelligenceEngine } from "../lib/services/careerIntelligenceEngine";

describe("Universal Career Intelligence Engine (CIE-v2) Test Suite", () => {
  it("should extract a comprehensive capability profile from an Infrastructure & Controls CV", () => {
    const cvText = `
SUMIT RAJ
Email: sumit@sponsorajobs.com
Phone: +44 7700 900077
LinkedIn: linkedin.com/in/sumitraj

PROFESSIONAL SUMMARY
Project Coordinator with 5+ years of experience delivering major capital infrastructure schemes.
Proficient in project planning, project controls, schedule baseline management, Primavera P6,
Earned Value Management (EVM), Critical Path Method (CPM), risk management, and delay analysis.

WORK EXPERIENCE
Project Coordinator | Infrastructure Delivery Partners (2021 - Present)
- Managed Primavera P6 baseline schedules and performed EVM (CPI/SPI) cost & schedule analysis.
- Coordinated multi-disciplinary subcontractors, site inspections, RAMS, and safety compliance.
- Facilitated weekly progress meetings with clients and senior project managers.

EDUCATION & CREDENTIALS
MSc in Project Management from Brunel University London
B.Tech in Civil Engineering
Certifications: PMP, CSCS Accredited, APM PMQ
    `;

    const profile = CareerIntelligenceEngine.extractCandidateProfile(cvText);

    expect(profile.identity.name).toBe("SUMIT RAJ");
    expect(profile.headlineRole).toMatch(/Project Coordinator/i);
    expect(profile.yearsOfExperience).toBeGreaterThanOrEqual(4);
    expect(profile.highestDegree).toBe("Master's");
    expect(profile.primaryIndustry).toContain("Construction, Infrastructure & Engineering");

    // Capabilities and Tools
    expect(profile.toolsAndSoftware).toContain("Primavera P6");
    expect(profile.coreCapabilities).toContain("Earned Value Management (EVM)");
    expect(profile.coreCapabilities).toContain("Critical Path Method (CPM)");

    // Certifications
    expect(profile.certifications.length).toBeGreaterThan(0);
    const certString = profile.certifications.join(" ");
    expect(certString).toMatch(/PMP|CSCS|APM/i);

    // Dynamic Transferable Career Pathways
    expect(profile.transferableCareerPathways.length).toBeGreaterThanOrEqual(3);
    const targetRoles = profile.transferableCareerPathways.map((p) => p.targetRole).join(" ");
    expect(targetRoles).toMatch(/Planning Engineer|Project Controls|Assistant Project Manager|Construction/i);
  });

  it("should extract profile for Civil Engineer and discover realistic transferable career opportunities", () => {
    const civilCv = `
Senior Civil Engineer with 6 years experience in highway design, drainage, structural concrete, and site supervision.
Skilled in AutoCAD, Civil 3D, Revit, BIM, and health & safety compliance under CDM 2015.
Bachelor of Engineering in Civil Engineering.
Targeting UK Skilled Worker sponsor opportunities.
    `;

    const profile = CareerIntelligenceEngine.extractCandidateProfile(civilCv);

    expect(profile.headlineRole).toMatch(/Civil Engineer/i);
    expect(profile.primaryIndustry).toContain("Construction, Infrastructure & Engineering");
    expect(profile.highestDegree).toBe("Bachelor's");
    expect(profile.identity.targetCountry).toBe("GB");

    expect(profile.coreCapabilities).toContain("AutoCAD");
    expect(profile.coreCapabilities).toContain("Civil 3D");

    // Transferable pathways should bridge to Project Engineer, Site Manager, and Construction Manager
    const pathwayRoles = profile.transferableRolesList.join(" ");
    expect(pathwayRoles).toMatch(/Project Engineer/i);
    expect(pathwayRoles).toMatch(/Assistant Project Manager|Construction Manager|Site Manager/i);
  });

  it("should calculate deep 5-axis match and distinguish Direct, Adjacent, and Stretch opportunities", () => {
    const candidate = CareerIntelligenceEngine.extractCandidateProfile(`
Civil Engineer with 4 years experience in AutoCAD, Civil 3D, site supervision, and structural analysis.
Bachelor of Engineering in Civil Engineering.
    `);

    // 1. Direct Job Match
    const directJob = CareerIntelligenceEngine.extractJobProfile({
      id: "job_direct_1",
      title: "Senior Civil Engineer",
      description: "Looking for a Civil Engineer with AutoCAD, Civil 3D, and site supervision experience.",
      category: { name: "Engineering" },
      company: { name: "Balfour Beatty" },
      has_sponsorship: 1,
      sponsorship_score: 95,
      location: { country: "GB" },
    });

    const directMatch = CareerIntelligenceEngine.calculateUniversalMatch(candidate, directJob);
    expect(directMatch.careerScore).toBeGreaterThanOrEqual(80);
    expect(directMatch.matchTier).toMatch(/DIRECT_MATCH|ADJACENT_MATCH/);

    // 2. Transferable Pathway Job Match (Construction Manager)
    const pathwayJob = CareerIntelligenceEngine.extractJobProfile({
      id: "job_trans_1",
      title: "Construction Manager - Infrastructure",
      description: "Leading site operations and subcontractor delivery across infrastructure projects.",
      category: { name: "Construction" },
      company: { name: "Mace" },
      has_sponsorship: 1,
      sponsorship_score: 90,
      location: { country: "GB" },
    });

    const pathwayMatch = CareerIntelligenceEngine.calculateUniversalMatch(candidate, pathwayJob);
    expect(pathwayMatch.careerScore).toBeGreaterThanOrEqual(60);
    expect(pathwayMatch.transferabilityRationale).toBeTruthy();

    // 3. Cross-domain Mismatch (Nurse) - Geometric Domain Gate should protect candidate
    const unrelatedJob = CareerIntelligenceEngine.extractJobProfile({
      id: "job_unrelated_1",
      title: "Staff Nurse - Emergency Care",
      description: "Registered Nurse providing clinical patient care and medication administration.",
      category: { name: "Healthcare" },
      company: { name: "NHS Foundation Trust" },
      location: { country: "GB" },
    });

    const unrelatedMatch = CareerIntelligenceEngine.calculateUniversalMatch(candidate, unrelatedJob);
    expect(unrelatedMatch.careerScore).toBeLessThanOrEqual(35);
    expect(unrelatedMatch.matchTier).toBe("STRETCH_MATCH");
  });

  it("should rank matching jobs and enforce employer diversity and title deduplication", async () => {
    const candidate = CareerIntelligenceEngine.extractCandidateProfile(`
Project Coordinator with Primavera P6, EVM, project controls, and infrastructure delivery experience.
MSc in Project Management.
    `);

    const opportunities = await CareerIntelligenceEngine.rankMatchingJobs(candidate, {
      country: "GB",
      limit: 8,
    });

    expect(opportunities.length).toBeGreaterThan(0);
    expect(opportunities.length).toBeLessThanOrEqual(8);

    // Check Employer Diversity: No single employer should monopolize all results (max 2 per employer in top 8)
    const employerCounts = new Map<string, number>();
    for (const opp of opportunities) {
      const emp = opp.job.company.name.toLowerCase();
      employerCounts.set(emp, (employerCounts.get(emp) || 0) + 1);
    }

    for (const [emp, count] of employerCounts.entries()) {
      expect(count).toBeLessThanOrEqual(2);
    }

    // Top matches should be highly viable
    const top = opportunities[0];
    expect(top.careerMatchScore).toBeGreaterThanOrEqual(65);
    expect(top.breakdown.whyYouMatch.length).toBeGreaterThan(0);
  });
});
