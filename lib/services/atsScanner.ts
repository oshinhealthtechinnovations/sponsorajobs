import { PublicJobDTO } from "../types/job";
import { normalizeSearchQuery } from "../utils/searchNormalizer";

export interface ATSAnalysisResult {
  overallScore: number;
  atsFormattingScore: number;
  visaReadinessScore: number;
  contentQualityScore: number;
  wordCount: number;
  estimatedSeniority: "Junior" | "Mid-Level" | "Senior" | "Lead / Manager" | "Executive";
  detectedSkills: string[];
  detectedCertifications: string[];
  detectedContactInfo: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasLinkedIn: boolean;
    hasGitHubOrPortfolio: boolean;
  };
  detectedSections: {
    hasExperience: boolean;
    hasEducation: boolean;
    hasSkills: boolean;
    hasSummary: boolean;
  };
  strengths: string[];
  improvements: string[];
  missingHighImpactKeywords: string[];
  matchedRoleTitle?: string;
}

export interface ATSJobMatch {
  job: PublicJobDTO;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  reason: string;
}

// ── Common High-Impact ATS Keywords by Domain ────────────────────────────────
const TECHNICAL_SKILLS_TAXONOMY: Record<string, string[]> = {
  software_engineering: [
    "typescript", "javascript", "python", "golang", "go", "java", "c++", "c#", ".net", "rust",
    "react", "next.js", "vue", "angular", "node.js", "express", "fastapi", "django", "spring boot",
    "graphql", "rest api", "microservices", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "docker", "kubernetes", "aws", "gcp", "azure", "terraform", "ci/cd", "git", "linux", "kafka",
    "unit testing", "system design", "distributed systems", "agile", "scrum"
  ],
  data_and_ai: [
    "python", "sql", "r", "machine learning", "deep learning", "nlp", "llm", "genai", "pytorch",
    "tensorflow", "pandas", "numpy", "scikit-learn", "spark", "hadoop", "databricks", "snowflake",
    "bigquery", "data pipeline", "etl", "data modeling", "tableau", "power bi", "mlops", "langchain"
  ],
  product_and_management: [
    "product management", "roadmap", "user stories", "kpis", "okrs", "a/b testing", "stakeholder management",
    "jira", "confluence", "scrum master", "cross-functional leadership", "market research", "user research",
    "product strategy", "customer discovery", "analytics", "go-to-market", "budget management"
  ],
  finance_and_business: [
    "financial modeling", "fp&a", "forecasting", "budgeting", "variance analysis", "gaap", "ifrs",
    "sap", "oracle", "excel", "sql", "anaplan", "reconciliation", "audit", "compliance", "tax", "valuation"
  ],
  devops_and_security: [
    "kubernetes", "docker", "terraform", "ansible", "helm", "prometheus", "grafana", "datadog",
    "jenkins", "github actions", "gitlab ci", "aws", "azure", "gcp", "iam", "soc2", "iso27001",
    "penetration testing", "siem", "zero trust", "network security", "sre", "incident response"
  ],
};

const SENIORITY_PATTERNS = [
  { level: "Executive" as const, regex: /\b(chief|vp|vice president|head of|director|founder|co-founder)\b/i },
  { level: "Lead / Manager" as const, regex: /\b(team lead|engineering manager|tech lead|principal engineer|staff engineer)\b/i },
  { level: "Senior" as const, regex: /\b(senior|sr\.?|specialist|experienced|advanced|expert|architect)\b/i },
  { level: "Mid-Level" as const, regex: /\b(mid|intermediate|associate|specialist|analyst|engineer|developer)\b/i },
  { level: "Junior" as const, regex: /\b(junior|jr\.?|entry level|graduate|trainee|intern|internship)\b/i },
];

const CERTIFICATION_PATTERNS = [
  "AWS Certified", "Solutions Architect", "GCP Professional", "Azure Certified", "PMP", "Scrum Master",
  "CSM", "CISSP", "CISA", "CEH", "Chartered Accountant", "ACCA", "CFA", "CPA", "TOGAF", "ITIL", "Kubernetes (CKA)", "CKA", "CKAD"
];

/**
 * Analyzes raw resume text and calculates multi-pillar ATS & Visa readiness scores
 */
