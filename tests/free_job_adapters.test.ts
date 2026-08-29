import { describe, it, expect } from "vitest";
import { RemoteOKAdapter } from "../sources/remoteok/RemoteOKAdapter";
import { JobicyAdapter } from "../sources/jobicy/JobicyAdapter";
import { HimalayasAdapter } from "../sources/himalayas/HimalayasAdapter";
import { TheMuseAdapter } from "../sources/themuse/TheMuseAdapter";
import { SourceRegistry } from "../sources/registry";

describe("Free Job Source Adapters & Normalization Suite", () => {
  // 1. RemoteOK Adapter
  describe("RemoteOK Adapter", () => {
    const adapter = new RemoteOKAdapter({ enabled: true });

    it("should correctly normalize raw RemoteOK job payload", () => {
      const mockRaw = {
        id: "109283",
        slug: "109283-senior-full-stack-engineer",
        position: "Senior Full Stack Engineer",
        company: "Vercel",
        company_logo: "https://remoteok.com/assets/img/jobs/vercel.png",
        tags: ["react", "node", "typescript", "fullstack", "uk"],
        description: "<p>We are looking for a <strong>Senior Full Stack Engineer</strong> to lead serverless runtime features.</p>",
        location: "United Kingdom",
        salary_min: 90000,
        salary_max: 130000,
        url: "https://remoteok.com/remote-jobs/109283",
        apply_url: "https://vercel.com/careers/apply/109283",
        date: "2026-08-25T10:00:00Z",
      };

      const norm = adapter.normalizeJob(mockRaw);
      expect(norm).not.toBeNull();
      expect(norm?.title).toBe("Senior Full Stack Engineer");
      expect(norm?.companyName).toBe("Vercel");
      expect(norm?.countryCode).toBe("GB");
      expect(norm?.remoteType).toBe("REMOTE");
      expect(norm?.salaryMin).toBe(90000);
      expect(norm?.salaryMax).toBe(130000);
      expect(norm?.salaryCurrency).toBe("GBP");
      expect(norm?.categorySlug).toBe("information-technology");
      expect(adapter.validateJob(norm!)).toBe(true);
    });

    it("should handle disabled state gracefully", async () => {
      const disabledAdapter = new RemoteOKAdapter({ enabled: false });
      const result = await disabledAdapter.fetchJobs({});
      expect(result.jobsFetched).toBe(0);
      expect(result.errors?.[0]).toContain("disabled");
    });
  });

  // 2. Jobicy Adapter
  describe("Jobicy Adapter", () => {
    const adapter = new JobicyAdapter({ enabled: true });

    it("should correctly normalize raw Jobicy payload", () => {
      const mockRaw = {
        id: 54321,
        url: "https://jobicy.com/jobs/54321-cloud-devops-architect",
        jobTitle: "Cloud DevOps Architect",
        companyName: "CloudScale Inc",
        companyLogo: "https://jobicy.com/logos/cloudscale.png",
        jobDescription: "<p>Design high-scale multi-region Kubernetes architectures.</p>",
        jobGeo: "USA",
        jobType: "full-time",
        pubDate: "2026-08-26T14:00:00Z",
        annualSalaryMin: "140000",
        annualSalaryMax: "185000",
        salaryCurrency: "USD",
        jobCategory: "devops",
      };

      const norm = adapter.normalizeJob(mockRaw);
      expect(norm).not.toBeNull();
      expect(norm?.title).toBe("Cloud DevOps Architect");
      expect(norm?.companyName).toBe("CloudScale Inc");
      expect(norm?.countryCode).toBe("US");
      expect(norm?.remoteType).toBe("REMOTE");
      expect(norm?.employmentType).toBe("FULL_TIME");
      expect(norm?.salaryMin).toBe(140000);
      expect(norm?.salaryMax).toBe(185000);
      expect(norm?.salaryCurrency).toBe("USD");
      expect(norm?.categorySlug).toBe("information-technology");
      expect(adapter.validateJob(norm!)).toBe(true);
    });
  });

  // 3. Himalayas Adapter
  describe("Himalayas Adapter", () => {
    const adapter = new HimalayasAdapter({ enabled: true });

    it("should correctly normalize raw Himalayas payload", () => {
      const mockRaw = {
        slug: "staff-ai-research-engineer-101",
        title: "Staff AI Research Engineer",
        companyName: "DeepGraph",
        companySlug: "deepgraph",
        companyLogo: "https://himalayas.app/logos/deepgraph.png",
        description: "<h3>About the Role</h3><p>Train and deploy large transformer models at scale.</p>",
        locationRestrictions: ["United States", "Canada"],
        categories: ["Engineering", "Data Science", "Machine Learning"],
        applicationLink: "https://deepgraph.ai/jobs/staff-ai-research-engineer",
        minSalary: 160000,
        maxSalary: 220000,
        salaryCurrency: "USD",
        employmentType: "full_time",
        createdAt: "2026-08-27T08:00:00Z",
      };

      const norm = adapter.normalizeJob(mockRaw);
      expect(norm).not.toBeNull();
      expect(norm?.title).toBe("Staff AI Research Engineer");
      expect(norm?.companyName).toBe("DeepGraph");
      expect(norm?.countryCode).toBe("US");
      expect(norm?.remoteType).toBe("REMOTE");
      expect(norm?.salaryMin).toBe(160000);
      expect(norm?.salaryMax).toBe(220000);
      expect(norm?.applyUrl).toBe("https://deepgraph.ai/jobs/staff-ai-research-engineer");
      expect(adapter.validateJob(norm!)).toBe(true);
    });
  });

  // 4. The Muse Adapter
  describe("The Muse Adapter", () => {
    const adapter = new TheMuseAdapter({ enabled: true });

    it("should correctly normalize raw The Muse payload", () => {
      const mockRaw = {
        id: 778899,
        name: "Senior Financial Analyst",
        company: { name: "Bloomberg LP", short_name: "bloomberg" },
        locations: [{ name: "London, United Kingdom" }],
        categories: [{ name: "Financial Services" }],
        contents: "<p>Analyze quantitative metrics for EMEA fixed income portfolios.</p>",
        refs: { landing_page: "https://www.themuse.com/jobs/bloomberg/778899" },
        publication_date: "2026-08-28T09:00:00Z",
      };

      const norm = adapter.normalizeJob(mockRaw);
      expect(norm).not.toBeNull();
      expect(norm?.title).toBe("Senior Financial Analyst");
      expect(norm?.companyName).toBe("Bloomberg LP");
      expect(norm?.countryCode).toBe("GB");
      expect(norm?.city).toBe("London");
      expect(norm?.salaryCurrency).toBe("GBP");
      expect(norm?.categorySlug).toBe("finance");
      expect(adapter.validateJob(norm!)).toBe(true);
    });
  });

  // 5. Source Registry Integration
  describe("SourceRegistry Integration with Free Adapters", () => {
    it("should have all 4 new free adapters registered in registry", () => {
      const registry = new SourceRegistry();
      expect(registry.getAdapter("remoteok")).toBeDefined();
      expect(registry.getAdapter("jobicy")).toBeDefined();
      expect(registry.getAdapter("himalayas")).toBeDefined();
      expect(registry.getAdapter("themuse")).toBeDefined();
      expect(registry.getAllAdapters().length).toBe(13);
    });

    it("should safely isolate execution when an adapter returns errors", async () => {
      const registry = new SourceRegistry();
      const res = await registry.executeSource("non_existent_source", {});
      expect(res.jobsFetched).toBe(0);
      expect(res.errors?.[0]).toContain("not registered");
    });
  });
});
