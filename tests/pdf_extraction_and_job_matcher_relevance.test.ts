import { describe, it, expect } from "vitest";
import { extractTextFromPDFBuffer, isRawPdfSyntax, sanitizeExtractedText } from "../lib/services/pdfExtractor";
import { JobIntelligenceEngine } from "../lib/services/jobIntelligenceEngine";

describe("PDF Extraction & Smart Matcher Relevance Test Suite", () => {
  it("should extract readable plain text from a standard PDF buffer using pdf-parse v2", async () => {
    // Construct a minimal valid PDF containing actual text operators
    const minimalPdf = Buffer.from(
      "%PDF-1.4\n" +
      "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n" +
      "4 0 obj\n<< /Length 70 >>\nstream\n" +
      "BT /F1 12 Tf 72 712 Td (Sumit Raj - Full Stack Developer with React and Node.js) Tj ET\n" +
      "endstream\nendobj\n" +
      "xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \n" +
      "trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n320\n%%EOF"
    );

    const extracted = await extractTextFromPDFBuffer(minimalPdf);
    expect(extracted).toBeTruthy();
    expect(extracted.length).toBeGreaterThan(15);
    expect(extracted).toContain("Sumit Raj");
    expect(extracted).toContain("Full Stack Developer");
  });

  it("should detect raw PDF syntax strings and prevent them from being treated as resume text", () => {
    const rawPdfDictionary = "%PDF-1.5 /Catalog /Pages /Filter /FlateDecode /Length 1204 obj endobj xref trailer startxref";
    expect(isRawPdfSyntax(rawPdfDictionary)).toBe(true);

    const normalResumeText = "Sumit Raj | Senior Software Engineer with 5 years experience in React, TypeScript, and AWS.";
    expect(isRawPdfSyntax(normalResumeText)).toBe(false);
  });

  it("should accurately extract CandidateProfile without defaulting to General Professional", () => {
    const cvText = `
Sumit Raj
Email: sumit@sponsorajobs.com
Phone: +44 7700 900077
LinkedIn: linkedin.com/in/sumitraj

PROFESSIONAL SUMMARY
Senior Full Stack Developer with 5+ years of experience designing high-scale web platforms.
Specializing in React, TypeScript, Next.js, Node.js, and Cloud Infrastructure (AWS, Docker, PostgreSQL).

WORK EXPERIENCE
Lead Web Developer | Tech Innovations Ltd (2020 - Present)
- Engineered high-traffic Next.js frontends and microservices on Node.js and AWS.
- Managed CI/CD pipelines with Docker and GitHub Actions.
- Mentored junior engineers and improved ATS throughput.

EDUCATION
Bachelor of Science in Computer Science | 2016 - 2020

SKILLS
React, Node.js, TypeScript, Next.js, PostgreSQL, Docker, AWS, Git, REST APIs
    `;

    const profile = JobIntelligenceEngine.extractCandidateProfile(cvText);

    // Verify Name
    expect(profile.name).toBe("Sumit Raj");

    // Verify Role is NOT generic
    expect(profile.normalizedRole).toMatch(/Full Stack Developer|Software Engineer/i);
    expect(profile.currentRole).not.toBe("General Professional");

    // Verify Experience & Seniority
    expect(profile.yearsOfExperience).toBeGreaterThanOrEqual(4);
    expect(profile.seniority).toMatch(/Senior|Lead \/ Manager|Mid-Level/);

    // Verify Skills
    expect(profile.coreSkills).toContain("react");
    expect(profile.coreSkills).toContain("node.js");
    expect(profile.coreSkills).toContain("typescript");

    // Verify Industry
    expect(profile.primaryIndustry).toBe("Information Technology & Software");

    // Verify Transferable Career Paths are relevant tech roles
    expect(profile.transferablePotentialRoles.length).toBeGreaterThan(0);
    const techRoles = profile.transferablePotentialRoles.join(" ");
    expect(techRoles).toMatch(/Software Engineer|Developer|Frontend|Backend|DevOps/i);
  });

  it("should deduce role from concrete skill clusters when headline title is missing or unconventional", () => {
    const skillOnlyCv = `
Applicant Background Summary:
Hands-on experience developing with React, Node.js, Next.js, PostgreSQL, and Docker.
Worked on client deliverables from 2021 to 2024 (3 years).
Targeting UK Skilled Worker sponsorship roles.
    `;

    const profile = JobIntelligenceEngine.extractCandidateProfile(skillOnlyCv);

    // Deduced role should match Full Stack Developer from skills
    expect(profile.normalizedRole).toBe("Full Stack Developer");
    expect(profile.primaryIndustry).toBe("Information Technology & Software");
    expect(profile.targetCountry).toBe("GB");
  });

  it("should reject irrelevant domain matches when calculating match breakdown", () => {
    const candidateProfile = JobIntelligenceEngine.extractCandidateProfile(`
Sumit Raj
Full Stack Developer with 4 years experience in React, TypeScript, Node.js, Docker, and PostgreSQL.
    `);

    // Simulated irrelevant job: Registered Nurse in Hospital
    const nurseJob = {
      id: "nurse_101",
      title: "Staff Nurse - Band 5 ICU",
      description: "Looking for an experienced registered nurse with NMC registration, patient care, and wound care experience.",
      country_code: "GB",
      category_name: "Healthcare",
    };

    const nurseIntel = JobIntelligenceEngine.extractJobIntelligence(nurseJob);
    const breakdown = JobIntelligenceEngine.calculateDetailedMatch(candidateProfile, nurseIntel);

    // Match score between a Full Stack Developer and a Staff Nurse must be low (< 35)
    expect(breakdown.overallMatchScore).toBeLessThan(35);
    expect(breakdown.skillsMatchScore).toBe(0);

    // Simulated relevant job: Senior React Developer
    const techJob = {
      id: "tech_202",
      title: "Senior Full Stack React & Node.js Developer",
      description: "We are seeking a Full Stack Developer with strong React, Node.js, TypeScript, and Docker skills. Tier 2 visa sponsorship offered.",
      country_code: "GB",
      category_name: "Information Technology",
    };

    const techIntel = JobIntelligenceEngine.extractJobIntelligence(techJob);
    const techBreakdown = JobIntelligenceEngine.calculateDetailedMatch(candidateProfile, techIntel);

    // Match score for matching tech job should be high (>= 75)
    expect(techBreakdown.overallMatchScore).toBeGreaterThanOrEqual(75);
    expect(techBreakdown.skillsMatchScore).toBeGreaterThan(60);
    expect(techBreakdown.matchedSkills).toContain("react");
  });
});
