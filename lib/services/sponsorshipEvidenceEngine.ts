import { SponsorshipLabel, SponsorshipEvidenceType, JobSponsorshipEvidenceRecord } from "../types/database";

export interface SponsorshipAnalysisResult {
  score: number;             // 0 to 100
  confidence: number;        // 0 to 100 (Evidence strength)
  label: SponsorshipLabel;
  evidenceLevel: SponsorshipEvidenceType;
  positiveEvidence: string[];
  negativeEvidence: string[];
  visaKeywords: string[];
  evidenceRecords: Partial<JobSponsorshipEvidenceRecord>[];
}

// Regex rules for explicit statements
const EXPLICIT_POSITIVE_PATTERNS = [
  /visa sponsorship available/i,
  /visa sponsorship is provided/i,
  /certificate of sponsorship (?:provided|available|offered)/i,
  /h-?1b (?:transfer|sponsorship|filing) supported/i,
  /will sponsor (?:work )?visas?/i,
  /sponsorship available for this role/i,
  /skilled worker visa sponsorship/i,
  /tier 2 sponsorship/i,
  /subclass 482 (?:tss )?sponsorship/i,
  /lmia supported/i,
];

const EXPLICIT_NEGATIVE_PATTERNS = [
  /no visa sponsorship/i,
  /sponsorship is not available/i,
  /unable to sponsor/i,
  /must have unrestricted right to work/i,
  /must be a (?:us|uk|canadian|australian) citizen/i,
  /no sponsorship offered/i,
  /we cannot sponsor (?:visas|candidates)/i,
];

export class SponsorshipEvidenceEngine {
  /**
   * Analyzes job description, employer profile, and external signals with strict taxonomy separation
   */
  static analyze(params: {
    description: string;
    companyName?: string;
    isEmployerOnOfficialSponsorList?: boolean;
    isGlobalPracticeOrMobility?: boolean;
  }): SponsorshipAnalysisResult {
    const text = params.description || "";
    const positiveEvidence: string[] = [];
    const negativeEvidence: string[] = [];
    const visaKeywords: string[] = [];
    const evidenceRecords: Partial<JobSponsorshipEvidenceRecord>[] = [];

    // 1. Check for Explicit Negative Statements
    for (const pat of EXPLICIT_NEGATIVE_PATTERNS) {
      const match = text.match(pat);
      if (match) {
        negativeEvidence.push(`Explicit restriction: "${match[0]}"`);
      }
    }

    if (negativeEvidence.length > 0) {
      return {
        score: 0,
        confidence: 95,
        label: "Explicitly Not Offered",
        evidenceLevel: "EXPLICIT_JOB_TEXT",
        positiveEvidence: [],
        negativeEvidence,
        visaKeywords: [],
        evidenceRecords: [
          {
            evidence_type: "EXPLICIT_JOB_TEXT",
            evidence_text: negativeEvidence.join("; "),
            confidence: 95,
            verified: 1,
          },
        ],
      };
    }

    // 2. Check for Explicit Positive Statements
    for (const pat of EXPLICIT_POSITIVE_PATTERNS) {
      const match = text.match(pat);
      if (match) {
        positiveEvidence.push(`Direct statement: "${match[0]}"`);
        visaKeywords.push(match[0]);
      }
    }

    if (positiveEvidence.length > 0) {
      evidenceRecords.push({
        evidence_type: "EXPLICIT_JOB_TEXT",
        evidence_text: positiveEvidence.join("; "),
        confidence: 95,
        verified: 1,
      });

      return {
        score: 95,
        confidence: 95,
        label: "Strong",
        evidenceLevel: "EXPLICIT_JOB_TEXT",
        positiveEvidence,
        negativeEvidence: [],
        visaKeywords,
        evidenceRecords,
      };
    }

    // 3. Check for Employer Official Registry Status
    if (params.isEmployerOnOfficialSponsorList) {
      positiveEvidence.push(`Employer is verified on the government official sponsor register`);
      visaKeywords.push("Official Government Sponsor Register");

      evidenceRecords.push({
        evidence_type: "HISTORICAL_SPONSORSHIP",
        evidence_text: "Employer is a licensed sponsor in government database",
        confidence: 70,
        verified: 1,
      });

      return {
        score: 75,
        confidence: 65,
        label: "Likely",
        evidenceLevel: "HISTORICAL_SPONSORSHIP",
        positiveEvidence,
        negativeEvidence: [],
        visaKeywords,
        evidenceRecords,
      };
    }

    // 4. Check for Global Practice / Corporate Mobility Signal
    if (params.isGlobalPracticeOrMobility || /global facilities|international practice|cross-border projects/i.test(text)) {
      positiveEvidence.push("International enterprise practice handling cross-border engineering infrastructure");
      visaKeywords.push("Global Facilities Practice");

      evidenceRecords.push({
        evidence_type: "COMPANY_LEVEL_SIGNAL",
        evidence_text: "Corporate entity operates international engineering mobility centers",
        confidence: 45,
        verified: 1,
      });

      return {
        score: 60,
        confidence: 45,
        label: "Possible",
        evidenceLevel: "COMPANY_LEVEL_SIGNAL",
        positiveEvidence,
        negativeEvidence: [],
        visaKeywords,
        evidenceRecords,
      };
    }

    // 5. Default: No Clear Signal
    return {
      score: 15,
      confidence: 10,
      label: "No Sponsorship Signal",
      evidenceLevel: "NONE",
      positiveEvidence: [],
      negativeEvidence: [],
      visaKeywords: [],
      evidenceRecords: [],
    };
  }
}
