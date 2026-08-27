/**
 * Comprehensive Occupations Taxonomy & Mapping Engine (UK SOC 2020 & O*NET Aligned)
 * Zero-LLM Deterministic Normalization & Match Weights
 */

export interface CanonicalOccupation {
  id: string;
  name: string;
  ukSocCode: string;
  onetCode?: string;
  aliases: string[];
  relatedOccupations: { occupationId: string; weight: number }[]; // 0.35 to 0.95
}

export const OCCUPATIONS_TAXONOMY: Record<string, CanonicalOccupation> = {
  "software_engineer": {
    id: "software_engineer",
    name: "Software Engineer / Developer",
    ukSocCode: "2134",
    onetCode: "15-1252.00",
    aliases: [
      "software engineer",
      "software developer",
      "full stack developer",
      "full stack engineer",
      "backend developer",
      "backend engineer",
      "frontend developer",
      "frontend engineer",
      "web developer",
      "application developer",
      "programmer",
      "systems engineer",
    ],
    relatedOccupations: [
      { occupationId: "data_engineer", weight: 0.80 },
      { occupationId: "devops_engineer", weight: 0.75 },
      { occupationId: "solutions_architect", weight: 0.85 },
      { occupationId: "qa_engineer", weight: 0.65 },
    ],
  },
  "data_engineer": {
    id: "data_engineer",
    name: "Data Engineer / BI Architect",
    ukSocCode: "2133",
    onetCode: "15-1243.00",
    aliases: [
      "data engineer",
      "big data engineer",
      "bi developer",
      "data platform engineer",
      "analytics engineer",
      "etl developer",
      "data warehouse architect",
    ],
    relatedOccupations: [
      { occupationId: "software_engineer", weight: 0.80 },
      { occupationId: "data_scientist", weight: 0.85 },
      { occupationId: "solutions_architect", weight: 0.75 },
    ],
  },
  "data_scientist": {
    id: "data_scientist",
    name: "Data Scientist / Machine Learning Engineer",
    ukSocCode: "2135",
    onetCode: "15-2051.00",
    aliases: [
      "data scientist",
      "machine learning engineer",
      "ml engineer",
      "ai engineer",
      "research scientist",
      "statistician",
      "nlp engineer",
      "computer vision engineer",
    ],
    relatedOccupations: [
      { occupationId: "data_engineer", weight: 0.85 },
      { occupationId: "software_engineer", weight: 0.75 },
    ],
  },
  "solutions_architect": {
    id: "solutions_architect",
    name: "Solutions / Enterprise Architect",
    ukSocCode: "2133",
    onetCode: "15-1299.08",
    aliases: [
      "solutions architect",
      "cloud architect",
      "enterprise architect",
      "systems architect",
      "technical architect",
      "principal architect",
    ],
    relatedOccupations: [
      { occupationId: "software_engineer", weight: 0.85 },
      { occupationId: "devops_engineer", weight: 0.80 },
    ],
  },
  "devops_engineer": {
    id: "devops_engineer",
    name: "DevOps / Site Reliability Engineer (SRE)",
    ukSocCode: "2134",
    onetCode: "15-1251.00",
    aliases: [
      "devops engineer",
      "site reliability engineer",
      "sre",
      "platform engineer",
      "cloud engineer",
      "infrastructure engineer",
      "build engineer",
    ],
    relatedOccupations: [
      { occupationId: "software_engineer", weight: 0.75 },
      { occupationId: "solutions_architect", weight: 0.80 },
    ],
  },
  "product_manager": {
    id: "product_manager",
    name: "Product Manager / Technical Lead",
    ukSocCode: "2421",
    onetCode: "11-9199.00",
    aliases: [
      "product manager",
      "technical product manager",
      "product owner",
      "group product manager",
      "program manager",
    ],
    relatedOccupations: [
      { occupationId: "business_analyst", weight: 0.85 },
      { occupationId: "solutions_architect", weight: 0.60 },
    ],
  },
  "business_analyst": {
    id: "business_analyst",
    name: "IT Business Analyst / Consultant",
    ukSocCode: "2421",
    onetCode: "13-1111.00",
    aliases: [
      "business analyst",
      "it business analyst",
      "management consultant",
      "systems analyst",
      "functional consultant",
    ],
    relatedOccupations: [
      { occupationId: "product_manager", weight: 0.85 },
      { occupationId: "data_engineer", weight: 0.50 },
    ],
  },
  "registered_nurse": {
    id: "registered_nurse",
    name: "Registered Nurse / Healthcare Specialist",
    ukSocCode: "2231",
    onetCode: "29-1141.00",
    aliases: [
      "registered nurse",
      "staff nurse",
      "clinical nurse",
      "charge nurse",
      "nursing officer",
      "healthcare professional",
    ],
    relatedOccupations: [],
  },
  "civil_engineer": {
    id: "civil_engineer",
    name: "Civil / Structural Engineer",
    ukSocCode: "2121",
    onetCode: "17-2051.00",
    aliases: [
      "civil engineer",
      "structural engineer",
      "geotechnical engineer",
      "construction engineer",
      "site engineer",
    ],
    relatedOccupations: [],
  },
};

/**
 * Normalizes input text/title into a canonical occupation entity
 */
export function normalizeOccupation(jobTitle: string): CanonicalOccupation | null {
  if (!jobTitle) return null;
  const lower = jobTitle.toLowerCase().trim();

  // 1. Exact canonical ID lookup
  if (OCCUPATIONS_TAXONOMY[lower]) {
    return OCCUPATIONS_TAXONOMY[lower];
  }

  // 2. Alias lookup
  for (const occupation of Object.values(OCCUPATIONS_TAXONOMY)) {
    for (const alias of occupation.aliases) {
      if (lower.includes(alias) || alias.includes(lower)) {
        return occupation;
      }
    }
  }

  // Default fallback for general engineering/tech titles
  if (/\b(engineer|developer|architect|programmer|coding)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["software_engineer"];
  }

  return null;
}

/**
 * Calculates occupation match weight between candidate occupation and job occupation
 * Exact: 1.0, Strong: 0.80-0.85, Adjacent: 0.60-0.75, Unrelated: 0.0
 */
export function getOccupationMatchWeight(candidateOccId: string, jobOccId: string): number {
  if (candidateOccId === jobOccId) return 1.0;

  const candidateOcc = OCCUPATIONS_TAXONOMY[candidateOccId];
  if (!candidateOcc) return 0.0;

  const related = candidateOcc.relatedOccupations.find((r) => r.occupationId === jobOccId);
  if (related) {
    return related.weight;
  }

  const jobOcc = OCCUPATIONS_TAXONOMY[jobOccId];
  if (jobOcc) {
    const reciprocal = jobOcc.relatedOccupations.find((r) => r.occupationId === candidateOccId);
    if (reciprocal) return reciprocal.weight * 0.9;
  }

  return 0.0;
}
