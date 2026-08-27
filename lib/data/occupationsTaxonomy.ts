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
    name: "Civil / Structural / Infrastructure Engineer",
    ukSocCode: "2121",
    onetCode: "17-2051.00",
    aliases: [
      "civil engineer",
      "civil engineering",
      "structural engineer",
      "geotechnical engineer",
      "construction engineer",
      "site engineer",
      "infrastructure engineer",
      "infrastructure project",
      "water infrastructure",
      "highway engineer",
      "drainage engineer",
    ],
    relatedOccupations: [
      { occupationId: "project_coordinator", weight: 0.90 },
    ],
  },
  "project_coordinator": {
    id: "project_coordinator",
    name: "Project Coordinator / Planning & Controls Specialist",
    ukSocCode: "2421",
    onetCode: "11-9021.00",
    aliases: [
      "project coordinator",
      "project planning",
      "project controls",
      "project planner",
      "planning & controls",
      "planning coordinator",
      "pmo analyst",
      "project scheduler",
      "associate project manager",
      "project control",
      "planning engineer",
      "programme controls",
    ],
    relatedOccupations: [
      { occupationId: "civil_engineer", weight: 0.90 },
      { occupationId: "product_manager", weight: 0.75 },
      { occupationId: "business_analyst", weight: 0.80 },
    ],
  },
  "credit_analyst": {
    id: "credit_analyst",
    name: "Credit / Risk Analyst",
    ukSocCode: "3534",
    onetCode: "13-2041.00",
    aliases: [
      "credit analyst",
      "credit risk",
      "credit risk manager",
      "credit risk analyst",
      "credit underwriter",
      "risk analyst",
      "risk manager",
      "credit assessment",
      "portfolio risk",
    ],
    relatedOccupations: [
      { occupationId: "financial_analyst", weight: 0.85 },
      { occupationId: "business_analyst", weight: 0.60 },
    ],
  },
  "financial_analyst": {
    id: "financial_analyst",
    name: "Financial Analyst / Investment Manager",
    ukSocCode: "2422",
    onetCode: "13-2051.00",
    aliases: [
      "financial analyst",
      "finance analyst",
      "investment analyst",
      "portfolio manager",
      "commercial analyst",
      "treasury analyst",
      "financial controller",
    ],
    relatedOccupations: [
      { occupationId: "credit_analyst", weight: 0.85 },
      { occupationId: "accountant", weight: 0.75 },
      { occupationId: "business_analyst", weight: 0.65 },
    ],
  },
  "accountant": {
    id: "accountant",
    name: "Chartered Accountant / Auditor",
    ukSocCode: "2421",
    onetCode: "13-2011.00",
    aliases: [
      "accountant",
      "auditor",
      "tax specialist",
      "bookkeeper",
      "finance manager",
      "management accountant",
    ],
    relatedOccupations: [
      { occupationId: "financial_analyst", weight: 0.75 },
    ],
  },
  "marketing_specialist": {
    id: "marketing_specialist",
    name: "Marketing & Growth Specialist",
    ukSocCode: "2471",
    onetCode: "13-1161.00",
    aliases: [
      "marketing manager",
      "growth manager",
      "seo specialist",
      "digital marketing",
      "content manager",
      "brand manager",
      "performance marketer",
    ],
    relatedOccupations: [
      { occupationId: "product_manager", weight: 0.50 },
    ],
  },
  "operations_manager": {
    id: "operations_manager",
    name: "Operations Manager / Coordinator",
    ukSocCode: "1139",
    onetCode: "11-1021.00",
    aliases: [
      "operations manager",
      "operations analyst",
      "coo",
      "logistics coordinator",
      "supply chain specialist",
    ],
    relatedOccupations: [
      { occupationId: "business_analyst", weight: 0.60 },
    ],
  },
  "general_professional": {
    id: "general_professional",
    name: "General Corporate Professional",
    ukSocCode: "3543",
    onetCode: "11-9199.00",
    aliases: ["general", "associate", "specialist", "coordinator"],
    relatedOccupations: [],
  },
};

