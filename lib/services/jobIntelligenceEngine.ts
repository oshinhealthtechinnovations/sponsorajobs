/**
 * SponsorAJobs Central Job Intelligence Engine
 * 
 * Reusable backend intelligence service that powers:
 * 1. ATS Compatibility & Visa Sponsorship Scorer
 * 2. AI Smart Job Matcher
 * 3. Candidate Profile Extraction & Transferable Career Mapping
 * 4. Multi-Factor Weighted Scoring & Explainability Breakdown
 * 5. Sponsorship Certainty Classification
 */

import { PublicJobDTO } from "@/lib/types/job";
import { getDatabase } from "@/lib/db/client";

// ── TYPES & INTERFACES ──────────────────────────────────────────────────────

export type SeniorityLevel = "Entry" | "Mid-Level" | "Senior" | "Lead / Manager" | "Executive";

export type SponsorshipCertainty =
  | "CONFIRMED_IN_LISTING"
  | "HISTORICAL_EMPLOYER_SPONSOR"
  | "NO_SPONSORSHIP_FOUND";

export interface CandidateProfile {
  name?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  currentRole: string;
  normalizedRole: string;
  yearsOfExperience: number;
  seniority: SeniorityLevel;
  primaryIndustry: string;
  coreSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  toolsAndSoftware: string[];
  qualifications: string[];
  highestDegree: "PhD" | "Master's" | "Bachelor's" | "Diploma / Associate" | "High School" | "Not Detected";
  degreeField?: string;
  certifications: string[];
  transferablePotentialRoles: string[];
  rawTextSummary: string;
}

export interface StructuredJobIntelligence {
  jobId: string;
  title: string;
  normalizedTitle: string;
  alternativeTitles: string[];
  companyName: string;
  countryCode: string;
  city?: string;
  industry: string;
  seniority: SeniorityLevel;
  minYearsExperience: number;
  preferredYearsExperience: number;
  requiredSkills: string[];
  preferredSkills: string[];
  toolsAndTech: string[];
  requiredQualifications: string[];
  requiredCertifications: string[];
  keyResponsibilities: string[];
  sponsorshipCertainty: SponsorshipCertainty;
  sponsorshipEvidence: string;
  sponsorshipTier?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  transferableRoles: string[];
}

export interface DetailedMatchBreakdown {
  atsCompatibilityScore: number;  // 0 - 100
  skillsMatchScore: number;        // 0 - 100
  experienceMatchScore: number;    // 0 - 100
  roleSimilarityScore: number;     // 0 - 100
  qualificationMatchScore: number; // 0 - 100
  visaMatchScore: number;          // 0 - 100
  overallMatchScore: number;       // 0 - 100 (Weighted Composite)
  
  sponsorshipStatus: {
    certainty: SponsorshipCertainty;
    badgeLabel: string;
    description: string;
    evidence: string;
  };
  
  matchedSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  
  whyYouMatch: string[];
  whatIsMissing: string[];
  howToImprove: string[];
}

export interface RankedJobOpportunity {
  job: PublicJobDTO;
  matchScore: number;
  atsScore: number;
  breakdown: DetailedMatchBreakdown;
  recommendationReason: string;
}

// ── ROLE RELATIONSHIP & TRANSFERABLE ROLES GRAPH ───────────────────────────

export interface RoleNode {
  canonical: string;
  synonyms: string[];
  parentRoles: string[];
  lateralRoles: string[];
  juniorRoles: string[];
  seniorRoles: string[];
  industry: string;
  typicalSkills: string[];
}

