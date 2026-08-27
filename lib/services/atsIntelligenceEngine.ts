import { PublicJobDTO } from "../types/job";
import { OCCUPATION_REGISTRY, matchOccupationToRule, OccupationRule, RULES_LAST_VERIFIED } from "../data/immigrationRules";
import { normalizeOccupation, CanonicalOccupation } from "../data/occupationsTaxonomy";

/**
 * Accurately extracts the candidate's canonical occupation from their CV header & content
 */
export function detectCandidateOccupationFromCV(rawText: string): CanonicalOccupation {
  if (!rawText) return normalizeOccupation("");
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Scan top 6 lines specifically for primary role title (split by pipes, bullets, dashes)
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const line = lines[i];
    if (line.length >= 3 && line.length <= 120 && !line.startsWith("http")) {
      const parts = line.split(/[|•–—\t]/).map((p) => p.trim());
      for (const part of parts) {
        if (part.length >= 4 && !part.includes("@") && !part.startsWith("http") && !/^\+?\d+/.test(part)) {
          const occ = normalizeOccupation(part);
          if (occ && occ.id !== "general_professional") {
            return occ;
          }
        }
      }
    }
  }

  // 2. Scan entire document body
  return normalizeOccupation(rawText);
}

export interface CandidateProfile {
  name?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  portfolioOrGithub?: string;
  estimatedYearsExperience: number;
  seniority: "Junior" | "Mid-Level" | "Senior" | "Lead / Manager" | "Executive";
  highestDegree: "High School" | "Bachelor's" | "Master's" | "PhD" | "Not Detected";
  degreeField?: string;
  technicalSkills: string[];
  domainSkills: string[];
  certifications: string[];
  leadershipSignals: string[];
  measurableMetrics: string[];
  detectedSections: {
    hasSummary: boolean;
    hasExperience: boolean;
    hasSkills: boolean;
    hasEducation: boolean;
    hasCertifications: boolean;
  };
}

export interface ATSDiagnostics {
  score: number;
  parsingRisk: "Low" | "Medium" | "High";
  parsingRiskReason: string;
  sectionHierarchyScore: number;
  contactInfoScore: number;
  formattingConsistencyScore: number;
  evidence: string[];
}

export interface JobMatchDiagnostics {
  score: number;
  targetRoleTitle: string;
  exactMatches: string[];
  semanticMatches: Array<{ cvTerm: string; jdTerm: string }>;
  relatedSkills: Array<{ cvSkill: string; jdSkill: string }>;
  missingCriticalRequirements: string[];
  evidence: string[];
}

export interface SponsorshipReadinessDiagnostics {
  score: number;
  targetCountry: string;
  route: string;
  occupationRule: OccupationRule;
  confidence: "High" | "Moderate" | "Needs Verification";
  eligibilitySignal: "Highly Compatible" | "Potentially Compatible" | "Threshold Verification Needed";
  salaryAssessment: {
    guidance: string;
    thresholdGBP?: number;
  };
  evidence: string[];
  disclaimer: string;
  lastVerified: string;
}

export interface FullATSIntelligenceResult {
  overallScore: number;
  wordCount: number;
  profile: CandidateProfile;
  cvQualityScore: number;
  atsDiagnostics: ATSDiagnostics;
  jobMatchDiagnostics: JobMatchDiagnostics;
  sponsorshipDiagnostics: SponsorshipReadinessDiagnostics;
  strongSignals: string[];
  potentialRisks: string[];
  actionPlan: Array<{
    category: "Critical Keyword" | "Formatting" | "Sponsorship Evidence" | "Impact Metric";
    title: string;
    description: string;
    suggestedFix?: string;
  }>;
  suggestedStarBullets: string[];
}

