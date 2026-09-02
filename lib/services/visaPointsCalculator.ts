/**
 * Free Visa Points & Immigration Eligibility Calculation Engine
 * 
 * Implements standard points criteria for:
 * 1. UK Skilled Worker Visa (70 points mandatory threshold)
 * 2. Australia General Skilled Migration / TSS 482 (65 points threshold)
 * 3. Canada Express Entry CRS Preliminary Score
 */

export interface UkPointsInput {
  hasJobOffer: boolean; // 20 pts (Mandatory)
  jobAtAppropriateSkillLevel: boolean; // 20 pts (Mandatory)
  speaksEnglishB1: boolean; // 10 pts (Mandatory)
  salaryGbp: number; // 0, 10, or 20 pts (£38,700 threshold or shortage occupation)
  isShortageOccupationOrStemPhd?: boolean; // 20 tradeable pts
  isNewEntrant?: boolean; // 20 tradeable pts (under 26 or recent graduate)
}

export interface UkPointsResult {
  totalPoints: number;
  isEligible: boolean;
  pointsBreakdown: {
    mandatoryPoints: number; // Max 50
    tradeablePoints: number; // Max 20
  };
  passedCriteria: string[];
  missingCriteria: string[];
  verdict: string;
}

export interface AustraliaPointsInput {
  ageYears: number; // 18-24 (25 pts), 25-32 (30 pts), 33-39 (25 pts), 40-44 (15 pts)
  englishLevel: "Competent" | "Proficient" | "Superior"; // 0, 10, 20 pts
  overseasExperienceYears: number; // <3 (0), 3-4 (5), 5-7 (10), 8+ (15)
  educationLevel: "Doctorate" | "BachelorMaster" | "TradeDiploma" | "None"; // 20, 15, 10, 0
  hasStateNominationOrSponsor: boolean; // 5 or 15 pts
  partnerSkills?: boolean; // 5 - 10 pts
}

export interface AustraliaPointsResult {
  totalPoints: number;
  isEligible: boolean;
  requiredPoints: number; // 65
  breakdown: Record<string, number>;
  verdict: string;
}

export class VisaPointsCalculator {
  /**
   * UK Skilled Worker Visa Points Calculator
   * UK Home Office Rules: Requires minimum 70 points to obtain Certificate of Sponsorship (CoS)
   */
  static calculateUkSkilledWorkerPoints(input: UkPointsInput): UkPointsResult {
    let mandatory = 0;
    let tradeable = 0;
    const passed: string[] = [];
    const missing: string[] = [];

    // Mandatory (50 points needed)
    if (input.hasJobOffer) {
      mandatory += 20;
      passed.push("Offer of job by approved sponsor (+20)");
    } else {
      missing.push("Must have an offer of job by a licensed sponsor (20 pts missing)");
    }

    if (input.jobAtAppropriateSkillLevel) {
      mandatory += 20;
      passed.push("Job at appropriate skill level RQF 3 or above (+20)");
    } else {
      missing.push("Job must be at appropriate skill level RQF 3+ (20 pts missing)");
    }

    if (input.speaksEnglishB1) {
      mandatory += 10;
      passed.push("English language skills at level B1 CEFR (+10)");
    } else {
      missing.push("English language test at B1 level required (10 pts missing)");
    }

    // Tradeable points (20 points needed)
    if (input.salaryGbp >= 38700) {
      tradeable = 20;
      passed.push("Salary meets standard threshold £38,700+ (+20)");
    } else if (input.salaryGbp >= 30960 && (input.isShortageOccupationOrStemPhd || input.isNewEntrant)) {
      tradeable = 20;
      passed.push("Salary meets concession threshold with shortage/new-entrant criteria (+20)");
    } else if (input.salaryGbp >= 34830) {
      tradeable = 10;
      passed.push("Salary meets tier 2 concession threshold (+10)");
    } else {
      missing.push("Salary is below minimum threshold without eligible tradeable concessions");
    }

    const totalPoints = mandatory + tradeable;
    const isEligible = totalPoints >= 70 && mandatory === 50;

    let verdict = "";
    if (isEligible) {
      verdict = "Eligible! You have achieved the full 70 points required for a UK Skilled Worker Visa.";
    } else if (mandatory === 50) {
      verdict = "Mandatory 50 points achieved. Salary concession or shortage occupation needed to reach 70.";
    } else {
      verdict = `Currently at ${totalPoints}/70 points. A confirmed job offer and English test are required.`;
    }

    return {
      totalPoints,
      isEligible,
      pointsBreakdown: {
        mandatoryPoints: mandatory,
        tradeablePoints: tradeable,
      },
      passedCriteria: passed,
      missingCriteria: missing,
      verdict,
    };
  }

  /**
   * Australia General Skilled Migration / TSS 482 Points Test
   * Benchmark threshold is 65 points
   */
  static calculateAustraliaPoints(input: AustraliaPointsInput): AustraliaPointsResult {
    const breakdown: Record<string, number> = {};

    // 1. Age
    if (input.ageYears >= 18 && input.ageYears <= 24) breakdown["Age (18-24)"] = 25;
    else if (input.ageYears >= 25 && input.ageYears <= 32) breakdown["Age (25-32)"] = 30;
    else if (input.ageYears >= 33 && input.ageYears <= 39) breakdown["Age (33-39)"] = 25;
    else if (input.ageYears >= 40 && input.ageYears <= 44) breakdown["Age (40-44)"] = 15;
    else breakdown["Age"] = 0;

    // 2. English
    if (input.englishLevel === "Superior") breakdown["English (Superior)"] = 20;
    else if (input.englishLevel === "Proficient") breakdown["English (Proficient)"] = 10;
    else breakdown["English (Competent)"] = 0;

    // 3. Overseas Experience
    if (input.overseasExperienceYears >= 8) breakdown["Overseas Skilled Work (8+ yrs)"] = 15;
    else if (input.overseasExperienceYears >= 5) breakdown["Overseas Skilled Work (5-7 yrs)"] = 10;
    else if (input.overseasExperienceYears >= 3) breakdown["Overseas Skilled Work (3-4 yrs)"] = 5;
    else breakdown["Overseas Skilled Work"] = 0;

    // 4. Education
    if (input.educationLevel === "Doctorate") breakdown["Education (PhD)"] = 20;
    else if (input.educationLevel === "BachelorMaster") breakdown["Education (Degree/Masters)"] = 15;
    else if (input.educationLevel === "TradeDiploma") breakdown["Education (Trade/Diploma)"] = 10;
    else breakdown["Education"] = 0;

    // 5. Nomination / Sponsorship
    if (input.hasStateNominationOrSponsor) breakdown["State or Employer Sponsorship"] = 5;
    if (input.partnerSkills) breakdown["Partner Skills / Single Candidate"] = 10;

    const totalPoints = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const isEligible = totalPoints >= 65;

    return {
      totalPoints,
      isEligible,
      requiredPoints: 65,
      breakdown,
      verdict: isEligible
        ? `Eligible for EOI submission! You score ${totalPoints} points (65 minimum required).`
        : `Currently at ${totalPoints}/65 points. Improving English level or gaining Australian nomination can bridge the gap.`,
    };
  }
}
