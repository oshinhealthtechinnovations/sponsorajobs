/**
 * Smart Search Query Normalizer, Synonym Expander & Intelligent Domain Scanner
 * Ensures search queries (e.g. "civil engineer", "civi enginner", "structural", "swe", "rn")
 * match all relevant real jobs and generate contextual industry recommendations.
 */

const COMMON_TYPOS: Record<string, string> = {
  // Engineering & Construction
  civi: "civil",
  civl: "civil",
  civill: "civil",
  civils: "civil",
  enginner: "engineer",
  enginer: "engineer",
  engineerr: "engineer",
  engin: "engineer",
  eng: "engineer",
  structual: "structural",
  structur: "structural",
  structral: "structural",
  struct: "structural",
  contruction: "construction",
  constructon: "construction",
  constuction: "construction",
  infrastructre: "infrastructure",
  infrastucture: "infrastructure",
  archtect: "architect",
  architecht: "architect",
  geotech: "geotechnical",
  geotechnic: "geotechnical",
  survoyer: "surveyor",
  servayor: "surveyor",

  // Software & Tech
  sofware: "software",
  softwar: "software",
  softwre: "software",
  devloper: "developer",
  develper: "developer",
  developper: "developer",
  devlpr: "developer",
  programer: "programmer",
  progammer: "programmer",
  frontent: "frontend",
  fronted: "frontend",
  bakcend: "backend",
  backned: "backend",
  fullstck: "fullstack",
  fulstack: "fullstack",
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

  // Business / Finance / Management
  manger: "manager",
  managr: "manager",
  maneger: "manager",
  prject: "project",
  projct: "project",
  acountant: "accountant",
  accountent: "accountant",
  acct: "accountant",
  anlyst: "analyst",
  analist: "analyst",
  consultent: "consultant",
  represenative: "representative",
  markting: "marketing",
  marketer: "marketing",

  // Sponsorship & General
  sposor: "sponsor",
  sponsership: "sponsorship",
  sponorship: "sponsorship",
  sponser: "sponsor",
  visaa: "visa",
  reloaction: "relocation",
  remot: "remote",
};

/**
 * Common abbreviations and domain synonyms that expand into broader relevant roles
 */