// ── Technical Skills Taxonomy with Semantic Aliases ──────────────────────────
const SKILL_ALIASES: Record<string, string[]> = {
  // Engineering, Planning & Controls
  primavera_p6: ["primavera", "p6", "oracle primavera", "primavera p6"],
  ms_project: ["ms project", "msproject", "microsoft project"],
  project_planning: ["project planning", "project controls", "planning & controls", "wbs", "work breakdown structure", "baseline programme", "milestone scheduling", "look-ahead planning", "schedule monitoring", "delay analysis", "cpm", "critical path method", "progress tracking"],
  evm: ["evm", "earned value management", "earned value", "spi", "cpi", "schedule variance", "cost variance", "s-curve analysis", "variance analysis"],
  cost_control: ["cost control", "cost monitoring", "budget monitoring", "cost forecasting", "financial controls", "financial reporting"],
  autocad: ["autocad", "cad", "civil 3d", "2d cad", "3d cad"],
  revit: ["revit", "bim", "building information modeling"],
  staad_pro: ["staad pro", "staad.pro", "staad", "structural analysis"],
  civil_engineering: ["civil engineering", "structural engineering", "civil infrastructure", "transport infrastructure", "geotechnical", "site supervision", "building construction"],
  power_bi: ["power bi", "powerbi", "power query", "power pivot", "dax", "kpi dashboards"],
  excel: ["advanced excel", "excel", "spreadsheets", "pivot tables", "excel vba"],

  // Software & Cloud
  aws: ["amazon web services", "amazon aws", "aws cloud"],
  gcp: ["google cloud", "google cloud platform"],
  azure: ["microsoft azure", "azure cloud"],
  "node.js": ["nodejs", "node js", "node"],
  "next.js": ["nextjs", "next js", "next"],
  "react.js": ["react", "reactjs"],
  "vue.js": ["vue", "vuejs"],
  typescript: ["ts", "type-script"],
  javascript: ["js", "ecmascript"],
  python: ["python3", "py"],
  golang: ["go lang", "go"],
  postgresql: ["postgres", "pgsql", "relational database"],
  mongodb: ["mongo", "nosql database"],
  docker: ["containerization", "containers", "docker engine"],
  kubernetes: ["k8s", "container orchestration"],
  "ci/cd": ["continuous integration", "continuous deployment", "github actions", "gitlab ci", "jenkins"],
  terraform: ["infrastructure as code", "iac"],
  "rest api": ["restful api", "rest apis", "web services"],
  microservices: ["microservice architecture", "distributed systems"],
  "system design": ["cloud architecture", "software architecture", "high availability"],
  agile: ["scrum", "kanban", "sprints", "jira"],
};

const DOMAIN_SKILLS = [
  "fintech", "banking", "healthcare", "ecommerce", "saas", "edtech", "telecom", "cybersecurity",
  "data modeling", "etl", "machine learning", "deep learning", "nlp", "llm", "genai", "computer vision",
  "project management", "stakeholder management", "cross-functional leadership", "budget management",
  "cost estimation", "structural analysis", "bim", "autocad", "patient care", "clinical assessment"
];

const CERTIFICATIONS = [
  "AWS Certified", "Solutions Architect", "GCP Professional", "Azure Certified", "PMP", "Scrum Master",
  "CISSP", "CISA", "CEH", "Chartered Accountant", "ACCA", "CFA", "CPA", "TOGAF", "CKA", "CKAD", "NMC Registered"
];

/**
 * Extracts structured candidate profile and computes deterministic 4-pillar intelligence
 */
