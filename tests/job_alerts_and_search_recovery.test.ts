import { describe, it, expect } from "vitest";
import { normalizeSearchQuery, getRelatedSearchSuggestions } from "../lib/utils/searchNormalizer";
import { AlertRepository } from "../lib/repositories/alertRepository";
import { EmailService } from "../lib/services/emailService";
import { JobRepository } from "../lib/repositories/jobRepository";
import { NextRequest } from "next/server";
import { POST as subscribeHandler } from "../app/api/alerts/subscribe/route";

describe("Job Alerts & Zero-Result Search Recovery Logic", () => {
  it("should correctly normalize typos, expand role acronyms, and extract synonyms", () => {
    // Typos
    const civilTest = normalizeSearchQuery("civi enginner");
    expect(civilTest.normalized).toBe("civil engineer");
    expect(civilTest.isCorrected).toBe(true);

    const devTest = normalizeSearchQuery("sofware devloper");
    expect(devTest.normalized).toBe("software developer");
    expect(devTest.isCorrected).toBe(true);

    const nurseTest = normalizeSearchQuery("nurce");
    expect(nurseTest.normalized).toBe("nurse");

    // Role acronym expansion
    const sweTest = normalizeSearchQuery("swe");
    expect(sweTest.synonyms).toContain("software engineer");
    expect(sweTest.synonyms).toContain("developer");

    const rnTest = normalizeSearchQuery("rn");
    expect(rnTest.synonyms).toContain("registered nurse");

    const fullstackTest = normalizeSearchQuery("fullstck");
    expect(fullstackTest.normalized).toBe("fullstack");
    expect(fullstackTest.synonyms).toContain("software engineer");
  });

  it("should provide relevant search suggestions for empty queries and specific keywords", () => {
    const defaultSuggestions = getRelatedSearchSuggestions();
    expect(defaultSuggestions.length).toBeGreaterThan(0);
    expect(defaultSuggestions).toContain("Software Engineer");

    const sweSuggestions = getRelatedSearchSuggestions("swe");
    expect(sweSuggestions).toContain("software engineer");
  });

  it("should save alert subscriptions in AlertRepository and retrieve by email", async () => {
    const alertRepo = new AlertRepository();
    const alert = await alertRepo.createAlert({
      email: "applicant@example.com",
      keyword: "React Developer",
      country: "GB",
      category: "software-engineering",
      frequency: "daily",
    });

    expect(alert).toBeDefined();
    expect(alert.id).toMatch(/^alert_/);
    expect(alert.email).toBe("applicant@example.com");
    expect(alert.keyword).toBe("React Developer");
    expect(alert.country_code).toBe("GB");

    const userAlerts = await alertRepo.getAlertsByEmail("applicant@example.com");
    expect(userAlerts.length).toBeGreaterThan(0);
    expect(userAlerts[0].email).toBe("applicant@example.com");
  });

  it("should generate HTML welcome email with criteria and sample sponsor jobs", async () => {
    const emailService = new EmailService();
    const jobRepo = new JobRepository();
    const sampleJobs = await jobRepo.getLatestJobs(2);

    const html = emailService.generateWelcomeEmailHtml({
      toEmail: "jobseeker@gmail.com",
      keyword: "Software Engineer",
      country: "GB",
      category: "software-engineering",
      frequency: "daily",
      sampleJobs,
    });

    expect(html).toContain("Your Visa Job Alerts Are Active!");
    expect(html).toContain("Software Engineer");
    expect(html).toContain("jobseeker@gmail.com");
    expect(html).toContain("Sponsorship");

    const dispatchRes = await emailService.sendWelcomeAlertEmail({
      toEmail: "jobseeker@gmail.com",
      keyword: "Software Engineer",
      country: "GB",
      sampleJobs,
    });

    expect(dispatchRes.success).toBe(true);
    expect(dispatchRes.messageId).toBeDefined();
  }, 15000);

  it("should provide fallback suggestions when searching for a non-existent keyword", async () => {
    const jobRepo = new JobRepository();
    const searchRes = await jobRepo.search({
      q: "NonExistentKeywordXYZ12345",
      limit: 10,
    });

    expect(searchRes.total).toBe(0);
    expect(searchRes.jobs.length).toBe(0);
    expect(searchRes.fallbackJobs).toBeDefined();
    expect(searchRes.fallbackJobs!.length).toBeGreaterThan(0);
  });

  it("should handle /api/alerts/subscribe POST requests and return confirmation", async () => {
    const req = new NextRequest("http://localhost:3000/api/alerts/subscribe", {
      method: "POST",
      body: JSON.stringify({
        email: "test.subscriber@example.com",
        keyword: "Full Stack Developer",
        country: "all",
        category: "software-engineering",
        frequency: "daily",
      }),
    });

    const res = await subscribeHandler(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.emailSent).toBe(true);
    expect(data.alert).toBeDefined();
    expect(data.alert.email).toBe("test.subscriber@example.com");
  }, 15000);
});
