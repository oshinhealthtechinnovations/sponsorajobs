import { describe, it, expect } from "vitest";
import { enrichJobListing } from "../lib/services/jobAutoEnricher";

describe("JobAutoEnricher - Intelligent Gap Filling & Autocomplete Engine", () => {
  it("should infer country, currency, and category when only given title and location", () => {
    const raw = {
      title: "Senior React Developer",
      companyName: "Revolut",
      location: "London, United Kingdom",
      applyUrl: "https://job-boards.greenhouse.io/revolut/jobs/123",
      description: "We offer visa sponsorship and skilled worker visa support for senior frontend engineers.",
    };

    const enriched = enrichJobListing(raw);

    expect(enriched.country_code).toBe("GB");
    expect(enriched.city).toBe("London");
    expect(enriched.salary_currency).toBe("GBP");
    expect(enriched.category_slug).toBe("information-technology");
    expect(enriched.sponsorship_score).toBeGreaterThan(50);
    expect(enriched.sponsorship_label).toBe("Strong");
  });

  it("should extract salary range from description when structured salary is missing", () => {
    const raw = {
      title: "Staff Infrastructure Engineer",
      companyName: "Stripe",
      location: "San Francisco, CA",
      applyUrl: "https://job-boards.greenhouse.io/stripe/jobs/456",
      description: "Base compensation is $180k - $240k per year. H-1B transfer supported.",
    };

    const enriched = enrichJobListing(raw);

    expect(enriched.country_code).toBe("US");
    expect(enriched.salary_min).toBe(180000);
    expect(enriched.salary_max).toBe(240000);
    expect(enriched.salary_currency).toBe("USD");
  });

  it("should auto-classify Healthcare category for medical / dental roles", () => {
    const raw = {
      title: "Associate Dentist (Visa Sponsorship)",
      companyName: "MedMatch Dental",
      location: "Manchester, UK",
      applyUrl: "https://www.adzuna.co.uk/jobs/details/999",
      description: "Full clinical support, Tier 2 sponsorship provided for NHS performer number holders.",
    };

    const enriched = enrichJobListing(raw);

    expect(enriched.category_slug).toBe("healthcare");
    expect(enriched.category_name).toBe("Healthcare & Life Sciences");
    expect(enriched.country_code).toBe("GB");
  });

  it("should detect REMOTE status from title or text keywords", () => {
    const raw = {
      title: "Lead DevOps Engineer (100% Remote, WFH)",
      companyName: "GitLab",
      location: "Worldwide / Remote",
      applyUrl: "https://jobs.lever.co/gitlab/789/apply",
      description: "Work from anywhere. Global visa sponsorship available for relocated employees.",
    };

    const enriched = enrichJobListing(raw);

    expect(enriched.remote_type).toBe("REMOTE");
    expect(enriched.employment_type).toBe("FULL_TIME");
  });

  it("should generate a clean slug, canonical hash, and default company logo/website", () => {
    const raw = {
      title: "Product Designer",
      companyName: "Figma",
      location: "San Francisco",
      applyUrl: "https://job-boards.greenhouse.io/figma/jobs/321",
    };

    const enriched = enrichJobListing(raw);

    expect(enriched.canonical_hash).toBeDefined();
    expect(enriched.slug).toContain("figma-product-designer");
    expect(enriched.company_website).toContain("figma.com");
    expect(enriched.company_logo_url).toContain("logo.clearbit.com/figma.com");
    expect(enriched.quality_score).toBeGreaterThan(0);
  });
});