/**
 * Normalizes input text/title into a canonical occupation entity
 */
export function normalizeOccupation(jobTitle: string): CanonicalOccupation {
  if (!jobTitle) return OCCUPATIONS_TAXONOMY["general_professional"];
  const lower = jobTitle.toLowerCase().trim();

  // 1. Exact canonical ID lookup
  if (OCCUPATIONS_TAXONOMY[lower]) {
    return OCCUPATIONS_TAXONOMY[lower];
  }

  // 2. Alias lookup
  for (const occupation of Object.values(OCCUPATIONS_TAXONOMY)) {
    for (const alias of occupation.aliases) {
      if (lower.includes(alias)) {
        return occupation;
      }
    }
  }

  // 3. Specific keyword heuristics (precise, robust ordering)
  // Cloud, DevOps & SRE
  if (/\b(devops|sre|site\s*reliability|cloud\s*architect|cloud\s*engineer|platform\s*engineer|infrastructure\s*engineer|kubernetes\s*engineer)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["devops_engineer"];
  }

  // Data Science & AI/ML
  if (/\b(data\s*scientist|machine\s*learning|ai\s*engineer|ml\s*engineer|deep\s*learning|nlp\s*engineer|computer\s*vision|ai\s*researcher)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["data_scientist"];
  }

  // Data Engineering
  if (/\b(data\s*engineer|etl\s*developer|big\s*data|bi\s*developer|data\s*platform|analytics\s*engineer|data\s*warehouse)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["data_engineer"];
  }

  // Software & Web Engineering (Frontend, Backend, Full Stack, Mobile, Systems)
  if (/\b(software\s*engineer|software\s*developer|full\s*stack|frontend|front\s*end|backend|back\s*end|web\s*developer|mobile\s*developer|ios\s*developer|android\s*developer|react|angular|node|python\s*developer|java\s*developer|golang\s*developer|\.net\s*developer|c\#\s*developer|programmer|software\s*lead)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["software_engineer"];
  }

  // Solutions & Systems Architecture
  if (/\b(solutions\s*architect|enterprise\s*architect|technical\s*architect|systems\s*architect)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["solutions_architect"];
  }

  // Product Management
  if (/\b(product\s*manager|technical\s*product\s*manager|product\s*owner|tpm)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["product_manager"];
  }

  // Business Analysis & Consulting
  if (/\b(business\s*analyst|systems\s*analyst|management\s*consultant|functional\s*consultant)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["business_analyst"];
  }

  // Project Controls & Planning
  if (/\b(project\s*coordinator|project\s*planner|project\s*controls|planning\s*&\s*controls|planning\s*engineer|project\s*scheduler|pmo)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["project_coordinator"];
  }

  // Civil & Structural Engineering
  if (/\b(civil\s*engineer|civil\s*engineering|structural\s*engineer|geotechnical|highway\s*engineer|bridge\s*engineer|site\s*engineer|construction\s*engineer)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["civil_engineer"];
  }

  // Credit, Finance & Risk
  if (/\b(credit\s*analyst|credit\s*risk|risk\s*analyst|underwriter|loan\s*officer)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["credit_analyst"];
  }
  if (/\b(financial\s*analyst|finance\s*analyst|investment\s*analyst|portfolio\s*manager|commercial\s*analyst)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["financial_analyst"];
  }
  if (/\b(accountant|auditor|financial\s*controller|bookkeeper)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["accountant"];
  }

  // Healthcare
  if (/\b(nurse|nursing|healthcare|clinical\s*specialist|medical\s*practitioner|doctor)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["registered_nurse"];
  }

  // General fallback for developer/engineer titles
  if (/\b(engineer|developer|architect|programmer|coding)\b/i.test(lower)) {
    return OCCUPATIONS_TAXONOMY["software_engineer"];
  }

  return OCCUPATIONS_TAXONOMY["general_professional"];
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
