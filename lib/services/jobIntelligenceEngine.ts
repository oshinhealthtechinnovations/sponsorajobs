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
  targetCountry?: string;
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
  "quantity surveyor": {
    canonical: "Quantity Surveyor",
    synonyms: ["qs", "cost manager", "commercial manager", "estimator", "cost consultant", "assistant quantity surveyor", "senior quantity surveyor"],
    parentRoles: ["commercial director", "head of commercial"],
    lateralRoles: ["estimator", "commercial manager", "project manager", "contracts manager"],
    juniorRoles: ["assistant quantity surveyor", "graduate quantity surveyor", "trainee qs"],
    seniorRoles: ["senior quantity surveyor", "managing quantity surveyor", "commercial director"],
    industry: "Construction & Commercial Management",
    typicalSkills: ["cost management", "nec4", "procurement", "tendering", "contract administration", "bills of quantities", "budget control"],
  },
  "site engineer": {
    canonical: "Site Engineer",
    synonyms: ["setting out engineer", "field engineer", "site civil engineer", "construction site engineer"],
    parentRoles: ["site manager", "project engineer"],
    lateralRoles: ["civil engineer", "assistant site manager", "section engineer"],
    juniorRoles: ["graduate site engineer", "junior site engineer"],
    seniorRoles: ["senior site engineer", "site agent", "project manager"],
    industry: "Construction & Civil Engineering",
    typicalSkills: ["setting out", "total station", "autocad", "site supervision", "health & safety", "quality control"],
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
  "electrical engineer": {
    canonical: "Electrical Engineer",
    synonyms: ["electrical design engineer", "building services electrical engineer", "power systems engineer", "mep electrical engineer"],
    parentRoles: ["senior electrical engineer", "principal electrical engineer"],
    lateralRoles: ["mechanical engineer", "building services engineer", "mep engineer", "automation engineer"],
    juniorRoles: ["graduate electrical engineer", "junior electrical engineer"],
    seniorRoles: ["senior electrical engineer", "lead electrical engineer", "associate electrical director"],
    industry: "Engineering & Building Services",
    typicalSkills: ["autocad", "revit mep", "electrical design", "18th edition", "power distribution", "building services"],
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
  "full stack developer": {
    canonical: "Full Stack Developer",
    synonyms: [
      "full stack engineer",
      "full-stack developer",
      "full-stack engineer",
      "fullstack developer",
      "fullstack engineer",
      "full stack web developer",
      "mern developer",
      "mern stack developer",
      "mean stack developer",
      "web developer",
      "lead full stack developer",
      "full stack software engineer"
    ],
    parentRoles: ["lead full stack developer", "engineering manager", "tech lead"],
    lateralRoles: ["software engineer", "frontend developer", "backend developer", "devops engineer", "cloud engineer"],
    juniorRoles: ["junior full stack developer", "junior web developer", "graduate software engineer"],
    seniorRoles: ["senior full stack developer", "principal full stack engineer", "lead developer", "staff software engineer"],
    industry: "Information Technology & Software",
    typicalSkills: ["react", "node.js", "typescript", "javascript", "sql", "git", "docker", "rest api", "next.js", "postgresql", "mongodb"],
  },
  "frontend developer": {
    canonical: "Frontend Developer",
    synonyms: [
      "frontend engineer",
      "front end developer",
      "front end engineer",
      "front-end developer",
      "front-end engineer",
      "react developer",
      "ui developer",
      "javascript developer"
    ],
    parentRoles: ["lead frontend engineer", "tech lead"],
    lateralRoles: ["full stack developer", "ui/ux designer", "software engineer"],
    juniorRoles: ["junior frontend developer", "junior web developer"],
    seniorRoles: ["senior frontend developer", "principal frontend engineer", "lead frontend developer"],
    industry: "Information Technology & Software",
    typicalSkills: ["react", "typescript", "javascript", "html", "css", "tailwind", "next.js", "vue", "angular", "figma"],
  },
  "backend developer": {
    canonical: "Backend Developer",
    synonyms: [
      "backend engineer",
      "back end developer",
      "back end engineer",
      "back-end developer",
      "back-end engineer",
      "api developer",
      "node.js developer",
      "node developer",
      "python developer",
      "java developer",
      "golang developer"
    ],
    parentRoles: ["lead backend engineer", "tech lead", "engineering manager"],
    lateralRoles: ["full stack developer", "software engineer", "cloud engineer", "devops engineer", "data engineer"],
    juniorRoles: ["junior backend developer", "associate software engineer"],
    seniorRoles: ["senior backend developer", "principal backend engineer", "staff software engineer"],
    industry: "Information Technology & Software",
    typicalSkills: ["node.js", "python", "sql", "java", "golang", "postgresql", "docker", "rest api", "graphql", "microservices", "redis", "aws"],
  },
  "software engineer": {
    canonical: "Software Engineer",
    synonyms: [
      "software developer",
      "software development engineer",
      "sde",
      "programmer",
      "software architect",
      "application developer",
      "computer programmer"
    ],
    parentRoles: ["senior software engineer", "tech lead", "engineering manager"],
    lateralRoles: ["full stack developer", "backend developer", "frontend developer", "devops engineer", "mobile developer", "cloud engineer"],
    juniorRoles: ["junior software engineer", "associate developer", "graduate software engineer"],
    seniorRoles: ["senior software engineer", "staff software engineer", "principal engineer", "tech lead", "architect"],
    industry: "Information Technology & Software",
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
  "data engineer": {
    canonical: "Data Engineer",
    synonyms: ["big data engineer", "data platform engineer", "etl developer", "analytics engineer", "data pipeline engineer"],
    parentRoles: ["lead data engineer", "head of data", "data architect"],
    lateralRoles: ["data analyst", "data scientist", "backend developer", "cloud engineer"],
    juniorRoles: ["junior data engineer", "graduate data engineer"],
    seniorRoles: ["senior data engineer", "principal data engineer", "data architect"],
    industry: "Technology & Data",
    typicalSkills: ["python", "sql", "spark", "hadoop", "etl", "data modeling", "aws", "snowflake", "bigquery", "airflow", "kafka"],
  },
  "data scientist": {
    canonical: "Data Scientist",
    synonyms: ["machine learning engineer", "ml engineer", "ai engineer", "applied scientist", "data science consultant"],
    parentRoles: ["lead data scientist", "head of ai", "chief data officer"],
    lateralRoles: ["data analyst", "data engineer", "machine learning engineer", "statistician"],
    juniorRoles: ["junior data scientist", "graduate data scientist"],
    seniorRoles: ["senior data scientist", "principal data scientist", "lead ai engineer"],
    industry: "Technology & Artificial Intelligence",
    typicalSkills: ["python", "machine learning", "sql", "tensorflow", "pytorch", "deep learning", "statistical modeling", "scikit-learn", "data analysis"],
  },
  "qa automation engineer": {
    canonical: "QA Automation Engineer",
    synonyms: [
      "qa engineer",
      "quality assurance engineer",
      "sdet",
      "software development engineer in test",
      "test engineer",
      "automation tester",
      "qa tester"
    ],
    parentRoles: ["qa lead", "head of quality assurance"],
    lateralRoles: ["software engineer", "devops engineer", "systems analyst"],
    juniorRoles: ["junior qa tester", "manual tester"],
    seniorRoles: ["senior qa engineer", "lead sdet", "principal test engineer"],
    industry: "Information Technology",
    typicalSkills: ["selenium", "cypress", "playwright", "test automation", "jest", "unit testing", "jira", "ci/cd", "javascript", "python"],
  },
  "product manager": {
    canonical: "Product Manager",
    synonyms: ["product owner", "technical product manager", "associate product manager", "product lead", "senior product manager"],
    parentRoles: ["group product manager", "head of product", "vp of product"],
    lateralRoles: ["project manager", "business analyst", "scrum master", "product designer"],
    juniorRoles: ["associate product manager", "junior product owner"],
    seniorRoles: ["senior product manager", "lead product manager", "director of product"],
    industry: "Technology & Product",
    typicalSkills: ["product management", "user research", "roadmapping", "agile", "jira", "data analysis", "stakeholder management"],
  },
  "business analyst": {
    canonical: "Business Analyst",
    synonyms: ["business systems analyst", "technical business analyst", "functional analyst", "it business analyst"],
    parentRoles: ["lead business analyst", "consulting manager"],
    lateralRoles: ["data analyst", "product manager", "project manager", "pmo analyst"],
    juniorRoles: ["junior business analyst", "graduate analyst"],
    seniorRoles: ["senior business analyst", "principal business analyst", "lead consultant"],
    industry: "Technology / Consulting / Finance",
    typicalSkills: ["requirements gathering", "process mapping", "sql", "stakeholder management", "jira", "agile", "user stories", "data analysis"],
  },
  "devops engineer": {
    canonical: "DevOps Engineer",
    synonyms: ["cloud engineer", "site reliability engineer", "sre", "platform engineer", "infrastructure engineer", "cloud architect", "solutions architect"],
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
  "next.js": { category: "technical", synonyms: ["nextjs", "next js"] },
  "vue.js": { category: "technical", synonyms: ["vue", "vuejs", "vue 3", "nuxt"] },
  angular: { category: "technical", synonyms: ["angularjs", "angular 2+"] },
  tailwind: { category: "technical", synonyms: ["tailwindcss", "tailwind css"] },
  html: { category: "technical", synonyms: ["html5"] },
  css: { category: "technical", synonyms: ["css3", "sass", "scss"] },
  figma: { category: "tool", synonyms: ["ui design", "wireframing", "prototyping"] },
  java: { category: "technical", synonyms: ["spring", "spring boot", "jvm", "j2ee"] },
  "c#": { category: "technical", synonyms: ["csharp", ".net", "dotnet", "asp.net"] },
  golang: { category: "technical", synonyms: ["go", "golang developer"] },
  "c++": { category: "technical", synonyms: ["cpp", "c/c++"] },
  express: { category: "technical", synonyms: ["express.js", "expressjs"] },
  django: { category: "technical", synonyms: ["django rest framework"] },
  fastapi: { category: "technical", synonyms: [] },
  graphql: { category: "technical", synonyms: ["apollo graphql"] },
  "rest api": { category: "technical", synonyms: ["restful api", "rest apis", "rest web services", "api development"] },
  microservices: { category: "technical", synonyms: ["distributed architecture", "service oriented architecture"] },
  postgresql: { category: "technical", synonyms: ["postgres"] },
  mongodb: { category: "technical", synonyms: ["mongo", "nosql", "mongoose"] },
  redis: { category: "technical", synonyms: ["in-memory cache", "caching"] },
  git: { category: "tool", synonyms: ["github", "gitlab", "version control", "bitbucket"] },
  linux: { category: "technical", synonyms: ["unix", "bash", "shell scripting", "ubuntu", "centos"] },
  azure: { category: "technical", synonyms: ["microsoft azure", "azure devops"] },
  gcp: { category: "technical", synonyms: ["google cloud", "google cloud platform"] },
  aws: { category: "technical", synonyms: ["amazon web services", "ec2", "s3", "lambda", "ecs"] },
  kubernetes: { category: "technical", synonyms: ["k8s"] },
  docker: { category: "technical", synonyms: ["containerization", "containers"] },
  terraform: { category: "technical", synonyms: ["iac", "infrastructure as code"] },
  "ci/cd": { category: "technical", synonyms: ["continuous integration", "github actions", "jenkins", "gitlab ci"] },
  "system design": { category: "technical", synonyms: ["software architecture", "distributed systems"] },
  selenium: { category: "technical", synonyms: ["selenium webdriver"] },
  cypress: { category: "technical", synonyms: [] },
  playwright: { category: "technical", synonyms: [] },
  jest: { category: "technical", synonyms: ["vitest", "mocha", "chai"] },
  "unit testing": { category: "technical", synonyms: ["test driven development", "tdd", "automated testing"] },
  
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

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesWordOrPhrase(text: string, phrase: string): boolean {
  if (!text || !phrase) return false;
  const escaped = escapeRegex(phrase.trim().toLowerCase());
  const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
  return regex.test(text.toLowerCase());
}

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

    // Detect Target Destination Country from Natural Language Prompt or CV text
    let targetCountry: string | undefined = undefined;
    if (/\b(uk|united kingdom|london|england|britain|skilled worker|cos|tier 2)\b/i.test(text)) {
      targetCountry = "GB";
    } else if (/\b(us|usa|united states|america|h-1b|h1b)\b/i.test(text)) {
      targetCountry = "US";
    } else if (/\b(australia|sydney|melbourne|brisbane|tss 482|subclass 482)\b/i.test(text)) {
      targetCountry = "AU";
    } else if (/\b(canada|toronto|vancouver|lmia|gts)\b/i.test(text)) {
      targetCountry = "CA";
    } else if (/\b(new zealand|auckland|aewv)\b/i.test(text)) {
      targetCountry = "NZ";
    }

    // Extract Skills & Software early so they can be used for domain role inference
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

    // Detect Current / Primary Role
    let detectedRole = "General Professional";
    const sortedRoleEntries = Object.entries(ROLE_GRAPH).sort((a, b) => b[0].length - a[0].length);

    // 1. First check top headline lines (lines 0-4) where candidates declare their title:
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const lineLower = lines[i].toLowerCase();
      for (const [key, node] of sortedRoleEntries) {
        if (matchesWordOrPhrase(lineLower, key) || node.synonyms.some((s) => matchesWordOrPhrase(lineLower, s))) {
          detectedRole = node.canonical;
          break;
        }
      }
      if (detectedRole !== "General Professional") break;
    }

    // 2. If not detected in headline, search entire document with longest specific keys first
    if (detectedRole === "General Professional") {
      for (const [key, node] of sortedRoleEntries) {
        if (matchesWordOrPhrase(lower, key) || node.synonyms.some((s) => matchesWordOrPhrase(lower, s))) {
          detectedRole = node.canonical;
          break;
        }
      }
    }

    // 3. Fallback: check first 5 lines for role keyword indicators
    if (detectedRole === "General Professional") {
      for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].toLowerCase();
        if (
          line.includes("developer") ||
          line.includes("engineer") ||
          line.includes("manager") ||
          line.includes("nurse") ||
          line.includes("analyst") ||
          line.includes("chef") ||
          line.includes("architect")
        ) {
          detectedRole = lines[i];
          break;
        }
      }
    }

    // 4. Intelligent Skill-Based Role Deduction: If detectedRole is still General Professional,
    // infer the candidate's canonical role from their concrete skill footprint!
    if (detectedRole === "General Professional" && matchedSkills.size > 0) {
      if (
        matchedSkills.has("react") ||
        matchedSkills.has("node.js") ||
        matchedSkills.has("typescript") ||
        matchedSkills.has("javascript") ||
        matchedSkills.has("next.js") ||
        matchedSkills.has("vue.js") ||
        matchedSkills.has("angular")
      ) {
        if (matchedSkills.has("node.js") || matchedSkills.has("sql") || matchedSkills.has("docker") || matchedSkills.has("mongodb") || matchedSkills.has("postgresql")) {
          detectedRole = "Full Stack Developer";
        } else {
          detectedRole = "Frontend Developer";
        }
      } else if (matchedSkills.has("python") || matchedSkills.has("java") || matchedSkills.has("golang") || matchedSkills.has("c#")) {
        if (matchedSkills.has("machine learning") || matchedSkills.has("data modeling")) {
          detectedRole = "Data Scientist";
        } else if (matchedSkills.has("sql") || matchedSkills.has("power bi") || matchedSkills.has("tableau")) {
          detectedRole = "Data Analyst";
        } else {
          detectedRole = "Software Engineer";
        }
      } else if (matchedSkills.has("aws") || matchedSkills.has("kubernetes") || matchedSkills.has("terraform") || matchedSkills.has("docker") || matchedSkills.has("ci/cd")) {
        detectedRole = "DevOps Engineer";
      } else if (matchedSkills.has("selenium") || matchedSkills.has("cypress") || matchedSkills.has("playwright")) {
        detectedRole = "QA Automation Engineer";
      } else if (matchedSkills.has("autocad") || matchedSkills.has("civil 3d") || matchedSkills.has("bim")) {
        detectedRole = "Civil Engineer";
      } else if (matchedSkills.has("revit") || matchedSkills.has("structural analysis")) {
        detectedRole = "Structural Engineer";
      } else if (matchedSkills.has("solidworks") || matchedSkills.has("catia")) {
        detectedRole = "Mechanical Engineer";
      } else if (matchedSkills.has("patient care") || matchedSkills.has("clinical assessment") || matchedSkills.has("medication administration")) {
        detectedRole = "Registered Nurse";
      } else if (matchedSkills.has("food preparation") || matchedSkills.has("culinary arts") || matchedSkills.has("kitchen hygiene")) {
        detectedRole = "Chef de Partie";
      } else if (matchedSkills.has("project management") || matchedSkills.has("jira") || matchedSkills.has("ms project") || matchedSkills.has("agile")) {
        detectedRole = "Project Manager";
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
      // Parse date ranges like (2018 - 2023) or (2020 - Present)
      const dateRanges = text.match(/\b(200\d|201\d|202\d)\s*[-–—to]+\s*(200\d|201\d|202\d|present|current)\b/gi);
      if (dateRanges && dateRanges.length > 0) {
        years = Math.min(25, Math.max(2, dateRanges.length * 2));
      }
      // Also check chronological start and end years
      const allFoundYears = (text.match(/\b(201\d|202\d)\b/g) || []).map((y) => parseInt(y, 10));
      if (allFoundYears.length >= 2) {
        const span = Math.max(...allFoundYears) - Math.min(...allFoundYears);
        if (span >= 1 && span <= 30) {
          years = Math.max(years, span);
        }
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
    const roleLower = normalizedRole.toLowerCase();
    if (
      roleLower.includes("software") ||
      roleLower.includes("developer") ||
      roleLower.includes("frontend") ||
      roleLower.includes("backend") ||
      roleLower.includes("full stack") ||
      roleLower.includes("devops") ||
      roleLower.includes("data") ||
      roleLower.includes("cloud") ||
      roleLower.includes("qa") ||
      /\b(software|full stack|frontend|backend|cloud|devops|data|ai|web)\b/i.test(lower)
    ) {
      primaryIndustry = "Information Technology & Software";
    } else if (
      roleLower.includes("civil") ||
      roleLower.includes("structural") ||
      roleLower.includes("construction") ||
      roleLower.includes("quantity surveyor") ||
      roleLower.includes("site engineer") ||
      /\b(civil|construction|infrastructure|structural|site|building|bim)\b/i.test(lower)
    ) {
      primaryIndustry = "Construction & Civil Engineering";
    } else if (
      roleLower.includes("nurse") ||
      roleLower.includes("healthcare") ||
      /\b(nurse|clinical|patient|hospital|medical|healthcare|hca)\b/i.test(lower)
    ) {
      primaryIndustry = "Healthcare & Nursing";
    } else if (
      roleLower.includes("chef") ||
      roleLower.includes("hotel") ||
      roleLower.includes("hospitality") ||
      /\b(chef|hotel|culinary|food|beverage|restaurant|hospitality)\b/i.test(lower)
    ) {
      primaryIndustry = "Hospitality & Culinary";
    } else if (
      roleLower.includes("mechanical") ||
      roleLower.includes("electrical") ||
      roleLower.includes("maintenance") ||
      /\b(mechanical|electrical|maintenance|solidworks|cad)\b/i.test(lower)
    ) {
      primaryIndustry = "Engineering & Manufacturing";
    } else if (/\b(finance|accounting|audit|tax|banking|financial)\b/i.test(lower)) {
      primaryIndustry = "Finance & Banking";
    }

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
      targetCountry,
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

    // Extract required vs preferred skills using proper word-boundary regex (same as CV extraction)
    const requiredSkills: string[] = [];
    const preferredSkills: string[] = [];
    const toolsAndTech: string[] = [];

    for (const [skillKey, meta] of Object.entries(SKILL_TAXONOMY)) {
      // Use word-boundary regex to avoid false substring matches (e.g., "go" inside "django")
      const skillRegex = new RegExp(`(^|[^a-z0-9])${escapeRegex(skillKey)}([^a-z0-9]|$)`, "i");
      const synonymMatch = meta.synonyms.some((s) => {
        const synRegex = new RegExp(`(^|[^a-z0-9])${escapeRegex(s)}([^a-z0-9]|$)`, "i");
        return synRegex.test(lower);
      });
      if (skillRegex.test(lower) || synonymMatch) {
        // Check if explicitly marked as preferred
        const isPreferred = [
          `preferred: ${skillKey}`, `nice to have: ${skillKey}`, `bonus: ${skillKey}`,
          `preferred: ${meta.synonyms[0] || ""}`, `nice to have: ${meta.synonyms[0] || ""}`
        ].some((phrase) => lower.includes(phrase));
        if (isPreferred) {
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
    
    // Proper industry alignment: check if key domain words overlap (not just first 5 chars)
    const candidateIndustryTokens = candidate.primaryIndustry.toLowerCase().split(/[\s/&,]+/).filter((t) => t.length >= 4);
    const jobIndustryTokens = jobIntel.industry.toLowerCase().split(/[\s/&,]+/).filter((t) => t.length >= 4);
    const industryOverlapCount = candidateIndustryTokens.filter((t) => jobIndustryTokens.some((jt) => jt.includes(t) || t.includes(jt))).length;
    const industryAlignment = industryOverlapCount >= 1 ? 100 : 55;

    let overallScore = Math.round(
      skillsScore * 0.25 +
      experienceScore * 0.20 +
      roleScore * 0.15 +
      qualScore * 0.10 +
      atsScore * 0.10 +
      industryAlignment * 0.10 +
      visaScore * 0.10
    );

    // Aggressive Cross-Domain Protection:
    // Hard block: if role similarity is very low AND skills don't match, it's a cross-domain mismatch
    if (skillsScore === 0 && roleScore < 50) {
      overallScore = Math.min(overallScore, 20); // Hard block irrelevant jobs
    } else if (roleScore < 25 && skillsScore < 20) {
      overallScore = Math.min(overallScore, 28); // Strong block for unrelated roles
    } else if (industryAlignment < 60 && roleScore < 50) {
      overallScore = Math.min(overallScore, 35); // Cross-industry guard
    }

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
    const country = options?.country && options.country !== "ALL"
      ? options.country
      : (candidate.targetCountry || undefined);

    const db = getDatabase();

    // Build targeted keywords to match relevant vacancies across the entire database
    const roleKeywords = new Set<string>();
    [candidate.normalizedRole, candidate.currentRole, ...candidate.transferablePotentialRoles]
      .filter(Boolean)
      .forEach((r) => {
        const clean = r.toLowerCase().trim();
        roleKeywords.add(clean);
        clean.split(/\s+/).forEach((w) => {
          if (w.length >= 4 && !["assistant", "associate", "junior", "senior", "lead", "general"].includes(w)) {
            roleKeywords.add(w);
          }
        });
      });

    // Add candidate primary industry terms
    if (candidate.primaryIndustry) {
      candidate.primaryIndustry.toLowerCase().split(/[\s/&,]+/).forEach((term) => {
        if (term.length >= 5 && !["general", "services", "technology"].includes(term)) {
          roleKeywords.add(term);
        }
      });
    }

    // Add candidate core skills (technical skills take priority for matching)
    [...candidate.coreSkills, ...candidate.technicalSkills].forEach((skill) => {
      const clean = skill.toLowerCase().trim();
      if (clean.length >= 3) {
        roleKeywords.add(clean);
      }
    });

    // Cap keyword list at 20 for a wider but still targeted fetch
    const keywordList = Array.from(roleKeywords).slice(0, 20);
    let allJobs: any[] = [];

    if (keywordList.length > 0) {
      const likeClauses = keywordList.map(() => "(LOWER(title) LIKE ? OR LOWER(category_name) LIKE ?)").join(" OR ");
      const likeParams: string[] = [];
      keywordList.forEach((kw) => {
        likeParams.push(`%${kw}%`, `%${kw}%`);
      });

      const targetedQuery = country
        ? `SELECT * FROM jobs WHERE status = 'active' AND UPPER(country_code) = ? AND (${likeClauses}) ORDER BY has_sponsorship DESC, sponsorship_score DESC, published_at DESC LIMIT 250`
        : `SELECT * FROM jobs WHERE status = 'active' AND (${likeClauses}) ORDER BY has_sponsorship DESC, sponsorship_score DESC, published_at DESC LIMIT 250`;

      const stmt = country
        ? db.prepare(targetedQuery).bind(country.toUpperCase(), ...likeParams)
        : db.prepare(targetedQuery).bind(...likeParams);

      const res = await stmt.all<any>();
      allJobs = res.results || [];
    }

    // Fallback: If targeted query yielded fewer than 10 jobs, fetch domain-restricted sponsored jobs
    // CRITICAL: Do NOT fall back to completely random jobs — always restrict by industry/category
    if (allJobs.length < 10) {
      // Build domain-specific LIKE terms from industry (e.g. "technology", "healthcare", "construction")
      const industryTerms = candidate.primaryIndustry
        .toLowerCase()
        .split(/[\s/&,]+/)
        .filter((t) => t.length >= 4 && !["services", "cross", "functional"].includes(t))
        .slice(0, 3);

      let fallbackQuery: string;
      let fallbackParams: string[];

      if (industryTerms.length > 0) {
        // Use industry terms in category_name for domain-aware fallback
        const industryClauses = industryTerms.map(() => "LOWER(category_name) LIKE ?").join(" OR ");
        fallbackParams = industryTerms.map((t) => `%${t}%`);
        if (country) {
          fallbackQuery = `SELECT * FROM jobs WHERE status = 'active' AND UPPER(country_code) = ? AND (${industryClauses}) ORDER BY has_sponsorship DESC, sponsorship_score DESC, published_at DESC LIMIT 150`;
          fallbackParams = [country.toUpperCase(), ...fallbackParams];
        } else {
          fallbackQuery = `SELECT * FROM jobs WHERE status = 'active' AND (${industryClauses}) ORDER BY has_sponsorship DESC, sponsorship_score DESC, published_at DESC LIMIT 150`;
        }
      } else {
        // Only if industry is completely unknown, fall back to country-scoped top jobs
        fallbackParams = country ? [country.toUpperCase()] : [];
        fallbackQuery = country
          ? "SELECT * FROM jobs WHERE status = 'active' AND UPPER(country_code) = ? ORDER BY has_sponsorship DESC, sponsorship_score DESC, published_at DESC LIMIT 100"
          : "SELECT * FROM jobs WHERE status = 'active' ORDER BY has_sponsorship DESC, sponsorship_score DESC, published_at DESC LIMIT 100";
      }

      const stmt = db.prepare(fallbackQuery).bind(...fallbackParams);
      const fallbackRes = await stmt.all<any>();
      const existingIds = new Set(allJobs.map((j) => j.id));
      for (const j of fallbackRes.results || []) {
        if (!existingIds.has(j.id)) {
          allJobs.push(j);
        }
      }
    }

    const scoredOpportunities: RankedJobOpportunity[] = [];

    for (const job of allJobs) {
      const anyJob = job as any;
      const jobIntel = this.extractJobIntelligence(anyJob);
      const breakdown = this.calculateDetailedMatch(candidate, jobIntel);

      // Hard gate against cross-domain false positives:
      // Reject jobs with low overall score OR zero skill overlap with low role similarity.
      // Also guard against industry mismatch jobs sneaking in via fallback.
      const isCrossDomainMismatch =
        breakdown.skillsMatchScore === 0 && breakdown.roleSimilarityScore < 40;
      const isTooWeak = breakdown.overallMatchScore < 50;
      if (isTooWeak || isCrossDomainMismatch) {
        continue;
      }

      // Boost score for confirmed sponsorship & direct employers
      let priorityScore = breakdown.overallMatchScore;
      if (jobIntel.sponsorshipCertainty === "CONFIRMED_IN_LISTING") priorityScore += 5;
      if (anyJob.is_direct) priorityScore += 3;

      let recommendation = `Recommended based on ${breakdown.matchedSkills.length} matching skills and strong role continuity.`;
      if (breakdown.roleSimilarityScore >= 80) {
        recommendation = `Direct role alignment with "${candidate.currentRole}" with verified employer sponsorship.`;
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

    // Sort descending by match score
    scoredOpportunities.sort((a, b) => b.matchScore - a.matchScore);

    return scoredOpportunities.slice(0, limit);
  }

  // ── HELPER UTILITIES ──────────────────────────────────────────────────────

  public static findCanonicalRole(title: string): string {
    const lower = title.toLowerCase();
    const sortedEntries = Object.entries(ROLE_GRAPH).sort((a, b) => b[0].length - a[0].length);
    for (const [key, node] of sortedEntries) {
      if (matchesWordOrPhrase(lower, key) || node.synonyms.some((s) => matchesWordOrPhrase(lower, s))) {
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

    // Check Role Graph relationships
    const nodeA = Object.entries(ROLE_GRAPH).find(([k, n]) => k === a || n.canonical.toLowerCase() === a)?.[1];
    const nodeB = Object.entries(ROLE_GRAPH).find(([k, n]) => k === b || n.canonical.toLowerCase() === b)?.[1];

    if (nodeA) {
      if (nodeA.canonical.toLowerCase() === b) return 100;
      if (nodeA.synonyms.some((s) => matchesWordOrPhrase(b, s))) return 95;
      if (nodeA.seniorRoles.some((s) => matchesWordOrPhrase(b, s) || matchesWordOrPhrase(s, b))) return 88;
      if (nodeA.lateralRoles.some((s) => matchesWordOrPhrase(b, s) || matchesWordOrPhrase(s, b))) return 85;
      if (nodeA.juniorRoles.some((s) => matchesWordOrPhrase(b, s) || matchesWordOrPhrase(s, b))) return 82;
      if (nodeA.parentRoles.some((s) => matchesWordOrPhrase(b, s) || matchesWordOrPhrase(s, b))) return 88;
    }

    if (nodeB) {
      if (nodeB.canonical.toLowerCase() === a) return 100;
      if (nodeB.synonyms.some((s) => matchesWordOrPhrase(a, s))) return 95;
      if (nodeB.seniorRoles.some((s) => matchesWordOrPhrase(a, s) || matchesWordOrPhrase(s, a))) return 88;
      if (nodeB.lateralRoles.some((s) => matchesWordOrPhrase(a, s) || matchesWordOrPhrase(s, a))) return 85;
      if (nodeB.juniorRoles.some((s) => matchesWordOrPhrase(a, s) || matchesWordOrPhrase(s, a))) return 82;
      if (nodeB.parentRoles.some((s) => matchesWordOrPhrase(a, s) || matchesWordOrPhrase(s, a))) return 88;
    }

    // Sub-phrase match if multi-word (e.g. "project manager" inside "assistant project manager")
    if (a.length >= 8 && b.length >= 8) {
      if (matchesWordOrPhrase(a, b) || matchesWordOrPhrase(b, a)) {
        return 88;
      }
    }

    // Jaccard token similarity with domain modifier filtering
    const genericModifiers = new Set([
      "junior", "senior", "lead", "assistant", "associate", "specialist", "coordinator",
      "manager", "engineer", "analyst", "officer", "consultant", "director", "head",
      "and", "or", "in", "of", "for", "&", "the", "a", "an", "at", "to", "ii", "iii", "sr", "jr"
    ]);

    const rawTokensA = a.split(/[^a-z0-9]+/).filter(Boolean);
    const rawTokensB = b.split(/[^a-z0-9]+/).filter(Boolean);

    const tokensA = new Set(rawTokensA);
    const tokensB = new Set(rawTokensB);

    const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);

    if (intersection.size === 0) return 0;

    // If the only overlapping token is a generic modifier (e.g. both only have "manager")
    const domainOverlap = [...intersection].filter((t) => !genericModifiers.has(t));
    if (domainOverlap.length === 0) {
      return 15;
    }

    const jaccard = union.size > 0 ? intersection.size / union.size : 0;
    return Math.round(jaccard * 100);
  }
}
