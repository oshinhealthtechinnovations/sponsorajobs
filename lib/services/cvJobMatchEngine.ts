import { PublicJobDTO } from "../types/job";
import { CandidateProfileRecord, JobRecommendationRecord, RecommendationTier } from "../types/database";
import { SKILLS_TAXONOMY, normalizeSkill, getSkillMatchWeight } from "../data/skillsTaxonomy";
import { OCCUPATIONS_TAXONOMY, normalizeOccupation, getOccupationMatchWeight } from "../data/occupationsTaxonomy";

export const ALGORITHM_VERSION = "cv-match-v1.0";
export const JOB_DATASET_VERSION = "jobs-2026.08";

export interface CandidateMatchingPreferences {
  countries?: string[];
  locations?: string[];
  sponsorship?: "required" | "preferred" | "not_required" | "any";
  workArrangement?: "remote" | "hybrid" | "onsite" | "any";
  employmentType?: "full-time" | "part-time" | "contract" | "any";
  minimumSalary?: number | null;
  minMatchScore?: number;
}

export interface StructuredJobRequirement {
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperienceYears: number;
  educationLevel: string;
  dataQualityScore: number;
}

export interface SkillGapItem {
  skill: string;
  canonicalKey: string;
  status: "STRONG" | "MODERATE" | "WEAK" | "MISSING";
  isRequired: boolean;
}

export interface RecommendationResultItem {
  job: PublicJobDTO;
  jobMatchScore: number;
  sponsorJobMatchScore: number;
  skillMatchScore: number;
  experienceMatchScore: number;
  occupationMatchScore: number;
  seniorityMatchScore: number;
  locationMatchScore: number;
  educationMatchScore: number;
  sponsorshipScore: number;
  dataQualityScore: number;
  recommendationTier: RecommendationTier;
  rankingPosition: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillGapBreakdown: SkillGapItem[];
  reasons: string[];
  sponsorshipStatus: "CONFIRMED" | "LIKELY" | "UNKNOWN" | "NOT_AVAILABLE";
}

export interface CVJobMatchEngineOutput {
  candidateProfile: CandidateProfileRecord;
  totalMatches: number;
  recommendations: RecommendationResultItem[];
  algorithmVersion: string;
  jobDatasetVersion: string;
}

/**
 * Extracts structured skills & requirements from a Job record deterministically
 */
