/**
 * Smart Search Query Normalizer, Synonym Expander & Typo Corrector
 * Ensures misspelled or niche search queries (e.g. "civi enginner", "swe", "rn", "react dev", "golang")
 * match relevant real jobs just like Glassdoor, Indeed, and Google Search.
 */

const COMMON_TYPOS: Record<string, string> = {
  // Engineering & Tech
  civi: "civil",
  civl: "civil",
  civill: "civil",
  enginner: "engineer",
  enginer: "engineer",
  engineerr: "engineer",
  engin: "engineer",
  eng: "engineer",
  sofware: "software",
  softwar: "software",
  soft: "software",
  devloper: "developer",
  developper: "developer",
  develoepr: "developer",
  devlpr: "developer",
  dev: "developer",
  programer: "programmer",
  progammer: "programmer",
  frontent: "frontend",
  fronted: "frontend",
  bakcend: "backend",
  backned: "backend",
  fullstck: "fullstack",
  fulstack: "fullstack",
  fullstackk: "fullstack",
  reactjs: "react",
  nextjs: "next.js",
  nodejs: "node",
  vuejs: "vue",
  kubernets: "kubernetes",
  k8s: "kubernetes",
  pythn: "python",
  pyton: "python",
  javascrip: "javascript",
  typscript: "typescript",
  typescrip: "typescript",
  golng: "golang",

  // Healthcare
  nurs: "nurse",
  nurce: "nurse",
  nursingg: "nursing",
  docter: "doctor",
  physican: "physician",
  therapistt: "therapist",
  phamacist: "pharmacist",
  dentistt: "dentist",
  radiograper: "radiographer",

  // Business / Finance
  manger: "manager",
  managr: "manager",
  acountant: "accountant",
  acct: "accountant",
  analist: "analyst",
  consultent: "consultant",
  represenative: "representative",
  markting: "marketing",
  marketer: "marketing",

  // Sponsorship & General
  sposor: "sponsor",
  sponsership: "sponsorship",
  sponser: "sponsor",
  visaa: "visa",
  reloaction: "relocation",
  remot: "remote",
};

/**
 * Common abbreviations and domain synonyms that expand into broader relevant roles
 */
const ROLE_SYNONYMS: Record<string, string[]> = {
  // Engineering, Construction & Project Management
  civil: ["civil", "civil engineer", "structural", "construction", "site engineer", "project manager", "design manager", "infrastructure"],
  construction: ["construction", "site manager", "project manager", "civil", "structural", "planning", "design manager", "cost consultancy"],
  pm: ["project manager", "programme manager", "operations director", "project director", "planning manager", "product manager"],
  project: ["project manager", "programme manager", "project director", "planning manager", "project controls", "operations director"],
  planning: ["planning manager", "project manager", "project controls", "operations director"],
  director: ["operations director", "project director", "associate director", "head of", "lead"],
  design: ["design manager", "architectural", "product design", "ui designer", "engineering"],
  cost: ["cost consultancy", "quantity surveyor", "commercial manager", "estimator", "finance"],
  bim: ["information manager", "bim manager", "cad", "technical services", "digital engineer"],
  defence: ["project controls", "defence", "security", "aerospace"],

  // Software & Tech
  swe: ["software engineer", "developer", "backend", "frontend", "full stack"],
  sde: ["software development engineer", "software engineer", "developer"],
  sre: ["site reliability engineer", "devops", "cloud", "infrastructure", "platform"],
  devops: ["sre", "cloud engineer", "infrastructure", "platform engineer", "kubernetes"],
  fullstack: ["full stack", "software engineer", "developer", "frontend", "backend"],
  frontend: ["front end", "ui engineer", "web developer", "react", "javascript", "typescript"],
  backend: ["back end", "software engineer", "api", "node", "python", "java", "golang", "microservices"],
  ml: ["machine learning", "data scientist", "ai engineer", "data engineer", "deep learning"],
  ai: ["artificial intelligence", "machine learning", "data scientist", "llm", "generative ai"],
  qa: ["quality assurance", "test engineer", "automation engineer", "sdet"],
  golang: ["go", "backend", "software engineer"],
  react: ["frontend", "web developer", "javascript", "fullstack", "ui", "typescript"],
  node: ["backend", "javascript", "fullstack", "typescript", "api"],
  python: ["backend", "data engineer", "data science", "software engineer", "fastapi", "django"],
  aws: ["cloud", "devops", "infrastructure", "solutions architect"],
  cloud: ["aws", "azure", "gcp", "devops", "cloud architect", "infrastructure"],

  // Healthcare
  rn: ["registered nurse", "nurse", "healthcare", "clinical", "staff nurse"],
  nurse: ["registered nurse", "staff nurse", "clinical", "healthcare", "practitioner"],
  gp: ["general practitioner", "doctor", "physician", "medical"],
  doctor: ["physician", "general practitioner", "medical officer", "consultant"],
  pharmacist: ["pharmacy", "clinical pharmacist", "healthcare"],

  // Finance, HR & Business
  ca: ["chartered accountant", "accountant", "finance", "auditor"],
  accountant: ["finance", "financial analyst", "auditor", "accounts manager", "payroll"],
  payroll: ["payroll", "benefits", "human resources", "hr assistant", "compensation"],
  hr: ["human resources", "talent acquisition", "recruiter", "people ops", "payroll"],
  recruiter: ["talent acquisition", "human resources", "recruitment", "hr"],
  finance: ["financial analyst", "accountant", "commercial", "cost consultancy", "auditor"],
};

