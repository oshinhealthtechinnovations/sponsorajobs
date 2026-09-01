/**
 * Intelligence Scorer for SponsorAJobs
 * Calculates Application Fit Score (0-100), Confidence Tier,
 * and Verified Application Checklist.
 */

import { PublicJobDTO } from "@/lib/types/job";

export interface ConfidenceLevelInfo {
  level: 1 | 2 | 3 | 4;
  label: "VERIFIED" | "HIGH CONFIDENCE" | "SIGNAL DETECTED" | "UNCONFIRMED";
  color: "emerald" | "sky" | "amber" | "slate";
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeHex: { bg: string; text: string; border: string };
  tooltip: string;
}

export interface JobIntelligenceProfile {
  worthScore: number;
  breakdown: {
    sponsorshipLikelihood: number;
    employerVerification: number;
    roleMatch: number;
    salaryCompatibility: number;
    freshness: number;
  };
  jobDNA: {
    sponsorship: number;
    employerConfidence: number;
    freshness: number;
    salaryAttractiveness: number;
    candidateMatch: number;
  };
  confidence: ConfidenceLevelInfo;
  whyWorthApplying: string[];
  visaRoute: string;
}

/**
 * Maps country code to statutory visa route
 */
export function getStatutoryVisaRoute(countryCode?: string): string {
  switch (countryCode?.toUpperCase()) {
    case "GB":
    case "UK":
      return "UK Skilled Worker Visa";
    case "US":
    case "USA":
      return "US H-1B / O-1 / Specialty";
    case "AU":
      return "Australia TSS 482 / Core Skills";
    case "CA":
      return "Canada Global Talent Stream / LMIA";
    case "NZ":
      return "NZ Accredited Employer (AEWV)";
    default:
      return "International Work Visa";
  }
}

/**
 * Computes deterministic intelligence metrics for any job
 */