const ROLE_SYNONYMS: Record<string, string[]> = {
  // Civil & Infrastructure Engineering
  civil: [
    "civil",
    "civil engineer",
    "structural",
    "structural engineer",
    "site engineer",
    "civil infrastructure engineer",
    "civil project engineer",
    "civil design engineer",
    "geotechnical engineer",
    "highway engineer",
    "water resources engineer",
    "construction"
  ],
  structural: [
    "structural",
    "structural engineer",
    "civil & structural engineer",
    "senior structural engineer",
    "structural designer",
    "bridge engineer",
    "civil engineer"
  ],
  construction: [
    "construction",
    "construction manager",
    "site manager",
    "project engineer",
    "quantity surveyor",
    "civil engineer",
    "commercial manager",
    "planning engineer"
  ],
  bim: [
    "bim",
    "bim coordinator",
    "bim manager",
    "cad designer",
    "digital engineer",
    "revit modeler"
  ],
  surveyor: [
    "quantity surveyor",
    "building surveyor",
    "commercial manager",
    "estimator",
    "cost consultant"
  ],
  infrastructure: [
    "infrastructure",
    "infrastructure engineer",
    "civil infrastructure engineer",
    "highways engineer",
    "rail engineer",
    "utilities engineer"
  ],

  // Software & Technology
  swe: ["software engineer", "developer", "backend", "frontend", "full stack"],
  sde: ["software development engineer", "software engineer", "developer", "full stack"],
  sre: ["site reliability engineer", "devops", "cloud", "infrastructure", "platform"],
  devops: ["devops", "site reliability engineer", "cloud architect", "platform engineer", "kubernetes"],
  fullstack: ["full stack", "software engineer", "developer", "frontend", "backend"],
  frontend: ["frontend", "ui engineer", "web developer", "react", "typescript"],
  backend: ["backend", "software engineer", "node", "python", "golang", "api"],
  ml: ["machine learning", "data scientist", "ai engineer", "deep learning", "data engineer"],
  ai: ["ai", "machine learning", "data scientist", "llm", "generative ai"],
  data: ["data engineer", "data scientist", "data analyst", "analytics engineer", "database administrator"],
  qa: ["qa", "automation test engineer", "sdet", "software tester"],
  golang: ["golang", "go", "backend", "software engineer"],
  react: ["react", "frontend", "next.js", "full stack", "javascript", "typescript"],
  node: ["node", "backend", "javascript", "typescript", "api"],
  python: ["python", "data engineer", "backend", "django", "machine learning"],
  cloud: ["cloud", "aws", "azure", "devops", "cloud architect"],

  // Healthcare
  rn: ["registered nurse", "nurse", "healthcare", "clinical", "staff nurse"],
  nurse: ["registered nurse", "staff nurse", "clinical", "healthcare", "practitioner"],
  gp: ["general practitioner", "family physician", "medical officer", "doctor"],
  doctor: ["medical doctor", "physician", "doctor", "consultant"],
  pharmacist: ["pharmacist", "clinical pharmacist", "community pharmacist"],

  // Finance, HR & Business
  ca: ["chartered accountant", "accountant", "finance", "auditor"],
  accountant: ["accountant", "financial accountant", "financial analyst", "auditor", "tax consultant"],
  finance: ["finance", "financial analyst", "commercial", "finance manager"],
  hr: ["human resources", "talent acquisition", "recruiter", "people ops", "hr manager"],
  recruiter: ["talent acquisition", "human resources", "recruitment", "hr"],
  pm: ["project manager", "programme manager", "delivery manager", "operations"],
  project: ["project manager", "project engineer", "project coordinator", "planning manager"]
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
 * High-demand curated fallback search keywords
 */
export const POPULAR_SEARCH_KEYWORDS = [
  "Civil Engineer",
  "Structural Engineer",
  "Software Engineer",
  "Frontend Developer",
  "Backend Engineer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Registered Nurse",
  "Quantity Surveyor",
  "Project Manager",
  "Financial Analyst"
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
 * Returns smart, context-aware alternative search suggestions based on the user's specific domain
 */
export function getRelatedSearchSuggestions(currentQuery?: string): string[] {
  if (!currentQuery || !currentQuery.trim()) {
    return POPULAR_SEARCH_KEYWORDS.slice(0, 6);
  }

  const { tokens, synonyms } = normalizeSearchQuery(currentQuery);
  const cleanQ = currentQuery.toLowerCase().trim();
  const suggestions: string[] = [];

  // 1. Add domain-specific synonyms matching the query
  if (synonyms.length > 0) {
    for (const syn of synonyms) {
      if (suggestions.length >= 6) break;
      if (
        !suggestions.some((s) => s.toLowerCase() === syn.toLowerCase()) &&
        syn.toLowerCase() !== cleanQ
      ) {
        suggestions.push(syn);
      }
    }
  }

  // 2. Add domain variations from matching tokens
  for (const token of tokens) {
    if (suggestions.length >= 6) break;
    if (ROLE_SYNONYMS[token]) {
      for (const role of ROLE_SYNONYMS[token]) {
        if (suggestions.length >= 6) break;
        if (
          !suggestions.some((s) => s.toLowerCase() === role.toLowerCase()) &&
          role.toLowerCase() !== cleanQ
        ) {
          suggestions.push(role);
        }
      }
    }
  }

  // 3. Fall back to popular keywords only if we don't have enough suggestions
  for (const pop of POPULAR_SEARCH_KEYWORDS) {
    if (suggestions.length >= 6) break;
    if (
      !suggestions.some((s) => s.toLowerCase() === pop.toLowerCase()) &&
      !cleanQ.includes(pop.toLowerCase())
    ) {
      suggestions.push(pop);
    }
  }

  return suggestions.slice(0, 6);
}