/**
 * Common suffixes and word stems to normalize (e.g. engineering -> engineer, managing -> manager)
 */
export function stemKeyword(word: string): string {
  const clean = word.toLowerCase().trim();
  if (clean.endsWith("ing") && clean.length > 5) return clean.slice(0, -3);
  if (clean.endsWith("ers") && clean.length > 5) return clean.slice(0, -3);
  if (clean.endsWith("er") && clean.length > 4) return clean.slice(0, -2);
  if (clean.endsWith("or") && clean.length > 4) return clean.slice(0, -2);
  if (clean.endsWith("s") && clean.length > 3 && !clean.endsWith("ss")) return clean.slice(0, -1);
  return clean;
}

/**
 * High-demand curated alternative search pills for instant recovery
 */
export const POPULAR_SEARCH_KEYWORDS = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Engineer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Cloud Architect",
  "Civil Engineer",
  "Registered Nurse",
  "Product Manager",
  "Financial Analyst",
  "Cybersecurity",
];

const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "or", "and", "is", "of", "to", "for", "with", "by", "from", "as",
  "job", "jobs", "role", "roles", "wanted", "looking", "need",
  "1=1", "11", "--", "select", "drop", "delete", "where", "union", "insert", "update", "table", "admin",
  "null", "like", "order", "group", "having", "limit", "offset", "join", "into", "values", "exec", "cast"
]);

export function normalizeSearchQuery(rawQuery: string): {
  normalized: string;
  original: string;
  isCorrected: boolean;
  tokens: string[];
  synonyms: string[];
} {
  if (!rawQuery || typeof rawQuery !== "string") {
    return { normalized: "", original: "", isCorrected: false, tokens: [], synonyms: [] };
  }

  const clean = rawQuery.trim().toLowerCase();
  const rawWords = clean.split(/\s+/).filter(Boolean);

  let isCorrected = false;
  const correctedTokens: string[] = [];
  const foundSynonyms: string[] = [];

  for (const w of rawWords) {
    const lower = w.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!lower || STOP_WORDS.has(lower) || /^\d+$/.test(lower)) continue;

    let token = lower;
    if (COMMON_TYPOS[lower]) {
      isCorrected = true;
      token = COMMON_TYPOS[lower];
    }
    correctedTokens.push(token);

    const stemmed = stemKeyword(token);
    if (stemmed !== token && stemmed.length >= 3) {
      correctedTokens.push(stemmed);
    }

    if (ROLE_SYNONYMS[token]) {
      foundSynonyms.push(...ROLE_SYNONYMS[token]);
    }
    if (ROLE_SYNONYMS[stemmed]) {
      foundSynonyms.push(...ROLE_SYNONYMS[stemmed]);
    }
  }

  const normalized = correctedTokens.slice(0, rawWords.length).join(" ");

  return {
    normalized,
    original: rawQuery,
    isCorrected,
    tokens: Array.from(new Set(correctedTokens)),
    synonyms: Array.from(new Set(foundSynonyms)),
  };
}

/**
 * Returns alternative keyword suggestions based on current query or top defaults
 */
export function getRelatedSearchSuggestions(currentQuery?: string): string[] {
  if (!currentQuery) {
    return POPULAR_SEARCH_KEYWORDS.slice(0, 6);
  }

  const { tokens, synonyms } = normalizeSearchQuery(currentQuery);
  const suggestions: string[] = [];

  // 1. Add synonyms first if available
  if (synonyms.length > 0) {
    suggestions.push(...synonyms.slice(0, 4));
  }

  // 2. Add individual token roles
  for (const token of tokens) {
    const capitalized = token.charAt(0).toUpperCase() + token.slice(1);
    if (!suggestions.some((s) => s.toLowerCase() === token)) {
      if (["engineer", "developer", "manager", "nurse", "analyst"].includes(token)) {
        suggestions.push(`Software ${capitalized}`);
      }
    }
  }

  // 3. Fill remaining slots with popular keywords
  for (const pop of POPULAR_SEARCH_KEYWORDS) {
    if (suggestions.length >= 6) break;
    if (!suggestions.some((s) => s.toLowerCase() === pop.toLowerCase()) && !currentQuery.toLowerCase().includes(pop.toLowerCase())) {
      suggestions.push(pop);
    }
  }

  return suggestions.slice(0, 6);
}
