/**
 * Authoritative, Versioned Global Immigration & Occupation Rules Data
 * Sources: GOV.UK (Immigration Rules, Appendix Skilled Worker, Appendix Immigration Salary List),
 * USCIS (H-1B Specialty Occupations), Government of Canada (Global Talent Stream / NOC),
 * Australia Department of Home Affairs (MLTSSL / STSOL).
 */

export interface OccupationRule {
  socCode: string;
  title: string;
  domain: string;
  ukEligibility: {
    isEligible: boolean;
    standardThresholdGBP: number;
    isOnShortageOrISL: boolean;
    minimumRateGBP?: number;
    guidance: string;
    sourceUrl: string;
  };
  usEligibility: {
    isSpecialtyOccupation: boolean;
    minimumDegree: "Bachelor's" | "Master's" | "PhD";
    h1bSuitability: string;
    sourceUrl: string;
  };
  canadaEligibility: {
    nocCode: string;
    isGlobalTalentStream: boolean;
    teerCategory: number;
    guidance: string;
    sourceUrl: string;
  };
  australiaEligibility: {
    anzscoCode: string;
    listType: "MLTSSL" | "STSOL" | "ROL";
    guidance: string;
    sourceUrl: string;
  };
}

export const IMMIGRATION_RULES_VERSION = "2026.1";
export const RULES_LAST_VERIFIED = "27 August 2026";

