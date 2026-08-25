import { SponsorshipAnalysisResult } from "@/lib/types/sponsorship";
import {
  POSITIVE_SPONSORSHIP_PATTERNS,
  NEGATIVE_SPONSORSHIP_PATTERNS,
  AMBIGUOUS_SPONSORSHIP_PATTERNS,
} from "@/config/sponsorship-rules";
import { SponsorshipLabel } from "@/lib/types/database";

/**
 * Deterministic First-Stage Sponsorship Intelligence Engine
 * As specified in Master Build Prompt Sections 17-21, 104, 142-145
 */
export function classifyJobSponsorship(
  text: string,
  countryCode?: string
): SponsorshipAnalysisResult {
  if (!text || typeof text !== "string") {
    return {
      score: 0,
      label: "No Sponsorship Signal",
      positiveEvidence: [],
      negativeEvidence: [],
      keywords: [],
      requiresReview: false,
    };
  }

  // 1. Strip HTML tags, zero-width characters, and normalize whitespace
  const cleanText = text
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const positiveEvidence: string[] = [];
  const negativeEvidence: string[] = [];
  const keywords: string[] = [];

  let positiveScore = 0;
  let textForPositiveSearch = cleanText;

  // 2. Scan Negative Patterns
  for (const rule of NEGATIVE_SPONSORSHIP_PATTERNS) {
    const regex = typeof rule.pattern === "string" ? new RegExp(rule.pattern, "i") : rule.pattern;
    const match = cleanText.match(regex);
    if (match) {
      negativeEvidence.push(match[0]);
      // Mask out the matched negative phrase from the positive text scanner to prevent false positive collisions
      textForPositiveSearch = textForPositiveSearch.replace(regex, (m) => " ".repeat(m.length));
    }
  }

  // 3. Scan Positive Patterns on unmasked text (including country-specific)
  for (const rule of POSITIVE_SPONSORSHIP_PATTERNS) {
    if (rule.countryCode && countryCode && rule.countryCode !== countryCode.toUpperCase()) {
      continue;
    }
    const regex = typeof rule.pattern === "string" ? new RegExp(rule.pattern, "i") : rule.pattern;
    const match = textForPositiveSearch.match(regex);
    if (match) {
      positiveEvidence.push(match[0]);
      keywords.push(rule.id);
      positiveScore = Math.max(positiveScore, rule.weight);
    }
  }

  // 4. Scan Ambiguous Patterns
  for (const rule of AMBIGUOUS_SPONSORSHIP_PATTERNS) {
    const regex = typeof rule.pattern === "string" ? new RegExp(rule.pattern, "i") : rule.pattern;
    const match = textForPositiveSearch.match(regex);
    if (match) {
      positiveEvidence.push(match[0]);
      keywords.push(rule.id);
      if (positiveScore < rule.weight) {
        positiveScore = rule.weight;
      }
    }
  }

  // Section 144/145: Negative Override & Conflict Resolution
  const hasDistinctPositive = positiveEvidence.length > 0;
  const hasDistinctNegative = negativeEvidence.length > 0;

  if (hasDistinctPositive && hasDistinctNegative) {
    return {
      score: 50,
      label: "REVIEW_REQUIRED",
      positiveEvidence,
      negativeEvidence,
      keywords,
      requiresReview: true,
    };
  }

  if (hasDistinctNegative) {
    return {
      score: 0,
      label: "Explicitly Not Offered",
      positiveEvidence: [],
      negativeEvidence,
      keywords,
      requiresReview: false,
    };
  }

  // Map score to label (Section 19)
  let finalScore = positiveScore;
  let label: SponsorshipLabel = "No Sponsorship Signal";

  if (finalScore >= 90) {
    label = "Strong";
  } else if (finalScore >= 70) {
    label = "Likely";
  } else if (finalScore >= 40) {
    label = "Possible";
  } else if (finalScore >= 1) {
    label = "Weak";
  } else {
    label = "No Sponsorship Signal";
  }

  return {
    score: finalScore,
    label,
    positiveEvidence,
    negativeEvidence,
    keywords,
    requiresReview: false,
  };
}
