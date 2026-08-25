/**
 * SponsorAJobs Job Quality Scoring Engine
 *
 * Computes a 0–100 quality_score across 5 weighted dimensions:
 *  1. Description Richness      — 25 pts
 *  2. Sponsorship Signal        — 30 pts (feeds from existing sponsorship_score)
 *  3. Salary Data Completeness  — 15 pts
 *  4. Apply URL Quality         — 15 pts
 *  5. Data Completeness         — 15 pts
 */

export interface QualityScoreBreakdown {
  total: number;
  descriptionScore: number;
  sponsorshipScore: number;
  salaryScore: number;
  urlScore: number;
  completenessScore: number;
  flags: string[];
}

export interface QualityInput {
  title: string;
  description: string;
  sponsorshipScore: number;          // 0–100 from existing classifier
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  applyUrl: string;
  jobUrl?: string | null;
  city?: string | null;
  region?: string | null;
  countryCode: string;
  employmentType?: string | null;
  categorySlug?: string | null;
  companyName?: string | null;
  remoteType?: string | null;
  publishedAt?: string | null;
}

// ─── Known high-quality employer ATS domains ────────────────────────────────
const TRUSTED_ATS_DOMAINS = [
  "lever.co",
  "greenhouse.io",
  "workday.com",
  "workable.com",
  "ashbyhq.com",
  "breezy.hr",
  "smartrecruiters.com",
  "recruitee.com",
  "teamtailor.com",
  "jobs.lever.co",
  "apply.workable.com",
  "app.greenhouse.io",
  "careers.workday.com",
  // Major employer career pages
  "nhs.uk",
  "arup.com",
  "bhp.com",
  "atlassian.com",
  "revolut.com",
  "monzo.com",
  "canva.com",
  "shopify.com",
  "xero.com",
  "datacom.com",
  "usajobs.gov",
  "gov.uk",
];

// ─── Description quality markers ────────────────────────────────────────────
const RICH_DESCRIPTION_MARKERS = [
  // Structure markers
  /responsibilities/i,
  /requirements?/i,
  /qualifications?/i,
  /benefits?/i,
  /what you.ll do/i,
  /what we.re looking for/i,
  /about the role/i,
  /about us/i,
  // Sponsorship detail markers (high value)
  /certificate of sponsorship/i,
  /skilled worker visa/i,
  /h-?1b/i,
  /tss (482|subclass)/i,
  /lmia/i,
  /aewv/i,
  /work permit/i,
  /relocation (package|support|assistance)/i,
  // Compensation markers
  /salary/i,
  /per annum/i,
  /bonus/i,
  /equity/i,
  /pension/i,
  /health (insurance|care)/i,
  // Technical job markers
  /minimum.*(year|experience)/i,
  /degree|bachelor|master|phd/i,
  /certification|chartered|licensed/i,
];

/**
 * Main quality scoring function — call during ingestion before DB insert.
 */
