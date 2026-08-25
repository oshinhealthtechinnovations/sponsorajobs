import { describe, it, expect } from "vitest";
import { classifyJobSponsorship } from "../scoring/classifier";

describe("Phase 4: Comprehensive Sponsorship Classifier Test Suite (Section 104)", () => {
  // -------------------------------------------------------------
  // 1. 20 Positive Cases
  // -------------------------------------------------------------
  describe("20 Positive Cases", () => {
    const positiveCases = [
      { text: "Visa sponsorship is available for this position.", label: "Strong" },
      { text: "We offer visa sponsorship to international candidates.", label: "Strong" },
      { text: "Visa sponsorship provided along with comprehensive relocation.", label: "Strong" },
      { text: "Explicit sponsorship available for experienced software engineers.", label: "Strong" },
      { text: "Will provide visa sponsorship for qualified professionals.", label: "Strong" },
      { text: "The employer will sponsor the right candidate.", label: "Likely" },
      { text: "Company will sponsor foreign workers with relevant skills.", label: "Likely" },
      { text: "Work visa sponsorship is available for this vacancy.", label: "Likely" },
      { text: "Employer sponsored position with permanent residency pathway.", label: "Likely" },
      { text: "Immigration support provided for overseas hires.", label: "Likely" },
      { text: "We provide Skilled Worker visa sponsorship.", country: "GB", label: "Likely" },
      { text: "Certificate of Sponsorship (CoS) will be assigned upon offer.", country: "GB", label: "Likely" },
      { text: "Licensed Home Office sponsor with Tier 2 sponsorship available.", country: "GB", label: "Likely" },
      { text: "H-1B sponsorship and H1B transfer supported.", country: "US", label: "Likely" },
      { text: "We provide Green Card sponsorship and O-1 visa support.", country: "US", label: "Likely" },
      { text: "Subclass 482 visa sponsorship available for civil engineers.", country: "AU", label: "Likely" },
      { text: "Skills in Demand visa support provided by Standard Business Sponsor.", country: "AU", label: "Likely" },
      { text: "Positive LMIA supported position in Ontario.", country: "CA", label: "Likely" },
      { text: "Provincial Nominee Program PNP sponsorship available.", country: "CA", label: "Likely" },
      { text: "Accredited Employer Work Visa (AEWV) support provided.", country: "NZ", label: "Likely" },
    ];

    positiveCases.forEach((tc, idx) => {
      it(`Positive Case #${idx + 1}: "${tc.text.slice(0, 45)}..."`, () => {
        const res = classifyJobSponsorship(tc.text, tc.country);
        expect(["Strong", "Likely"]).toContain(res.label);
        expect(res.positiveEvidence.length).toBeGreaterThan(0);
        expect(res.negativeEvidence.length).toBe(0);
        expect(res.requiresReview).toBe(false);
      });
    });
  });

  // -------------------------------------------------------------
  // 2. 20 Negative Cases
  // -------------------------------------------------------------
  describe("20 Negative Cases", () => {
    const negativeCases = [
      { text: "No visa sponsorship is available for this position." },
      { text: "Unfortunately, sponsorship is not available." },
      { text: "We are not offering sponsorship at this time." },
      { text: "Unable to sponsor foreign applicants." },
      { text: "We do not sponsor work visas." },
      { text: "We cannot sponsor candidates for this role." },
      { text: "We cannot provide sponsorship for this entry-level role." },
      { text: "Not able to sponsor overseas workers." },
      { text: "We are unable to offer sponsorship." },
      { text: "We cannot provide visa support for this job." },
      { text: "Candidates must have unrestricted work authorization." },
      { text: "Must already have the right to work in the UK." },
      { text: "Candidates must have a valid visa to apply." },
      { text: "Must be authorized to work without sponsorship." },
      { text: "No sponsorship now or in the future." },
      { text: "Requires existing right to work in Australia." },
      { text: "Must be legally eligible to work without visa assistance." },
      { text: "Citizens or permanent residents only." },
      { text: "US citizenship required for government contract." },
      { text: "Security clearance requires citizenship." },
    ];

    negativeCases.forEach((tc, idx) => {
      it(`Negative Case #${idx + 1}: "${tc.text.slice(0, 45)}..."`, () => {
        const res = classifyJobSponsorship(tc.text);
        expect(res.label).toBe("Explicitly Not Offered");
        expect(res.score).toBe(0);
        expect(res.negativeEvidence.length).toBeGreaterThan(0);
        expect(res.positiveEvidence.length).toBe(0);
      });
    });
  });

  // -------------------------------------------------------------
  // 3. 10 Ambiguous Cases (Section 143)
  // -------------------------------------------------------------
  describe("10 Ambiguous Cases", () => {
    const ambiguousCases = [
      { text: "Sponsorship may be considered for exceptional candidates." },
      { text: "Visa support may be available depending on qualifications." },
      { text: "Potential sponsorship for exceptional candidates." },
      { text: "Sponsorship considered on a case-by-case basis." },
      { text: "May sponsor qualified applicants with niche experience." },
      { text: "Visa assistance may be considered for senior applicants." },
      { text: "Potential visa support depending on background." },
      { text: "Sponsorship may be considered for chartered specialists." },
      { text: "Visa support may be available for key leadership positions." },
      { text: "Sponsorship considered on a case-by-case basis for lead architects." },
    ];

    ambiguousCases.forEach((tc, idx) => {
      it(`Ambiguous Case #${idx + 1}: "${tc.text.slice(0, 45)}..."`, () => {
        const res = classifyJobSponsorship(tc.text);
        expect(res.label).toBe("Possible");
        expect(res.score).toBeGreaterThanOrEqual(40);
        expect(res.score).toBeLessThan(70);
      });
    });
  });

  // -------------------------------------------------------------
  // 4. 10 Edge Cases (Sections 142, 144, 145)
  // -------------------------------------------------------------
  describe("10 Edge Cases", () => {
    it("Edge Case #1: Standalone word 'visa' alone must NOT trigger Strong (Section 142)", () => {
      const res = classifyJobSponsorship("Candidates must hold a valid credit card and valid visa for business travel.");
      expect(res.label).not.toBe("Strong");
      expect(res.label).not.toBe("Likely");
    });

    it("Edge Case #2: Conflicting positive and negative in multi-paragraph text -> REVIEW_REQUIRED (Section 144)", () => {
      const text = "We offer visa sponsorship is available for Principal engineers. Please note: we are unable to sponsor for junior staff.";
      const res = classifyJobSponsorship(text);
      expect(res.label).toBe("REVIEW_REQUIRED");
      expect(res.requiresReview).toBe(true);
    });

    it("Edge Case #3: HTML markup in job listing text should be stripped cleanly", () => {
      const html = "<p>Join our team! <strong>Visa sponsorship is available</strong> for this vacancy.</p>";
      const res = classifyJobSponsorship(html);
      expect(res.label).toBe("Strong");
    });

    it("Edge Case #4: Case insensitivity (e.g. ALL CAPS)", () => {
      const res = classifyJobSponsorship("VISA SPONSORSHIP IS AVAILABLE FOR ALL SENIOR ROLES");
      expect(res.label).toBe("Strong");
    });

    it("Edge Case #5: Multiple extra whitespaces and newline breaks", () => {
      const res = classifyJobSponsorship("Visa   \n\n\t  sponsorship   \n is   available");
      expect(res.label).toBe("Strong");
    });

    it("Edge Case #6: Country mismatch should skip other country-specific regex", () => {
      // US H1B pattern shouldn't count towards Australian job if country is AU
      const res = classifyJobSponsorship("Role based in Sydney. Requires H-1B transfer.", "AU");
      expect(res.positiveEvidence.length).toBe(0);
    });

    it("Edge Case #7: 'no visa sponsorship' substring inside 'sponsorship available' negation", () => {
      const res = classifyJobSponsorship("Please note that no visa sponsorship is available at this time.");
      expect(res.label).toBe("Explicitly Not Offered");
      expect(res.positiveEvidence.length).toBe(0);
    });

    it("Edge Case #8: Empty / null / non-string inputs", () => {
      const res1 = classifyJobSponsorship("");
      expect(res1.label).toBe("No Sponsorship Signal");
      const res2 = classifyJobSponsorship(null as any);
      expect(res2.label).toBe("No Sponsorship Signal");
    });

    it("Edge Case #9: Hyphenated variations (H-1B vs H1B)", () => {
      const res1 = classifyJobSponsorship("We provide H-1B sponsorship.", "US");
      const res2 = classifyJobSponsorship("We provide H1B sponsorship.", "US");
      expect(res1.label).toBe("Likely");
      expect(res2.label).toBe("Likely");
    });

    it("Edge Case #10: 'Must already have right to work' overrides generic words", () => {
      const res = classifyJobSponsorship("Job requires travel. Candidates must already have right to work.");
      expect(res.label).toBe("Explicitly Not Offered");
    });
  });
});