export const ROLE_GRAPH: Record<string, RoleNode> = {
  // ── CONSTRUCTION & PROJECT MANAGEMENT ──
  "project manager": {
    canonical: "Project Manager",
    synonyms: ["pm", "project lead", "delivery manager", "project director"],
    parentRoles: ["programme manager", "operations director"],
    lateralRoles: ["construction project manager", "project coordinator", "assistant project manager", "operations manager", "scrum master"],
    juniorRoles: ["assistant project manager", "project coordinator", "project administrator", "graduate project manager"],
    seniorRoles: ["senior project manager", "programme manager", "head of projects", "project director"],
    industry: "Construction / Technology / Engineering",
    typicalSkills: ["project management", "budget management", "risk management", "scheduling", "stakeholder management", "ms project", "jira", "agile"],
  },
  "assistant project manager": {
    canonical: "Assistant Project Manager",
    synonyms: ["apm", "associate project manager", "junior project manager"],
    parentRoles: ["project manager", "senior project manager"],
    lateralRoles: ["project coordinator", "project assistant", "site project coordinator", "construction coordinator"],
    juniorRoles: ["project administrator", "graduate project coordinator"],
    seniorRoles: ["project manager", "construction project manager", "senior project manager"],
    industry: "Construction / Engineering",
    typicalSkills: ["project management", "coordination", "planning", "budget tracking", "ms project", "stakeholder communication", "reporting"],
  },
  "project coordinator": {
    canonical: "Project Coordinator",
    synonyms: ["project support officer", "pmo analyst", "project controller"],
    parentRoles: ["project manager", "pmo manager"],
    lateralRoles: ["assistant project manager", "project administrator", "operations coordinator"],
    juniorRoles: ["project assistant", "junior coordinator"],
    seniorRoles: ["assistant project manager", "project manager", "pmo lead"],
    industry: "Construction / Technology / Professional Services",
    typicalSkills: ["project coordination", "scheduling", "meeting coordination", "documentation", "ms project", "excel", "jira", "tracking"],
  },
  "construction project manager": {
    canonical: "Construction Project Manager",
    synonyms: ["construction manager", "site project manager", "build manager"],
    parentRoles: ["project director", "construction director"],
    lateralRoles: ["site manager", "contracts manager", "commercial manager", "civil project engineer"],
    juniorRoles: ["assistant site manager", "assistant project manager", "site engineer"],
    seniorRoles: ["senior construction manager", "project director", "head of construction"],
    industry: "Construction & Infrastructure",
    typicalSkills: ["construction management", "site supervision", "health & safety", "contractor management", "procurement", "primavera p6", "nec4", "cost control"],
  },

  // ── CIVIL & STRUCTURAL ENGINEERING ──
  "civil engineer": {
    canonical: "Civil Engineer",
    synonyms: ["civil infrastructure engineer", "site civil engineer", "design civil engineer"],
    parentRoles: ["senior civil engineer", "principal civil engineer"],
    lateralRoles: ["structural engineer", "site engineer", "highway engineer", "geotechnical engineer", "drainage engineer", "infrastructure engineer"],
    juniorRoles: ["graduate civil engineer", "junior civil engineer", "civil engineering technician"],
    seniorRoles: ["senior civil engineer", "principal civil engineer", "associate director - civil", "chief engineer"],
    industry: "Civil & Infrastructure Engineering",
    typicalSkills: ["autocad", "civil 3d", "microdrainage", "structural analysis", "site inspection", "eurocodes", "suDS", "bim"],
  },
  "structural engineer": {
    canonical: "Structural Engineer",
    synonyms: ["structural design engineer", "bridge engineer", "building structures engineer"],
    parentRoles: ["senior structural engineer", "principal structural engineer"],
    lateralRoles: ["civil engineer", "bridge design engineer", "facade engineer", "geotechnical engineer"],
    juniorRoles: ["graduate structural engineer", "junior structural engineer"],
    seniorRoles: ["senior structural engineer", "lead structural engineer", "principal structural engineer"],
    industry: "Engineering & Construction",
    typicalSkills: ["revit", "tekla", "etabs", "staad pro", "concrete design", "steel design", "eurocodes", "structural calculations"],
  },

  // ── MECHANICAL & ELECTRICAL ENGINEERING ──
  "mechanical engineer": {
    canonical: "Mechanical Engineer",
    synonyms: ["mechanical design engineer", "building services mechanical engineer", "plant engineer"],
    parentRoles: ["senior mechanical engineer", "principal mechanical engineer"],
    lateralRoles: ["mechanical design engineer", "maintenance engineer", "manufacturing engineer", "reliability engineer", "mechanical project engineer", "hvac engineer"],
    juniorRoles: ["graduate mechanical engineer", "junior mechanical engineer", "mechanical technician"],
    seniorRoles: ["senior mechanical engineer", "lead mechanical engineer", "engineering manager"],
    industry: "Engineering & Manufacturing",
    typicalSkills: ["solidworks", "autocad", "catia", "ansys", "thermodynamics", "hvac", "mep", "design for manufacturing", "gd&t", "finite element analysis"],
  },
  "mechanical design engineer": {
    canonical: "Mechanical Design Engineer",
    synonyms: ["cad engineer", "product design engineer", "mechanical development engineer"],
    parentRoles: ["lead design engineer", "engineering manager"],
    lateralRoles: ["mechanical engineer", "product development engineer", "cad designer", "tooling engineer"],
    juniorRoles: ["junior cad technician", "graduate design engineer"],
    seniorRoles: ["senior mechanical design engineer", "principal design engineer"],
    industry: "Engineering / Automotive / Aerospace / Product Design",
    typicalSkills: ["solidworks", "cad", "creo", "catia", "3d modeling", "prototyping", "tolerance analysis", "fea"],
  },
  "maintenance engineer": {
    canonical: "Maintenance Engineer",
    synonyms: ["reliability engineer", "plant maintenance engineer", "multi-skilled engineer"],
    parentRoles: ["maintenance manager", "engineering operations manager"],
    lateralRoles: ["mechanical engineer", "electrical engineer", "service engineer", "automation engineer"],
    juniorRoles: ["maintenance technician", "apprentice maintenance technician"],
    seniorRoles: ["senior maintenance engineer", "maintenance manager", "reliability lead"],
    industry: "Manufacturing / Facilities / Energy",
    typicalSkills: ["preventative maintenance", "plc fault finding", "hydraulics", "pneumatics", "troubleshooting", "cmms", "root cause analysis"],
  },

  // ── SOFTWARE & TECHNOLOGY ──
  "software engineer": {
    canonical: "Software Engineer",
    synonyms: ["software developer", "full stack engineer", "programmer", "software architect"],
    parentRoles: ["senior software engineer", "tech lead", "engineering manager"],
    lateralRoles: ["full stack developer", "backend engineer", "frontend engineer", "devops engineer", "mobile developer", "cloud engineer"],
    juniorRoles: ["junior software engineer", "associate developer", "graduate software engineer"],
    seniorRoles: ["senior software engineer", "staff software engineer", "principal engineer", "tech lead", "architect"],
    industry: "Information Technology",
    typicalSkills: ["javascript", "typescript", "python", "react", "node.js", "sql", "git", "rest api", "docker", "unit testing", "system design"],
  },
  "data analyst": {
    canonical: "Data Analyst",
    synonyms: ["bi analyst", "business intelligence analyst", "reporting analyst", "product analyst"],
    parentRoles: ["senior data analyst", "analytics manager"],
    lateralRoles: ["business analyst", "bi developer", "data scientist", "data engineer", "analytics engineer", "financial analyst"],
    juniorRoles: ["junior data analyst", "data entry analyst"],
    seniorRoles: ["senior data analyst", "lead analytics consultant", "head of bi"],
    industry: "Technology / Finance / Healthcare / Consulting",
    typicalSkills: ["sql", "python", "excel", "power bi", "tableau", "data analysis", "data visualization", "statistical modeling", "reporting"],
  },
  "devops engineer": {
    canonical: "DevOps Engineer",
    synonyms: ["cloud engineer", "site reliability engineer", "sre", "platform engineer", "infrastructure engineer"],
    parentRoles: ["senior devops engineer", "lead cloud architect"],
    lateralRoles: ["cloud architect", "sysadmin", "software engineer", "sre", "cybersecurity engineer"],
    juniorRoles: ["junior devops engineer", "cloud support engineer"],
    seniorRoles: ["senior devops engineer", "staff sre", "principal platform architect"],
    industry: "Information Technology & Cloud",
    typicalSkills: ["aws", "azure", "gcp", "kubernetes", "docker", "terraform", "ci/cd", "linux", "ansible", "helm", "monitoring"],
  },

  // ── HEALTHCARE & NURSING ──
  "registered nurse": {
    canonical: "Registered Nurse",
    synonyms: ["staff nurse", "clinical nurse", "inpatient nurse", "ward nurse", "rgn"],
    parentRoles: ["senior staff nurse", "clinical lead nurse"],
    lateralRoles: ["theatre scrub nurse", "icu nurse", "community nurse", "paediatric nurse", "occupational health nurse"],
    juniorRoles: ["healthcare assistant", "trainee nursing associate", "graduate nurse"],
    seniorRoles: ["senior staff nurse", "clinical nurse specialist", "ward manager", "nurse practitioner", "matron"],
    industry: "Healthcare & Clinical Services",
    typicalSkills: ["patient care", "medication administration", "clinical assessment", "infection control", "nmc registration", "bls", "acls", "triage", "wound care"],
  },
  "healthcare assistant": {
    canonical: "Healthcare Assistant",
    synonyms: ["hca", "care assistant", "support worker", "nursing auxiliary", "care worker"],
    parentRoles: ["senior healthcare assistant", "trainee nurse associate"],
    lateralRoles: ["care assistant", "residential support worker", "domiciliary carer"],
    juniorRoles: ["trainee care assistant"],
    seniorRoles: ["senior healthcare assistant", "team leader", "trainee nursing associate"],
    industry: "Healthcare & Social Care",
    typicalSkills: ["personal care", "vital signs", "patient mobility", "compassionate care", "hygiene protocols", "reporting", "empathy"],
  },

  // ── HOSPITALITY & CULINARY ──
  "chef de partie": {
    canonical: "Chef de Partie",
    synonyms: ["station chef", "line cook", "senior line cook"],
    parentRoles: ["junior sous chef", "sous chef"],
    lateralRoles: ["pastry chef", "demi chef de partie", "banqueting chef"],
    juniorRoles: ["commis chef", "apprentice chef", "kitchen assistant"],
    seniorRoles: ["sous chef", "head chef", "executive chef"],
    industry: "Hospitality & Culinary",
    typicalSkills: ["food preparation", "kitchen hygiene", "culinary arts", "haccp", "knife skills", "station management", "plating", "temperature control"],
  },
  "sous chef": {
    canonical: "Sous Chef",
    synonyms: ["second chef", "senior sous chef", "junior sous chef"],
    parentRoles: ["head chef", "executive head chef"],
    lateralRoles: ["head pastry chef", "banqueting head chef", "kitchen manager"],
    juniorRoles: ["chef de partie", "senior chef de partie"],
    seniorRoles: ["head chef", "executive sous chef", "executive chef"],
    industry: "Hospitality & Culinary",
    typicalSkills: ["menu planning", "kitchen management", "food hygiene", "inventory control", "staff supervision", "culinary leadership", "cost of sales"],
  },
  "hotel operations manager": {
    canonical: "Hotel Operations Manager",
    synonyms: ["duty manager", "assistant general manager - hotel", "front of house manager"],
    parentRoles: ["hotel general manager"],
    lateralRoles: ["front office manager", "f&b operations manager", "guest relations manager"],
    juniorRoles: ["front office supervisor", "guest service agent"],
    seniorRoles: ["hotel general manager", "regional operations director"],
    industry: "Hospitality & Tourism",
    typicalSkills: ["hotel management", "guest satisfaction", "opera pms", "revenue management", "staff scheduling", "budgeting", "health & safety"],
  },
};

