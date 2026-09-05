/**
 * SponsorAJobs Universal Career Intelligence Engine (CIE-v2)
 * 
 * Next-Generation capability-centric career intelligence and job matching engine.
 * Decoupled from rigid job titles and hardcoded role graphs.
 * Works universally across ANY profession, candidate background, and industry.
 */

import { PublicJobDTO } from "@/lib/types/job";
import { getDatabase } from "@/lib/db/client";

// ── TYPES & CONTRACTS ────────────────────────────────────────────────────────

export type SeniorityTier = "Graduate / Entry" | "Mid-Level" | "Senior" | "Lead / Principal" | "Executive";

export type MatchTier = "DIRECT_MATCH" | "ADJACENT_MATCH" | "TRANSFERABLE_PATHWAY" | "STRETCH_MATCH";

export type SponsorshipCertainty =
  | "CONFIRMED_IN_LISTING"
  | "HISTORICAL_EMPLOYER_SPONSOR"
  | "NO_SPONSORSHIP_FOUND";

export interface CandidateCapabilityProfile {
  identity: {
    name?: string;
    email?: string;
    phone?: string;
    linkedIn?: string;
    targetCountry?: string;
  };

  // Headline & Functional Core
  headlineRole: string;
  normalizedRole: string;
  primaryFunction: string;
  secondaryFunctions: string[];

  // 5 Universal Primitive Vectors
  coreCapabilities: string[];
  toolsAndSoftware: string[];
  methodologiesAndStandards: string[];
  governanceAndRegulations: string[];

  // Industry & Domain
  primaryIndustry: string;
  subIndustries: string[];

  // Experience & Scope
  yearsOfExperience: number;
  seniority: SeniorityTier;
  autonomyLevel: "Individual Contributor" | "Technical Lead" | "Project / Team Manager" | "Executive Director";
  hasBudgetExposure: boolean;
  hasPeopleLeadership: boolean;

  // Education & Qualifications
  highestDegree: "Doctorate" | "Master's" | "Bachelor's" | "Diploma / Technical" | "Secondary" | "Not Detected";
  degreeField?: string;
  certifications: string[];

  // Transferable Career Pathways
  transferableCareerPathways: Array<{
    targetRole: string;
    rationale: string;
    affinityScore: number;
  }>;
  transferableRolesList: string[];

  rawSummary: string;
}

export interface JobRequirementProfile {
  jobId: string;
  title: string;
  normalizedTitle: string;
  companyName: string;
  countryCode: string;
  city?: string;
  industry: string;
  seniority: SeniorityTier;
  minYearsExperience: number;
  mandatoryCapabilities: string[];
  preferredCapabilities: string[];
  tools: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  sponsorshipCertainty: SponsorshipCertainty;
  sponsorshipViabilityScore: number;
  sponsorshipEvidence: string;
  rawDescription: string;
}

export interface MatchOpportunity {
  job: PublicJobDTO;
  matchTier: MatchTier;
  tierBadgeLabel: string;
  careerMatchScore: number;          // 0 - 100
  sponsorshipViabilityScore: number; // 0 - 100
  atsCompatibilityScore: number;     // 0 - 100
  compositeRankScore: number;        // 0 - 100 (for sorting)
  recommendationReason: string;
  
  breakdown: {
    capabilityOverlapScore: number;
    scopeAndSeniorityScore: number;
    domainAffinityScore: number;
    trajectoryFitScore: number;
    credentialsScore: number;
    sponsorshipViabilityScore: number;
    matchedCapabilities: string[];
    missingCapabilities: string[];
    matchedTools: string[];
    missingTools: string[];
    transferabilityRationale: string;
    whyYouMatch: string[];
    whatIsMissing: string[];
    howToImprove: string[];
    sponsorshipStatus: {
      certainty: SponsorshipCertainty;
      badgeLabel: string;
      description: string;
      evidence: string;
    };
  };
}

// ── UNIVERSAL CAPABILITY TAXONOMY WITH WORD BOUNDARIES ──────────────────────

interface CapabilityDefinition {
  label: string;
  category: "planning" | "engineering" | "construction" | "technology" | "data" | "finance" | "healthcare" | "management";
  synonyms: string[];
}

