import { describe, it, expect } from "vitest";
import { getCountryBySlug, getCountryByCode } from "@/config/countries";
import { CountryRepository } from "@/lib/repositories/countryRepository";
import { routeHealthMonitor } from "@/lib/services/routeHealthMonitor";

describe("Country Slug & Route Resolution (Zero 404 Guarantee)", () => {
  const countryRepo = new CountryRepository();

  it("should correctly resolve United States from all common aliases (us, usa, united-states)", async () => {
    const fromUS = getCountryBySlug("us");
    const fromUSA = getCountryBySlug("usa");
    const fromFull = getCountryBySlug("united-states");

    expect(fromUS).toBeDefined();
    expect(fromUS?.code).toBe("US");
    expect(fromUS?.name).toBe("United States");

    expect(fromUSA).toBeDefined();
    expect(fromUSA?.code).toBe("US");

    expect(fromFull).toBeDefined();
    expect(fromFull?.code).toBe("US");

    // Test Repository getBySlug
    const repoUS = await countryRepo.getBySlug("us");
    const repoUSA = await countryRepo.getBySlug("usa");
    const repoFull = await countryRepo.getBySlug("united-states");

    expect(repoUS).not.toBeNull();
    expect(repoUS?.code).toBe("US");
    expect(repoUSA?.code).toBe("US");
    expect(repoFull?.code).toBe("US");
  });

  it("should correctly resolve United Kingdom from all common aliases (uk, gb, united-kingdom)", async () => {
    const fromUK = getCountryBySlug("uk");
    const fromGB = getCountryBySlug("gb");
    const fromFull = getCountryBySlug("united-kingdom");

    expect(fromUK?.code).toBe("GB");
    expect(fromGB?.code).toBe("GB");
    expect(fromFull?.code).toBe("GB");

    const repoUK = await countryRepo.getBySlug("uk");
    const repoGB = await countryRepo.getBySlug("gb");
    expect(repoUK?.code).toBe("GB");
    expect(repoGB?.code).toBe("GB");
  });

  it("should correctly resolve Australia, Canada, and New Zealand from codes and slugs", async () => {
    expect(getCountryBySlug("au")?.code).toBe("AU");
    expect(getCountryBySlug("australia")?.code).toBe("AU");
    expect(getCountryBySlug("ca")?.code).toBe("CA");
    expect(getCountryBySlug("canada")?.code).toBe("CA");
    expect(getCountryBySlug("nz")?.code).toBe("NZ");
    expect(getCountryBySlug("new-zealand")?.code).toBe("NZ");

    const repoAU = await countryRepo.getBySlug("au");
    const repoCA = await countryRepo.getBySlug("ca");
    const repoNZ = await countryRepo.getBySlug("nz");

    expect(repoAU?.code).toBe("AU");
    expect(repoCA?.code).toBe("CA");
    expect(repoNZ?.code).toBe("NZ");
  });

  it("should run the RouteHealthMonitor audit across all routes and achieve 100% zero 404s", async () => {
    const report = await routeHealthMonitor.auditAllSystemRoutes();

    expect(report.brokenRoutesCount).toBe(0);
    expect(report.brokenRoutes.length).toBe(0);
    expect(report.healthGrade).toContain("100% Zero 404s");
    expect(report.totalRoutesAudited).toBeGreaterThan(40);
  });
});
