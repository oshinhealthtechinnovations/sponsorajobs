/**
 * Smart Search Query Normalizer & Typo Corrector
 * Ensures misspelled search queries (e.g., "civi enginner", "sofware devloper")
 * match relevant real jobs just like Glassdoor, Indeed, and Google Search.
 */

const COMMON_TYPOS: Record<string, string> = {
  // Engineering & Tech
  civi: "civil",
  civl: "civil",
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
  dev: "developer",
  programer: "programmer",
  frontent: "frontend",
  bakcend: "backend",
  fullstck: "fullstack",
  fulstack: "fullstack",

  // Healthcare
  nurs: "nurse",
  nurce: "nurse",
  docter: "doctor",
  physican: "physician",
  therapistt: "therapist",

  // Business / Finance
  manger: "manager",
  managr: "manager",
  acountant: "accountant",
  acct: "accountant",
  analist: "analyst",
  consultent: "consultant",
  represenative: "representative",

  // Sponsorship
  sposor: "sponsor",
  sponsership: "sponsorship",
  visaa: "visa",
};

const STOP_WORDS = new Set(["a", "an", "the", "in", "on", "at", "or", "and", "is", "of", "to", "for", "with", "1=1", "--", "select", "drop", "delete", "where"]);

export function normalizeSearchQuery(rawQuery: string): {
  normalized: string;
  original: string;
  isCorrected: boolean;
  tokens: string[];
} {
  if (!rawQuery || typeof rawQuery !== "string") {
    return { normalized: "", original: "", isCorrected: false, tokens: [] };
  }

  const clean = rawQuery.trim().toLowerCase();
  const rawWords = clean.split(/\s+/).filter(Boolean);

  let isCorrected = false;
  const correctedTokens: string[] = [];

  for (const w of rawWords) {
    const lower = w.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!lower || STOP_WORDS.has(lower)) continue;

    if (COMMON_TYPOS[lower]) {
      isCorrected = true;
      correctedTokens.push(COMMON_TYPOS[lower]);
    } else {
      correctedTokens.push(lower);
    }
  }

  const normalized = correctedTokens.join(" ");

  return {
    normalized,
    original: rawQuery,
    isCorrected,
    tokens: correctedTokens,
  };
}
