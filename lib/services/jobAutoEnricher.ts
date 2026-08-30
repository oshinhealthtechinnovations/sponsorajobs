import { classifyJobSponsorship } from "@/scoring/classifier";
import { computeQualityScore } from "@/scoring/qualityScorer";
import { generateCanonicalHash, cleanHtmlToMarkdown, normalizeCountryCode } from "@/normalization";
import { resolveDirectApplyUrl } from "@/lib/services/urlResolver";
import { RemoteType, EmploymentType } from "@/lib/types/database";

export interface RawPartialJobInput {
  title?: string;
  companyName?: string;
  companyWebsite?: string;
  companyLogoUrl?: string;
  countryCode?: string;
  location?: string;
  city?: string;
  region?: string;
  remoteType?: string;
  employmentType?: string;
  categorySlug?: string;
  categoryName?: string;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  salaryCurrency?: string | null;
  applyUrl?: string;
  jobUrl?: string;
  sourceUrl?: string;
  description?: string;
  publishedAt?: string;
  sourceId?: string;
}

export interface EnrichedJobOutput {
  id: string;
  source_id: string;
  source_job_id: string;
  canonical_hash: string;
  title: string;
  slug: string;
  company_id: string;
  company_name: string;
  company_website?: string;
  company_logo_url?: string;
  description: string;
  description_clean: string;
  location: string;
  city: string | null;
  region: string | null;
  country_code: string;
  remote_type: RemoteType;
  employment_type: EmploymentType;
  category_id: string;
  category_slug: string;
  category_name: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  job_url: string;
  apply_url: string;
  source_url: string;
  publishedAt: string;
  first_seen_at: string;
  last_seen_at: string;
  sponsorship_score: number;
  sponsorship_label: string;
  sponsorship_positive_evidence: string;
  sponsorship_negative_evidence: string;
  visa_keywords: string;
  quality_score: number;
  status: "active" | "expired";
  is_featured: number;
  created_at: string;
  updated_at: string;
}

// Country keywords dictionary for intelligent location inference
const CITY_COUNTRY_MAP: Record<string, string> = {
  // UK
  london: "GB", manchester: "GB", birmingham: "GB", bristol: "GB", edinburgh: "GB",
  glasgow: "GB", leeds: "GB", cambridge: "GB", oxford: "GB", cardiff: "GB", belfast: "GB",
  reading: "GB", newcastle: "GB", sheffield: "GB", liverpool: "GB",
  // US
  "new york": "US", "san francisco": "US", seattle: "US", austin: "US", boston: "US",
  chicago: "US", "los angeles": "US", atlanta: "US", denver: "US", dallas: "US",
  houston: "US", miami: "US", "san diego": "US", "san jose": "US", "washington dc": "US",
  // Canada
  toronto: "CA", vancouver: "CA", montreal: "CA", ottawa: "CA", calgary: "CA",
  edmonton: "CA", waterloo: "CA", victoria: "CA",
  // Australia
  sydney: "AU", melbourne: "AU", brisbane: "AU", perth: "AU", adelaide: "AU",
  canberra: "AU", "gold coast": "AU",
  // New Zealand
  auckland: "NZ", wellington: "NZ", christchurch: "NZ", hamilton: "NZ",
  // Europe
  berlin: "DE", munich: "DE", frankfurt: "DE", hamburg: "DE",
  dublin: "IE", cork: "IE",
  amsterdam: "NL", rotterdam: "NL",
  paris: "FR", stockholm: "SE", zurich: "CH", geneva: "CH",
  // Asia
  singapore: "SG", tokyo: "JP", dubai: "AE",
};