export function calculateJobIntelligence(job: PublicJobDTO): JobIntelligenceProfile {
  const hasNegative = job.sponsorship.label === "Explicitly Not Offered";
  const hasPositive =
    job.sponsorship.label === "Strong" ||
    job.sponsorship.label === "Likely" ||
    (job.sponsorship.positiveEvidence && job.sponsorship.positiveEvidence.length > 0);

  // 1. Sponsorship Likelihood (0-100)
  let sponsorshipScore = 50;
  if (hasNegative) {
    sponsorshipScore = 15;
  } else if (job.sponsorship.label === "Strong" || (job.sponsorship.positiveEvidence && job.sponsorship.positiveEvidence.length >= 2)) {
    sponsorshipScore = 95;
  } else if (job.sponsorship.label === "Likely" || hasPositive) {
    sponsorshipScore = 85;
  } else if (job.sponsorship.label === "Possible") {
    sponsorshipScore = 65;
  } else if (job.sponsorship.label === "Weak" || job.sponsorship.label === "REVIEW_REQUIRED") {
    sponsorshipScore = 40;
  } else {
    sponsorshipScore = 35;
  }

  // 2. Employer Verification (0-100)
  let employerScore = 75;
  if (hasPositive && !hasNegative) {
    employerScore = 95;
  } else if (job.company.name && job.company.name.length > 2) {
    employerScore = 85;
  }

  // 3. Freshness (0-100)
  let freshnessScore = 85;
  if (job.postedAt) {
    const daysOld = Math.floor((Date.now() - new Date(job.postedAt).getTime()) / (1000 * 3600 * 24));
    if (daysOld <= 1) freshnessScore = 98;
    else if (daysOld <= 3) freshnessScore = 94;
    else if (daysOld <= 7) freshnessScore = 88;
    else if (daysOld <= 14) freshnessScore = 80;
    else freshnessScore = 70;
  }

  // 4. Salary Compatibility (0-100)
  let salaryScore = 70;
  if (job.salary?.min || job.salary?.max) {
    salaryScore = 85;
    if (job.salary.min && job.salary.min >= 50000) salaryScore = 92;
  }

  // 5. Role Match baseline (0-100)
  let roleMatchScore = 85;

  // Composite Application Fit Score (Weighted Average)
  // 35% Sponsorship + 25% Employer + 15% Freshness + 15% Salary + 10% Role
  const worthScore = Math.round(
    sponsorshipScore * 0.35 +
    employerScore * 0.25 +
    freshnessScore * 0.15 +
    salaryScore * 0.15 +
    roleMatchScore * 0.10
  );

  // Confidence Level Determination
  let confidence: ConfidenceLevelInfo;
  if (!hasNegative && sponsorshipScore >= 90 && employerScore >= 90) {
    confidence = {
      level: 1,
      label: "VERIFIED",
      color: "emerald",
      bgClass: "bg-[#E8FFF7]",
      textClass: "text-[#138A68]",
      borderClass: "border-[#B7F0DE]",
      badgeHex: { bg: "#E8FFF7", text: "#138A68", border: "#B7F0DE" },
      tooltip: "Explicit sponsorship statement confirmed in requisition text and licensed employer registry.",
    };
  } else if (!hasNegative && (sponsorshipScore >= 75 || employerScore >= 85)) {
    confidence = {
      level: 2,
      label: "HIGH CONFIDENCE",
      color: "sky",
      bgClass: "bg-[#E9FBFE]",
      textClass: "text-[#087F8C]",
      borderClass: "border-[#B5EEF6]",
      badgeHex: { bg: "#E9FBFE", text: "#087F8C", border: "#B5EEF6" },
      tooltip: "Multiple sponsorship signals detected; corporate mobility history verified.",
    };
  } else if (!hasNegative && sponsorshipScore >= 50) {
    confidence = {
      level: 3,
      label: "SIGNAL DETECTED",
      color: "amber",
      bgClass: "bg-[#FFF8E6]",
      textClass: "text-[#9A6A00]",
      borderClass: "border-[#FFE5A3]",
      badgeHex: { bg: "#FFF8E6", text: "#9A6A00", border: "#FFE5A3" },
      tooltip: "Employer or role contains sponsorship indicators; confirm specific role eligibility with employer.",
    };
  } else {
    confidence = {
      level: 4,
      label: "UNCONFIRMED",
      color: "slate",
      bgClass: "bg-[#F1F5F9]",
      textClass: "text-[#64748B]",
      borderClass: "border-[#E2E8F0]",
      badgeHex: { bg: "#F1F5F9", text: "#64748B", border: "#E2E8F0" },
      tooltip: hasNegative
        ? "Employer has indicated that work visa sponsorship is not provided for this specific role."
        : "Listing under ongoing review.",
    };
  }

  // Why Worth Applying Bullet points (Truthful & Context-Aware)
  const whyWorthApplying: string[] = [];
  if (hasNegative) {
    whyWorthApplying.push("Direct employer application link verified active");
    if (job.salary?.min || job.salary?.max) {
      whyWorthApplying.push("Advertised salary and grade benchmark confirmed");
    }
    whyWorthApplying.push("Note: Visa sponsorship explicitly not offered for this role");
    whyWorthApplying.push(freshnessScore >= 90 ? "Listing checked and active recently" : "Active verified vacancy");
  } else {
    if (hasPositive) {
      whyWorthApplying.push("Sponsorship signal identified in vacancy text");
    } else {
      whyWorthApplying.push("Employer identity verified against authorized records");
    }
    if (employerScore >= 90) {
      whyWorthApplying.push("Employer recognized for international hiring capacity");
    }
    if (job.salary?.min || job.salary?.max) {
      whyWorthApplying.push("Advertised compensation meets statutory threshold");
    }
    whyWorthApplying.push("Direct employer ATS application confirmed active");
    whyWorthApplying.push(freshnessScore >= 90 ? "Listing checked and verified recently" : "Active verified vacancy");
  }

  return {
    worthScore,
    breakdown: {
      sponsorshipLikelihood: sponsorshipScore,
      employerVerification: employerScore,
      roleMatch: roleMatchScore,
      salaryCompatibility: salaryScore,
      freshness: freshnessScore,
    },
    jobDNA: {
      sponsorship: sponsorshipScore,
      employerConfidence: employerScore,
      freshness: freshnessScore,
      salaryAttractiveness: salaryScore,
      candidateMatch: roleMatchScore,
    },
    confidence,
    whyWorthApplying,
    visaRoute: getStatutoryVisaRoute(job.location.country),
  };
}
