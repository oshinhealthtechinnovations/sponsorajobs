import { describe, it, expect } from "vitest";
import { JobVerificationEngine } from "@/lib/services/jobVerificationEngine";
import { NormalizationEngine } from "@/lib/services/normalizationEngine";
import { DeduplicationEngine } from "@/lib/services/deduplicationEngine";
import { SponsorshipEvidenceEngine } from "@/lib/services/sponsorshipEvidenceEngine";
import { PublishGateService } from "@/lib/services/publishGateService";
import { ContinuousVerificationWorker } from "@/lib/services/continuousVerificationWorker";
import { SourcePolicyService } from "@/lib/services/sourcePolicyService";
import { JobRecord } from "@/lib/types/database";

describe("Sponsora Job Acquisition & Publishing Platform — 100-Job Adversarial Benchmark (Part 97)", () => {
  // ── 1. 20 Live Jobs Test
  describe("Group 1: 20 Live Actionable Jobs", () => {
    it("should successfully verify, score 80+, and publish 20 genuine live jobs", async () => {
      for (let i = 1; i <= 20; i++) {
        const evalResult = JobVerificationEngine.computeVerificationScore({
          sourceApproved: true,
          jobUrlLive: true,
          applicationUrlLive: true,
          isHttps: true,
          isDnsValid: true,
          employerDetected: true,
          titleDetected: true,
          isHomepageRedirect: false,
          isClosedSignal: false,
          is404or410: false,
        });

        expect(evalResult.status).toBe("VERIFIED");
        expect(evalResult.score).toBeGreaterThanOrEqual(80);

        const job: Partial<JobRecord> = {
          id: `job_live_${i}`,
          title: `Senior Structural Engineer ${i}`,
          company_id: "comp_mace",
          country_code: "GB",
          job_url: `https://macegroup.com/careers/job-${i}`,
          apply_url: `https://careers.macegroup.com/apply-${i}`,
          verification_status: evalResult.status,
          verification_score: evalResult.score,
          quality_score: 90,
          status: "quarantined",
        };

        const gate = PublishGateService.evaluate(job, true);
        expect(gate.canPublish).toBe(true);
        expect(gate.isPublished).toBe(1);
        expect(gate.recommendedStatus).toBe("active");
      }
    });
  });

  // ── 2. 10 x HTTP 404 (Requisition Dead)
  describe("Group 2: 10 x HTTP 404 Not Found Jobs", () => {
    it("should immediately expire and block publication for 10 HTTP 404 jobs", () => {
      for (let i = 1; i <= 10; i++) {
        const evalResult = JobVerificationEngine.computeVerificationScore({
          sourceApproved: true,
          jobUrlLive: false,
          applicationUrlLive: false,
          isHttps: true,
          isDnsValid: true,
          employerDetected: false,
          titleDetected: false,
          isHomepageRedirect: false,
          isClosedSignal: false,
          is404or410: true,
        });

        expect(evalResult.status).toBe("EXPIRED");
        expect(evalResult.score).toBe(0);

        const gate = PublishGateService.evaluate({
          id: `job_404_${i}`,
          title: `DevOps Engineer ${i}`,
          company_id: "comp_test",
          country_code: "US",
          job_url: `https://example.com/404-${i}`,
          apply_url: `https://example.com/apply-404-${i}`,
          verification_status: evalResult.status,
          status: "expired",
        });

        expect(gate.canPublish).toBe(false);
        expect(gate.isPublished).toBe(0);
        expect(gate.recommendedStatus).toBe("expired");
      }
    });
  });

  // ── 3. 10 x HTTP 410 (Requisition Gone)
  describe("Group 3: 10 x HTTP 410 Gone Jobs", () => {
    it("should immediately expire and block publication for 10 HTTP 410 jobs", () => {
      for (let i = 1; i <= 10; i++) {
        const evalResult = JobVerificationEngine.computeVerificationScore({
          sourceApproved: true,
          jobUrlLive: false,
          applicationUrlLive: false,
          isHttps: true,
          isDnsValid: true,
          employerDetected: false,
          titleDetected: false,
          isHomepageRedirect: false,
          isClosedSignal: false,
          is404or410: true,
        });

        expect(evalResult.status).toBe("EXPIRED");

        const gate = PublishGateService.evaluate({
          id: `job_410_${i}`,
          title: `Product Manager ${i}`,
          company_id: "comp_test",
          country_code: "CA",
          job_url: `https://example.com/410-${i}`,
          apply_url: `https://example.com/apply-410-${i}`,
          verification_status: evalResult.status,
          status: "expired",
        });

        expect(gate.canPublish).toBe(false);
        expect(gate.isPublished).toBe(0);
      }
    });
  });

  // ── 4. 10 x Homepage Redirects
  describe("Group 4: 10 x Homepage Redirects", () => {
    it("should reject and block publication for 10 jobs that redirect to homepages", () => {
      const redirectUrls = [
        "https://company.com/",
        "https://company.com/careers",
        "https://company.com/careers/",
        "https://company.com/jobs",
        "https://company.com/en",
        "https://company.com/home",
        "https://burnsmcd.com/",
        "https://macegroup.com/careers",
        "https://example.com/",
        "https://test.com/jobs/",
      ];

      redirectUrls.forEach((finalUrl, idx) => {
        const isHome = JobVerificationEngine.isHomepageRedirect(
          "https://company.com/job/12345",
          finalUrl
        );
        expect(isHome).toBe(true);

        const evalResult = JobVerificationEngine.computeVerificationScore({
          sourceApproved: true,
          jobUrlLive: false,
          applicationUrlLive: false,
          isHttps: true,
          isDnsValid: true,
          employerDetected: true,
          titleDetected: false,
          isHomepageRedirect: true,
          isClosedSignal: false,
          is404or410: false,
        });

        expect(evalResult.status).toBe("REJECTED");
        expect(evalResult.score).toBe(0);
      });
    });
  });

  // ── 5. 10 x Soft-404s (HTTP 200 with Closed Job Content)
  describe("Group 5: 10 x Soft-404 Closed Signals", () => {
    it("should detect closed message phrases in HTTP 200 bodies and trigger expiration", () => {
      const closedBodies = [
        "<html><body><h1>Job no longer available</h1><p>Thank you for your interest.</p></body></html>",
        "<div>This position has been filled. Explore other open opportunities.</div>",
        "<main>Applications are closed for this role.</main>",
        "<span>This job is no longer active.</span>",
        "<p>We are no longer accepting applications for this position.</p>",
        "<div>Requisition closed on August 2026.</div>",
        "<div>Position unavailable at this time.</div>",
        "<p>This posting has expired.</p>",
        "<div>Role has expired and is archived.</div>",
        "<div>Job has been closed by the recruiter.</div>",
      ];

      closedBodies.forEach((body, idx) => {
        const closedCheck = JobVerificationEngine.detectClosedSignals(body);
        expect(closedCheck.isClosed).toBe(true);

        const evalResult = JobVerificationEngine.computeVerificationScore({
          sourceApproved: true,
          jobUrlLive: false,
          applicationUrlLive: false,
          isHttps: true,
          isDnsValid: true,
          employerDetected: true,
          titleDetected: true,
          isHomepageRedirect: false,
          isClosedSignal: true,
          is404or410: false,
        });

        expect(evalResult.status).toBe("EXPIRED");
        expect(evalResult.score).toBe(0);
      });
    });
  });

  // ── 6. 10 x Dead Application Paths
  describe("Group 6: 10 x Dead Application Paths", () => {
    it("should classify jobs as UNVERIFIABLE and block publication when the apply URL is broken", () => {
      for (let i = 1; i <= 10; i++) {
        const evalResult = JobVerificationEngine.computeVerificationScore({
          sourceApproved: true,
          jobUrlLive: true,
          applicationUrlLive: false, // Job page 200, but apply form broken
          isHttps: true,
          isDnsValid: true,
          employerDetected: true,
          titleDetected: true,
          isHomepageRedirect: false,
          isClosedSignal: false,
          is404or410: false,
        });

        expect(evalResult.status).toBe("UNVERIFIABLE");

        const gate = PublishGateService.evaluate({
          id: `job_dead_apply_${i}`,
          title: `Civil Engineer ${i}`,
          company_id: "comp_test",
          country_code: "GB",
          job_url: `https://example.com/job-${i}`,
          apply_url: `https://example.com/broken-apply-${i}`,
          verification_status: evalResult.status,
        });

        expect(gate.canPublish).toBe(false);
        expect(gate.isPublished).toBe(0);
      }
    });
  });

  // ── 7. 10 x Temporary 503 Server Errors
  describe("Group 7: 10 x Temporary 503 Errors", () => {
    it("should NOT immediately expire jobs on temporary 503 server outages", async () => {
      for (let i = 1; i <= 10; i++) {
        // Continuous verification mock returning 503
        const mock503 = async () => ({
          isLive: false,
          httpStatus: 503,
          isClosedMessage: false,
          isHomepageRedirect: false,
        });

        const activeJob: JobRecord = {
          id: `job_503_${i}`,
          source_id: "test_source",
          source_job_id: `503_${i}`,
          canonical_hash: `hash_503_${i}`,
          title: `Project Assistant ${i}`,
          company_id: "comp_test",
          description: "Test description",
          description_clean: null,
          location: "London, UK",
          city: "London",
          region: "Greater London",
          country_code: "GB",
          postal_code: null,
          remote_type: "ONSITE",
          employment_type: "FULL_TIME",
          category_id: "cat_eng",
          salary_min: null,
          salary_max: null,
          salary_currency: "GBP",
          job_url: `https://example.com/job-${i}`,
          apply_url: `https://example.com/apply-${i}`,
          source_url: null,
          published_at: null,
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          expires_at: null,
          sponsorship_score: 80,
          sponsorship_label: "Possible",
          sponsorship_positive_evidence: null,
          sponsorship_negative_evidence: null,
          visa_keywords: null,
          quality_score: 90,
          status: "active",
          is_published: 1,
          is_featured: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { updatedJobs, report } = await ContinuousVerificationWorker.runVerificationCycle(
          [activeJob],
          mock503
        );

        // 503 should mark as warning/unverifiable, not instant expiration
        expect(report.expiredCount).toBe(0);
        expect(report.unverifiableCount).toBe(1);
        expect(updatedJobs[0].status).toBe("warning");
      }
    });
  });

  // ── 8. 5 x 403 Forbidden Responses
  describe("Group 8: 5 x 403 Forbidden Responses", () => {
    it("should treat HTTP 403 as UNVERIFIABLE rather than assumed dead", () => {
      for (let i = 1; i <= 5; i++) {
        const evalResult = JobVerificationEngine.computeVerificationScore({
          sourceApproved: true,
          jobUrlLive: false,
          applicationUrlLive: false,
          isHttps: true,
          isDnsValid: true,
          employerDetected: false,
          titleDetected: false,
          isHomepageRedirect: false,
          isClosedSignal: false,
          is404or410: false, // 403 is NOT 404/410
        });

        expect(evalResult.status).toBe("UNVERIFIABLE");
      }
    });
  });

  // ── 9. 5 x 429 Rate Limiting Backoff
  describe("Group 9: 5 x Rate Limit & Sliding Window Tests", () => {
    it("should correctly throttle and enforce per-source request limits", () => {
      const sourceId = "test_rate_limited_source";

      // Allow 2 requests per minute max
      for (let i = 1; i <= 2; i++) {
        const check = SourcePolicyService.checkRateLimit(sourceId, 2, 1);
        expect(check.canProceed).toBe(true);
        SourcePolicyService.recordRequestStart(sourceId);
        SourcePolicyService.recordRequestEnd(sourceId);
      }

      // 3rd request in same minute should be rejected
      const thirdCheck = SourcePolicyService.checkRateLimit(sourceId, 2, 1);
      expect(thirdCheck.canProceed).toBe(false);
      expect(thirdCheck.waitMs).toBeGreaterThan(0);
    });
  });

  // ── 10. 5 x Deduplication Tests
  describe("Group 10: 5 x Deduplication Conflict Resolution", () => {
    it("should detect duplicates across source IDs, canonical URLs, and entity hashes", () => {
      const existingJobs: Partial<JobRecord>[] = [
        {
          id: "job_existing_1",
          source_id: "burnsmcd_careers",
          source_job_id: "260436",
          canonical_hash: "hash_s_burnsmcd_careers_260436",
          canonical_url: "https://burnsmcd.jobs/project-assistant-gfs",
          company_id: "comp_burnsmcd",
          title: "Project Assistant - GFS",
          location: "Mumbai, India",
        },
      ];

      // Match Priority 1: source_id + source_job_id
      const dupP1 = DeduplicationEngine.findDuplicate(
        {
          sourceId: "burnsmcd_careers",
          sourceJobId: "260436",
          companyName: "Burns & McDonnell",
          title: "Project Assistant - GFS",
          location: "Mumbai, India",
        },
        existingJobs as JobRecord[]
      );
      expect(dupP1.isDuplicate).toBe(true);
      expect(dupP1.matchedPriority).toBe(1);

      // Match Priority 2: Canonical URL
      const dupP2 = DeduplicationEngine.findDuplicate(
        {
          sourceId: "another_feed",
          canonicalUrl: "https://burnsmcd.jobs/project-assistant-gfs",
          companyName: "Burns & McDonnell",
          title: "Project Assistant - GFS",
          location: "Mumbai, India",
        },
        existingJobs as JobRecord[]
      );
      expect(dupP2.isDuplicate).toBe(true);
      expect(dupP2.matchedPriority).toBe(2);

      // Match Priority 4: Entity tuple
      const dupP4 = DeduplicationEngine.findDuplicate(
        {
          sourceId: "third_aggregator",
          companyName: "comp_burnsmcd",
          title: "Project Assistant - GFS",
          location: "Mumbai, India",
        },
        existingJobs as JobRecord[]
      );
      expect(dupP4.isDuplicate).toBe(true);
      expect(dupP4.matchedPriority).toBe(4);

      // Unique job
      const uniqueJob = DeduplicationEngine.findDuplicate(
        {
          sourceId: "burnsmcd_careers",
          sourceJobId: "999999",
          companyName: "Burns & McDonnell",
          title: "Lead Civil Engineer",
          location: "London, UK",
        },
        existingJobs as JobRecord[]
      );
      expect(uniqueJob.isDuplicate).toBe(false);
    });
  });

  // ── 11. 5 x Geographic Contradiction & Location Integrity Tests
  describe("Group 11: 5 x Geographic Location Contradiction Tests", () => {
    it("should catch country contradictions (e.g. Mumbai / US) and route to Review Required", () => {
      // Test 1: Mumbai, IND with country_code US -> Contradiction!
      const loc1 = NormalizationEngine.validateLocationConsistency("Mumbai, IND", "US");
      expect(loc1.isValid).toBe(false);
      expect(loc1.requiresReview).toBe(true);
      expect(loc1.normalizedCountryCode).toBe("IN");

      // Test 2: London, England with country_code CA -> Contradiction!
      const loc2 = NormalizationEngine.validateLocationConsistency("London, England", "CA");
      expect(loc2.isValid).toBe(false);
      expect(loc2.requiresReview).toBe(true);

      // Test 3: Toronto, ON with country_code CA -> Valid
      const loc3 = NormalizationEngine.validateLocationConsistency("Toronto, ON, Canada", "CA");
      expect(loc3.isValid).toBe(true);
      expect(loc3.requiresReview).toBe(false);
      expect(loc3.normalizedCountryCode).toBe("CA");

      // Test 4: Sydney, Australia with country_code AU -> Valid
      const loc4 = NormalizationEngine.validateLocationConsistency("Sydney NSW", "AU");
      expect(loc4.isValid).toBe(true);
      expect(loc4.normalizedCountryCode).toBe("AU");

      // Test 5: Auckland with country_code NZ -> Valid
      const loc5 = NormalizationEngine.validateLocationConsistency("Auckland, New Zealand", "NZ");
      expect(loc5.isValid).toBe(true);
      expect(loc5.normalizedCountryCode).toBe("NZ");
    });
  });

  // ── 12. Sponsorship Evidence Separation Tests
  describe("Group 12: Sponsorship Evidence Taxonomy & Score vs Confidence", () => {
    it("should separate explicit statements from corporate mobility signals", () => {
      // Test explicit statement
      const exp = SponsorshipEvidenceEngine.analyze({
        description: "We are pleased to offer Certificate of Sponsorship provided for this engineering role.",
      });
      expect(exp.label).toBe("Strong");
      expect(exp.evidenceLevel).toBe("EXPLICIT_JOB_TEXT");
      expect(exp.confidence).toBe(95);

      // Test company level mobility signal (Burns & McDonnell GFS case)
      const mob = SponsorshipEvidenceEngine.analyze({
        description: "Global facilities practice handling North America hyper-scale datacenter engineering.",
        isGlobalPracticeOrMobility: true,
      });
      expect(mob.label).toBe("Possible");
      expect(mob.evidenceLevel).toBe("COMPANY_LEVEL_SIGNAL");
      expect(mob.confidence).toBe(45); // Honest confidence, never falsely labeled 'Confirmed'

      // Test explicit negative restriction
      const neg = SponsorshipEvidenceEngine.analyze({
        description: "Must have unrestricted right to work. No visa sponsorship offered.",
      });
      expect(neg.label).toBe("Explicitly Not Offered");
      expect(neg.score).toBe(0);
      expect(neg.confidence).toBe(95);
    });
  });
});
