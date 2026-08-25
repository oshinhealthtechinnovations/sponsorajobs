import { describe, it, expect } from "vitest";
import { USAJobsAdapter } from "../sources/usajobs/USAJobsAdapter";
import { AshbyAdapter } from "../sources/ashby/AshbyAdapter";
import { WorkableAdapter } from "../sources/workable/WorkableAdapter";
import { AdzunaAdapter } from "../sources/adzuna/AdzunaAdapter";
import { SourceRegistry } from "../sources/registry";

describe("Phase 5: Source Adapters & Normalization Tests", () => {
  // 1. USAJobs Adapter
  describe("USAJobs Adapter", () => {
    const adapter = new USAJobsAdapter({ apiKey: "test_key", email: "test@example.com", enabled: true });

    it("should normalize raw USAJobs payload correctly", () => {
      const mockRawUSAJobs = {
        MatchedObjectId: "usajobs_12345",
        MatchedObjectDescriptor: {
          PositionTitle: "Civil Engineer (Structural)",
          OrganizationName: "US Army Corps of Engineers",
          PositionURI: "https://www.usajobs.gov/job/12345",
          ApplyURI: ["https://www.usajobs.gov/apply/12345"],
          PositionLocationDisplay: "San Francisco, California",
          PositionRemuneration: [{ MinimumRange: "115000", MaximumRange: "148000" }],
          PositionOfferingType: [{ Name: "Full Time" }],
          PositionTelework: "Telework Eligible",
          UserArea: { Details: { JobSummary: "Lead critical flood control engineering." } },
          PublicationStartDate: "2026-08-01T00:00:00Z"
        }
      };

      const norm = adapter.normalizeJob(mockRawUSAJobs);
      expect(norm).not.toBeNull();
      expect(norm?.title).toBe("Civil Engineer (Structural)");
      expect(norm?.companyName).toBe("US Army Corps of Engineers");
      expect(norm?.countryCode).toBe("US");
      expect(norm?.salaryMin).toBe(115000);
      expect(norm?.salaryMax).toBe(148000);
      expect(norm?.remoteType).toBe("HYBRID");
      expect(norm?.employmentType).toBe("FULL_TIME");
      expect(adapter.validateJob(norm!)).toBe(true);
    });

    it("should handle missing credentials gracefully without throwing", async () => {
      const unauthAdapter = new USAJobsAdapter({ enabled: false });
      const res = await unauthAdapter.fetchJobs({});
      expect(res.jobsFetched).toBe(0);
      expect(res.errors?.length).toBeGreaterThan(0);
    });
  });

  // 2. Ashby ATS Adapter
  describe("Ashby ATS Adapter", () => {
    const adapter = new AshbyAdapter({ enabled: true });

    it("should normalize Ashby job board payload correctly", () => {
      const mockRawAshby = {
        id: "ashby_job_99",
        title: "Senior Backend Engineer",
        orgName: "Linear",
        jobUrl: "https://jobs.ashbyhq.com/Linear/ashby_job_99",
        applyUrl: "https://jobs.ashbyhq.com/Linear/ashby_job_99/apply",
        locationName: "London, United Kingdom",
        isRemote: true,
        employmentType: "FullTime",
        descriptionPlain: "Build world-class sync engine. Visa sponsorship is available for senior candidates.",
        publishedAt: "2026-08-10T12:00:00Z",
        address: {
          postalAddress: {
            addressLocality: "London",
            addressCountry: "GB"
          }
        }
      };

      const norm = adapter.normalizeJob(mockRawAshby);
      expect(norm).not.toBeNull();
      expect(norm?.title).toBe("Senior Backend Engineer");
      expect(norm?.countryCode).toBe("GB");
      expect(norm?.remoteType).toBe("REMOTE");
      expect(norm?.employmentType).toBe("FULL_TIME");
      expect(adapter.validateJob(norm!)).toBe(true);
    });
  });

  // 3. Workable ATS Adapter
  describe("Workable ATS Adapter", () => {
    const adapter = new WorkableAdapter({ enabled: true });

    it("should normalize Workable widget payload correctly", () => {
      const mockRawWorkable = {
        shortcode: "WORK123",
        title: "Staff Data Engineer",
        companyName: "TransferGo",
        city: "Melbourne",
        region: "Victoria",
        country: "Australia",
        telecommuting: false,
        employment_type: "full_time",
        description: "Scale data pipelines across APAC. Subclass 482 visa support provided.",
        published_on: "2026-08-15T00:00:00Z"
      };

      const norm = adapter.normalizeJob(mockRawWorkable);
      expect(norm).not.toBeNull();
      expect(norm?.title).toBe("Staff Data Engineer");
      expect(norm?.countryCode).toBe("AU");
      expect(norm?.city).toBe("Melbourne");
      expect(adapter.validateJob(norm!)).toBe(true);
    });
  });

  // 4. Adzuna Adapter
  describe("Adzuna Adapter", () => {
    const adapter = new AdzunaAdapter({ appId: "test_id", appKey: "test_key", enabled: true });

    it("should declare attribution required as mandated by Section 78", () => {
      expect(adapter.isAttributionRequired()).toBe(true);
      expect(adapter.getRateLimitPerMinute()).toBe(25);
    });

    it("should normalize Adzuna job payload correctly", () => {
      const mockRawAdzuna = {
        id: 987654321,
        title: "<b>Lead React Native Developer</b>",
        company: { display_name: "Fintech UK" },
        redirect_url: "https://www.adzuna.co.uk/land/ad/987654321",
        description: "Join as lead developer. Skilled Worker visa sponsorship available.",
        location: {
          area: ["UK", "London"],
          display_name: "London, UK"
        },
        salary_min: 75000,
        salary_max: 95000,
        contract_time: "permanent",
        created: "2026-08-20T00:00:00Z"
      };

      const norm = adapter.normalizeJob(mockRawAdzuna);
      expect(norm).not.toBeNull();
      expect(norm?.title).toBe("Lead React Native Developer"); // HTML tag stripped
      expect(norm?.countryCode).toBe("GB");
      expect(norm?.salaryCurrency).toBe("GBP");
      expect(norm?.salaryMin).toBe(75000);
      expect(adapter.validateJob(norm!)).toBe(true);
    });
  });

  // 5. Source Registry & Isolation
  describe("Source Registry & Fault Tolerance", () => {
    it("should register all 4 adapters and allow lookup", () => {
      const registry = new SourceRegistry();
      expect(registry.getAdapter("usajobs")).toBeDefined();
      expect(registry.getAdapter("ashby")).toBeDefined();
      expect(registry.getAdapter("workable")).toBeDefined();
      expect(registry.getAdapter("adzuna")).toBeDefined();
    });

    it("should execute source safely and isolate failures without throwing (Section 62)", async () => {
      const registry = new SourceRegistry();
      // Execute unconfigured source
      const res = await registry.executeSource("usajobs", {});
      expect(res.sourceName).toBe("USAJobs");
      expect(res.jobsFetched).toBe(0);
      expect(res.errors?.length).toBeGreaterThan(0);
    });
  });
});
