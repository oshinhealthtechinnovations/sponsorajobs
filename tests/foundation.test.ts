import { describe, it, expect } from "vitest";
import { INITIAL_COUNTRIES, getCountryByCode, getCountryBySlug } from "@/config/countries";
import { INITIAL_CATEGORIES, getCategoryBySlug } from "@/config/categories";
import { getFeatureFlags } from "@/config/features";
import {
  normalizeCountryCode,
  normalizeRemoteType,
  normalizeEmploymentType,
  generateCanonicalHash
} from "@/normalization";

describe("Foundation Configuration & Normalizers", () => {
  it("should have exactly 5 initial target countries (GB, US, AU, CA, NZ)", () => {
    const codes = INITIAL_COUNTRIES.map((c) => c.code);
    expect(codes).toEqual(["GB", "US", "AU", "CA", "NZ"]);
  });

  it("should lookup countries by code and slug", () => {
    expect(getCountryByCode("GB")?.name).toBe("United Kingdom");
    expect(getCountryByCode("us")?.name).toBe("United States");
    expect(getCountryBySlug("australia")?.code).toBe("AU");
    expect(getCountryBySlug("canada")?.currency).toBe("CAD");
    expect(getCountryBySlug("new-zealand")?.code).toBe("NZ");
  });

  it("should normalize country name variations accurately", () => {
    expect(normalizeCountryCode("United Kingdom")).toBe("GB");
    expect(normalizeCountryCode("UK")).toBe("GB");
    expect(normalizeCountryCode("Great Britain")).toBe("GB");
    expect(normalizeCountryCode("USA")).toBe("US");
    expect(normalizeCountryCode("United States of America")).toBe("US");
    expect(normalizeCountryCode("Australia")).toBe("AU");
    expect(normalizeCountryCode("Canada")).toBe("CA");
    expect(normalizeCountryCode("New Zealand")).toBe("NZ");
  });

  it("should normalize remote types properly", () => {
    expect(normalizeRemoteType("100% Remote / WFH")).toBe("REMOTE");
    expect(normalizeRemoteType("Hybrid 2 days in office")).toBe("HYBRID");
    expect(normalizeRemoteType("On-site Sydney HQ")).toBe("ONSITE");
    expect(normalizeRemoteType("")).toBe("UNKNOWN");
  });

  it("should normalize employment types properly", () => {
    expect(normalizeEmploymentType("Permanent Full Time")).toBe("FULL_TIME");
    expect(normalizeEmploymentType("Part-time flexible")).toBe("PART_TIME");
    expect(normalizeEmploymentType("12 Month Fixed Contract")).toBe("CONTRACT");
    expect(normalizeEmploymentType("Summer Internship")).toBe("INTERNSHIP");
    expect(normalizeEmploymentType("Graduate Apprenticeship")).toBe("APPRENTICESHIP");
  });

  it("should generate deterministic canonical deduplication hashes", () => {
    const hash1 = generateCanonicalHash("Google", "Software Engineer", "London, UK", "https://careers.google.com/jobs/123?src=feed");
    const hash2 = generateCanonicalHash("Google", "Software Engineer", "London, UK", "https://careers.google.com/jobs/123");
    expect(hash1).toBe(hash2);
  });

  it("should have external sources disabled by default for zero-cost / safe operation", () => {
    const flags = getFeatureFlags({});
    expect(flags.enableAdzuna).toBe(false);
    expect(flags.enableUSAJobs).toBe(false);
    expect(flags.enableATS).toBe(false);
  });
});