// Category keyword taxonomy for intelligent sector tagging
const CATEGORY_TAXONOMY: Array<{
  slug: string;
  name: string;
  keywords: string[];
}> = [
  {
    slug: "information-technology",
    name: "Information Technology",
    keywords: [
      "software", "developer", "engineer", "backend", "frontend", "full stack", "fullstack",
      "devops", "sre", "cloud", "aws", "azure", "gcp", "data engineer", "data scientist",
      "machine learning", "ai", "artificial intelligence", "deep learning", "nlp",
      "qa", "quality assurance", "tester", "cybersecurity", "security analyst",
      "product manager", "scrum master", "tech lead", "cto", "architect",
      "ui", "ux", "product designer", "sysadmin", "database", "sql", "ios", "android",
      "react", "python", "java", "golang", "rust", "typescript", "c\\+\\+", "c#"
    ]
  },
  {
    slug: "healthcare",
    name: "Healthcare & Life Sciences",
    keywords: [
      "nurse", "nursing", "doctor", "physician", "dentist", "dental", "surgeon",
      "pharmacist", "pharmacy", "therapist", "physiotherapist", "radiographer",
      "clinical", "medical", "healthcare", "caregiver", "paramedic", "oncologist",
      "psychiatrist", "psychologist", "biologist", "biomedical"
    ]
  },
  {
    slug: "finance",
    name: "Finance & Accounting",
    keywords: [
      "accountant", "accounting", "auditor", "audit", "financial analyst", "controller",
      "cfo", "investment", "banking", "quant", "trader", "actuary", "actuarial",
      "underwriter", "tax consultant", "treasury", "payroll", "anaplan", "fintech"
    ]
  },
  {
    slug: "engineering",
    name: "Engineering & Infrastructure",
    keywords: [
      "civil engineer", "mechanical engineer", "electrical engineer", "structural engineer",
      "chemical engineer", "geotechnical", "aerospace", "environmental engineer",
      "cad engineer", "site engineer", "manufacturing engineer", "automation engineer"
    ]
  },
  {
    slug: "sales-marketing",
    name: "Sales & Marketing",
    keywords: [
      "marketing", "growth", "seo", "content writer", "copywriter", "sales", "account executive",
      "business development", "bdr", "sdr", "gtm", "brand manager", "customer success"
    ]
  },
  {
    slug: "legal-hr",
    name: "Legal & Human Resources",
    keywords: [
      "legal counsel", "attorney", "lawyer", "paralegal", "compliance", "hr manager",
      "talent acquisition", "recruiter", "people partner", "human resources"
    ]
  }
];

/**
 * Intelligent Gap Filler & Autocomplete Engine for Job Listings
 */