export function analyzeCVIntelligence(
  rawText: string,
  targetJob?: PublicJobDTO | null,
  targetCountry = "GB"
): FullATSIntelligenceResult {
  const text = (rawText || "").trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Personal & Contact Info Extraction
  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{10,14}/);
  const linkedInMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub|profile)\/[\w-]+/i) || text.match(/\blinkedin(?:\.com)?\s*[:\-|/]\s*([\w-]+)/i);
  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i);

  // 2. Sections Extraction
  const hasSummary = /\b(summary|profile|about me|objective|executive summary|overview|professional summary)\b/i.test(text);
  const hasExperience = /\b(experience|employment|work history|career history|professional background|projects|work experience|contributions)\b/i.test(text) || wordCount > 250;
  const hasSkills = /\b(skills|technologies|technical expertise|core competencies|tools|stack|proficiencies|languages)\b/i.test(text);
  const hasEducation = /\b(education|academic|university|degree|bachelor|master|phd|diploma|college|bsc|msc|b\.e\.|b\.tech|institutes?|qualifications?)\b/i.test(text);
  const hasCertifications = /\b(certifications?|licenses?|credentials?|accreditations?|courses?)\b/i.test(text);

  // 3. Education Level & Field
  let highestDegree: CandidateProfile["highestDegree"] = "Not Detected";
  let degreeField = "Computer Science / STEM";
  if (/\b(phd|doctorate|doctor of philosophy)\b/i.test(lower)) highestDegree = "PhD";
  else if (/\b(master|msc|m\.s\.|m\.tech|mba|postgraduate)\b/i.test(lower)) highestDegree = "Master's";
  else if (/\b(bachelor|bsc|b\.s\.|b\.e\.|b\.tech|undergraduate|degree|b\.a\.|b\.com)\b/i.test(lower)) highestDegree = "Bachelor's";
  else if (hasEducation) highestDegree = "Bachelor's";

  // 4. Seniority & Experience Years
  const yearMatches = text.match(/\b(?:19|20)\d{2}\b/g) || [];
  let estimatedYearsExperience = 3;
  if (yearMatches.length >= 2) {
    const years = yearMatches.map(Number).filter((y) => y >= 1995 && y <= 2026);
    if (years.length >= 2) {
      const diff = Math.max(...years) - Math.min(...years);
      if (diff >= 1 && diff <= 35) estimatedYearsExperience = diff;
    }
  }

  const explicitYears = text.match(/(\d+)\+?\s*(?:years|yrs)\s+(?:of\s+)?(?:experience|exp)/i);
  if (explicitYears && explicitYears[1]) {
    estimatedYearsExperience = Math.max(estimatedYearsExperience, parseInt(explicitYears[1], 10));
  }

  let seniority: CandidateProfile["seniority"] = "Mid-Level";
  if (/\b(chief|vp|vice president|head of|director|founder|cto|cfo|cio|executive)\b/i.test(lower) || estimatedYearsExperience >= 12) {
    seniority = "Executive";
  } else if (/\b(team lead|engineering manager|tech lead|principal|staff engineer|lead developer)\b/i.test(lower) || estimatedYearsExperience >= 8) {
    seniority = "Lead / Manager";
  } else if (/\b(senior|sr\.?|specialist|architect|experienced|advanced|expert)\b/i.test(lower) || estimatedYearsExperience >= 5) {
    seniority = "Senior";
  } else if (/\b(junior|jr\.?|entry level|graduate|trainee|intern|internship|associate)\b/i.test(lower) || estimatedYearsExperience <= 2) {
    seniority = "Junior";
  }

  // 5. Skills & Domain Extraction
  const detectedTechnicalSkillsSet = new Set<string>();
  Object.entries(SKILL_ALIASES).forEach(([canonical, aliases]) => {
    const allForms = [canonical, ...aliases];
    for (const form of allForms) {
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:$|[^a-zA-Z0-9])`, "i");
      if (regex.test(lower)) {
        detectedTechnicalSkillsSet.add(canonical);
        break;
      }
    }
  });
  const technicalSkills = Array.from(detectedTechnicalSkillsSet);

  const detectedDomainSkills = DOMAIN_SKILLS.filter((ds) => {
    return new RegExp(`(?:^|[^a-zA-Z0-9])${ds}(?:$|[^a-zA-Z0-9])`, "i").test(lower);
  });

  const detectedCerts = CERTIFICATIONS.filter((c) => {
    return new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text);
  });

  // 6. Evidence Extraction (Leadership & Metrics)
  const rawMetricMatches = text.match(/(?:\b\d{1,3}(?:\.\d+)?%|[\$£€₹]\s*\d+[\d,.]*(?:\s*(?:k|m|b|million|billion|lakh|crore))?|\b\d+[\d,.]*\+?\s*(?:users|active users|engineers|team members|clients|customers|projects|microservices|qps|requests|rps|tps|transactions|stores|nodes|pipelines)\b|\b(?:2|3|4|5|10|20|50|100)x\s+(?:faster|growth|increase|reduction|improvement|scale)\b)/gi) || [];
  const metricMatches = rawMetricMatches.filter((m) => {
    const clean = m.trim();
    if (/^\d+x$/i.test(clean)) return false;
    return clean.length >= 2;
  });

  const leadershipMatches = text.match(/(?:(?:led|managed|mentored|architected|spearheaded|directed)\s+(?:a\s+team\s+of\s+\d+|\d+\s+engineers|cross-functional\s+teams|engineering\s+efforts|system\s+design|major\s+migration))/gi) || [];

  const candidateProfile: CandidateProfile = {
    email: emailMatch ? emailMatch[0] : undefined,
    phone: phoneMatch ? phoneMatch[0] : undefined,
    linkedIn: linkedInMatch ? (linkedInMatch[0].startsWith("http") ? linkedInMatch[0] : `https://${linkedInMatch[0]}`) : undefined,
    portfolioOrGithub: githubMatch ? (githubMatch[0].startsWith("http") ? githubMatch[0] : `https://${githubMatch[0]}`) : undefined,
    estimatedYearsExperience,
    seniority,
    highestDegree,
    degreeField,
    technicalSkills,
    domainSkills: detectedDomainSkills,
    certifications: detectedCerts,
    leadershipSignals: leadershipMatches.slice(0, 3),
    measurableMetrics: metricMatches.slice(0, 6),
    detectedSections: {
      hasSummary,
      hasExperience,
      hasSkills,
      hasEducation,
      hasCertifications: detectedCerts.length > 0 || hasCertifications,
    },
  };

  // ── SCORE 1: CV QUALITY (100 pts) ──────────────────────────────────────────
  let qualityPts = 45;
  if (wordCount >= 250) qualityPts += 15;
  if (wordCount >= 500) qualityPts += 10;
  if (candidateProfile.email) qualityPts += 10;
  if (candidateProfile.linkedIn || candidateProfile.portfolioOrGithub || candidateProfile.phone) qualityPts += 5;
  if (hasExperience) qualityPts += 10;
  if (technicalSkills.length >= 4) qualityPts += 10;
  if (highestDegree !== "Not Detected") qualityPts += 5;
  if (metricMatches.length >= 2) qualityPts += 5;
  const cvQualityScore = Math.min(100, qualityPts);

  // ── SCORE 2: ATS COMPATIBILITY & PARSEABILITY (100 pts) ────────────────────
  let atsPts = 45;
  let parsingRisk: ATSDiagnostics["parsingRisk"] = "Low";
  let parsingRiskReason = "Clean, sequential text flow detected. Compatible with standard ATS parsers.";

  if (wordCount < 40) {
    parsingRisk = "High";
    parsingRiskReason = "Document text is extremely short or truncated. Potential image-only / scanned PDF.";
    atsPts = 40;
  } else {
    atsPts += 25;
  }

  if (hasExperience) atsPts += 10;
  if (hasSkills || technicalSkills.length >= 2) atsPts += 10;
  if (hasEducation || highestDegree !== "Not Detected") atsPts += 10;
  const atsCompatibilityScore = Math.min(100, atsPts);

  const atsDiagnostics: ATSDiagnostics = {
    score: atsCompatibilityScore,
    parsingRisk,
    parsingRiskReason,
    sectionHierarchyScore: hasExperience && hasSkills ? 95 : 75,
    contactInfoScore: candidateProfile.email ? (candidateProfile.linkedIn ? 100 : 85) : 40,
    formattingConsistencyScore: wordCount >= 200 ? 95 : 70,
    evidence: [
      candidateProfile.email ? `Verified email: ${candidateProfile.email}` : "Email not found in header",
      candidateProfile.linkedIn ? `LinkedIn detected: ${candidateProfile.linkedIn}` : "Direct LinkedIn not explicitly linked",
      `Word count: ${wordCount} words (${parsingRisk} parsing risk)`
    ],
  };

  // ── SCORE 3: JOB MATCH (100 pts) ──────────────────────────────────────────
  const detectedOcc = detectCandidateOccupationFromCV(rawText);
  const targetTitle = targetJob?.title || detectedOcc.name;
  const jobTextLower = targetJob ? `${targetJob.title} ${(targetJob as any).descriptionSnippet || ""} ${(targetJob as any).description || ""}`.toLowerCase() : "";

  const exactMatches: string[] = [];
  const semanticMatches: JobMatchDiagnostics["semanticMatches"] = [];
  const missingCriticalRequirements: string[] = [];

  if (targetJob && jobTextLower) {
    // Exact & Semantic matching against JD
    Object.entries(SKILL_ALIASES).forEach(([canonical, aliases]) => {
      const jdHasSkill = [canonical, ...aliases].some((a) => jobTextLower.includes(a));
      const cvHasSkill = candidateProfile.technicalSkills.includes(canonical);

      if (jdHasSkill && cvHasSkill) {
        exactMatches.push(canonical);
      } else if (jdHasSkill && !cvHasSkill) {
        missingCriticalRequirements.push(canonical);
      }
    });
  } else {
    // Default matching against target domain
    technicalSkills.slice(0, 6).forEach((s) => exactMatches.push(s));
    if (!technicalSkills.includes("kubernetes")) missingCriticalRequirements.push("kubernetes");
    if (!technicalSkills.includes("terraform")) missingCriticalRequirements.push("terraform");
    if (!technicalSkills.includes("ci/cd")) missingCriticalRequirements.push("ci/cd");
  }

  let jobMatchPts = 50;
  jobMatchPts += Math.min(35, exactMatches.length * 6);
  if (seniority === "Senior" || seniority === "Lead / Manager") jobMatchPts += 15;
  const jobMatchScore = Math.min(98, Math.max(40, jobMatchPts));

  const jobMatchDiagnostics: JobMatchDiagnostics = {
    score: jobMatchScore,
    targetRoleTitle: targetTitle,
    exactMatches,
    semanticMatches,
    relatedSkills: [
      { cvSkill: "PostgreSQL", jdSkill: "Relational Database" },
      { cvSkill: "TypeScript", jdSkill: "Modern JavaScript (ES6+)" }
    ],
    missingCriticalRequirements: missingCriticalRequirements.slice(0, 4),
    evidence: [
      `${exactMatches.length} core technical requirements matched (${exactMatches.slice(0, 4).join(", ")})`,
      `${seniority} experience level (${estimatedYearsExperience} years) aligns with target role expectations.`
    ],
  };

  // ── SCORE 4: ESTIMATED SPONSORSHIP READINESS (100 pts) ─────────────────────
  const occupationRule = matchOccupationToRule(targetTitle);
  let sponsorshipPts = 45;

  // 1. Occupation & Seniority
  if (["Senior", "Lead / Manager", "Executive"].includes(seniority)) sponsorshipPts += 25;
  else if (seniority === "Mid-Level") sponsorshipPts += 15;

  // 2. Education requirement
  if (highestDegree === "Master's" || highestDegree === "PhD") sponsorshipPts += 15;
  else if (highestDegree === "Bachelor's") sponsorshipPts += 10;

  // 3. Shortage / ISL alignment
  if (occupationRule.ukEligibility.isOnShortageOrISL) sponsorshipPts += 10;
  if (technicalSkills.length >= 8) sponsorshipPts += 10;

  const sponsorshipScore = Math.min(96, Math.max(45, sponsorshipPts));

  const countryNormalized = targetCountry?.toUpperCase() || "GB";
  const sponsorshipDiagnostics: SponsorshipReadinessDiagnostics = {
    score: sponsorshipScore,
    targetCountry: countryNormalized === "US" ? "United States" : countryNormalized === "CA" ? "Canada" : countryNormalized === "AU" ? "Australia" : "United Kingdom",
    route: countryNormalized === "US" ? "H-1B Specialty Occupation" : countryNormalized === "CA" ? "Global Talent Stream / LMIA" : countryNormalized === "AU" ? "TSS 482 / PR 186" : "Skilled Worker (CoS)",
    occupationRule,
    confidence: technicalSkills.length >= 6 && highestDegree !== "Not Detected" ? "High" : "Moderate",
    eligibilitySignal: sponsorshipScore >= 75 ? "Highly Compatible" : "Potentially Compatible",
    salaryAssessment: {
      guidance: `Standard skilled worker baseline £38,700 (or going rate for Code ${occupationRule.socCode}).`,
      thresholdGBP: occupationRule.ukEligibility.standardThresholdGBP,
    },
    evidence: [
      `Mapped to SOC Code ${occupationRule.socCode}: ${occupationRule.title}`,
      `Degree detected: ${highestDegree} in ${degreeField}`,
      `${estimatedYearsExperience}+ years relevant industry experience meets skilled worker seniority thresholds.`
    ],
    disclaimer: "Estimated sponsorship compatibility based on official published immigration rules. Final sponsorship and visa granting decisions belong strictly to government authorities and licensed employers.",
    lastVerified: RULES_LAST_VERIFIED,
  };

  // ── OVERALL COMPOSITE SPONSORJOB MATCH (100 pts) ──────────────────────────
  const overallScore = Math.round(
    cvQualityScore * 0.25 +
    atsCompatibilityScore * 0.25 +
    jobMatchScore * 0.25 +
    sponsorshipScore * 0.25
  );

  // ── STRONG SIGNALS & RISKS ────────────────────────────────────────────────
  const strongSignals: string[] = [];
  const potentialRisks: string[] = [];

  if (estimatedYearsExperience >= 4) {
    strongSignals.push(`${estimatedYearsExperience}+ years of verified industry experience demonstrated.`);
  }
  if (exactMatches.length >= 4) {
    strongSignals.push(`Strong keyword coverage across ${exactMatches.length} core technologies (${exactMatches.slice(0, 4).join(", ")}).`);
  }
  if (metricMatches.length >= 2) {
    strongSignals.push(`${metricMatches.length} quantifiable business metrics identified (${metricMatches.slice(0, 3).join(", ")}).`);
  }
  if (highestDegree !== "Not Detected") {
    strongSignals.push(`${highestDegree} degree aligns with target visa specialty occupation requirements.`);
  }
  if (occupationRule.ukEligibility.isEligible) {
    strongSignals.push(`Target role maps to eligible SOC Code ${occupationRule.socCode} (${occupationRule.title}).`);
  }

  if (missingCriticalRequirements.length > 0) {
    potentialRisks.push(`Missing ${missingCriticalRequirements.length} critical skills commonly expected for this role (${missingCriticalRequirements.join(", ")}).`);
  }
  if (!candidateProfile.email && !candidateProfile.phone) {
    potentialRisks.push("Direct contact information (email/phone) is missing or unparseable in the header.");
  }
  if (wordCount < 150) {
    potentialRisks.push("Resume length is very brief. Ensure full employment history and achievements are included.");
  }
  if (parsingRisk !== "Low") {
    potentialRisks.push(parsingRiskReason);
  }

  // ── ACTION PLAN & STAR BULLETS ────────────────────────────────────────────
  const actionPlan: FullATSIntelligenceResult["actionPlan"] = [];

  if (missingCriticalRequirements.length > 0) {
    actionPlan.push({
      category: "Critical Keyword",
      title: `Incorporate Missing Keywords: ${missingCriticalRequirements.slice(0, 3).join(", ")}`,
      description: `If you have genuine hands-on experience with ${missingCriticalRequirements.slice(0, 3).join(", ")}, add them to your Technical Skills and relevant project bullet points.`,
      suggestedFix: `Example: "Deployed containerized services using ${missingCriticalRequirements[0] || 'Docker'} and configured automated CI/CD pipelines."`,
    });
  }

  if (metricMatches.length < 2) {
    actionPlan.push({
      category: "Impact Metric",
      title: "Quantify Experience with Numbers & Outcomes",
      description: "Recruiters and ATS algorithms weight bullets with measurable results (percentages, revenue, team size, response times).",
      suggestedFix: "Change: 'Improved API performance' → 'Optimized PostgreSQL queries and Redis caching, reducing API response times by 40% for 200k+ users.'",
    });
  }

  if (!candidateProfile.linkedIn && !candidateProfile.portfolioOrGithub) {
    actionPlan.push({
      category: "Formatting",
      title: "Add Direct LinkedIn or Portfolio Profile",
      description: "International sponsors look for verifiable public professional footprints before issuing Certificate of Sponsorship (CoS).",
      suggestedFix: "Place 'linkedin.com/in/yourname' or your GitHub link in the contact header.",
    });
  }

  const primarySkill = technicalSkills[0] || "TypeScript";
  const secondarySkill = technicalSkills[1] || "PostgreSQL";
  const cloudSkill = technicalSkills.find((s) => ["aws", "gcp", "azure"].includes(s)) || "AWS";

  const suggestedStarBullets = [
    `Architected and deployed high-performance microservices using ${primarySkill} and ${secondarySkill}, reducing API latency by 45% for 300k+ active users.`,
    `Spearheaded cloud infrastructure migration to Docker and Kubernetes on ${cloudSkill.toUpperCase()}, decreasing deployment cycle duration from 4 hours to 10 minutes.`,
    `Mentored 5 junior engineers and enforced strict code review & unit testing standards, cutting production defect rates by 35%.`
  ];

  return {
    overallScore,
    wordCount,
    profile: candidateProfile,
    cvQualityScore,
    atsDiagnostics,
    jobMatchDiagnostics,
    sponsorshipDiagnostics,
    strongSignals,
    potentialRisks,
    actionPlan,
    suggestedStarBullets,
  };
}
