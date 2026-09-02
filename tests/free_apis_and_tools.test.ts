import { describe, it, expect } from "vitest";
import { CurrencyService } from "@/lib/services/currencyService";
import { CountryIntelligenceService } from "@/lib/services/countryIntelligenceService";
import { CompanyEnrichmentService } from "@/lib/services/companyEnrichmentService";
import { VisaPointsCalculator } from "@/lib/services/visaPointsCalculator";
import { GET as convertCurrencyGet } from "@/app/api/tools/convert-currency/route";
import { GET as countryInfoGet } from "@/app/api/tools/country-info/route";
import { GET as companyLogoGet } from "@/app/api/tools/company-logo/route";
import { NextRequest } from "next/server";

describe("Free APIs & Platform Enrichment Tools", () => {
  describe("1. Free Currency & ECB Exchange Rate Service", () => {
    it("should retrieve real exchange rates and convert GBP to USD and INR", async () => {
      const result = await CurrencyService.convertSalary(60000, "GBP", "USD");

      expect(result).toBeDefined();
      expect(result.amount).toBe(60000);
      expect(result.from).toBe("GBP");
      expect(result.to).toBe("USD");
      expect(result.rate).toBeGreaterThan(1.0);
      expect(result.convertedAmount).toBeGreaterThan(60000);
      expect(result.monthlyAmount).toBe(Math.round(result.convertedAmount / 12));
      expect(result.formatted).toContain("$");
    });

    it("should handle identical from and to currencies gracefully", async () => {
      const result = await CurrencyService.convertSalary(50000, "USD", "USD");
      expect(result.rate).toBe(1);
      expect(result.convertedAmount).toBe(50000);
    });

    it("should execute via API route /api/tools/convert-currency", async () => {
      const req = new NextRequest("http://localhost:3000/api/tools/convert-currency?amount=55000&from=GBP&to=EUR");
      const res = await convertCurrencyGet(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.convertedAmount).toBeGreaterThan(0);
      expect(data.currencies.length).toBeGreaterThan(10);
    });
  });

  describe("2. Free RestCountries Immigration Intelligence Service", () => {
    it("should fetch verified country and visa profile for UK (GB)", async () => {
      const profile = await CountryIntelligenceService.getCountryProfile("GB");

      expect(profile).not.toBeNull();
      expect(profile?.name).toBe("United Kingdom");
      expect(profile?.capital).toBe("London");
      expect(profile?.flagEmoji).toBe("🇬🇧");
      expect(profile?.visaHighlights.workPermitType).toContain("Skilled Worker");
    });

    it("should fetch verified country profile for Australia (AU)", async () => {
      const profile = await CountryIntelligenceService.getCountryProfile("AU");

      expect(profile).not.toBeNull();
      expect(profile?.name).toBe("Australia");
      expect(profile?.capital).toBe("Canberra");
      expect(profile?.visaHighlights.workPermitType).toContain("482");
    });

    it("should execute via API route /api/tools/country-info", async () => {
      const req = new NextRequest("http://localhost:3000/api/tools/country-info?country=CA");
      const res = await countryInfoGet(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.capital).toBe("Ottawa");
      expect(data.data.currencies[0].code).toBe("CAD");
    });
  });

  describe("3. Free Company Logo & Brand Enrichment Service", () => {
    it("should resolve high-resolution logo from domain", () => {
      const logoUrl = CompanyEnrichmentService.getCompanyLogoUrl("Atlassian", "https://atlassian.com");
      expect(logoUrl).toContain("google.com/s2/favicons?domain=atlassian.com");

      const candidates = CompanyEnrichmentService.getLogoCandidates("Stripe", "https://stripe.com");
      expect(candidates.length).toBeGreaterThanOrEqual(3);
      expect(candidates[0]).toContain("logo.clearbit.com/stripe.com");
    });

    it("should execute via API route /api/tools/company-logo", async () => {
      const req = new NextRequest("http://localhost:3000/api/tools/company-logo?company=Monzo&website=https://monzo.com");
      const res = await companyLogoGet(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.logoUrl).toContain("monzo.com");
    });
  });

  describe("4. Free Visa Points Calculation Engine", () => {
    it("should accurately assess UK Skilled Worker 70 points pass mark", () => {
      const eligible = VisaPointsCalculator.calculateUkSkilledWorkerPoints({
        hasJobOffer: true,
        jobAtAppropriateSkillLevel: true,
        speaksEnglishB1: true,
        salaryGbp: 42000, // Above £38,700
      });

      expect(eligible.isEligible).toBe(true);
      expect(eligible.totalPoints).toBe(70);
      expect(eligible.pointsBreakdown.mandatoryPoints).toBe(50);
      expect(eligible.pointsBreakdown.tradeablePoints).toBe(20);
    });

    it("should fail UK Skilled Worker test if mandatory job offer is missing", () => {
      const ineligible = VisaPointsCalculator.calculateUkSkilledWorkerPoints({
        hasJobOffer: false,
        jobAtAppropriateSkillLevel: true,
        speaksEnglishB1: true,
        salaryGbp: 45000,
      });

      expect(ineligible.isEligible).toBe(false);
      expect(ineligible.totalPoints).toBe(50);
      expect(ineligible.missingCriteria.length).toBeGreaterThan(0);
    });

    it("should accurately calculate Australia 65 points pass mark", () => {
      const eligible = VisaPointsCalculator.calculateAustraliaPoints({
        ageYears: 28, // 30 pts
        englishLevel: "Superior", // 20 pts
        overseasExperienceYears: 5, // 10 pts
        educationLevel: "BachelorMaster", // 15 pts
        hasStateNominationOrSponsor: true, // 5 pts
      });

      expect(eligible.isEligible).toBe(true);
      expect(eligible.totalPoints).toBeGreaterThanOrEqual(65);
    });
  });
});