// ── COMPREHENSIVE SKILL & VOCABULARY TAXONOMY ──────────────────────────────

export const SKILL_TAXONOMY: Record<string, { category: string; synonyms: string[] }> = {
  // Software & Tech
  python: { category: "technical", synonyms: ["py", "python3", "python 3"] },
  sql: { category: "technical", synonyms: ["t-sql", "pl/sql", "postgres", "mysql", "relational databases"] },
  javascript: { category: "technical", synonyms: ["js", "es6", "ecmascript"] },
  typescript: { category: "technical", synonyms: ["ts"] },
  react: { category: "technical", synonyms: ["react.js", "reactjs"] },
  "node.js": { category: "technical", synonyms: ["nodejs", "node"] },
  aws: { category: "technical", synonyms: ["amazon web services", "ec2", "s3", "lambda", "ecs"] },
  kubernetes: { category: "technical", synonyms: ["k8s"] },
  docker: { category: "technical", synonyms: ["containerization", "containers"] },
  terraform: { category: "technical", synonyms: ["iac", "infrastructure as code"] },
  "ci/cd": { category: "technical", synonyms: ["continuous integration", "github actions", "jenkins", "gitlab ci"] },
  "system design": { category: "technical", synonyms: ["software architecture", "distributed systems"] },
  
  // Data & AI
  "power bi": { category: "technical", synonyms: ["powerbi", "dax", "power query"] },
  tableau: { category: "technical", synonyms: [] },
  excel: { category: "technical", synonyms: ["advanced excel", "vlookup", "pivot tables"] },
  "machine learning": { category: "technical", synonyms: ["ml", "scikit-learn", "deep learning", "pytorch", "tensorflow"] },
  "data modeling": { category: "technical", synonyms: ["data warehousing", "dimensional modeling", "etl"] },
  
  // Management & Process
  "project management": { category: "domain", synonyms: ["project planning", "project delivery", "pmp", "prince2"] },
  "budget management": { category: "domain", synonyms: ["cost control", "budget tracking", "financial oversight", "budgeting"] },
  "risk management": { category: "domain", synonyms: ["risk assessment", "risk mitigation", "raaid log"] },
  "stakeholder management": { category: "soft", synonyms: ["stakeholder engagement", "client relations", "cross-functional collaboration"] },
  "ms project": { category: "tool", synonyms: ["microsoft project"] },
  jira: { category: "tool", synonyms: ["confluence", "atlassian"] },
  agile: { category: "domain", synonyms: ["scrum", "kanban", "sprint planning"] },
  
  // Construction & Engineering
  autocad: { category: "tool", synonyms: ["cad", "2d cad"] },
  revit: { category: "tool", synonyms: ["autodesk revit", "bim modeling"] },
  bim: { category: "domain", synonyms: ["building information modeling", "iso 19650", "navisworks"] },
  "primavera p6": { category: "tool", synonyms: ["primavera", "p6", "critical path method"] },
  "structural analysis": { category: "technical", synonyms: ["structural design", "finite element", "etabs", "staad pro"] },
  "health & safety": { category: "domain", synonyms: ["h&s", "coshh", "risk assessments", "iosh", "nebosh", "cdm 2015"] },
  "contractor management": { category: "domain", synonyms: ["subcontractor management", "procurement", "nec3", "nec4", "fidic"] },

  // Healthcare
  "patient care": { category: "domain", synonyms: ["nursing care", "patient support", "bedside care"] },
  "medication administration": { category: "domain", synonyms: ["drug administration", "pharmaceutical dispensing"] },
  "clinical assessment": { category: "domain", synonyms: ["patient triage", "vital signs", "health evaluation"] },
  "infection control": { category: "domain", synonyms: ["sterile technique", "sanitation protocols"] },
  "nmc registration": { category: "qualification", synonyms: ["registered nurse pin", "uk nmc"] },
  bls: { category: "qualification", synonyms: ["basic life support", "cpr"] },
  acls: { category: "qualification", synonyms: ["advanced cardiac life support"] },

  // Hospitality & Culinary
  "food preparation": { category: "domain", synonyms: ["prep work", "mise en place"] },
  "kitchen hygiene": { category: "domain", synonyms: ["food safety", "haccp", "hygiene rating"] },
  "culinary arts": { category: "domain", synonyms: ["cooking", "chef craftsmanship", "fine dining"] },
  "menu planning": { category: "domain", synonyms: ["recipe development", "menu engineering"] },
  "guest satisfaction": { category: "soft", synonyms: ["guest relations", "customer experience", "customer service"] },
  "opera pms": { category: "tool", synonyms: ["opera", "property management system"] },
};