export const OCCUPATION_REGISTRY: Record<string, OccupationRule> = {
  software_engineer: {
    socCode: "2134",
    title: "Programmers and Software Development Professionals",
    domain: "Software Engineering",
    ukEligibility: {
      isEligible: true,
      standardThresholdGBP: 38700,
      isOnShortageOrISL: true,
      minimumRateGBP: 34000,
      guidance: "Eligible for UK Skilled Worker Visa (Code 2134). Sponsor licence required from licensed employer.",
      sourceUrl: "https://www.gov.uk/skilled-worker-visa/your-job",
    },
    usEligibility: {
      isSpecialtyOccupation: true,
      minimumDegree: "Bachelor's",
      h1bSuitability: "High - Standard STEM specialty occupation eligible for H-1B lottery and cap-exempt institutions.",
      sourceUrl: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations",
    },
    canadaEligibility: {
      nocCode: "21232",
      isGlobalTalentStream: true,
      teerCategory: 1,
      guidance: "Category B Global Talent Stream eligible (2-week expedited work permit processing).",
      sourceUrl: "https://www.canada.ca/en/employment-social-development/services/foreign-workers/global-talent.html",
    },
    australiaEligibility: {
      anzscoCode: "261313",
      listType: "MLTSSL",
      guidance: "Medium and Long-term Strategic Skills List (Eligible for TSS 482 and Direct PR 186/189).",
      sourceUrl: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list",
    },
  },
  data_engineer_ai: {
    socCode: "2133",
    title: "IT Business Analysts, Architects and Systems Designers / Data Engineers",
    domain: "Data & Artificial Intelligence",
    ukEligibility: {
      isEligible: true,
      standardThresholdGBP: 38700,
      isOnShortageOrISL: true,
      minimumRateGBP: 36000,
      guidance: "Eligible for UK Skilled Worker Visa under Code 2133. High sponsor license prevalence.",
      sourceUrl: "https://www.gov.uk/skilled-worker-visa/your-job",
    },
    usEligibility: {
      isSpecialtyOccupation: true,
      minimumDegree: "Bachelor's",
      h1bSuitability: "High - Qualifies as specialty occupation in quantitative / computer science disciplines.",
      sourceUrl: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations",
    },
    canadaEligibility: {
      nocCode: "21211",
      isGlobalTalentStream: true,
      teerCategory: 1,
      guidance: "Fast-track Global Talent Stream eligible for Data Architects & ML Engineers.",
      sourceUrl: "https://www.canada.ca/en/employment-social-development/services/foreign-workers/global-talent.html",
    },
    australiaEligibility: {
      anzscoCode: "261312",
      listType: "MLTSSL",
      guidance: "MLTSSL eligible for 4-year temporary skill shortage visa with permanent residence pathway.",
      sourceUrl: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list",
    },
  },
  civil_engineer: {
    socCode: "2121",
    title: "Civil Engineers & Structural Consultants",
    domain: "Civil & Construction Engineering",
    ukEligibility: {
      isEligible: true,
      standardThresholdGBP: 38700,
      isOnShortageOrISL: true,
      minimumRateGBP: 32000,
      guidance: "Eligible for UK Skilled Worker Visa. Included on National Shortage lists for major infrastructure.",
      sourceUrl: "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-immigration-salary-list",
    },
    usEligibility: {
      isSpecialtyOccupation: true,
      minimumDegree: "Bachelor's",
      h1bSuitability: "High - ABET accredited engineering degree standard for H-1B specialty petitions.",
      sourceUrl: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations",
    },
    canadaEligibility: {
      nocCode: "21300",
      isGlobalTalentStream: false,
      teerCategory: 1,
      guidance: "Provincial Nominee Program (PNP) and Express Entry category-based selection priority.",
      sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html",
    },
    australiaEligibility: {
      anzscoCode: "233211",
      listType: "MLTSSL",
      guidance: "Engineers Australia skills assessment eligible with direct permanent residency routes.",
      sourceUrl: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list",
    },
  },
  registered_nurse: {
    socCode: "2231",
    title: "Registered Nurses and Healthcare Professionals",
    domain: "Healthcare & Nursing",
    ukEligibility: {
      isEligible: true,
      standardThresholdGBP: 29000,
      isOnShortageOrISL: true,
      minimumRateGBP: 28000,
      guidance: "Eligible for UK Health & Care Worker Visa with reduced visa application fees and exemption from Immigration Health Surcharge (IHS).",
      sourceUrl: "https://www.gov.uk/health-care-worker-visa",
    },
    usEligibility: {
      isSpecialtyOccupation: false,
      minimumDegree: "Bachelor's",
      h1bSuitability: "EB-3 Schedule A Direct Green Card or specialized Nurse Practitioner H-1B.",
      sourceUrl: "https://www.uscis.gov/green-card/green-card-eligibility-categories",
    },
    canadaEligibility: {
      nocCode: "31301",
      isGlobalTalentStream: false,
      teerCategory: 1,
      guidance: "Healthcare category-based Express Entry draws with expedited invitations.",
      sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html",
    },
    australiaEligibility: {
      anzscoCode: "254499",
      listType: "MLTSSL",
      guidance: "Priority processing under Australian Health Workforce Migration guidelines.",
      sourceUrl: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list",
    },
  },
  management_consultant: {
    socCode: "2421",
    title: "Management Consultants and Business Analysts",
    domain: "Business & Management",
    ukEligibility: {
      isEligible: true,
      standardThresholdGBP: 38700,
      isOnShortageOrISL: false,
      guidance: "Eligible for Skilled Worker route subject to standard salary threshold of £38,700 or going rate.",
      sourceUrl: "https://www.gov.uk/skilled-worker-visa/your-job",
    },
    usEligibility: {
      isSpecialtyOccupation: true,
      minimumDegree: "Bachelor's",
      h1bSuitability: "Moderate - Requires close alignment between degree field (MBA / Finance / Engineering) and consulting duties.",
      sourceUrl: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations",
    },
    canadaEligibility: {
      nocCode: "11201",
      isGlobalTalentStream: false,
      teerCategory: 1,
      guidance: "Eligible under Express Entry Federal Skilled Worker Program (FSWP).",
      sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html",
    },
    australiaEligibility: {
      anzscoCode: "224711",
      listType: "STSOL",
      guidance: "Short-term Skilled Occupation List (TSS 482 visa eligible up to 2 years with renewal options).",
      sourceUrl: "https://immi.homeaffairs.gov.au/visas/working-in-australia/skill-occupation-list",
    },
  },
};

/**
 * Maps raw candidate/job title to the authoritative SOC occupation rule
 */
export function matchOccupationToRule(titleOrKeywords: string): OccupationRule {
  const query = (titleOrKeywords || "").toLowerCase();

  if (query.includes("data") || query.includes("machine learning") || query.includes("ai ") || query.includes("analyst")) {
    return OCCUPATION_REGISTRY.data_engineer_ai;
  }
  if (query.includes("civil") || query.includes("structural") || query.includes("construction") || query.includes("bim") || query.includes("autocad")) {
    return OCCUPATION_REGISTRY.civil_engineer;
  }
  if (query.includes("nurse") || query.includes("healthcare") || query.includes("clinical") || query.includes("medical")) {
    return OCCUPATION_REGISTRY.registered_nurse;
  }
  if (query.includes("consultant") || query.includes("product manager") || query.includes("finance") || query.includes("accountant")) {
    return OCCUPATION_REGISTRY.management_consultant;
  }

  // Default to Software Engineering (SOC 2134)
  return OCCUPATION_REGISTRY.software_engineer;
}
