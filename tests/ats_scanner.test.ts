import { describe, it, expect } from "vitest";
import { analyzeResumeATS, matchResumeWithJobs } from "@/lib/services/atsScanner";
import { PublicJobDTO } from "@/lib/types/job";

describe("ATS Resume Scanner & Visa Matcher Service", () => {
  const sampleResume = `
    Alex Rivera
    Senior Full Stack Engineer
    London, UK | alex.rivera@example.com | linkedin.com/in/alexrivera-tech | github.com/alexrivera-dev

    PROFESSIONAL SUMMARY
    Senior Software Engineer with 6+ years of experience architecting distributed cloud applications.

    TECHNICAL SKILLS
    TypeScript, JavaScript, Python, React, Next.js, Node.js, AWS, Docker, Kubernetes, PostgreSQL, Redis

    PROFESSIONAL EXPERIENCE
    Senior Engineer | Monzo Tech | London, UK (2022 - Present)
    • Architected microservices in TypeScript serving 500k+ daily users.
    • Reduced latency by 45% and saved $100,000 annually.
    • Scaled Docker and Kubernetes clusters on AWS.

    EDUCATION
    Bachelor of Science (BSc) in Computer Science, University of Manchester

    CERTIFICATIONS
    AWS Certified Solutions Architect
  `;

  it("should parse contact info and standard sections accurately", () => {
    const analysis = analyzeResumeATS(sampleResume);

    expect(analysis.detectedContactInfo.hasEmail).toBe(true);
    expect(analysis.detectedContactInfo.hasLinkedIn).toBe(true);
    expect(analysis.detectedSections.hasExperience).toBe(true);
    expect(analysis.detectedSections.hasEducation).toBe(true);
    expect(analysis.detectedSections.hasSkills).toBe(true);
    expect(analysis.estimatedSeniority).toBe("Senior");
  });

  it("should extract technical skills and certifications", () => {
    const analysis = analyzeResumeATS(sampleResume);

    expect(analysis.detectedSkills).toContain("typescript");
    expect(analysis.detectedSkills).toContain("react");
    expect(analysis.detectedSkills).toContain("docker");
    expect(analysis.detectedSkills).toContain("aws");
    expect(analysis.detectedCertifications.length).toBeGreaterThan(0);
  });

  it("should calculate a high ATS formatting and visa readiness score for complete profile", () => {
    const analysis = analyzeResumeATS(sampleResume);

    expect(analysis.overallScore).toBeGreaterThanOrEqual(75);
    expect(analysis.atsFormattingScore).toBeGreaterThanOrEqual(70);
    expect(analysis.visaReadinessScore).toBeGreaterThanOrEqual(70);
    expect(analysis.strengths.length).toBeGreaterThan(0);
  });

  it("should flag missing sections and lower scores for incomplete resumes", () => {
    const incompleteResume = "Just a quick summary without experience or education or contact info.";
    const analysis = analyzeResumeATS(incompleteResume);

    expect(analysis.overallScore).toBeLessThan(60);
    expect(analysis.detectedContactInfo.hasEmail).toBe(false);
    expect(analysis.improvements.length).toBeGreaterThan(0);
  });

  it("should match candidate skills with live jobs and rank by compatibility", () => {
    const analysis = analyzeResumeATS(sampleResume);

    const mockJobs: PublicJobDTO[] = [
      {
        id: "job_1",
        slug: "job-1",
        title: "Senior Full Stack TypeScript Engineer",
        company: { id: "comp_1", name: "Monzo Bank" },
        location: { country: "GB", city: "London", formatted: "London, UK" },
        remoteType: "HYBRID",
        employmentType: "FULL_TIME",
        category: { id: "cat_eng", name: "Software Engineering", slug: "software-engineering" },
        sponsorship: {
          label: "Strong",
          evidenceMessage: "Verified",
          positiveEvidence: ["Sponsor"],
          negativeEvidence: [],
          visaKeywords: ["sponsorship"],
        },
        postedAt: "2026-08-20T00:00:00Z",
        applyUrl: "https://example.com/apply",
        sourceName: "Arbeitnow",
      },
      {
        id: "job_2",
        slug: "job-2",
        title: "Marketing Coordinator",
        company: { id: "comp_2", name: "Retail Global" },
        location: { country: "GB", city: "London", formatted: "London, UK" },
        remoteType: "ONSITE",
        employmentType: "FULL_TIME",
        category: { id: "cat_mkt", name: "Marketing", slug: "marketing" },
        sponsorship: {
          label: "Possible",
          evidenceMessage: "Unverified",
          positiveEvidence: [],
          negativeEvidence: [],
          visaKeywords: [],
        },
        postedAt: "2026-08-20T00:00:00Z",
        applyUrl: "https://example.com/apply2",
        sourceName: "Jooble",
      },
    ];

    const matches = matchResumeWithJobs(analysis, sampleResume, mockJobs);

    expect(matches.length).toBe(2);
    expect(matches[0].job.id).toBe("job_1");
    expect(matches[0].matchScore).toBeGreaterThan(matches[1].matchScore);
    expect(matches[0].matchingSkills).toContain("typescript");
  });
});
