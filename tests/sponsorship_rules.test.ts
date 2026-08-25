import { describe, it, expect } from "vitest";
import { classifyJobSponsorship } from "@/scoring/classifier";

describe("Sponsorship Intelligence Classifier Rules (Sections 18, 19, 104, 142-145)", () => {
  it("should classify strong explicit sponsorship offering as Strong", () => {
    const res1 = classifyJobSponsorship("Visa sponsorship is available for this role.");
    expect(res1.label).toBe("Strong");
    expect(res1.score).toBeGreaterThanOrEqual(90);

    const res2 = classifyJobSponsorship("We offer visa sponsorship and relocation support.");
    expect(res2.label).toBe("Strong");
  });

  it("should classify explicit negative sponsorship phrasing as Explicitly Not Offered", () => {
    const res = classifyJobSponsorship("Unfortunately, no visa sponsorship is available for this vacancy.");
    expect(res.label).toBe("Explicitly Not Offered");
    expect(res.score).toBe(0);
    expect(res.negativeEvidence.length).toBeGreaterThan(0);
  });

  it("should recognize work authorization / right to work requirements as negative", () => {
    const res = classifyJobSponsorship("Candidates must have unrestricted work authorization to apply.");
    expect(res.label).toBe("Explicitly Not Offered");
  });

  it("should NOT classify the single generic word 'visa' as sponsorship (Section 142)", () => {
    const res = classifyJobSponsorship("Candidates must hold a valid working visa.");
    // In our negative patterns, 'must have a valid visa' is caught as a right-to-work constraint, not sponsorship
    expect(res.label).not.toBe("Strong");
  });

  it("should mark conflicting positive and negative evidence as REVIEW_REQUIRED (Section 144, 145)", () => {
    const text = "Visa sponsorship available for senior candidates. However, we are currently unable to sponsor applicants requiring immediate filing.";
    const res = classifyJobSponsorship(text);
    expect(res.label).toBe("REVIEW_REQUIRED");
    expect(res.requiresReview).toBe(true);
    expect(res.positiveEvidence.length).toBeGreaterThan(0);
    expect(res.negativeEvidence.length).toBeGreaterThan(0);
  });

  it("should classify country-specific patterns accurately (UK, US, AU, CA, NZ)", () => {
    const ukRes = classifyJobSponsorship("We can provide Skilled Worker visa sponsorship with Certificate of Sponsorship (CoS).", "GB");
    expect(ukRes.label).toBe("Likely");
    expect(ukRes.positiveEvidence.some(e => e.toLowerCase().includes("skilled worker"))).toBe(true);

    const usRes = classifyJobSponsorship("H-1B sponsorship and transfer available for qualified software engineers.", "US");
    expect(usRes.label).toBe("Likely");

    const auRes = classifyJobSponsorship("Employer sponsored position via Subclass 482 visa.", "AU");
    expect(auRes.label).toBe("Likely");

    const caRes = classifyJobSponsorship("This job is supported with a positive LMIA for international workers.", "CA");
    expect(caRes.label).toBe("Likely");

    const nzRes = classifyJobSponsorship("We are an accredited employer and support the Accredited Employer Work Visa (AEWV).", "NZ");
    expect(nzRes.label).toBe("Likely");
  });
});