export function extractJobRequirements(job: PublicJobDTO): StructuredJobRequirement {
  const fullText = `${job.title} ${job.company.name} ${(job as any).descriptionSnippet || ""} ${(job as any).description || ""}`.toLowerCase();
  
  const detectedSkills = new Set<string>();
  Object.keys(SKILLS_TAXONOMY).forEach((canonicalKey) => {
    const skillDef = SKILLS_TAXONOMY[canonicalKey];
    const forms = [canonicalKey, ...skillDef.aliases];
    for (const f of forms) {
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^a-zA-Z0-9])`, "i");
      if (regex.test(fullText)) {
        detectedSkills.add(canonicalKey);
        break;
      }
    }
  });

  const allSkills = Array.from(detectedSkills);
  const titleLower = job.title.toLowerCase();

  // Skills in title or first 3 detected are MUST_HAVE
  const requiredSkills = allSkills.filter((s) => {
    const aliases = SKILLS_TAXONOMY[s]?.aliases || [];
    return titleLower.includes(s) || aliases.some((a) => titleLower.includes(a));
  });

  if (requiredSkills.length === 0 && allSkills.length > 0) {
    requiredSkills.push(...allSkills.slice(0, Math.min(3, allSkills.length)));
  }

  const preferredSkills = allSkills.filter((s) => !requiredSkills.includes(s));

  // Extract experience years
  let requiredExperienceYears = 3;
  const expMatch = fullText.match(/(\d+)\+?\s*(?:years|yrs)\s+(?:of\s+)?(?:experience|exp)/i);
  if (expMatch && expMatch[1]) {
    requiredExperienceYears = parseInt(expMatch[1], 10);
  } else if (titleLower.includes("senior") || titleLower.includes("lead")) {
    requiredExperienceYears = 5;
  } else if (titleLower.includes("junior") || titleLower.includes("graduate")) {
    requiredExperienceYears = 1;
  }

  // Data quality calculation
  let dq = 60;
  if (job.title && job.title.length > 5) dq += 10;
  if (job.location && job.location.formatted) dq += 10;
  if (job.sponsorship && job.sponsorship.label !== "No Sponsorship Signal") dq += 10;
  if (allSkills.length >= 3) dq += 10;
  const dataQualityScore = Math.min(100, dq);

  return {
    requiredSkills,
    preferredSkills,
    requiredExperienceYears,
    educationLevel: "Bachelor's",
    dataQualityScore,
  };
}

/**
 * 2-Stage Recommendation Engine (Filtering + Soft Weighted Scoring)
 */
export function rankJobsForCandidate(
  candidate: CandidateProfileRecord,
  allJobs: PublicJobDTO[],
  preferences: CandidateMatchingPreferences = {}
): CVJobMatchEngineOutput {
  const candidateSkills = (candidate.detected_skills || []).map((s) => s.toLowerCase());
  const candidateOcc = normalizeOccupation(candidate.primary_occupation) || OCCUPATIONS_TAXONOMY["software_engineer"];
  const candidateYears = candidate.total_experience_years || 3;
  const targetCountries = (preferences.countries || []).map((c) => c.toUpperCase());
  const sponsorshipPref = preferences.sponsorship || candidate.sponsorship_preference || "required";

  // ── STAGE 1: HARD FILTERING ───────────────────────────────────────────────
  const eligibleJobs = allJobs.filter((job) => {
    // 1. Expired check
    if ((job as any).isExpired || (job as any).status === "expired") return false;

    // 2. Explicit Country Filter
    if (targetCountries.length > 0 && !targetCountries.includes("ALL") && !targetCountries.includes("GLOBAL")) {
      const jobCountry = job.location.country?.toUpperCase();
      if (jobCountry && !targetCountries.includes(jobCountry)) {
        return false;
      }
    }

    // 3. Work arrangement filter
    if (preferences.workArrangement && preferences.workArrangement !== "any") {
      const jobRemote = (job.remoteType || "UNKNOWN").toLowerCase();
      if (preferences.workArrangement === "remote" && !jobRemote.includes("remote")) {
        return false;
      }
      if (preferences.workArrangement === "onsite" && !jobRemote.includes("onsite")) {
        return false;
      }
    }

    return true;
  });

  // ── STAGE 2: SOFT WEIGHTED SCORING ────────────────────────────────────────
  const scoredResults: RecommendationResultItem[] = [];

  for (const job of eligibleJobs) {
    const jobReqs = extractJobRequirements(job);
    const jobOcc = normalizeOccupation(job.title);

    // 1. Occupation Match (15 pts)
    const occWeight = getOccupationMatchWeight(candidateOcc.id, jobOcc.id);
    const occupationMatchScore = Math.round(occWeight * 100);

    // 2. Required Skills Score (30 pts)
    let requiredMatchesCount = 0;
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const skillGapBreakdown: SkillGapItem[] = [];

    const reqList = jobReqs.requiredSkills;

    if (reqList.length > 0) {
      for (const reqSkill of reqList) {
        let bestWeight = 0;
        for (const candSkill of candidateSkills) {
          const w = getSkillMatchWeight(candSkill, reqSkill);
          if (w > bestWeight) bestWeight = w;
        }

        const skillName = SKILLS_TAXONOMY[reqSkill]?.name || reqSkill;

        if (bestWeight >= 0.9) {
          requiredMatchesCount += 1.0;
          matchedSkills.push(skillName);
          skillGapBreakdown.push({ skill: skillName, canonicalKey: reqSkill, status: "STRONG", isRequired: true });
        } else if (bestWeight >= 0.6) {
          requiredMatchesCount += 0.7;
          matchedSkills.push(`${skillName} (Related)`);
          skillGapBreakdown.push({ skill: skillName, canonicalKey: reqSkill, status: "MODERATE", isRequired: true });
        } else {
          missingSkills.push(skillName);
          skillGapBreakdown.push({ skill: skillName, canonicalKey: reqSkill, status: "MISSING", isRequired: true });
        }
      }
    }

    const skillMatchScore = reqList.length > 0
      ? Math.round((requiredMatchesCount / reqList.length) * 100)
      : (occupationMatchScore >= 70 ? 70 : 0);

    // 3. Preferred Skills (10 pts)
    let preferredScore = occupationMatchScore >= 70 ? 70 : 0;
    if (jobReqs.preferredSkills.length > 0) {
      let prefMatched = 0;
      for (const prefSkill of jobReqs.preferredSkills) {
        const hasSkill = candidateSkills.some((cs) => getSkillMatchWeight(cs, prefSkill) >= 0.6);
        const skillName = SKILLS_TAXONOMY[prefSkill]?.name || prefSkill;
        if (hasSkill) {
          prefMatched++;
          skillGapBreakdown.push({ skill: skillName, canonicalKey: prefSkill, status: "STRONG", isRequired: false });
        } else {
          skillGapBreakdown.push({ skill: skillName, canonicalKey: prefSkill, status: "WEAK", isRequired: false });
        }
      }
      preferredScore = Math.round((prefMatched / jobReqs.preferredSkills.length) * 100);
    }

    // 4. Experience Match (20 pts - non-linear curve)
    const reqYears = jobReqs.requiredExperienceYears;
    let experienceMatchScore = 100;
    const diff = candidateYears - reqYears;
    if (diff >= 0) {
      experienceMatchScore = 100;
    } else if (diff >= -1) {
      experienceMatchScore = 85;
    } else if (diff >= -2) {
      experienceMatchScore = 65;
    } else {
      experienceMatchScore = Math.max(30, Math.round((candidateYears / reqYears) * 60));
    }

    // 5. Seniority Alignment (8 pts)
    let seniorityMatchScore = 90;
    const jobTitleLower = job.title.toLowerCase();
    const candSen = candidate.seniority || "Mid-Level";
    if (candSen === "Executive" && (jobTitleLower.includes("junior") || jobTitleLower.includes("intern"))) {
      seniorityMatchScore = 40; // Overqualified
    } else if (candSen === "Junior" && (jobTitleLower.includes("lead") || jobTitleLower.includes("principal"))) {
      seniorityMatchScore = 50; // Underqualified
    }

    // 6. Location / Work Arrangement (7 pts)
    let locationMatchScore = 85;
    if (job.remoteType === "REMOTE") locationMatchScore = 100;
    else if (job.location.country === candidate.preferred_country) locationMatchScore = 95;

    // 7. Education Match (5 pts)
    const educationMatchScore = candidate.highest_degree !== "Not Detected" ? 100 : 75;

    // 8. Sponsorship Score (5 pts / Signal Boost)
    let sponsorshipScore = 50;
    let sponsorshipStatus: RecommendationResultItem["sponsorshipStatus"] = "UNKNOWN";

    if (job.sponsorship.label === "Strong" || job.sponsorship.positiveEvidence.length >= 2) {
      sponsorshipScore = 100;
      sponsorshipStatus = "CONFIRMED";
    } else if (job.sponsorship.label === "Likely" || job.sponsorship.positiveEvidence.length >= 1) {
      sponsorshipScore = 80;
      sponsorshipStatus = "LIKELY";
    } else if (job.sponsorship.label === "Explicitly Not Offered") {
      sponsorshipScore = 0;
      sponsorshipStatus = "NOT_AVAILABLE";
    }

    // ── PURE JOB MATCH (100 pts) ────────────────────────────────────────────
    let rawJobMatch = (
      skillMatchScore * 0.30 +
      experienceMatchScore * 0.20 +
      occupationMatchScore * 0.15 +
      preferredScore * 0.10 +
      seniorityMatchScore * 0.08 +
      locationMatchScore * 0.07 +
      educationMatchScore * 0.05 +
      sponsorshipScore * 0.05
    );

    // RELEVANCE PRINCIPLE: Strict gating multiplier for complete occupation & skill mismatches
    if (occupationMatchScore === 0 || skillMatchScore === 0) {
      rawJobMatch = rawJobMatch * 0.20; // Heavy drop for unrelated occupations
    } else if (occupationMatchScore < 50) {
      rawJobMatch = rawJobMatch * (0.35 + (occupationMatchScore / 100) * 0.5);
    }

    const jobMatchScore = Math.min(100, Math.max(5, Math.round(rawJobMatch)));

    // ── SPONSORJOB MATCH (Factoring in Sponsorship Preference) ───────────────
    let sponsorshipFactor = 1.0;
    if (sponsorshipPref === "required") {
      sponsorshipFactor = sponsorshipStatus === "CONFIRMED" ? 1.08 : sponsorshipStatus === "LIKELY" ? 1.02 : 0.92;
    } else if (sponsorshipPref === "preferred") {
      sponsorshipFactor = sponsorshipStatus === "CONFIRMED" ? 1.04 : 1.0;
    }

    // RELEVANCE PRINCIPLE: Never let sponsorship boost an irrelevant job
    if (occupationMatchScore < 50 || skillMatchScore === 0) {
      sponsorshipFactor = Math.min(0.8, sponsorshipFactor);
    }

    const sponsorJobMatchScore = Math.min(99, Math.max(5, Math.round(jobMatchScore * sponsorshipFactor)));

    // Determine Tier
    let recommendationTier: RecommendationTier = "POTENTIAL";
    if (sponsorJobMatchScore >= 88) recommendationTier = "EXCELLENT";
    else if (sponsorJobMatchScore >= 78) recommendationTier = "STRONG";
    else if (sponsorJobMatchScore >= 68) recommendationTier = "GOOD";
    else if (sponsorJobMatchScore >= 55) recommendationTier = "POTENTIAL";
    else recommendationTier = "LOW";

    // ── DETERMINISTIC REASONS ───────────────────────────────────────────────
    const reasons: string[] = [];
    if (matchedSkills.length > 0) {
      reasons.push(`${matchedSkills.length} of ${reqList.length} core technical requirements matched (${matchedSkills.slice(0, 3).join(", ")})`);
    }
    if (experienceMatchScore >= 85) {
      reasons.push(`Your ${candidateYears} years of experience satisfies the ${reqYears}+ year target`);
    }
    if (occupationMatchScore >= 80) {
      reasons.push(`Direct occupation alignment with ${jobOcc.name}`);
    }
    if (sponsorshipStatus === "CONFIRMED") {
      reasons.push(`Visa sponsorship confirmed with verified employer credentials`);
    } else if (sponsorshipStatus === "LIKELY") {
      reasons.push(`Positive sponsorship indicators detected in job specification`);
    }

    if (missingSkills.length > 0) {
      reasons.push(`Missing critical skill for this specific role: ${missingSkills.slice(0, 2).join(", ")}`);
    }

    scoredResults.push({
      job,
      jobMatchScore,
      sponsorJobMatchScore,
      skillMatchScore,
      experienceMatchScore,
      occupationMatchScore,
      seniorityMatchScore,
      locationMatchScore,
      educationMatchScore,
      sponsorshipScore,
      dataQualityScore: jobReqs.dataQualityScore,
      recommendationTier,
      rankingPosition: 0,
      matchedSkills,
      missingSkills,
      skillGapBreakdown,
      reasons,
      sponsorshipStatus,
    });
  }

  // ── RANKING: Highest SponsorJob Score First, with Diversity & Freshness ───
  scoredResults.sort((a, b) => {
    if (b.sponsorJobMatchScore !== a.sponsorJobMatchScore) {
      return b.sponsorJobMatchScore - a.sponsorJobMatchScore;
    }
    return b.dataQualityScore - a.dataQualityScore;
  });

  // Assign ranking positions
  scoredResults.forEach((r, idx) => {
    r.rankingPosition = idx + 1;
  });

  return {
    candidateProfile: candidate,
    totalMatches: scoredResults.length,
    recommendations: scoredResults,
    algorithmVersion: ALGORITHM_VERSION,
    jobDatasetVersion: JOB_DATASET_VERSION,
  };
}