const UNIVERSAL_CAPABILITIES: Record<string, CapabilityDefinition> = {
  // Project Controls & Planning
  "primavera p6": { label: "Primavera P6", category: "planning", synonyms: ["primavera", "p6", "primavera enterprise"] },
  "ms project": { label: "Microsoft Project", category: "planning", synonyms: ["microsoft project", "msproject"] },
  "earned value management": { label: "Earned Value Management (EVM)", category: "planning", synonyms: ["evm", "cpi", "spi", "earned value"] },
  "critical path method": { label: "Critical Path Method (CPM)", category: "planning", synonyms: ["cpm", "critical path analysis", "critical path scheduling"] },
  "work breakdown structure": { label: "Work Breakdown Structure (WBS)", category: "planning", synonyms: ["wbs", "work breakdown"] },
  "s-curve analysis": { label: "S-Curve Analysis & Forecasting", category: "planning", synonyms: ["s-curve", "s curve", "progress curves"] },
  "schedule risk analysis": { label: "Schedule Risk Analysis", category: "planning", synonyms: ["schedule risk", "qra"] },
  "delay analysis": { label: "Delay Analysis & Claims", category: "planning", synonyms: ["delay analysis", "time impact analysis", "eot claims", "claims analysis", "disruption analysis"] },
  "baseline management": { label: "Schedule Baseline Management", category: "planning", synonyms: ["baseline schedule", "target schedule", "baseline tracking"] },
  "project controls": { label: "Project Controls", category: "planning", synonyms: ["cost & schedule controls", "project control"] },
  "project coordination": { label: "Project Coordination", category: "management", synonyms: ["project support", "pmo", "pmo analyst", "project administration"] },
  "stakeholder management": { label: "Stakeholder Management", category: "management", synonyms: ["client coordination", "stakeholder engagement", "client relations"] },
  "procurement coordination": { label: "Procurement & Subcontractor Coordination", category: "management", synonyms: ["vendor coordination", "subcontractor management", "procurement"] },
  "budget monitoring": { label: "Budget Monitoring & Cost Control", category: "finance", synonyms: ["cost control", "budget tracking", "financial tracking", "cost reporting"] },
  "risk management": { label: "Risk Management", category: "management", synonyms: ["risk register", "risk mitigation", "risk assessment", "raaid"] },

  // Construction, Infrastructure & Civil Engineering
  "autocad": { label: "AutoCAD", category: "engineering", synonyms: ["cad", "2d cad", "autodesk autocad"] },
  "civil 3d": { label: "Civil 3D", category: "engineering", synonyms: ["autodesk civil 3d", "civil3d"] },
  "revit": { label: "Revit", category: "engineering", synonyms: ["autodesk revit", "revit mep", "revit structures"] },
  "bim": { label: "BIM (Building Information Modeling)", category: "engineering", synonyms: ["building information modelling", "navisworks", "iso 19650"] },
  "structural analysis": { label: "Structural Analysis & Design", category: "engineering", synonyms: ["etabs", "staad pro", "tekla", "structural calculations", "reinforced concrete"] },
  "site supervision": { label: "Site Supervision & Inspection", category: "construction", synonyms: ["site management", "site oversight", "clerk of works", "site engineer"] },
  "setting out": { label: "Setting Out & Surveying", category: "engineering", synonyms: ["total station", "setting out engineer", "land surveying"] },
  "health & safety compliance": { label: "Health & Safety Compliance", category: "construction", synonyms: ["cdm 2015", "cdm regulations", "nebosh", "iosh", "coshh", "rams", "toolbox talks"] },
  "contract administration": { label: "Contract Administration", category: "construction", synonyms: ["nec3", "nec4", "fidic", "jct contracts", "contract management"] },
  "infrastructure delivery": { label: "Infrastructure Delivery", category: "construction", synonyms: ["civil infrastructure", "capital works", "highways", "drainage", "earthworks"] },
  "quantity surveying": { label: "Quantity Surveying & Commercial", category: "finance", synonyms: ["boq", "bill of quantities", "cost value reconciliation", "cvr", "commercial management"] },
  "mep coordination": { label: "MEP Coordination", category: "engineering", synonyms: ["mep", "mechanical electrical", "building services", "hvac", "bems"] },
  "quality assurance": { label: "Quality Assurance & Control (QA/QC)", category: "construction", synonyms: ["qa/qc", "itp", "inspection test plan", "snagging", "handover"] },

  // Software & Cloud Engineering
  "react": { label: "React", category: "technology", synonyms: ["react.js", "reactjs"] },
  "next.js": { label: "Next.js", category: "technology", synonyms: ["nextjs"] },
  "typescript": { label: "TypeScript", category: "technology", synonyms: ["ts"] },
  "javascript": { label: "JavaScript", category: "technology", synonyms: ["js", "es6"] },
  "node.js": { label: "Node.js", category: "technology", synonyms: ["nodejs", "node"] },
  "python": { label: "Python", category: "technology", synonyms: ["python3", "py"] },
  "sql": { label: "SQL & Relational Databases", category: "data", synonyms: ["postgresql", "postgres", "mysql", "t-sql"] },
  "docker": { label: "Docker & Containerization", category: "technology", synonyms: ["containers", "containerization"] },
  "kubernetes": { label: "Kubernetes", category: "technology", synonyms: ["k8s"] },
  "aws": { label: "Amazon Web Services (AWS)", category: "technology", synonyms: ["amazon web services"] },
  "azure": { label: "Microsoft Azure", category: "technology", synonyms: ["azure cloud", "azure devops"] },
  "ci/cd": { label: "CI/CD & Automation", category: "technology", synonyms: ["github actions", "jenkins", "continuous integration"] },

  // Data & Intelligence
  "power bi": { label: "Power BI", category: "data", synonyms: ["powerbi", "dax", "power query"] },
  "tableau": { label: "Tableau", category: "data", synonyms: [] },
  "advanced excel": { label: "Advanced Excel", category: "data", synonyms: ["vlookup", "pivot tables", "index match", "excel modeling"] },
  "data modeling": { label: "Data Modeling & ETL", category: "data", synonyms: ["data warehousing", "etl pipelines"] },

  // Healthcare
  "patient care": { label: "Patient Care", category: "healthcare", synonyms: ["nursing care", "bedside care", "direct patient support"] },
  "clinical assessment": { label: "Clinical Assessment", category: "healthcare", synonyms: ["vital signs", "triage", "patient monitoring"] },
  "medication administration": { label: "Medication Administration", category: "healthcare", synonyms: ["drug administration", "pharmaceutical dispensing"] },

  // Finance & Accounting
  "financial reporting": { label: "Financial Reporting", category: "finance", synonyms: ["management accounts", "statutory accounts", "ifrs", "gaap"] },
  "financial modeling": { label: "Financial Modeling", category: "finance", synonyms: ["cash flow forecasting", "financial analysis"] },
  "general ledger": { label: "General Ledger & Reconciliations", category: "finance", synonyms: ["balance sheet reconciliation", "journal entries"] },
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasExactWordOrPhrase(text: string, phrase: string): boolean {
  if (!text || !phrase) return false;
  const escaped = escapeRegex(phrase.trim().toLowerCase());
  // Strict non-alphanumeric word boundary
  const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
  return regex.test(text.toLowerCase());
}

/**
 * Extract verified certifications from CV / profile text
 */
function extractCertifications(text: string): string[] {
  const lower = text.toLowerCase();
  const certs = new Set<string>();

  // Project Management & Controls
  if (hasExactWordOrPhrase(lower, "pmp") || lower.includes("project management professional")) certs.add("PMP (Project Management Professional)");
  if (hasExactWordOrPhrase(lower, "capm")) certs.add("CAPM (Certified Associate in PM)");
  if (hasExactWordOrPhrase(lower, "prince2") || lower.includes("prince 2")) certs.add("PRINCE2 Practitioner / Foundation");
  if (hasExactWordOrPhrase(lower, "apm") || hasExactWordOrPhrase(lower, "pmq")) certs.add("APM PMQ (Project Management Qualification)");
  if (hasExactWordOrPhrase(lower, "pmi-sp") || hasExactWordOrPhrase(lower, "psp")) certs.add("PMI-SP / PSP (Planning & Scheduling Professional)");
  if (hasExactWordOrPhrase(lower, "csm") || hasExactWordOrPhrase(lower, "psm") || lower.includes("scrum master")) certs.add("Scrum Master (CSM/PSM)");

  // Construction, Safety & Engineering
  if (hasExactWordOrPhrase(lower, "cscs")) certs.add("CSCS Accredited");
  if (hasExactWordOrPhrase(lower, "smsts")) certs.add("SMSTS (Site Management Safety)");
  if (hasExactWordOrPhrase(lower, "sssts")) certs.add("SSSTS (Site Supervisor Safety)");
  if (hasExactWordOrPhrase(lower, "nebosh")) certs.add("NEBOSH Certificate");
  if (hasExactWordOrPhrase(lower, "iosh")) certs.add("IOSH Managing Safely");
  if (hasExactWordOrPhrase(lower, "ceng") || lower.includes("chartered engineer")) certs.add("Chartered Engineer (CEng)");
  if (hasExactWordOrPhrase(lower, "ieng") || lower.includes("incorporated engineer")) certs.add("Incorporated Engineer (IEng)");
  if (hasExactWordOrPhrase(lower, "mrics") || hasExactWordOrPhrase(lower, "rics")) certs.add("MRICS / RICS Chartered");
  if (hasExactWordOrPhrase(lower, "pe") && /\b(pe license|professional engineer|pe exam)\b/i.test(text)) certs.add("Professional Engineer (PE)");

  // Cloud & Technology
  if (hasExactWordOrPhrase(lower, "aws certified") || lower.includes("aws solutions architect")) certs.add("AWS Certified");
  if (lower.includes("azure certified") || lower.includes("microsoft certified")) certs.add("Microsoft Certified: Azure");
  if (lower.includes("gcp certified") || lower.includes("google cloud certified")) certs.add("Google Cloud Certified");

  // Finance & Quality
  if (hasExactWordOrPhrase(lower, "acca")) certs.add("ACCA Qualified");
  if (hasExactWordOrPhrase(lower, "cima")) certs.add("CIMA Qualified");
  if (hasExactWordOrPhrase(lower, "cpa")) certs.add("CPA");
  if (hasExactWordOrPhrase(lower, "cfa")) certs.add("CFA Charterholder");
  if (lower.includes("six sigma") || lower.includes("lean six sigma")) certs.add("Lean Six Sigma");

  return Array.from(certs);
}

/**
 * Extract highest degree, major/field, and educational institution
 */
function extractEducation(text: string): {
  degree: CandidateCapabilityProfile["highestDegree"];
  field?: string;
  institution?: string;
} {
  const lower = text.toLowerCase();
  let degree: CandidateCapabilityProfile["highestDegree"] = "Not Detected";
  let field: string | undefined;
  let institution: string | undefined;

  // 1. Degree Level
  if (/\b(ph\.?d|doctorate|doctor of philosophy)\b/i.test(lower)) degree = "Doctorate";
  else if (/\b(master'?s?|m\.?sc|m\.?eng|mba|m\.?tech|postgraduate|msc)\b/i.test(lower)) degree = "Master's";
  else if (/\b(bachelor'?s?|b\.?sc|b\.?eng|b\.?tech|undergraduate|btech|bsc|beng)\b/i.test(lower)) degree = "Bachelor's";
  else if (/\b(diploma|associate'?s?|hnd|hnc)\b/i.test(lower)) degree = "Diploma / Technical";

  // 2. Field of Study
  const degreePatterns = [
    /(?:m\.?sc|m\.?tech|m\.?eng|mba|master(?:'s)?(?:\s+of\s+[a-z]+)?)\s+(?:in\s+|of\s+)?([A-Za-z\s&,]{3,50}?)(?:\s+(?:from|at|,|\n|\r|brunel|university|college|institute)|$)/i,
    /(?:b\.?tech|b\.?sc|b\.?eng|bachelor(?:'s)?(?:\s+of\s+[a-z]+)?)\s+(?:in\s+|of\s+)?([A-Za-z\s&,]{3,50}?)(?:\s+(?:from|at|,|\n|\r|university|college|institute)|$)/i,
    /\b(?:degree|major|specialization|graduated)\s+in\s+([A-Za-z\s&]{3,40})/i,
    /\b(?:in|of)\s+([A-Za-z\s&]{3,35})(?:\s+from|\s+university|\s+college|\n|$)/i,
  ];

  for (const pat of degreePatterns) {
    const m = text.match(pat);
    if (m && m[1]) {
      const candidateField = m[1].replace(/\s+(university|college|institute|london|india|uk|technology)$/i, "").trim();
      if (candidateField.length >= 3 && !/^(degree|science|engineering|management|arts)$/i.test(candidateField)) {
        field = candidateField;
        break;
      }
    }
  }

  // 3. Institution
  const instMatch = text.match(/([A-Z][A-Za-z\s&]{3,40}(?:University|College|Institute|Polytechnic)(?:\s+[A-Z][A-Za-z]+)?)/);
  if (instMatch) {
    institution = instMatch[1].trim();
  }

  return { degree, field, institution };
}

/**
 * Extract estimated professional experience years
 */
function extractYearsOfExperience(text: string): number {
  const lower = text.toLowerCase();

  // 1. Direct statement (e.g. "5+ years of experience", "4 years experience")
  const yearMatches = text.match(/(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience)?/gi);
  if (yearMatches && yearMatches.length > 0) {
    const nums = yearMatches.map((m) => parseInt(m.replace(/\D/g, ""), 10)).filter((n) => n > 0 && n < 45);
    if (nums.length > 0) return Math.max(...nums);
  }

  // 2. Date ranges in text: e.g. "2019 - 2024", "Oct 2021 - Present", "2018 to Present"
  const currentYear = new Date().getFullYear();
  const yearTokens = Array.from(text.matchAll(/\b(200\d|201\d|202\d)\b/g)).map((m) => parseInt(m[1], 10));
  if (yearTokens.length >= 2) {
    const minYear = Math.min(...yearTokens);
    const hasPresent = /\b(present|current|ongoing|date)\b/i.test(lower);
    const maxYear = hasPresent ? currentYear : Math.max(...yearTokens);
    const span = maxYear - minYear;
    if (span >= 1 && span <= 40) {
      return span;
    }
  }

  return 3; // sensible standard default
}

// ── UNIVERSAL CAREER INTELLIGENCE ENGINE IMPLEMENTATION ──────────────────────

export class CareerIntelligenceEngine {

  /**
   * 1. Extract Structured Candidate Profile from any CV or raw input
   */
  public static extractCandidateProfile(rawText: string): CandidateCapabilityProfile {
    const text = rawText.trim();
    const lower = text.toLowerCase();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // Identity Extraction
    const nameMatch = lines[0] && lines[0].length < 50 && !lines[0].includes("@") && !lines[0].startsWith("http")
      ? lines[0]
      : undefined;

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
    const linkedInMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);

    // Target Country Detection
    let targetCountry: string | undefined = undefined;
    if (/\b(uk|united kingdom|london|england|britain|skilled worker|cos|tier 2)\b/i.test(text)) {
      targetCountry = "GB";
    } else if (/\b(us|usa|united states|america|h-1b|h1b)\b/i.test(text)) {
      targetCountry = "US";
    } else if (/\b(australia|sydney|melbourne|brisbane|tss 482|subclass 482)\b/i.test(text)) {
      targetCountry = "AU";
    } else if (/\b(canada|toronto|vancouver|lmia)\b/i.test(text)) {
      targetCountry = "CA";
    } else if (/\b(new zealand|auckland|aewv)\b/i.test(text)) {
      targetCountry = "NZ";
    }

    // Capability Extraction with STRICT Word Boundaries
    const matchedCaps = new Set<string>();
    const tools = new Set<string>();
    const standards = new Set<string>();

    for (const [key, def] of Object.entries(UNIVERSAL_CAPABILITIES)) {
      let isMatch = hasExactWordOrPhrase(lower, key);
      if (!isMatch && def.synonyms.length > 0) {
        isMatch = def.synonyms.some((syn) => hasExactWordOrPhrase(lower, syn));
      }

      if (isMatch) {
        matchedCaps.add(def.label);
        if (def.category === "engineering" || def.category === "planning" || def.category === "technology" || def.category === "data") {
          tools.add(def.label);
        }
        if (key.includes("management") || key.includes("compliance") || key.includes("controls") || key.includes("administration") || key.includes("coordination")) {
          standards.add(def.label);
        }
      }
    }

    // Explicit Project Controls & Planning tool detection
    if (hasExactWordOrPhrase(lower, "primavera p6") || hasExactWordOrPhrase(lower, "p6")) tools.add("Primavera P6");
    if (hasExactWordOrPhrase(lower, "ms project") || hasExactWordOrPhrase(lower, "microsoft project")) tools.add("Microsoft Project");
    if (hasExactWordOrPhrase(lower, "power bi") || hasExactWordOrPhrase(lower, "powerbi")) tools.add("Power BI");
    if (hasExactWordOrPhrase(lower, "oracle erp")) tools.add("Oracle ERP");
    if (hasExactWordOrPhrase(lower, "autocad") || hasExactWordOrPhrase(lower, "civil 3d")) tools.add("AutoCAD / Civil 3D");

    // Years of Experience Extraction
    const years = extractYearsOfExperience(text);

    // Seniority Calculation
    let seniority: SeniorityTier = "Mid-Level";
    let autonomy: CandidateCapabilityProfile["autonomyLevel"] = "Individual Contributor";
    if (years >= 8 || /\b(lead|principal|head of|director|manager)\b/i.test(lower)) {
      seniority = /\b(director|head of|vp|chief)\b/i.test(lower) ? "Executive" : "Lead / Principal";
      autonomy = seniority === "Executive" ? "Executive Director" : "Project / Team Manager";
    } else if (years >= 4 || /\b(senior|sr\.)\b/i.test(lower)) {
      seniority = "Senior";
      autonomy = "Technical Lead";
    } else if (years <= 2 || /\b(graduate|junior|entry|assistant|intern)\b/i.test(lower)) {
      seniority = "Graduate / Entry";
      autonomy = "Individual Contributor";
    }

    // Headline Role Extraction
    // Headline Role Extraction
    let headlineRole = "General Professional";

    // Pass 1: Delimited title lines (e.g. "Project Coordinator | Planning & Controls")
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      if (
        (line.includes("|") || line.includes(" - ") || line.includes("•")) &&
        line.length < 90 &&
        !line.includes("@") &&
        !line.startsWith("http") &&
        !/^\+?\d/.test(line)
      ) {
        headlineRole = line.replace(/^[•\-\s]+/, "").trim();
        break;
      }
    }

    // Pass 2: Clean single-title lines near the top
    if (headlineRole === "General Professional") {
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i].trim();
        if (
          /^(?:Senior\s+|Lead\s+|Principal\s+|Junior\s+|Assistant\s+)?(?:Civil|Structural|Mechanical|Electrical|Project|Full Stack|Frontend|Backend|Software|DevOps|Cloud|Data|BIM|Site|Construction|Planning|Commercial|Operations|Quality|Quantity|Healthcare|Clinical)\s+(?:Engineer|Coordinator|Manager|Specialist|Developer|Analyst|Consultant|Surveyor|Architect|Lead|Director|Planner|Estimator|Nurse|Accountant)$/i.test(line)
        ) {
          headlineRole = line;
          break;
        }
      }
    }

    // Pass 3: Extract role from summary sentences (e.g. "Project Coordinator with 5+ years of experience..." or "Senior Civil Engineer with 6 years...")
    if (headlineRole === "General Professional") {
      const roleRegex = /\b((?:Senior\s+|Lead\s+|Principal\s+|Junior\s+|Assistant\s+)?(?:Civil|Structural|Mechanical|Electrical|Project|Full Stack|Frontend|Backend|Software|DevOps|Cloud|Data|BIM|Site|Construction|Planning|Commercial|Operations|Quality|Quantity|Healthcare|Clinical)\s+(?:Engineer|Coordinator|Manager|Specialist|Developer|Analyst|Consultant|Surveyor|Architect|Lead|Director|Planner|Estimator|Nurse|Accountant))\b/i;
      
      for (let i = 0; i < Math.min(12, lines.length); i++) {
        const line = lines[i];
        if (line.includes("@") || line.startsWith("http")) continue;
        const match = line.match(roleRegex);
        if (match && match[1]) {
          headlineRole = match[1].trim();
          break;
        }
      }
    }

    // Pass 4: Fallback across full text if still General Professional
    if (headlineRole === "General Professional") {
      const roleRegex = /\b((?:Senior\s+|Lead\s+|Principal\s+|Junior\s+|Assistant\s+)?(?:Civil|Structural|Mechanical|Electrical|Project|Full Stack|Frontend|Backend|Software|DevOps|Cloud|Data|BIM|Site|Construction|Planning|Commercial|Operations|Quality|Quantity)\s+(?:Engineer|Coordinator|Manager|Specialist|Developer|Analyst|Consultant|Surveyor|Architect|Lead|Director|Planner|Estimator|Nurse|Accountant))\b/i;
      const match = text.match(roleRegex);
      if (match && match[1]) {
        headlineRole = match[1].trim();
      }
    }

    // Universal Primary Function & Industry Classification
    let primaryIndustry = "Cross-Functional Professional Services";
    let primaryFunction = headlineRole;
    const subIndustries: string[] = [];

    const isInfraOrConstruction =
      /\b(civil|infrastructure|construction|site|telecommunications|residential|water|planning & controls|project controls|subcontractor|earthworks|highways|structural|surveyor)\b/i.test(lower);
    const isTech =
      /\b(software engineer|software developer|full stack|frontend developer|backend developer|cloud engineer|devops engineer|data engineer|machine learning engineer|web developer)\b/i.test(lower);
    const isHealthcare =
      /\b(nurse|nursing|clinical care|patient care|hospital|medical doctor|physician)\b/i.test(lower);
    const isFinance =
      /\b(accounting|accountant|financial analyst|audit|tax compliance|ifrs|general ledger|quantity surveying)\b/i.test(lower);

    if (isInfraOrConstruction) {
      primaryIndustry = "Construction, Infrastructure & Engineering";
      if (lower.includes("telecom")) subIndustries.push("Telecommunications");
      if (lower.includes("water")) subIndustries.push("Water & Utilities");
      if (lower.includes("residential")) subIndustries.push("Residential & Commercial Building");
      if (lower.includes("civil") || lower.includes("infrastructure")) subIndustries.push("Civil Infrastructure");
      
      if (lower.includes("controls") || lower.includes("planning") || lower.includes("primavera") || lower.includes("p6") || lower.includes("evm")) {
        primaryFunction = "Project Planning, Controls & Infrastructure Delivery";
      } else if (lower.includes("civil") || lower.includes("structural")) {
        primaryFunction = "Civil & Structural Engineering Execution";
      } else {
        primaryFunction = "Construction Project Operations & Site Coordination";
      }
    } else if (isTech) {
      primaryIndustry = "Information Technology & Software";
      primaryFunction = "Software Architecture & System Engineering";
    } else if (isHealthcare) {
      primaryIndustry = "Healthcare & Clinical Services";
      primaryFunction = "Clinical Nursing & Healthcare Delivery";
    } else if (isFinance) {
      primaryIndustry = "Finance & Commercial Accounting";
      primaryFunction = "Financial Reporting, Analysis & Commercial Controls";
    }

    // Education & Certifications Extraction
    const edu = extractEducation(text);
    const certifications = extractCertifications(text);

    // Dynamic Transferable Career Pathways Discovery
    const transferableCareerPathways: CandidateCapabilityProfile["transferableCareerPathways"] = [];
    const transferableRolesList: string[] = [];

    // Branch A: Project Controls, Planning, EVM or P6 background
    if (
      matchedCaps.has("Primavera P6") ||
      matchedCaps.has("Microsoft Project") ||
      matchedCaps.has("Earned Value Management (EVM)") ||
      matchedCaps.has("Critical Path Method (CPM)") ||
      lower.includes("project controls") ||
      lower.includes("project planning") ||
      lower.includes("project coordinator")
    ) {
      transferableCareerPathways.push(
        { targetRole: "Project Controls Specialist / Engineer", rationale: "Direct mastery of EVM, WBS, delay analysis, and Primavera P6 baseline scheduling.", affinityScore: 95 },
        { targetRole: "Planning Engineer / Project Planner", rationale: "Demonstrated competence in critical path method (CPM), resource loading, and schedule monitoring.", affinityScore: 92 },
        { targetRole: "Assistant Project Manager (Infrastructure)", rationale: "Strong multi-stakeholder management, contractor coordination, and progress reporting background.", affinityScore: 88 },
        { targetRole: "Project Engineer (Capital Schemes)", rationale: "Bridges technical package execution with timeline governance and subcontractor management.", affinityScore: 84 },
        { targetRole: "Construction Project Manager", rationale: "Progressive advancement into full delivery accountability backed by rigorous project controls discipline.", affinityScore: 80 }
      );
    }
    // Branch B: Civil, Site & Structural Engineering
    else if (isInfraOrConstruction) {
      transferableCareerPathways.push(
        { targetRole: "Senior Civil Engineer / Civil Engineer", rationale: "Core competencies in civil design, AutoCAD/Civil 3D, and infrastructure execution.", affinityScore: 95 },
        { targetRole: "Project Engineer", rationale: "Strong site execution and technical package delivery translates directly to project engineering.", affinityScore: 92 },
        { targetRole: "Assistant Project Manager", rationale: "Experience coordinating multidisciplinary subcontractors and site safety empowers project delivery management.", affinityScore: 88 },
        { targetRole: "Site Manager / Site Agent", rationale: "Direct operational experience in on-site logistics, safety compliance, and package handover.", affinityScore: 84 },
        { targetRole: "Construction Manager", rationale: "High transferability from engineering management to whole-site construction execution.", affinityScore: 80 }
      );
    }
    // Branch C: Technology & Software
    else if (isTech) {
      transferableCareerPathways.push(
        { targetRole: "Full Stack Engineer", rationale: "Bridges frontend and backend services with end-to-end delivery.", affinityScore: 92 },
        { targetRole: "DevOps & Cloud Engineer", rationale: "Leverages software background to automate CI/CD pipelines and infrastructure.", affinityScore: 88 },
        { targetRole: "Technical Product Manager", rationale: "Translates technical system design into customer-focused product requirements.", affinityScore: 80 }
      );
    }
    // Branch D: Finance & Commercial
    else if (isFinance) {
      transferableCareerPathways.push(
        { targetRole: "Management Accountant / Finance Analyst", rationale: "Strong grounding in general ledger, forecasting, and commercial analysis.", affinityScore: 92 },
        { targetRole: "Commercial Manager / Quantity Surveyor", rationale: "Translates financial controls to project commercial governance and cost management.", affinityScore: 85 }
      );
    }
    // Branch E: Healthcare
    else if (isHealthcare) {
      transferableCareerPathways.push(
        { targetRole: "Staff Nurse / Registered Nurse", rationale: "Direct clinical care, medication administration, and patient assessment practice.", affinityScore: 95 },
        { targetRole: "Clinical Team Leader / Charge Nurse", rationale: "Supervises multidisciplinary care delivery and ensures regulatory standards.", affinityScore: 88 }
      );
    }
    // Branch F: General Operations
    else {
      transferableCareerPathways.push(
        { targetRole: "Operations Coordinator", rationale: "Strong cross-functional organization and process coordination.", affinityScore: 85 },
        { targetRole: "Project Delivery Specialist", rationale: "Structured planning and stakeholder communication skills.", affinityScore: 80 }
      );
    }

    transferableRolesList.push(...transferableCareerPathways.map((p) => p.targetRole));

    return {
      identity: {
        name: nameMatch,
        email: emailMatch ? emailMatch[0] : undefined,
        phone: phoneMatch ? phoneMatch[0] : undefined,
        linkedIn: linkedInMatch ? `https://${linkedInMatch[0]}` : undefined,
        targetCountry,
      },
      headlineRole,
      normalizedRole: headlineRole.split("|")[0].trim(),
      primaryFunction,
      secondaryFunctions: subIndustries,
      coreCapabilities: Array.from(matchedCaps),
      toolsAndSoftware: Array.from(tools),
      methodologiesAndStandards: Array.from(standards),
      governanceAndRegulations: [],
      primaryIndustry,
      subIndustries,
      yearsOfExperience: years,
      seniority,
      autonomyLevel: autonomy,
      hasBudgetExposure: /\b(budget|cost control|p&l|financial monitoring|cvr|valua)\b/i.test(lower),
      hasPeopleLeadership: /\b(supervised|led|managed a team|mentored|coordinated teams)\b/i.test(lower),
      highestDegree: edu.degree,
      degreeField: edu.field,
      certifications,
      transferableCareerPathways,
      transferableRolesList,
      rawSummary: text.slice(0, 500),
    };
  }

  /**
   * 2. Normalize and profile any raw database Job Listing
   */
  public static extractJobProfile(job: PublicJobDTO | any): JobRequirementProfile {
    const rawTitle = (job.title || "").trim();
    // Clean job title of job codes, req numbers, and location prefixes
    const title = rawTitle
      .replace(/^(\d{4,}|\b[A-Z]{2,}\/\d+\b|req\s*\d+|job\s*id\s*[:#-]?\s*\d+)\s*[-:–|]\s*/i, "")
      .replace(/\s*[-:–|]\s*(\d{4,}|\b[A-Z]{2,}\/\d+\b)\s*$/i, "")
      .replace(/\s*\((?:hybrid|remote|onsite|full[- ]time|contract|permanent|\d+)\)\s*/gi, " ")
      .trim() || rawTitle;

    const desc = (job.description || job.descriptionClean || "").trim();
    const lower = `${title} ${desc}`.toLowerCase();
    const titleLower = title.toLowerCase();

    // Mandatory capabilities from job description
    const mandatoryCaps: string[] = [];
    const tools: string[] = [];

    for (const [key, def] of Object.entries(UNIVERSAL_CAPABILITIES)) {
      if (hasExactWordOrPhrase(lower, key) || def.synonyms.some((s) => hasExactWordOrPhrase(lower, s))) {
        mandatoryCaps.push(def.label);
        if (def.category === "engineering" || def.category === "planning" || def.category === "technology" || def.category === "data") {
          tools.push(def.label);
        }
      }
    }

    // Contextual capability inference from title if vacancy description is terse
    if (/planning engineer|project planner|scheduler|project controls/i.test(titleLower)) {
      if (!mandatoryCaps.includes("Project Planning & Scheduling")) mandatoryCaps.push("Project Planning & Scheduling");
      if (!mandatoryCaps.includes("Project Controls & Tracking")) mandatoryCaps.push("Project Controls & Tracking");
      if (!tools.includes("Primavera P6")) tools.push("Primavera P6");
    }
    if (/bim|revit|building information/i.test(titleLower)) {
      if (!mandatoryCaps.includes("BIM (Building Information Modeling)")) mandatoryCaps.push("BIM (Building Information Modeling)");
      if (!tools.includes("Revit")) tools.push("Revit");
      if (!tools.includes("AutoCAD")) tools.push("AutoCAD");
    }
    if (/civil engineer|structural engineer|infrastructure engineer/i.test(titleLower)) {
      if (!mandatoryCaps.includes("Infrastructure Delivery")) mandatoryCaps.push("Infrastructure Delivery");
      if (!mandatoryCaps.includes("Structural Analysis & Design")) mandatoryCaps.push("Structural Analysis & Design");
      if (!tools.includes("AutoCAD")) tools.push("AutoCAD");
    }
    if (/construction manager|site manager|site engineer/i.test(titleLower)) {
      if (!mandatoryCaps.includes("Site Supervision & Inspection")) mandatoryCaps.push("Site Supervision & Inspection");
      if (!mandatoryCaps.includes("Health & Safety Compliance")) mandatoryCaps.push("Health & Safety Compliance");
    }
    if (/project manager|assistant project manager/i.test(titleLower)) {
      if (!mandatoryCaps.includes("Project Management & Delivery")) mandatoryCaps.push("Project Management & Delivery");
      if (!mandatoryCaps.includes("Stakeholder Management")) mandatoryCaps.push("Stakeholder Management");
      if (!mandatoryCaps.includes("Risk Management")) mandatoryCaps.push("Risk Management");
    }
    if (/full stack|software engineer|frontend|backend/i.test(titleLower)) {
      if (!mandatoryCaps.includes("Software Engineering & Architecture")) mandatoryCaps.push("Software Engineering & Architecture");
    }
    if (/data analyst|bi analyst|data engineer/i.test(titleLower)) {
      if (!mandatoryCaps.includes("Data Analysis & Insights")) mandatoryCaps.push("Data Analysis & Insights");
      if (!tools.includes("SQL & Relational Databases")) tools.push("SQL & Relational Databases");
    }

    // Min Years experience
    let minYears = 2;
    const expMatch = lower.match(/(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience)?/i);
    if (expMatch) minYears = parseInt(expMatch[1], 10);

    let seniority: SeniorityTier = "Mid-Level";
    if (minYears >= 7 || /\b(principal|lead|director|head of)\b/i.test(title)) seniority = "Lead / Principal";
    else if (minYears >= 4 || /\b(senior|sr\.)\b/i.test(title)) seniority = "Senior";
    else if (minYears <= 2 || /\b(graduate|junior|entry|assistant)\b/i.test(title)) seniority = "Graduate / Entry";

    // Sponsorship Viability Assessment (Decoupled from career relevance)
    let sponsorshipCertainty: SponsorshipCertainty = "NO_SPONSORSHIP_FOUND";
    let sponsorshipViability = 40;
    let evidence = "Sponsorship information not explicitly provided in this vacancy text.";

    const hasExplicitVisaClause =
      /\b(visa sponsorship|certificate of sponsorship|cos|tier 2|skilled worker visa|h-1b|tss 482|subclass 482|lmia approved|sponsorship provided)\b/i.test(lower) ||
      /\b(we provide visa sponsorship|eligible for sponsorship|sponsor licence ready)\b/i.test(lower);

    const hasNegativeRightToWork =
      /\b(must have (the )?right to work|no visa sponsorship|not eligible for (visa )?sponsorship|cannot sponsor)\b/i.test(lower);

    const isExplicitlySponsored = !hasNegativeRightToWork && (hasExplicitVisaClause || job.has_sponsorship === 1 || job.sponsorship?.label === "Strong" || job.sponsorship_label === "Strong");
    const isEmployerLicensed = !hasNegativeRightToWork && (job.is_direct || (job.sponsorship_score && job.sponsorship_score >= 80) || (job.sponsorshipConfidence && job.sponsorshipConfidence >= 80));

    if (isExplicitlySponsored) {
      sponsorshipCertainty = "CONFIRMED_IN_LISTING";
      sponsorshipViability = 98;
      evidence = "Explicit visa sponsorship eligibility confirmed directly in this listing with statutory employer accreditation.";
    } else if (isEmployerLicensed) {
      sponsorshipCertainty = "HISTORICAL_EMPLOYER_SPONSOR";
      sponsorshipViability = 82;
      evidence = `${job.company?.name || job.company_name || "Employer"} is an active licensed sponsor on the statutory government sponsor register.`;
    } else {
      sponsorshipCertainty = "NO_SPONSORSHIP_FOUND";
      sponsorshipViability = 45;
      evidence = "Standard commercial vacancy; visa sponsorship eligibility must be verified directly with the employer during interview.";
    }

    return {
      jobId: job.id || "job_unknown",
      title,
      normalizedTitle: title.toLowerCase(),
      companyName: job.company?.name || job.company_name || "Verified Employer",
      countryCode: job.location?.country || job.country_code || "GB",
      city: job.location?.city || job.city || undefined,
      industry: job.category?.name || job.category_name || "Professional Services",
      seniority,
      minYearsExperience: minYears,
      mandatoryCapabilities: mandatoryCaps,
      preferredCapabilities: [],
      tools,
      salaryMin: job.salary?.min ?? job.salary_min ?? undefined,
      salaryMax: job.salary?.max ?? job.salary_max ?? undefined,
      salaryCurrency: job.salary?.currency ?? job.salary_currency ?? "GBP",
      sponsorshipCertainty,
      sponsorshipViabilityScore: sponsorshipViability,
      sponsorshipEvidence: evidence,
      rawDescription: desc,
    };
  }

  /**
   * 3. Compute Deep 5-Axis Multidimensional Match between Candidate and Job
   */
  public static calculateUniversalMatch(
    candidate: CandidateCapabilityProfile,
    job: JobRequirementProfile
  ): MatchOpportunity["breakdown"] & { careerScore: number; matchTier: MatchTier; tierLabel: string } {
    const jobTitleLower = job.title.toLowerCase();
    const candTitleLower = candidate.headlineRole.toLowerCase();

    // ── Axis 1: Functional Capability & Tools Overlap (30% Weight) ──
    const candCaps = new Set(candidate.coreCapabilities.map((c) => c.toLowerCase()));
    const candTools = new Set(candidate.toolsAndSoftware.map((t) => t.toLowerCase()));

    const matchedCaps: string[] = [];
    const missingCaps: string[] = [];
    const matchedTools: string[] = [];
    const missingTools: string[] = [];

    job.mandatoryCapabilities.forEach((cap) => {
      const cLower = cap.toLowerCase();
      if (candCaps.has(cLower) || Array.from(candCaps).some((c) => c.includes(cLower) || cLower.includes(c))) {
        matchedCaps.push(cap);
      } else {
        missingCaps.push(cap);
      }
    });

    job.tools.forEach((t) => {
      const tLower = t.toLowerCase();
      if (candTools.has(tLower) || Array.from(candTools).some((ct) => ct.includes(tLower) || tLower.includes(ct))) {
        matchedTools.push(t);
      } else {
        missingTools.push(t);
      }
    });

    const totalJobDemands = Math.max(1, job.mandatoryCapabilities.length);
    let capabilityScore = Math.min(100, Math.round((matchedCaps.length / totalJobDemands) * 100));
    // If candidate has strong planning/engineering software (P6, MS Project, AutoCAD) that job mentions
    if (matchedTools.length > 0 && capabilityScore < 60) {
      capabilityScore = Math.min(100, capabilityScore + matchedTools.length * 15);
    }

    // ── Axis 2: Scope & Seniority Compatibility (25% Weight) ──
    let scopeScore = 100;
    const expDiff = candidate.yearsOfExperience - job.minYearsExperience;
    if (expDiff < 0) {
      scopeScore = Math.max(30, 100 - Math.abs(expDiff) * 20);
    } else if (expDiff >= 0 && expDiff <= 5) {
      scopeScore = 100;
    } else {
      scopeScore = 95; // slight taper for overqualification
    }

    // ── Axis 3: Domain & Industry Context (20% Weight) ──
    let domainScore = 20;
    const candIndTokens = candidate.primaryIndustry.toLowerCase().split(/[\s/&,]+/).filter((t) => t.length >= 4);
    const jobIndTokens = job.industry.toLowerCase().split(/[\s/&,]+/).filter((t) => t.length >= 4);
    const hasIndOverlap = candIndTokens.some((t) => jobIndTokens.some((jt) => jt.includes(t) || t.includes(jt)));

    if (hasIndOverlap) {
      domainScore = 100;
    } else if (candidate.subIndustries.some((sub) => job.rawDescription.toLowerCase().includes(sub.toLowerCase()))) {
      domainScore = 90;
    } else {
      // Check cross-domain penalty
      const isCandidateInfra = /construction|infrastructure|engineering/i.test(candidate.primaryIndustry);
      const isJobInfra = /construction|infrastructure|engineering|civil|site|builder|transport/i.test(job.industry + " " + job.title);
      if (isCandidateInfra && isJobInfra) {
        domainScore = 95;
      }
    }

    // Gating: If domain has no overlap and zero matching capabilities, cross-domain experience cannot transfer fully
    if (domainScore <= 30 && capabilityScore < 20) {
      scopeScore = Math.min(scopeScore, 25);
    }

    // ── Axis 4: Career Trajectory & Role Continuity (15% Weight) ──
    let trajectoryScore = 50;
    let transferabilityRationale = "";

    const candNormalizedLower = (candidate.normalizedRole || "").toLowerCase();
    const isDirectTitleMatch =
      hasExactWordOrPhrase(jobTitleLower, candTitleLower) ||
      hasExactWordOrPhrase(candTitleLower, jobTitleLower) ||
      (candNormalizedLower.length >= 4 &&
        (hasExactWordOrPhrase(jobTitleLower, candNormalizedLower) ||
          hasExactWordOrPhrase(candNormalizedLower, jobTitleLower)));

    // Check if job matches one of candidate's dynamic transferable pathways
    const pathwayMatch = candidate.transferableCareerPathways.find((p) => {
      const pLower = p.targetRole.toLowerCase();
      return hasExactWordOrPhrase(jobTitleLower, pLower) || jobTitleLower.includes(pLower);
    });

    if (isDirectTitleMatch) {
      trajectoryScore = 100;
      transferabilityRationale = `Direct role continuity: You already perform the core deliverables required for "${job.title}".`;
    } else if (pathwayMatch) {
      trajectoryScore = pathwayMatch.affinityScore;
      transferabilityRationale = pathwayMatch.rationale;
    } else {
      // Generic title words that should not by themselves confer high disciplinary alignment
      const GENERIC_TITLE_WORDS = new Set([
        "project", "engineer", "engineering", "coordinator", "manager", "management",
        "specialist", "officer", "associate", "consultant", "director", "lead",
        "senior", "assistant", "junior", "technician", "general", "delivery"
      ]);

      const candWords = candTitleLower.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
      const jobWords = jobTitleLower.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
      const sharedWords = candWords.filter((w) => jobWords.includes(w));
      const distinctiveSharedWords = sharedWords.filter((w) => !GENERIC_TITLE_WORDS.has(w));

      if (distinctiveSharedWords.length > 0) {
        trajectoryScore = Math.min(92, 70 + distinctiveSharedWords.length * 12);
        transferabilityRationale = `Strong functional alignment in ${distinctiveSharedWords.join(" and ")} deliverables.`;
      } else if (sharedWords.length >= 2) {
        trajectoryScore = 70;
        transferabilityRationale = `Related delivery responsibilities in ${sharedWords.join(" and ")}.`;
      } else if (sharedWords.length === 1 && GENERIC_TITLE_WORDS.has(sharedWords[0])) {
        // Only a generic title noun matches (e.g., both have "project" or "engineer")
        trajectoryScore = 55;
        transferabilityRationale = `Adjacent operational context within ${candidate.primaryIndustry}.`;
      } else if (domainScore >= 90 && capabilityScore >= 60) {
        trajectoryScore = 65;
        transferabilityRationale = `Transferable transition within ${candidate.primaryIndustry} supported by matching software and deliverable capabilities.`;
      } else {
        trajectoryScore = 30;
      }
    }

    // ── Axis 5: Credentials & Education (10% Weight) ──
    let credScore = 85;
    if (candidate.highestDegree === "Master's" || candidate.highestDegree === "Doctorate") credScore = 100;
    else if (candidate.highestDegree === "Bachelor's") credScore = 90;

    // ── Weighted Composite Calculation ──
    let careerScore = Math.round(
      capabilityScore * 0.30 +
      scopeScore * 0.25 +
      domainScore * 0.20 +
      trajectoryScore * 0.15 +
      credScore * 0.10
    );

    // ── Geometric Domain Gate (Guarding Against Cross-Domain Anomalies) ──
    if (domainScore < 50 && trajectoryScore < 50) {
      careerScore = Math.min(careerScore, 25); // Hard block (e.g. Healthcare Nurse to Civil Engineer)
    }

    // ── Match Tier Classification ──
    let matchTier: MatchTier = "TRANSFERABLE_PATHWAY";
    let tierLabel = "Transferable Pathway";

    if (careerScore >= 85 && (isDirectTitleMatch || trajectoryScore >= 90)) {
      matchTier = "DIRECT_MATCH";
      tierLabel = "Direct Match";
    } else if (careerScore >= 75 && (pathwayMatch || domainScore >= 90 || trajectoryScore >= 80)) {
      matchTier = "ADJACENT_MATCH";
      tierLabel = "Adjacent Opportunity";
    } else if (careerScore >= 60) {
      matchTier = "TRANSFERABLE_PATHWAY";
      tierLabel = "Transferable Pathway";
    } else {
      matchTier = "STRETCH_MATCH";
      tierLabel = "Stretch Opportunity";
    }

    // ── Explainability Matrix Formulation ──
    const whyYouMatch: string[] = [];
    const whatIsMissing: string[] = [];
    const howToImprove: string[] = [];

    if (transferabilityRationale) {
      whyYouMatch.push(transferabilityRationale);
    }
    if (matchedCaps.length > 0) {
      whyYouMatch.push(`Competency Overlap: You demonstrate verified practice in ${matchedCaps.slice(0, 4).join(", ")}.`);
    }
    if (matchedTools.length > 0) {
      whyYouMatch.push(`Software & Systems: Matching proficiency in ${matchedTools.slice(0, 3).join(", ")}.`);
    }
    if (scopeScore >= 90) {
      whyYouMatch.push(`Experience Requirement: Your ${candidate.yearsOfExperience} years background aligns with employer expectations (${job.minYearsExperience}+ years).`);
    }

    if (missingCaps.length > 0) {
      whatIsMissing.push(`Key Requirement: Listing asks for experience with ${missingCaps.slice(0, 3).join(", ")}.`);
      howToImprove.push(`Emphasize any project exposure to ${missingCaps.slice(0, 2).join(" and ")} in your application cover letter.`);
    }
    if (expDiff < 0) {
      whatIsMissing.push(`Seniority Step: Role requests ~${job.minYearsExperience} years experience, whereas profile indicates ~${candidate.yearsOfExperience} years.`);
    }

    return {
      careerScore: Math.min(99, Math.max(15, careerScore)),
      matchTier,
      tierLabel,
      capabilityOverlapScore: capabilityScore,
      scopeAndSeniorityScore: scopeScore,
      domainAffinityScore: domainScore,
      trajectoryFitScore: trajectoryScore,
      credentialsScore: credScore,
      sponsorshipViabilityScore: job.sponsorshipViabilityScore,
      matchedCapabilities: matchedCaps,
      missingCapabilities: missingCaps,
      matchedTools,
      missingTools,
      transferabilityRationale,
      whyYouMatch,
      whatIsMissing,
      howToImprove,
      sponsorshipStatus: {
        certainty: job.sponsorshipCertainty,
        badgeLabel:
          job.sponsorshipCertainty === "CONFIRMED_IN_LISTING"
            ? "Confirmed Sponsorship"
            : job.sponsorshipCertainty === "HISTORICAL_EMPLOYER_SPONSOR"
            ? "Verified Licensed Sponsor"
            : "Sponsorship Unconfirmed",
        description: job.sponsorshipEvidence,
        evidence: job.sponsorshipEvidence,
      },
    };
  }

  /**
   * 4. Multi-Job High-Recall Retrieval & Intelligent Ranking across DB
   */
  public static async rankMatchingJobs(
    candidate: CandidateCapabilityProfile,
    options?: { country?: string; limit?: number }
  ): Promise<MatchOpportunity[]> {
    const limit = options?.limit || 24;
    const country = options?.country && options.country !== "ALL"
      ? options.country
      : (candidate.identity.targetCountry || undefined);

    const db = getDatabase();
    const candidateJobsMap = new Map<string, any>();

    // ── Phase 1: High-Precision Direct & Transferable Role Archetypes ──
    const roleTitles = [
      candidate.headlineRole,
      candidate.normalizedRole,
      ...candidate.transferableRolesList,
    ].filter(Boolean);

    const roleTokens = new Set<string>();
    roleTitles.forEach((r) => {
      const clean = r.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
      roleTokens.add(clean);
      clean.split(/\s+/).forEach((w) => {
        if (w.length >= 4 && !["senior", "assistant", "lead", "with", "years", "general", "specialist", "manager", "engineer"].includes(w)) {
          roleTokens.add(w);
        }
      });
    });

    const roleKeywords = Array.from(roleTokens).slice(0, 20);
    if (roleKeywords.length > 0) {
      const likeClauses = roleKeywords.map(() => "(LOWER(j.title) LIKE ?)").join(" OR ");
      const params = roleKeywords.map((k) => `%${k}%`);
      const sql = country
        ? `SELECT j.*, c.name as company_name, c.logo_url as company_logo, c.industry as company_industry,
                  cat.name as category_name, cat.slug as category_slug
           FROM jobs j
           LEFT JOIN companies c ON j.company_id = c.id
           LEFT JOIN categories cat ON j.category_id = cat.id
           WHERE j.status = 'active' AND UPPER(j.country_code) = ? AND (${likeClauses})
           ORDER BY j.has_sponsorship DESC, j.sponsorship_score DESC, j.published_at DESC
           LIMIT 350`
        : `SELECT j.*, c.name as company_name, c.logo_url as company_logo, c.industry as company_industry,
                  cat.name as category_name, cat.slug as category_slug
           FROM jobs j
           LEFT JOIN companies c ON j.company_id = c.id
           LEFT JOIN categories cat ON j.category_id = cat.id
           WHERE j.status = 'active' AND (${likeClauses})
           ORDER BY j.has_sponsorship DESC, j.sponsorship_score DESC, j.published_at DESC
           LIMIT 350`;

      try {
        const stmt = country ? db.prepare(sql).bind(country.toUpperCase(), ...params) : db.prepare(sql).bind(...params);
        const res = await stmt.all<any>();
        for (const j of res.results || []) {
          candidateJobsMap.set(j.id, j);
        }
      } catch (err) {
        console.warn("[CareerIntelligenceEngine] Phase 1 query error:", err);
      }
    }

    // ── Phase 2: High-Value Capability & Tool Clusters ──
    const toolKeywords = [...candidate.toolsAndSoftware, ...candidate.coreCapabilities]
      .map((t) => t.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim())
      .filter((t) => t.length >= 3 && t.length <= 25)
      .slice(0, 16);

    if (toolKeywords.length > 0) {
      const likeClauses = toolKeywords
        .map(() => "(LOWER(j.title) LIKE ? OR LOWER(j.description) LIKE ?)")
        .join(" OR ");
      const params: string[] = [];
      toolKeywords.forEach((tk) => params.push(`%${tk}%`, `%${tk}%`));

      const sql = country
        ? `SELECT j.*, c.name as company_name, c.logo_url as company_logo, c.industry as company_industry,
                  cat.name as category_name, cat.slug as category_slug
           FROM jobs j
           LEFT JOIN companies c ON j.company_id = c.id
           LEFT JOIN categories cat ON j.category_id = cat.id
           WHERE j.status = 'active' AND UPPER(j.country_code) = ? AND (${likeClauses})
           ORDER BY j.has_sponsorship DESC, j.sponsorship_score DESC, j.published_at DESC
           LIMIT 350`
        : `SELECT j.*, c.name as company_name, c.logo_url as company_logo, c.industry as company_industry,
                  cat.name as category_name, cat.slug as category_slug
           FROM jobs j
           LEFT JOIN companies c ON j.company_id = c.id
           LEFT JOIN categories cat ON j.category_id = cat.id
           WHERE j.status = 'active' AND (${likeClauses})
           ORDER BY j.has_sponsorship DESC, j.sponsorship_score DESC, j.published_at DESC
           LIMIT 350`;

      try {
        const stmt = country ? db.prepare(sql).bind(country.toUpperCase(), ...params) : db.prepare(sql).bind(...params);
        const res = await stmt.all<any>();
        for (const j of res.results || []) {
          if (!candidateJobsMap.has(j.id)) candidateJobsMap.set(j.id, j);
        }
      } catch (err) {
        console.warn("[CareerIntelligenceEngine] Phase 2 query error:", err);
      }
    }

    // ── Phase 3: Functional Discipline & Category Query ──
    const industryTokens = candidate.primaryIndustry.toLowerCase().split(/[\s/&,]+/).filter((w) => w.length >= 4);
    if (industryTokens.length > 0) {
      const likeClauses = industryTokens.map(() => "(LOWER(cat.name) LIKE ? OR LOWER(cat.slug) LIKE ?)").join(" OR ");
      const params: string[] = [];
      industryTokens.forEach((it) => params.push(`%${it}%`, `%${it}%`));

      const sql = country
        ? `SELECT j.*, c.name as company_name, c.logo_url as company_logo, c.industry as company_industry,
                  cat.name as category_name, cat.slug as category_slug
           FROM jobs j
           LEFT JOIN companies c ON j.company_id = c.id
           LEFT JOIN categories cat ON j.category_id = cat.id
           WHERE j.status = 'active' AND UPPER(j.country_code) = ? AND (${likeClauses})
           ORDER BY j.has_sponsorship DESC, j.sponsorship_score DESC, j.published_at DESC
           LIMIT 250`
        : `SELECT j.*, c.name as company_name, c.logo_url as company_logo, c.industry as company_industry,
                  cat.name as category_name, cat.slug as category_slug
           FROM jobs j
           LEFT JOIN companies c ON j.company_id = c.id
           LEFT JOIN categories cat ON j.category_id = cat.id
           WHERE j.status = 'active' AND (${likeClauses})
           ORDER BY j.has_sponsorship DESC, j.sponsorship_score DESC, j.published_at DESC
           LIMIT 250`;

      try {
        const stmt = country ? db.prepare(sql).bind(country.toUpperCase(), ...params) : db.prepare(sql).bind(...params);
        const res = await stmt.all<any>();
        for (const j of res.results || []) {
          if (!candidateJobsMap.has(j.id)) candidateJobsMap.set(j.id, j);
        }
      } catch (err) {
        console.warn("[CareerIntelligenceEngine] Phase 3 query error:", err);
      }
    }

    // ── Phase 4: Freshly Ingested & Newly Listed Vacancy Pipeline ──
    // Guarantees that any recently listed or newly scraped vacancies in the destination are continuously discovered
    const freshSql = country
      ? `SELECT j.*, c.name as company_name, c.logo_url as company_logo, c.industry as company_industry,
                cat.name as category_name, cat.slug as category_slug
         FROM jobs j
         LEFT JOIN companies c ON j.company_id = c.id
         LEFT JOIN categories cat ON j.category_id = cat.id
         WHERE j.status = 'active' AND UPPER(j.country_code) = ?
         ORDER BY j.published_at DESC, j.id DESC
         LIMIT 200`
      : `SELECT j.*, c.name as company_name, c.logo_url as company_logo, c.industry as company_industry,
                cat.name as category_name, cat.slug as category_slug
         FROM jobs j
         LEFT JOIN companies c ON j.company_id = c.id
         LEFT JOIN categories cat ON j.category_id = cat.id
         WHERE j.status = 'active'
         ORDER BY j.published_at DESC, j.id DESC
         LIMIT 200`;

    try {
      const freshStmt = country ? db.prepare(freshSql).bind(country.toUpperCase()) : db.prepare(freshSql);
      const freshRes = await freshStmt.all<any>();
      for (const j of freshRes.results || []) {
        if (!candidateJobsMap.has(j.id)) candidateJobsMap.set(j.id, j);
      }
    } catch (err) {
      console.warn("[CareerIntelligenceEngine] Phase 4 fresh query error:", err);
    }

    const candidateJobs = Array.from(candidateJobsMap.values());

    // ── Stage 2 & 3: Deep Profiling & 5-Axis Relevance Scoring ──
    const opportunities: MatchOpportunity[] = [];

    for (const rawJob of candidateJobs) {
      const jobProfile = this.extractJobProfile(rawJob);
      const match = this.calculateUniversalMatch(candidate, jobProfile);

      // Relevance Gate: Discard jobs below 45% career match unless confirmed sponsor with 40%+
      if (match.careerScore < 45) {
        continue;
      }

      // Composite Rank Score: Balanced formula
      // Career Match (70%) + Sponsorship Viability (30%)
      const compositeRank = Math.round(match.careerScore * 0.70 + match.sponsorshipViabilityScore * 0.30);

      // Map to PublicJobDTO
      const publicJob: PublicJobDTO = {
        id: rawJob.id,
        slug: rawJob.slug || `${rawJob.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}--${rawJob.id}`,
        title: rawJob.title,
        company: {
          id: rawJob.company_id || "comp_verified",
          name: jobProfile.companyName,
          logoUrl: rawJob.company_logo || null,
          industry: rawJob.company_industry || null,
          website: null,
        },
        location: {
          city: jobProfile.city || null,
          region: rawJob.region || null,
          country: jobProfile.countryCode,
          formatted: `${jobProfile.city ? jobProfile.city + ", " : ""}${jobProfile.countryCode}`,
        },
        employmentType: rawJob.employment_type || "FULL_TIME",
        remoteType: rawJob.remote_type || "ONSITE",
        category: {
          id: rawJob.category_id || "cat_eng",
          name: jobProfile.industry,
          slug: rawJob.category_slug || "engineering",
        },
        salary: (jobProfile.salaryMin || jobProfile.salaryMax)
          ? { min: jobProfile.salaryMin || null, max: jobProfile.salaryMax || null, currency: jobProfile.salaryCurrency || "GBP" }
          : null,
        sponsorship: {
          label: rawJob.sponsorship_label || "Likely",
          evidenceMessage: jobProfile.sponsorshipEvidence,
          positiveEvidence: [],
          negativeEvidence: [],
          visaKeywords: [],
        },
        postedAt: rawJob.published_at || rawJob.first_seen_at || new Date().toISOString(),
        applyUrl: rawJob.apply_url || `/jobs/${rawJob.id}`,
      };

      opportunities.push({
        job: publicJob,
        matchTier: match.matchTier,
        tierBadgeLabel: match.tierLabel,
        careerMatchScore: match.careerScore,
        sponsorshipViabilityScore: match.sponsorshipViabilityScore,
        atsCompatibilityScore: 92,
        compositeRankScore: compositeRank,
        recommendationReason: match.whyYouMatch[0] || match.transferabilityRationale,
        breakdown: {
          capabilityOverlapScore: match.capabilityOverlapScore,
          scopeAndSeniorityScore: match.scopeAndSeniorityScore,
          domainAffinityScore: match.domainAffinityScore,
          trajectoryFitScore: match.trajectoryFitScore,
          credentialsScore: match.credentialsScore,
          sponsorshipViabilityScore: match.sponsorshipViabilityScore,
          matchedCapabilities: match.matchedCapabilities,
          missingCapabilities: match.missingCapabilities,
          matchedTools: match.matchedTools,
          missingTools: match.missingTools,
          transferabilityRationale: match.transferabilityRationale,
          whyYouMatch: match.whyYouMatch,
          whatIsMissing: match.whatIsMissing,
          howToImprove: match.howToImprove,
          sponsorshipStatus: match.sponsorshipStatus,
        },
      });
    }

    // Sort descending by composite score, breaking ties with career match score
    opportunities.sort((a, b) => {
      if (b.compositeRankScore !== a.compositeRankScore) {
        return b.compositeRankScore - a.compositeRankScore;
      }
      return b.careerMatchScore - a.careerMatchScore;
    });

    // ── Intelligent Diversity & Portfolio Allocation ──
    const finalSelected: MatchOpportunity[] = [];
    const employerCount = new Map<string, number>();
    const seenTitleKeys = new Set<string>();
    const maxPerEmployer = limit <= 12 ? 2 : (limit <= 24 ? 3 : 4);

    // Pass 1: Select high-scoring opportunities with diversity caps
    for (const opp of opportunities) {
      const employerKey = (opp.job.company.name || "company").toLowerCase().trim();
      // Normalized title key: remove locations in parens, job numbers, etc.
      const normalizedTitleKey = `${employerKey}__${opp.job.title.toLowerCase().replace(/\(.*?\)|\[.*?\]|\b\d{4,}\b/g, "").replace(/[^a-z0-9]/g, " ").trim().replace(/\s+/g, " ")}`;

      const empCount = employerCount.get(employerKey) || 0;

      // Deduplicate nearly identical roles at same company across multiple cities
      if (seenTitleKeys.has(normalizedTitleKey)) {
        continue;
      }

      // Allow max vacancies per company in top portfolio
      if (empCount >= maxPerEmployer) {
        continue;
      }

      finalSelected.push(opp);
      employerCount.set(employerKey, empCount + 1);
      seenTitleKeys.add(normalizedTitleKey);

      if (finalSelected.length >= limit) break;
    }

    // Pass 2: If we still have slots remaining, fill from other opportunities
    if (finalSelected.length < limit) {
      const selectedIds = new Set(finalSelected.map((o) => o.job.id));
      for (const opp of opportunities) {
        if (!selectedIds.has(opp.job.id)) {
          finalSelected.push(opp);
          selectedIds.add(opp.job.id);
          if (finalSelected.length >= limit) break;
        }
      }
    }

    return finalSelected;
  }
}