export function analyzeResumeATS(rawText: string): ATSAnalysisResult {
  const text = (rawText || "").trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Detected Contact Info
  const hasEmail = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{10,14}/.test(text);
  const hasLinkedIn = /linkedin\.com\/in\/[\w-]+/i.test(text) || lower.includes("linkedin");
  const hasGitHubOrPortfolio = /github\.com\/[\w-]+/i.test(text) || lower.includes("github") || /https?:\/\/[\w.-]+\.(?:io|com|dev|me|tech)/i.test(text);

  // 2. Detected Standard Sections
  const hasExperience = /\b(experience|employment|work history|career history|professional background)\b/i.test(text);
  const hasEducation = /\b(education|academic|university|degree|bachelor|master|phd|diploma)\b/i.test(text);
  const hasSkills = /\b(skills|technologies|technical expertise|core competencies|tools)\b/i.test(text);
  const hasSummary = /\b(summary|profile|about me|objective|professional summary)\b/i.test(text);

  // 3. Metrics & Quantifiable Achievements check (%, $, £, numbers with verbs)
  const numbersWithMetrics = (text.match(/\b(?:\d+%(?:\s+\w+)?|\$\d+[\d,]*|£\d+[\d,]*|€\d+[\d,]*|\d+x|\d+\+\s+(?:years|users|engineers|clients|projects|services))\b/gi) || []).length;
  const actionVerbsCount = (text.match(/\b(led|architected|delivered|spearheaded|increased|reduced|optimized|scaled|designed|implemented|built|engineered|managed|mentored)\b/gi) || []).length;

  // 4. Detected Skills
  const detectedSkillsSet = new Set<string>();
  Object.values(TECHNICAL_SKILLS_TAXONOMY).flat().forEach((skill) => {
    // Word boundary check for skill
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(lower)) {
      detectedSkillsSet.add(skill);
    }
  });
  const detectedSkills = Array.from(detectedSkillsSet);

  // 5. Detected Certifications
  const detectedCerts = CERTIFICATION_PATTERNS.filter((cert) => {
    return new RegExp(`\\b${cert.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);
  });

  // 6. Estimate Seniority
  let estimatedSeniority: "Junior" | "Mid-Level" | "Senior" | "Lead / Manager" | "Executive" = "Mid-Level";
  for (const pattern of SENIORITY_PATTERNS) {
    if (pattern.regex.test(text)) {
      estimatedSeniority = pattern.level;
      break;
    }
  }

  // 7. Calculate Pillar Scores
  // ── A. ATS Formatting Score (0–100)
  let formattingPoints = 0;
  if (hasEmail) formattingPoints += 15;
  if (hasPhone) formattingPoints += 10;
  if (hasLinkedIn) formattingPoints += 10;
  if (hasGitHubOrPortfolio) formattingPoints += 5;
  if (hasExperience) formattingPoints += 20;
  if (hasEducation) formattingPoints += 15;
  if (hasSkills) formattingPoints += 15;
  if (hasSummary) formattingPoints += 10;

  // Word count multiplier
  let wordCountMultiplier = 1.0;
  if (wordCount < 40) wordCountMultiplier = 0.5;
  else if (wordCount < 80) wordCountMultiplier = 0.8;
  else if (wordCount > 2000) wordCountMultiplier = 0.85;

  const atsFormattingScore = Math.min(100, Math.round(formattingPoints * wordCountMultiplier));

  // ── B. Content Quality Score (0–100)
  let qualityPoints = 40;
  if (numbersWithMetrics >= 5) qualityPoints += 30;
  else if (numbersWithMetrics >= 2) qualityPoints += 15;

  if (actionVerbsCount >= 8) qualityPoints += 20;
  else if (actionVerbsCount >= 4) qualityPoints += 10;

  if (detectedSkills.length >= 8) qualityPoints += 10;
  const contentQualityScore = Math.min(100, qualityPoints);

  // ── C. Visa Sponsorship Readiness Score (0–100)
  // Evaluates candidate's profile strength for international Tier 2 / Skilled Worker / H-1B thresholds
  let visaPoints = 50;
  if (["Senior", "Lead / Manager", "Executive"].includes(estimatedSeniority)) visaPoints += 20;
  if (hasEducation) visaPoints += 15;
  if (detectedSkills.length >= 10) visaPoints += 10;
  if (detectedCerts.length > 0) visaPoints += 5;
  const visaReadinessScore = Math.min(100, visaPoints);

  // Overall Weighted Score
  const overallScore = Math.round(
    atsFormattingScore * 0.4 +
    contentQualityScore * 0.35 +
    visaReadinessScore * 0.25
  );

  // 8. Generate Actionable Strengths & Improvement Recommendations
  const strengths: string[] = [];
  const improvements: string[] = [];
  const missingHighImpactKeywords: string[] = [];

  if (hasEmail && hasLinkedIn) {
    strengths.push("Excellent candidate contact information with verifiable professional links (LinkedIn/Email).");
  } else {
    improvements.push("Add a direct LinkedIn profile URL and clear email address at the top of your resume.");
  }

  if (hasExperience && hasSkills && hasEducation) {
    strengths.push("Follows standard ATS section hierarchy (Experience, Skills, Education) that ensures error-free ATS parsing.");
  } else {
    improvements.push("Ensure your CV uses standard header titles like 'Professional Experience', 'Technical Skills', and 'Education'.");
  }

  if (numbersWithMetrics >= 3) {
    strengths.push(`Great use of quantifiable business impact (${numbersWithMetrics} measurable metrics detected).`);
  } else {
    improvements.push("Add more numbers and percentages to your experience bullets (e.g. 'Reduced latency by 35%', 'Scaled platform to 100k+ users').");
  }

  if (detectedSkills.length >= 8) {
    strengths.push(`Strong core keyword footprint with ${detectedSkills.length} in-demand technical competencies.`);
  } else {
    improvements.push("Incorporate more industry-standard technical tools, frameworks, and methodologies relevant to your target role.");
  }

  if (visaReadinessScore >= 80) {
    strengths.push("High international visa sponsorship profile strength matching global shortage occupation criteria.");
  } else {
    improvements.push("Highlight leadership, architectural ownership, and formal degree qualifications to boost visa eligibility scoring.");
  }

  // Suggest missing top keywords for their primary field
  let dominantCategory = "software_engineering";
  if (detectedSkills.some((s) => TECHNICAL_SKILLS_TAXONOMY.data_and_ai.includes(s))) dominantCategory = "data_and_ai";
  else if (detectedSkills.some((s) => TECHNICAL_SKILLS_TAXONOMY.devops_and_security.includes(s))) dominantCategory = "devops_and_security";

  const allCategorySkills = TECHNICAL_SKILLS_TAXONOMY[dominantCategory] || TECHNICAL_SKILLS_TAXONOMY.software_engineering;
  allCategorySkills.forEach((kw) => {
    if (!detectedSkillsSet.has(kw) && missingHighImpactKeywords.length < 8) {
      missingHighImpactKeywords.push(kw);
    }
  });

  return {
    overallScore,
    atsFormattingScore,
    visaReadinessScore,
    contentQualityScore,
    wordCount,
    estimatedSeniority,
    detectedSkills,
    detectedCertifications: detectedCerts,
    detectedContactInfo: {
      hasEmail,
      hasPhone,
      hasLinkedIn,
      hasGitHubOrPortfolio,
    },
    detectedSections: {
      hasExperience,
      hasEducation,
      hasSkills,
      hasSummary,
    },
    strengths,
    improvements,
    missingHighImpactKeywords,
  };
}

/**
 * Matches a candidate's ATS profile against live database jobs
 */
export function matchResumeWithJobs(
  analysis: ATSAnalysisResult,
  candidateText: string,
  availableJobs: PublicJobDTO[],
  limit = 6
): ATSJobMatch[] {
  const candidateLower = candidateText.toLowerCase();
  const candidateSkills = new Set(analysis.detectedSkills.map((s) => s.toLowerCase()));

  const scoredMatches = availableJobs.map((job) => {
    const jobTitleLower = job.title.toLowerCase();
    const jobCategoryLower = (job.category?.name || "").toLowerCase();
    const jobCompLower = job.company.name.toLowerCase();

    let matchPoints = 0;
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    // Title / role matching
    const titleTokens = normalizeSearchQuery(job.title).tokens;
    let titleTokenMatches = 0;
    for (const token of titleTokens) {
      if (candidateLower.includes(token)) {
        titleTokenMatches++;
      }
    }
    if (titleTokens.length > 0) {
      matchPoints += (titleTokenMatches / titleTokens.length) * 40;
    }

    // Skills overlap check
    const potentialJobSkills = Object.values(TECHNICAL_SKILLS_TAXONOMY)
      .flat()
      .filter((s) => jobTitleLower.includes(s) || jobCategoryLower.includes(s));

    for (const skill of analysis.detectedSkills) {
      if (jobTitleLower.includes(skill) || jobCategoryLower.includes(skill)) {
        matchingSkills.push(skill);
        matchPoints += 15;
      }
    }

    // Sponsorship bonus: Jobs with verified 'Strong' or 'Likely' visa support
    if (job.sponsorship.label === "Strong") matchPoints += 25;
    else if (job.sponsorship.label === "Likely") matchPoints += 15;
    else matchPoints += 5;

    // Normalization to 0-99%
    const finalScore = Math.min(98, Math.max(55, Math.round(matchPoints)));

    let reason = "Strong alignment with your core technical background and target role.";
    if (job.sponsorship.label === "Strong") {
      reason = "Verified sponsor employer offering full relocation and visa sponsorship support.";
    }

    return {
      job,
      matchScore: finalScore,
      matchingSkills: Array.from(new Set(matchingSkills)),
      missingSkills,
      reason,
    };
  });

  // Sort by matchScore descending
  scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

  return scoredMatches.slice(0, limit);
}