export function enrichJobListing(raw: RawPartialJobInput): EnrichedJobOutput {
  const title = (raw.title || "Untitled Role").trim();
  const companyName = (raw.companyName || "Employer").trim();
  const rawDescription = raw.description || `${title} at ${companyName}. Visa sponsorship and relocation details available upon application.`;
  const cleanDescription = cleanHtmlToMarkdown(rawDescription);

  // 1. Resolve and Validate Direct Apply URL
  const rawUrl = raw.applyUrl || raw.jobUrl || raw.sourceUrl || "https://sponsorajobs.com/jobs";
  const applyUrl = resolveDirectApplyUrl({
    applyUrl: rawUrl,
    description: rawDescription,
    companyName: companyName,
  });

  // 2. Infer Country Code
  let countryCode = normalizeCountryCode(raw.countryCode);
  if (countryCode === "UN" || countryCode === "UNKNOWN" || !raw.countryCode) {
    countryCode = inferCountryFromText(raw.location, title, rawDescription, applyUrl);
  }

  // 3. Infer City & Location
  const { city, location } = inferCityAndLocation(raw.city, raw.location, countryCode);

  // 4. Infer Remote Status
  const remoteType = inferRemoteType(raw.remoteType, title, location, rawDescription);

  // 5. Infer Employment Type
  const employmentType = inferEmploymentType(raw.employmentType, title, rawDescription);

  // 6. Infer Category
  const { categorySlug, categoryName } = inferCategory(raw.categorySlug, title, rawDescription);

  // 7. Extract Salary & Currency
  const salary = extractSalaryAndCurrency(raw.salaryMin, raw.salaryMax, raw.salaryCurrency, rawDescription, countryCode);

  // 8. Classify Visa Sponsorship
  const fullTextForSponsorship = `${title} ${rawDescription} ${location}`;
  const sponsorship = classifyJobSponsorship(fullTextForSponsorship, countryCode);

  // 9. Compute Quality Score
  const quality = computeQualityScore({
    title,
    description: rawDescription,
    sponsorshipScore: sponsorship.score,
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryCurrency: salary.currency,
    location,
    city: city || undefined,
    countryCode,
    remoteType,
    employmentType,
    applyUrl,
    publishedAt: raw.publishedAt,
    categorySlug,
    companyName,
  });

  // 10. Generate Deterministic ID & Canonical Hash
  const hash = generateCanonicalHash(companyName, title, location, applyUrl);
  const compId = `comp_${companyName.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30)}`;
  const slug = `${slugify(companyName)}-${slugify(title)}-${countryCode.toLowerCase()}-${hash.slice(4, 12)}`.replace(/--+/g, "-");

  const companyWebsite = raw.companyWebsite || `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
  const companyLogoUrl = raw.companyLogoUrl || `https://logo.clearbit.com/${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;

  const now = new Date().toISOString();

  return {
    id: hash,
    source_id: raw.sourceId || "manual_ingestion",
    source_job_id: hash,
    canonical_hash: hash,
    title,
    slug,
    company_id: compId,
    company_name: companyName,
    company_website: companyWebsite,
    company_logo_url: companyLogoUrl,
    description: rawDescription,
    description_clean: cleanDescription,
    location,
    city,
    region: raw.region || null,
    country_code: countryCode,
    remote_type: remoteType,
    employment_type: employmentType,
    category_id: `cat_${categorySlug}`,
    category_slug: categorySlug,
    category_name: categoryName,
    salary_min: salary.min,
    salary_max: salary.max,
    salary_currency: salary.currency,
    job_url: applyUrl,
    apply_url: applyUrl,
    source_url: applyUrl,
    publishedAt: raw.publishedAt || now,
    first_seen_at: now,
    last_seen_at: now,
    sponsorship_score: sponsorship.score,
    sponsorship_label: sponsorship.label,
    sponsorship_positive_evidence: JSON.stringify(sponsorship.positiveEvidence),
    sponsorship_negative_evidence: JSON.stringify(sponsorship.negativeEvidence),
    visa_keywords: JSON.stringify(sponsorship.keywords),
    quality_score: quality.total,
    status: "active",
    is_featured: quality.total >= 75 ? 1 : 0,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Intelligent Country Inference Helper
 */
function inferCountryFromText(location?: string, title?: string, description?: string, url?: string): string {
  const combined = `${location || ""} ${title || ""} ${url || ""}`.toLowerCase();

  // Check URL domains
  if (url) {
    if (url.includes(".co.uk") || url.includes("/uk/")) return "GB";
    if (url.includes(".com.au") || url.includes("/au/")) return "AU";
    if (url.includes(".ca") || url.includes("/ca/")) return "CA";
    if (url.includes(".co.nz") || url.includes("/nz/")) return "NZ";
    if (url.includes(".de")) return "DE";
    if (url.includes(".ie")) return "IE";
  }

  // Check cities
  for (const [cityName, code] of Object.entries(CITY_COUNTRY_MAP)) {
    if (new RegExp(`\\b${cityName}\\b`, "i").test(combined)) {
      return code;
    }
  }

  // Check country names
  if (/\b(uk|united kingdom|england|britain|scotland|wales)\b/i.test(combined)) return "GB";
  if (/\b(usa|united states|america|us|california|texas|new york|washington)\b/i.test(combined)) return "US";
  if (/\b(canada|ontario|quebec|british columbia|alberta)\b/i.test(combined)) return "CA";
  if (/\b(australia|nsw|victoria|queensland)\b/i.test(combined)) return "AU";
  if (/\b(new zealand|auckland)\b/i.test(combined)) return "NZ";

  return "US"; // Global fallback
}

/**
 * City & Location Normalizer
 */
function inferCityAndLocation(rawCity?: string, rawLocation?: string, countryCode?: string): { city: string | null; location: string } {
  if (rawCity && rawLocation) {
    return { city: rawCity.trim(), location: rawLocation.trim() };
  }

  if (rawLocation) {
    const parts = rawLocation.split(",").map((p) => p.trim());
    const city = parts[0] || null;
    return { city, location: rawLocation };
  }

  if (rawCity) {
    const loc = `${rawCity}, ${countryCode || "Global"}`;
    return { city: rawCity, location: loc };
  }

  const countryLabels: Record<string, string> = {
    GB: "United Kingdom",
    US: "United States",
    CA: "Canada",
    AU: "Australia",
    NZ: "New Zealand",
    DE: "Germany",
    IE: "Ireland",
  };

  const formatted = countryLabels[countryCode || "US"] || countryCode || "Global";
  return { city: null, location: formatted };
}

/**
 * Remote Status Inference
 */
function inferRemoteType(rawRemote?: string, title?: string, location?: string, description?: string): RemoteType {
  if (rawRemote) {
    const clean = rawRemote.toUpperCase();
    if (clean === "REMOTE" || clean === "HYBRID" || clean === "ONSITE") return clean as RemoteType;
  }

  const combined = `${title || ""} ${location || ""} ${description || ""}`.toLowerCase();

  if (/\b(remote|work from home|wfh|anywhere|distributed|virtual)\b/i.test(combined)) {
    return "REMOTE";
  }
  if (/\b(hybrid|flexible office|2-3 days|days in office|office\/remote)\b/i.test(combined)) {
    return "HYBRID";
  }

  return "ONSITE";
}

/**
 * Employment Type Inference
 */
function inferEmploymentType(rawEmp?: string, title?: string, description?: string): EmploymentType {
  if (rawEmp) {
    const clean = rawEmp.toUpperCase();
    if (["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "TEMPORARY"].includes(clean)) {
      return clean as EmploymentType;
    }
  }

  const combined = `${title || ""} ${description || ""}`.toLowerCase();

  if (/\b(part-time|part time)\b/i.test(combined)) return "PART_TIME";
  if (/\b(contract|contractor|freelance|fixed term)\b/i.test(combined)) return "CONTRACT";
  if (/\b(intern|internship|graduate trainee)\b/i.test(combined)) return "INTERNSHIP";
  if (/\b(temp|temporary|locum)\b/i.test(combined)) return "TEMPORARY";

  return "FULL_TIME";
}

/**
 * Category Classification Inference
 */
function inferCategory(rawCategory?: string, title?: string, description?: string): { categorySlug: string; categoryName: string } {
  if (rawCategory) {
    const match = CATEGORY_TAXONOMY.find((c) => c.slug === rawCategory || c.slug === `cat_${rawCategory}`);
    if (match) return { categorySlug: match.slug, categoryName: match.name };
  }

  const combined = `${title || ""} ${description || ""}`.toLowerCase();

  for (const cat of CATEGORY_TAXONOMY) {
    for (const kw of cat.keywords) {
      const escapedKw = kw.startsWith("c\\+\\+") ? "c\\+\\+" : kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escapedKw}\\b`, "i").test(combined)) {
        return { categorySlug: cat.slug, categoryName: cat.name };
      }
    }
  }

  return { categorySlug: "information-technology", categoryName: "Information Technology" };
}

/**
 * Salary & Currency Extraction from Text & Defaults
 */
function extractSalaryAndCurrency(
  rawMin?: number | string | null,
  rawMax?: number | string | null,
  rawCurrency?: string | null,
  description?: string,
  countryCode?: string
): { min: number | null; max: number | null; currency: string } {
  const defaultCurrency: Record<string, string> = {
    GB: "GBP",
    US: "USD",
    CA: "CAD",
    AU: "AUD",
    NZ: "NZD",
    DE: "EUR",
    IE: "EUR",
    FR: "EUR",
    NL: "EUR",
    SG: "SGD",
  };

  let currency = rawCurrency ? rawCurrency.toUpperCase() : defaultCurrency[countryCode || "US"] || "USD";
  let min = typeof rawMin === "number" ? rawMin : rawMin ? parseInt(String(rawMin).replace(/[^\d]/g, ""), 10) || null : null;
  let max = typeof rawMax === "number" ? rawMax : rawMax ? parseInt(String(rawMax).replace(/[^\d]/g, ""), 10) || null : null;

  // If salary is missing, try regex extraction from description
  if ((!min || !max) && description) {
    // Pattern: $180k - $240k or £70,000 - £90,000 or $120,000 - $160,000
    const rangeMatch = description.match(/([£$€])?\s*([0-9]{2,3}(?:,[0-9]{3})*(?:k)?|[0-9]{2,3}k)\s*(?:-|to)\s*([£$€])?\s*([0-9]{2,3}(?:,[0-9]{3})*(?:k)?|[0-9]{2,3}k)/i);
    if (rangeMatch) {
      const sym = rangeMatch[1] || rangeMatch[3];
      if (sym === "£") currency = "GBP";
      else if (sym === "€") currency = "EUR";
      else if (sym === "$") currency = currency || "USD";

      min = parseNum(rangeMatch[2]);
      max = parseNum(rangeMatch[4]);
    }
  }

  return { min, max, currency };
}

function parseNum(val: string): number | null {
  if (!val) return null;
  const clean = val.toLowerCase().trim();
  if (clean.endsWith("k")) {
    return Math.round(parseFloat(clean.replace("k", "")) * 1000);
  }
  return parseInt(clean.replace(/[^\d]/g, ""), 10) || null;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