export function computeQualityScore(input: QualityInput): QualityScoreBreakdown {
  const flags: string[] = [];

  // ── DIMENSION 1: Description Richness (max 25) ──────────────────────────
  let descriptionScore = 0;
  const descLength = (input.description || "").trim().length;

  if (descLength >= 800) {
    descriptionScore = 25;
  } else if (descLength >= 500) {
    descriptionScore = 20;
  } else if (descLength >= 300) {
    descriptionScore = 14;
  } else if (descLength >= 150) {
    descriptionScore = 8;
  } else if (descLength >= 50) {
    descriptionScore = 3;
  } else {
    descriptionScore = 0;
    flags.push("THIN_DESCRIPTION");
  }

  // Bonus points for rich structural markers (up to +5)
  let markerBonus = 0;
  for (const marker of RICH_DESCRIPTION_MARKERS) {
    if (marker.test(input.description)) {
      markerBonus++;
      if (markerBonus >= 5) break;
    }
  }
  descriptionScore = Math.min(25, descriptionScore + markerBonus);

  // ── DIMENSION 2: Sponsorship Signal Strength (max 30) ──────────────────
  // Map existing 0–100 sponsorship_score → 0–30 pts
  const sponsorshipScore = Math.round((Math.min(100, input.sponsorshipScore) / 100) * 30);

  if (input.sponsorshipScore === 0) {
    flags.push("NO_SPONSORSHIP_SIGNAL");
  }

  // ── DIMENSION 3: Salary Data Completeness (max 15) ─────────────────────
  let salaryScore = 0;

  if (input.salaryMin && input.salaryMax && input.salaryCurrency) {
    salaryScore = 15; // Full data
    if (input.salaryMin >= input.salaryMax) {
      salaryScore = 8; // Inverted/equal range — suspicious
      flags.push("INVALID_SALARY_RANGE");
    }
  } else if ((input.salaryMin || input.salaryMax) && input.salaryCurrency) {
    salaryScore = 8; // Partial salary data
    flags.push("PARTIAL_SALARY");
  } else {
    salaryScore = 0;
    flags.push("MISSING_SALARY");
  }

  // ── DIMENSION 4: Apply URL Quality (max 15) ────────────────────────────
  let urlScore = 0;

  if (!input.applyUrl || !isValidUrl(input.applyUrl)) {
    urlScore = 0;
    flags.push("INVALID_APPLY_URL");
  } else {
    try {
      const domain = new URL(input.applyUrl).hostname.replace(/^www\./, "");
      const isTrusted = TRUSTED_ATS_DOMAINS.some(
        (d) => domain === d || domain.endsWith(`.${d}`)
      );

      if (isTrusted) {
        urlScore = 15; // Direct employer/ATS link
      } else if (domain.includes("adzuna") || domain.includes("jooble") || domain.includes("remotive")) {
        urlScore = 8;  // Known aggregator redirect — still functional
        flags.push("AGGREGATOR_REDIRECT");
      } else if (input.applyUrl.startsWith("https://")) {
        urlScore = 10; // Unknown but secure domain
      } else {
        urlScore = 5;
        flags.push("NON_HTTPS_URL");
      }
    } catch {
      urlScore = 0;
      flags.push("MALFORMED_URL");
    }
  }

  // ── DIMENSION 5: Data Completeness (max 15) ────────────────────────────
  let completenessScore = 0;
  const checks = [
    { field: "city",           value: input.city,           pts: 3 },
    { field: "region",         value: input.region,         pts: 2 },
    { field: "employmentType", value: input.employmentType !== "UNKNOWN" ? input.employmentType : null, pts: 3 },
    { field: "categorySlug",   value: input.categorySlug,   pts: 3 },
    { field: "companyName",    value: input.companyName && input.companyName !== "Verified Employer" ? input.companyName : null, pts: 2 },
    { field: "publishedAt",    value: input.publishedAt,    pts: 2 },
  ];

  for (const check of checks) {
    if (check.value) {
      completenessScore += check.pts;
    } else {
      flags.push(`MISSING_${check.field.toUpperCase()}`);
    }
  }
  completenessScore = Math.min(15, completenessScore);

  // ── TOTAL ───────────────────────────────────────────────────────────────
  const total = Math.min(
    100,
    descriptionScore + sponsorshipScore + salaryScore + urlScore + completenessScore
  );

  return {
    total,
    descriptionScore,
    sponsorshipScore,
    salaryScore,
    urlScore,
    completenessScore,
    flags,
  };
}

/**
 * Returns a human-readable quality tier label for display in admin UI.
 */
export function getQualityTier(score: number): "Premium" | "Good" | "Fair" | "Poor" | "Rejected" {
  if (score >= 80) return "Premium";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Poor";
  return "Rejected";
}

/**
 * Minimum score threshold. Jobs below this should not be shown publicly.
 */
export const MINIMUM_QUALITY_SCORE = 20;

// ── Helpers ──────────────────────────────────────────────────────────────────
function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