// ── CENTRAL JOB INTELLIGENCE ENGINE IMPLEMENTATION ─────────────────────────

export class JobIntelligenceEngine {
  /**
   * 1. Extract Structured Candidate Profile from CV (text, paste, or parsed stream)
   */
  public static extractCandidateProfile(rawCvText: string): CandidateProfile {
    const text = rawCvText.trim();
    const lower = text.toLowerCase();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // Detect Name
    const nameMatch = lines[0]?.length < 50 && !lines[0].includes("@") && !lines[0].startsWith("http")
      ? lines[0]
      : undefined;

    // Detect Contact info
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
    const linkedInMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);

    // Detect Current / Primary Role
    let detectedRole = "General Professional";
    const sortedRoleEntries = Object.entries(ROLE_GRAPH).sort((a, b) => b[0].length - a[0].length);

    // 1. First check top headline lines (lines 0-4) where candidates declare their title:
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const lineLower = lines[i].toLowerCase();
      for (const [key, node] of sortedRoleEntries) {
        if (lineLower.includes(key) || node.synonyms.some((s) => lineLower.includes(s))) {
          detectedRole = node.canonical;
          break;
        }
      }
      if (detectedRole !== "General Professional") break;
    }

    // 2. If not detected in headline, search entire document with longest specific keys first
    if (detectedRole === "General Professional") {
      for (const [key, node] of sortedRoleEntries) {
        if (lower.includes(key) || node.synonyms.some((s) => lower.includes(s))) {
          detectedRole = node.canonical;
          break;
        }
      }
    }

    // Fallback: check first 5 lines for role titles
    if (detectedRole === "General Professional") {
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].toLowerCase();
        if (line.includes("engineer") || line.includes("developer") || line.includes("manager") || line.includes("nurse") || line.includes("analyst") || line.includes("chef")) {
          detectedRole = lines[i];
          break;
        }
      }
    }

    // Normalized Role
    const normalizedRole = this.findCanonicalRole(detectedRole);

    // Estimate Years of Experience
    let years = 1;
    const yearMatches = text.match(/(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience)?/gi);
    if (yearMatches && yearMatches.length > 0) {
      const nums = yearMatches.map((m) => parseInt(m.replace(/\D/g, ""), 10)).filter((n) => n > 0 && n < 45);
      if (nums.length > 0) years = Math.max(...nums);
    } else {
      // Count date ranges like (2018 - 2023)
      const dateRanges = text.match(/\b(200\d|201\d|202\d)\s*[-–—to]+\s*(200\d|201\d|202\d|present|current)\b/gi);
      if (dateRanges && dateRanges.length > 0) {
        years = Math.min(25, Math.max(2, dateRanges.length * 2));
      }
    }

    // Determine Seniority Level
    let seniority: SeniorityLevel = "Mid-Level";
    if (years >= 8 || /\b(lead|principal|head of|director|vp|chief|architect)\b/i.test(lower)) {
      seniority = /\b(chief|director|vp|head of)\b/i.test(lower) ? "Executive" : "Lead / Manager";
    } else if (years >= 4 || /\b(senior|sr\.)\b/i.test(lower)) {
      seniority = "Senior";
    } else if (years <= 2 || /\b(junior|jr\.|graduate|intern|entry|assistant)\b/i.test(lower)) {
      seniority = "Entry";
    }

    // Extract Skills & Software
    const matchedSkills = new Set<string>();
    const techSkills = new Set<string>();
    const softSkills = new Set<string>();
    const tools = new Set<string>();

    for (const [skillKey, meta] of Object.entries(SKILL_TAXONOMY)) {
      const regex = new RegExp(`\\b${skillKey.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
      const synonymMatch = meta.synonyms.some((s) => lower.includes(s.toLowerCase()));
      if (regex.test(lower) || synonymMatch) {
        matchedSkills.add(skillKey);
        if (meta.category === "technical") techSkills.add(skillKey);
        else if (meta.category === "soft") softSkills.add(skillKey);
        else if (meta.category === "tool") tools.add(skillKey);
      }
    }

    // Extract Education & Qualifications
    let highestDegree: CandidateProfile["highestDegree"] = "Not Detected";
    let degreeField: string | undefined;

    if (/\b(ph\.?d|doctorate|doctoral)\b/i.test(lower)) {
      highestDegree = "PhD";
    } else if (/\b(master'?s?|m\.?sc|m\.?eng|mba|m\.?tech|m\.?phil|postgraduate)\b/i.test(lower)) {
      highestDegree = "Master's";
    } else if (/\b(bachelor'?s?|b\.?sc|b\.?eng|b\.?tech|undergraduate)\b/i.test(lower)) {
      highestDegree = "Bachelor's";
    } else if (/\b(diploma|associate'?s?|hnd|hnc)\b/i.test(lower)) {
      highestDegree = "Diploma / Associate";
    }

    const fieldMatch = text.match(/\b(?:in|of)\s+([A-Za-z\s]{3,35})(?:\s+from|\s+university|\s+college|\n|$)/i);
    if (fieldMatch) {
      degreeField = fieldMatch[1].trim();
    }

    // Extract Certifications
    const certs: string[] = [];
    const knownCerts = ["AWS Certified", "PMP", "PRINCE2", "CKAD", "CKA", "Azure Certified", "Scrum Master", "CISSP", "NEBOSH", "IOSH", "NMC", "BLS", "ACLS", "CPA", "ACCA", "CFA"];
    for (const c of knownCerts) {
      if (new RegExp(`\\b${c}\\b`, "i").test(text)) certs.push(c);
    }

    // Primary Industry
    let primaryIndustry = "Cross-Functional Technology & Engineering";
    if (/\b(civil|construction|infrastructure|structural|site|building|bim)\b/i.test(lower)) primaryIndustry = "Construction & Civil Engineering";
    else if (/\b(software|full stack|frontend|backend|cloud|devops|data|ai)\b/i.test(lower)) primaryIndustry = "Information Technology & Software";
    else if (/\b(nurse|clinical|patient|hospital|medical|healthcare|hca)\b/i.test(lower)) primaryIndustry = "Healthcare & Nursing";
    else if (/\b(chef|hotel|culinary|food|beverage|restaurant|hospitality)\b/i.test(lower)) primaryIndustry = "Hospitality & Culinary";
    else if (/\b(finance|accounting|audit|tax|banking|financial)\b/i.test(lower)) primaryIndustry = "Finance & Banking";

    // Transferable Potential Roles (Graph Traverse)
    const transferablePotentialRoles = this.getTransferableRoles(normalizedRole);

    return {
      name: nameMatch,
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
      linkedIn: linkedInMatch ? `https://${linkedInMatch[0]}` : undefined,
      currentRole: detectedRole,
      normalizedRole,
      yearsOfExperience: years,
      seniority,
      primaryIndustry,
      coreSkills: Array.from(matchedSkills),
      technicalSkills: Array.from(techSkills),
      softSkills: Array.from(softSkills),
      toolsAndSoftware: Array.from(tools),
      qualifications: highestDegree !== "Not Detected" ? [highestDegree + (degreeField ? ` in ${degreeField}` : "")] : [],
      highestDegree,
      degreeField,
      certifications: certs,
      transferablePotentialRoles,
      rawTextSummary: text.slice(0, 300),
    };
  }

  /**
   * 2. Normalize and extract structured intelligence from any Job listing
   */
  public static extractJobIntelligence(job: PublicJobDTO | any): StructuredJobIntelligence {
    const anyJob = job as any;
    const title = anyJob.title || "";
    const textDesc =
      anyJob.description ||
      anyJob.descriptionClean ||
      (Array.isArray(anyJob.sponsorship?.positiveEvidence) ? anyJob.sponsorship.positiveEvidence.join(" ") : "") ||
      "";
    const lower = `${title} ${textDesc}`.toLowerCase();
    const normalizedTitle = this.findCanonicalRole(title);
    const alternativeTitles = this.getTransferableRoles(normalizedTitle);

    // Extract required vs preferred skills
    const requiredSkills: string[] = [];
    const preferredSkills: string[] = [];
    const toolsAndTech: string[] = [];

    for (const [skillKey, meta] of Object.entries(SKILL_TAXONOMY)) {
      if (lower.includes(skillKey)) {
        if (lower.includes(`preferred: ${skillKey}`) || lower.includes(`nice to have: ${skillKey}`) || lower.includes(`bonus: ${skillKey}`)) {
          preferredSkills.push(skillKey);
        } else {
          requiredSkills.push(skillKey);
        }
        if (meta.category === "tool" || meta.category === "technical") {
          toolsAndTech.push(skillKey);
        }
      }
    }

    // Min Years experience
    let minYears = 2;
    let preferredYears = 5;
    const expMatch = lower.match(/(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+experience)?/i);
    if (expMatch) {
      minYears = parseInt(expMatch[1], 10);
      preferredYears = minYears + 2;
    }

    // Seniority
    let seniority: SeniorityLevel = "Mid-Level";
    if (minYears >= 7 || /\b(lead|principal|director|head of)\b/i.test(title)) seniority = "Lead / Manager";
    else if (minYears >= 4 || /\b(senior|sr\.)\b/i.test(title)) seniority = "Senior";
    else if (minYears <= 2 || /\b(graduate|junior|entry|assistant)\b/i.test(title)) seniority = "Entry";

    // Required Qualifications
    const reqQuals: string[] = [];
    if (/\b(bachelor'?s|degree|beng|bsc|b\.tech)\b/i.test(lower)) reqQuals.push("Bachelor's Degree");
    if (/\b(master'?s|msc|meng)\b/i.test(lower)) reqQuals.push("Master's Degree");
    if (/\b(phd|doctorate)\b/i.test(lower)) reqQuals.push("PhD");
    if (/\b(nmc|registered nurse)\b/i.test(lower)) reqQuals.push("NMC Professional Registration");
    if (/\b(pmp|prince2)\b/i.test(lower)) reqQuals.push("PMP or PRINCE2 Certification");

    // Key Responsibilities extraction
    const responsibilities: string[] = [];
    const bulletMatches = textDesc.match(/[•\*\-]\s*(.+?)(?=\n|$)/g);
    if (bulletMatches && bulletMatches.length > 0) {
      responsibilities.push(...bulletMatches.slice(0, 6).map((b: string) => b.replace(/^[•\*\-\s]+/, "").trim()));
    } else {
      responsibilities.push(
        "Execute core operational workflows and technical deliverables",
        "Collaborate cross-functionally with team leads and client stakeholders",
        "Uphold quality standards, statutory safety regulations, and project milestones"
      );
    }

    // Sponsorship Certainty Classification (Strict Non-False-Positive Logic)
    let sponsorshipCertainty: SponsorshipCertainty = "NO_SPONSORSHIP_FOUND";
    let sponsorshipEvidence = "No explicit visa sponsorship clause detected in this specific vacancy.";

    const hasExplicitVisaClause =
      /\b(visa sponsorship|certificate of sponsorship|cos|tier 2|skilled worker visa|h-1b|tss 482|subclass 482|lmia approved|sponsorship provided)\b/i.test(textDesc) ||
      /\b(we provide visa sponsorship|eligible for sponsorship|sponsor licence ready)\b/i.test(textDesc);

    const companyName = anyJob.company?.name || anyJob.company_name || anyJob.companyName || "Verified Employer";
    const countryCode = anyJob.location?.country || anyJob.country_code || anyJob.country || "GB";
    const city = anyJob.location?.city || anyJob.city || null;
    const industry = anyJob.company?.industry || anyJob.company_industry || "Technology & Engineering";
    const salaryMin = anyJob.salary?.min ?? anyJob.salary_min ?? null;
    const salaryMax = anyJob.salary?.max ?? anyJob.salary_max ?? null;
    const salaryCurrency = anyJob.salary?.currency ?? anyJob.salary_currency ?? "GBP";

    const hasNegativeRightToWork = /\b(must have (the )?right to work|no visa sponsorship|not eligible for (visa )?sponsorship|cannot sponsor)\b/i.test(textDesc);

    if (!hasNegativeRightToWork && anyJob.has_sponsorship !== 0 && (hasExplicitVisaClause || anyJob.has_sponsorship === 1 || anyJob.sponsorship?.label === "Strong" || anyJob.sponsorship_label === "Strong")) {
      sponsorshipCertainty = "CONFIRMED_IN_LISTING";
      sponsorshipEvidence = "Explicit visa sponsorship eligibility confirmed in this job listing with statutory employer accreditation.";
    } else if (!hasNegativeRightToWork && anyJob.has_sponsorship !== 0 && (anyJob.is_direct || (anyJob.sponsorship_score && anyJob.sponsorship_score >= 80) || anyJob.sponsorshipConfidence >= 80)) {
      sponsorshipCertainty = "HISTORICAL_EMPLOYER_SPONSOR";
      sponsorshipEvidence = `${companyName} is an active licensed sponsor on the official government sponsor register, though sponsorship for this specific vacancy must be verified with the employer.`;
    }

    return {
      jobId: anyJob.id || "job_unknown",
      title,
      normalizedTitle,
      alternativeTitles,
      companyName,
      countryCode,
      city,
      industry,
      seniority,
      minYearsExperience: minYears,
      preferredYearsExperience: preferredYears,
      requiredSkills,
      preferredSkills,
      toolsAndTech,
      requiredQualifications: reqQuals,
      requiredCertifications: [],
      keyResponsibilities: responsibilities,
      sponsorshipCertainty,
      sponsorshipEvidence,
      sponsorshipTier: anyJob.sponsor_license_tier || "Statutory A-Rating Sponsor",
      salaryMin,
      salaryMax,
      salaryCurrency,
      transferableRoles: alternativeTitles,
    };
  }

  /**
   * 3. Compute Deep 7-Factor Compatibility Score between Candidate Profile and Target Job
   */
  public static calculateDetailedMatch(
    candidate: CandidateProfile,
    jobIntel: StructuredJobIntelligence
  ): DetailedMatchBreakdown {
    // A. Skills Match Score (25% weight)
    const allCandidateSkills = new Set([
      ...candidate.coreSkills.map((s) => s.toLowerCase()),
      ...candidate.technicalSkills.map((s) => s.toLowerCase()),
      ...candidate.toolsAndSoftware.map((s) => s.toLowerCase()),
    ]);

    const matchedSkills: string[] = [];
    const missingRequired: string[] = [];
    const missingPreferred: string[] = [];

    jobIntel.requiredSkills.forEach((reqSkill) => {
      const lowerReq = reqSkill.toLowerCase();
      if (allCandidateSkills.has(lowerReq) || Array.from(allCandidateSkills).some((c) => c.includes(lowerReq) || lowerReq.includes(c))) {
        matchedSkills.push(reqSkill);
      } else {
        missingRequired.push(reqSkill);
      }
    });

    jobIntel.preferredSkills.forEach((prefSkill) => {
      const lowerPref = prefSkill.toLowerCase();
      if (allCandidateSkills.has(lowerPref)) {
        matchedSkills.push(prefSkill);
      } else {
        missingPreferred.push(prefSkill);
      }
    });

    const totalJobSkills = Math.max(1, jobIntel.requiredSkills.length + jobIntel.preferredSkills.length * 0.5);
    const skillsScore = Math.min(100, Math.round((matchedSkills.length / totalJobSkills) * 100));

    // B. Experience Match Score (20% weight)
    let experienceScore = 100;
    const diff = candidate.yearsOfExperience - jobIntel.minYearsExperience;
    if (diff < 0) {
      // 1 year gap: 75, 2 year gap: 50, 3+ year gap: 30
      experienceScore = Math.max(20, 100 - Math.abs(diff) * 25);
    } else if (diff >= 0 && diff <= 5) {
      experienceScore = 100;
    } else {
      // Overqualified slight taper
      experienceScore = 95;
    }

    // C. Role Similarity Score (15% weight)
    const roleScore = this.computeRoleSimilarity(candidate.normalizedRole, jobIntel.normalizedTitle);

    // D. Qualification Match Score (10% weight)
    let qualScore = 90;
    if (jobIntel.requiredQualifications.length > 0) {
      const hasDegree = candidate.highestDegree !== "Not Detected";
      const needsMaster = jobIntel.requiredQualifications.some((q) => q.toLowerCase().includes("master"));
      if (needsMaster) {
        qualScore = candidate.highestDegree === "Master's" || candidate.highestDegree === "PhD" ? 100 : 70;
      } else {
        qualScore = hasDegree ? 100 : 60;
      }
    }

    // E. Visa Sponsorship Match Score (10% weight)
    let visaScore = 50;
    if (jobIntel.sponsorshipCertainty === "CONFIRMED_IN_LISTING") {
      visaScore = 95;
    } else if (jobIntel.sponsorshipCertainty === "HISTORICAL_EMPLOYER_SPONSOR") {
      visaScore = 80;
    } else {
      visaScore = 40;
    }

    // F. ATS Compatibility Score (Formatting & Parsing Health)
    let atsScore = 85;
    if (candidate.email && candidate.phone) atsScore += 5;
    if (candidate.coreSkills.length >= 5) atsScore += 5;
    if (candidate.highestDegree !== "Not Detected") atsScore += 5;
    atsScore = Math.min(100, atsScore);

    // G. Overall Weighted Score (100% total)
    // Formula: Skills (25%) + Experience (20%) + Role (15%) + Qual (10%) + Responsibilities/ATS (10%) + Industry (10%) + Visa (10%)
    const industryAlignment = candidate.primaryIndustry.toLowerCase().includes(jobIntel.industry.toLowerCase().slice(0, 5)) ? 100 : 80;
    const overallScore = Math.round(
      skillsScore * 0.25 +
      experienceScore * 0.20 +
      roleScore * 0.15 +
      qualScore * 0.10 +
      atsScore * 0.10 +
      industryAlignment * 0.10 +
      visaScore * 0.10
    );

    // Generate Human-Readable Explainability
    const whyYouMatch: string[] = [];
    const whatIsMissing: string[] = [];
    const howToImprove: string[] = [];

    // Why match points
    if (roleScore >= 80) {
      whyYouMatch.push(`Role Alignment: Your background in "${candidate.currentRole}" strongly connects with "${jobIntel.title}".`);
    } else if (roleScore >= 60) {
      whyYouMatch.push(`Transferable Experience: Your profile demonstrates key lateral skills relevant to "${jobIntel.title}".`);
    }

    if (matchedSkills.length > 0) {
      whyYouMatch.push(`Technical & Domain Skills: Found ${matchedSkills.length} matching competencies (${matchedSkills.slice(0, 5).join(", ")}).`);
    }

    if (experienceScore >= 90) {
      whyYouMatch.push(`Experience Requirement: Your ${candidate.yearsOfExperience} years of background meets or exceeds the required threshold (${jobIntel.minYearsExperience}+ years).`);
    }

    if (jobIntel.sponsorshipCertainty === "CONFIRMED_IN_LISTING") {
      whyYouMatch.push(`Visa Opportunity: Employer explicitly confirms visa sponsorship support for this position.`);
    } else if (jobIntel.sponsorshipCertainty === "HISTORICAL_EMPLOYER_SPONSOR") {
      whyYouMatch.push(`Sponsor Heritage: ${jobIntel.companyName} is an active licensed sponsor on the statutory register.`);
    }

    // What is missing points
    if (missingRequired.length > 0) {
      whatIsMissing.push(`Key Skills Gap: Missing ${missingRequired.length} required skills (${missingRequired.slice(0, 4).join(", ")}).`);
    }

    if (diff < 0) {
      whatIsMissing.push(`Experience Gap: Stated requirement asks for ${jobIntel.minYearsExperience}+ years, whereas CV indicates ~${candidate.yearsOfExperience} years.`);
    }

    if (jobIntel.requiredQualifications.length > 0 && qualScore < 90) {
      whatIsMissing.push(`Mandatory Qualification: Listing highlights ${jobIntel.requiredQualifications.join(", ")}, which was not explicitly verified on your profile.`);
    }

    if (jobIntel.sponsorshipCertainty === "NO_SPONSORSHIP_FOUND") {
      whatIsMissing.push(`Sponsorship Clause: No explicit sponsorship guarantee detected in this specific listing. Needs direct employer inquiry.`);
    }

    // How to improve points
    if (missingRequired.length > 0) {
      howToImprove.push(`Incorporate evidence of ${missingRequired.slice(0, 3).join(", ")} in your work experience bullet points if you have practiced them.`);
    }
    howToImprove.push(`Quantify your accomplishments with measurable metrics (e.g. "reduced latency by 30%", "managed £2M budget").`);
    howToImprove.push(`Emphasize statutory visa eligibility factors (relevant degree, professional registration) near the top of your CV summary.`);

    // Sponsorship Badge Details
    let badgeLabel = "Unverified Sponsorship";
    let desc = "Sponsorship information not explicitly provided in listing.";
    if (jobIntel.sponsorshipCertainty === "CONFIRMED_IN_LISTING") {
      badgeLabel = "Confirmed Sponsorship";
      desc = "Listing contains explicit statutory visa sponsorship evidence.";
    } else if (jobIntel.sponsorshipCertainty === "HISTORICAL_EMPLOYER_SPONSOR") {
      badgeLabel = "Historical Sponsor Employer";
      desc = `${jobIntel.companyName} is a licensed sponsor; sponsorship per listing subject to quota.`;
    }

    return {
      atsCompatibilityScore: atsScore,
      skillsMatchScore: skillsScore,
      experienceMatchScore: experienceScore,
      roleSimilarityScore: roleScore,
      qualificationMatchScore: qualScore,
      visaMatchScore: visaScore,
      overallMatchScore: overallScore,
      sponsorshipStatus: {
        certainty: jobIntel.sponsorshipCertainty,
        badgeLabel,
        description: desc,
        evidence: jobIntel.sponsorshipEvidence,
      },
      matchedSkills,
      missingRequiredSkills: missingRequired,
      missingPreferredSkills: missingPreferred,
      whyYouMatch,
      whatIsMissing,
      howToImprove,
    };
  }

  /**
   * 4. Multi-Job Ranking & Smart Matcher across the full database
   */
  public static async rankMatchingJobsForCandidate(
    candidate: CandidateProfile,
    options?: { country?: string; limit?: number }
  ): Promise<RankedJobOpportunity[]> {
    const limit = options?.limit || 6;
    const country = options?.country && options.country !== "ALL" ? options.country : undefined;

    // Pull jobs from database
    const db = getDatabase();
    const query = country
      ? "SELECT * FROM jobs WHERE status = 'active' AND country_code = ? LIMIT 300"
      : "SELECT * FROM jobs WHERE status = 'active' LIMIT 300";

    const stmt = country ? db.prepare(query).bind(country) : db.prepare(query);
    const result = await stmt.all<any>();
    const allJobs = result.results || [];

    const scoredOpportunities: RankedJobOpportunity[] = [];

    for (const job of allJobs) {
      const anyJob = job as any;
      const jobIntel = this.extractJobIntelligence(anyJob);
      const breakdown = this.calculateDetailedMatch(candidate, jobIntel);

      // Boost score for fresh jobs & verified direct employers
      let priorityScore = breakdown.overallMatchScore;
      if (jobIntel.sponsorshipCertainty === "CONFIRMED_IN_LISTING") priorityScore += 5;
      if (anyJob.is_direct) priorityScore += 3;

      // Filter out total mismatches (below 40% role or skill compatibility)
      if (breakdown.overallMatchScore >= 50 || breakdown.roleSimilarityScore >= 60) {
        let recommendation = `Recommended based on ${breakdown.matchedSkills.length} matching skills and strong role continuity.`;
        if (breakdown.roleSimilarityScore >= 80) {
          recommendation = `Direct role progression from "${candidate.currentRole}" with verified employer sponsorship.`;
        } else if (breakdown.whyYouMatch.length > 0) {
          recommendation = breakdown.whyYouMatch[0];
        }

        scoredOpportunities.push({
          job,
          matchScore: Math.min(99, priorityScore),
          atsScore: breakdown.atsCompatibilityScore,
          breakdown,
          recommendationReason: recommendation,
        });
      }
    }

    // Sort descending by match score
    scoredOpportunities.sort((a, b) => b.matchScore - a.matchScore);

    return scoredOpportunities.slice(0, limit);
  }

  // ── HELPER UTILITIES ──────────────────────────────────────────────────────

  public static findCanonicalRole(title: string): string {
    const lower = title.toLowerCase();
    const sortedEntries = Object.entries(ROLE_GRAPH).sort((a, b) => b[0].length - a[0].length);
    for (const [key, node] of sortedEntries) {
      if (lower.includes(key) || node.synonyms.some((s) => lower.includes(s))) {
        return node.canonical;
      }
    }
    return title.trim();
  }

  public static getTransferableRoles(canonicalRole: string): string[] {
    const lower = canonicalRole.toLowerCase();
    const node = Object.entries(ROLE_GRAPH).find(
      ([key, n]) => key === lower || n.canonical.toLowerCase() === lower
    )?.[1];

    if (!node) {
      return ["Project Specialist", "Technical Consultant", "Operations Associate"];
    }

    const rawRoles = Array.from(
      new Set([...node.seniorRoles, ...node.lateralRoles, ...node.juniorRoles])
    );

    return rawRoles.map((r) => this.findCanonicalRole(r)).slice(0, 6);
  }

  public static computeRoleSimilarity(roleA: string, roleB: string): number {
    const a = roleA.toLowerCase().trim();
    const b = roleB.toLowerCase().trim();

    if (a === b) return 100;
    if (a.includes(b) || b.includes(a)) return 90;

    // Check Role Graph relationships
    const nodeA = Object.entries(ROLE_GRAPH).find(([k, n]) => k === a || n.canonical.toLowerCase() === a)?.[1];
    if (nodeA) {
      if (nodeA.synonyms.some((s) => b.includes(s))) return 95;
      if (nodeA.seniorRoles.some((s) => s.toLowerCase() === b || b.includes(s.toLowerCase()))) return 88;
      if (nodeA.lateralRoles.some((s) => s.toLowerCase() === b || b.includes(s.toLowerCase()))) return 85;
      if (nodeA.juniorRoles.some((s) => s.toLowerCase() === b || b.includes(s.toLowerCase()))) return 82;
    }

    // Jaccard word token similarity
    const tokensA = new Set(a.split(/\s+/));
    const tokensB = new Set(b.split(/\s+/));
    const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);

    const jaccard = union.size > 0 ? intersection.size / union.size : 0;
    return Math.max(50, Math.round(jaccard * 100));
  }
}
