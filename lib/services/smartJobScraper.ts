import { classifyJobSponsorship } from "@/scoring/classifier";
import { computeQualityScore } from "@/scoring/qualityScorer";
import { generateCanonicalHash, normalizeCountryCode } from "@/normalization";

export interface RawScrapedJob {
  pageNumber: number;
  rawTitle: string;
  rawExperience?: string;
  rawSkills?: string;
  rawDescription: string;
  applyUrl: string;
}

export interface StructuredJobRecord {
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
  remote_type: "ONSITE" | "HYBRID" | "REMOTE";
  employment_type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  category_id: string;
  category_slug: string;
  category_name: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  job_url: string;
  apply_url: string;
  source_url: string;
  applyUrl?: string;
  publishedAt: string;
  first_seen_at: string;
  last_seen_at: string;
  sponsorship_score: number;
  sponsorship_label: "Strong" | "Likely" | "Possible";
  sponsorship_positive_evidence: string;
  sponsorship_negative_evidence: string;
  visa_keywords: string;
  quality_score: number;
  status: "active" | "expired";
  is_featured: number;
  isExpired?: boolean;
  created_at: string;
  updated_at: string;
}

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "united kingdom": "GB",
  uk: "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "united states": "US",
  usa: "US",
  us: "US",
  canada: "CA",
  australia: "AU",
  "new zealand": "NZ",
  "united arab emirates": "AE",
  uae: "AE",
  "saudi arabia": "SA",
  qatar: "QA",
  oman: "OM",
  philippines: "PH",
  india: "IN",
  "south africa": "ZA",
};

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  GB: "GBP",
  US: "USD",
  CA: "CAD",
  AU: "AUD",
  NZ: "NZD",
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  OM: "OMR",
  IN: "INR",
  PH: "PHP",
  ZA: "ZAR",
};

/**
 * Intelligent location parser to extract city, region/state, and country code
 */
export function parseLocationDetails(rawText: string, rawTitle: string): {
  location: string;
  city: string | null;
  region: string | null;
  countryCode: string;
} {
  const text = rawText.toLowerCase();

  // Check UK locations
  if (
    text.includes("united kingdom") ||
    text.includes("london") ||
    text.includes("manchester") ||
    text.includes("leeds") ||
    text.includes("birmingham") ||
    text.includes("glasgow") ||
    text.includes("basingstoke") ||
    text.includes("guildford") ||
    text.includes("reading") ||
    text.includes("bristol") ||
    text.includes("stockton-on-tees") ||
    text.includes("gloucester") ||
    text.includes("norwich") ||
    text.includes("exeter") ||
    text.includes("cambridge") ||
    text.includes("newcastle upon tyne")
  ) {
    let city = "London";
    let region = "England";
    if (text.includes("manchester")) { city = "Manchester"; region = "Greater Manchester"; }
    else if (text.includes("birmingham")) { city = "Birmingham"; region = "West Midlands"; }
    else if (text.includes("leeds")) { city = "Leeds"; region = "West Yorkshire"; }
    else if (text.includes("glasgow")) { city = "Glasgow"; region = "Lanarkshire"; }
    else if (text.includes("gloucester")) { city = "Gloucester"; region = "Gloucestershire"; }
    else if (text.includes("norwich")) { city = "Norwich"; region = "Norfolk"; }
    else if (text.includes("exeter")) { city = "Exeter"; region = "Devon"; }
    else if (text.includes("stockton-on-tees")) { city = "Stockton-On-Tees"; region = "Cleveland"; }
    else if (text.includes("cambridge")) { city = "Cambridge"; region = "Cambridgeshire"; }
    else if (text.includes("newcastle upon tyne")) { city = "Newcastle Upon Tyne"; region = "Tyne and Wear"; }
    else if (text.includes("basingstoke")) { city = "Basingstoke"; region = "Hampshire"; }
    else if (text.includes("guildford")) { city = "Guildford"; region = "Surrey"; }
    else if (text.includes("reading")) { city = "Reading"; region = "Berkshire"; }

    return {
      location: `${city}, ${region}, United Kingdom`,
      city,
      region,
      countryCode: "GB",
    };
  }

  // Check Canada
  if (
    text.includes("canada") ||
    text.includes("edmonton, ab") ||
    text.includes("medicine hat, ab") ||
    text.includes("vancouver, bc") ||
    text.includes("fredericton, nb") ||
    text.includes("ottawa, on") ||
    text.includes("winnipeg, mb") ||
    text.includes("prince george, bc")
  ) {
    let city = "Toronto";
    let region = "ON";
    if (text.includes("edmonton")) { city = "Edmonton"; region = "AB"; }
    else if (text.includes("medicine hat")) { city = "Medicine Hat"; region = "AB"; }
    else if (text.includes("vancouver")) { city = "Vancouver"; region = "BC"; }
    else if (text.includes("prince george")) { city = "Prince George"; region = "BC"; }
    else if (text.includes("fredericton")) { city = "Fredericton"; region = "NB"; }
    else if (text.includes("moncton")) { city = "Moncton"; region = "NB"; }
    else if (text.includes("ottawa")) { city = "Ottawa"; region = "ON"; }
    else if (text.includes("winnipeg")) { city = "Winnipeg"; region = "MB"; }

    return {
      location: `${city}, ${region}, Canada`,
      city,
      region,
      countryCode: "CA",
    };
  }

  // Check Australia
  if (
    text.includes("australia") ||
    text.includes("newcastle, new south wales") ||
    text.includes("perth, western australia") ||
    text.includes("melbourne, victoria") ||
    text.includes("sydney, new south wales") ||
    text.includes("adelaide, south australia")
  ) {
    let city = "Sydney";
    let region = "NSW";
    if (text.includes("melbourne")) { city = "Melbourne"; region = "VIC"; }
    else if (text.includes("perth")) { city = "Perth"; region = "WA"; }
    else if (text.includes("newcastle")) { city = "Newcastle"; region = "NSW"; }
    else if (text.includes("adelaide")) { city = "Adelaide"; region = "SA"; }
    else if (text.includes("sydney")) { city = "Sydney"; region = "NSW"; }

    return {
      location: `${city}, ${region}, Australia`,
      city,
      region,
      countryCode: "AU",
    };
  }

  // Check US
  if (
    text.includes("united states") ||
    text.includes("ny, united states") ||
    text.includes("tx, united states") ||
    text.includes("fl, united states") ||
    text.includes("co, united states") ||
    text.includes("az, united states") ||
    text.includes("tn, united states") ||
    text.includes("va, united states") ||
    text.includes("al, united states") ||
    text.includes("pa, united states") ||
    text.includes("oh, united states") ||
    text.includes("me, united states") ||
    text.includes("ma, united states")
  ) {
    let city = "New York";
    let region = "NY";
    if (text.includes("boise")) { city = "Boise"; region = "ID"; }
    else if (text.includes("buffalo")) { city = "Buffalo"; region = "NY"; }
    else if (text.includes("tampa")) { city = "Tampa"; region = "FL"; }
    else if (text.includes("billings")) { city = "Billings"; region = "MT"; }
    else if (text.includes("austin")) { city = "Austin"; region = "TX"; }
    else if (text.includes("tempe") || text.includes("phoenix")) { city = "Tempe"; region = "AZ"; }
    else if (text.includes("dallas")) { city = "Dallas"; region = "TX"; }
    else if (text.includes("atlanta") || text.includes("duluth")) { city = "Atlanta"; region = "GA"; }
    else if (text.includes("new york")) { city = "New York"; region = "NY"; }
    else if (text.includes("troy")) { city = "Troy"; region = "NY"; }
    else if (text.includes("nashville") || text.includes("brentwood")) { city = "Nashville"; region = "TN"; }
    else if (text.includes("portland")) { city = "Portland"; region = "ME"; }
    else if (text.includes("boston")) { city = "Boston"; region = "MA"; }
    else if (text.includes("lakewood") || text.includes("denver")) { city = "Denver"; region = "CO"; }
    else if (text.includes("wexford")) { city = "Wexford"; region = "PA"; }
    else if (text.includes("birmingham, al")) { city = "Birmingham"; region = "AL"; }
    else if (text.includes("virginia beach")) { city = "Virginia Beach"; region = "VA"; }
    else if (text.includes("cincinnati")) { city = "Cincinnati"; region = "OH"; }

    return {
      location: `${city}, ${region}, United States`,
      city,
      region,
      countryCode: "US",
    };
  }

  // Check UAE
  if (text.includes("united arab emirates") || text.includes("abu dhabi") || text.includes("dubai") || text.includes("sharjah")) {
    let city = "Dubai";
    let region = "Dubai";
    if (text.includes("abu dhabi")) { city = "Abu Dhabi"; region = "Abu Dhabi"; }
    else if (text.includes("sharjah")) { city = "Sharjah"; region = "Sharjah"; }

    return {
      location: `${city}, United Arab Emirates`,
      city,
      region,
      countryCode: "AE",
    };
  }

  // Check Saudi Arabia
  if (text.includes("saudi arabia") || text.includes("riyadh") || text.includes("jeddah") || text.includes("al ula")) {
    let city = "Riyadh";
    let region = "Riyadh";
    if (text.includes("jeddah")) { city = "Jeddah"; region = "Makkah"; }
    else if (text.includes("al ula")) { city = "Al Ula"; region = "Al Madinah"; }

    return {
      location: `${city}, Saudi Arabia`,
      city,
      region,
      countryCode: "SA",
    };
  }

  // Check Qatar
  if (text.includes("qatar") || text.includes("doha")) {
    return {
      location: "Doha, Qatar",
      city: "Doha",
      region: "Doha",
      countryCode: "QA",
    };
  }

  // Check Oman
  if (text.includes("oman") || text.includes("muscat")) {
    return {
      location: "Muscat, Oman",
      city: "Muscat",
      region: "Muscat",
      countryCode: "OM",
    };
  }

  // Check Philippines
  if (text.includes("philippines") || text.includes("pasig city") || text.includes("ncr")) {
    return {
      location: "Pasig City, NCR, Philippines",
      city: "Pasig City",
      region: "National Capital Region (NCR)",
      countryCode: "PH",
    };
  }

  // Check India
  if (text.includes("india") || text.includes("bengaluru") || text.includes("noida") || text.includes("mumbai")) {
    let city = "Bengaluru";
    let region = "Karnataka";
    if (text.includes("noida")) { city = "Noida"; region = "Uttar Pradesh"; }
    else if (text.includes("mumbai")) { city = "Mumbai"; region = "Maharashtra"; }

    return {
      location: `${city}, ${region}, India`,
      city,
      region,
      countryCode: "IN",
    };
  }

  // Check South Africa
  if (text.includes("south africa") || text.includes("cape town") || text.includes("midrand")) {
    let city = "Cape Town";
    let region = "Western Cape";
    if (text.includes("midrand")) { city = "Midrand"; region = "Gauteng"; }

    return {
      location: `${city}, ${region}, South Africa`,
      city,
      region,
      countryCode: "ZA",
    };
  }

  return {
    location: "London, United Kingdom",
    city: "London",
    region: "England",
    countryCode: "GB",
  };
}

/**
 * Intelligent categorization based on title and description
 */
export function inferEngineeringCategory(title: string, desc: string): {
  categoryId: string;
  categorySlug: string;
  categoryName: string;
} {
  const t = title.toLowerCase();
  const d = desc.toLowerCase();

  if (t.includes("structural") || t.includes("bridge") || t.includes("etabs") || t.includes("staad")) {
    return {
      categoryId: "cat_eng",
      categorySlug: "structural-engineering",
      categoryName: "Structural Engineering",
    };
  }

  if (t.includes("geotechnical") || t.includes("tunnelling") || t.includes("geohazard") || t.includes("ground")) {
    return {
      categoryId: "cat_eng",
      categorySlug: "civil-engineering",
      categoryName: "Geotechnical Engineering",
    };
  }

  if (t.includes("highway") || t.includes("road") || t.includes("pavement") || t.includes("transportation")) {
    return {
      categoryId: "cat_eng",
      categorySlug: "civil-engineering",
      categoryName: "Highway & Transportation Engineering",
    };
  }

  if (t.includes("quantity surveyor") || t.includes("cost manager") || t.includes("commercial manager") || t.includes("employer’s agent") || t.includes("employers agent")) {
    return {
      categoryId: "cat_const",
      categorySlug: "construction-project-management",
      categoryName: "Quantity Surveying & Commercial",
    };
  }

  if (t.includes("construction") || t.includes("site engineer") || t.includes("field engineer") || t.includes("supervision")) {
    return {
      categoryId: "cat_const",
      categorySlug: "construction-project-management",
      categoryName: "Construction & Site Engineering",
    };
  }

  if (t.includes("mechanical")) {
    return {
      categoryId: "cat_eng",
      categorySlug: "mechanical-engineering",
      categoryName: "Mechanical Engineering",
    };
  }

  if (t.includes("water") || t.includes("stormwater") || t.includes("drainage") || t.includes("hydrologic")) {
    return {
      categoryId: "cat_eng",
      categorySlug: "civil-engineering",
      categoryName: "Water & Environmental Civil Engineering",
    };
  }

  return {
    categoryId: "cat_eng",
    categorySlug: "civil-engineering",
    categoryName: "Civil Engineering",
  };
}

/**
 * Intelligent benchmark salary estimation
 */
export function estimateRealisticSalary(countryCode: string, title: string, expYearsStr?: string): {
  min: number;
  max: number;
  currency: string;
} {
  const currency = COUNTRY_CURRENCY_MAP[countryCode] || "USD";
  const t = title.toLowerCase();

  const isPrincipal = t.includes("principal") || t.includes("lead") || t.includes("director") || (expYearsStr && expYearsStr.includes("15+"));
  const isSenior = t.includes("senior") || (expYearsStr && (expYearsStr.includes("7-10") || expYearsStr.includes("8-12") || expYearsStr.includes("10")));
  const isMid = t.includes("mid") || t.includes("intermediate") || (expYearsStr && (expYearsStr.includes("3") || expYearsStr.includes("4") || expYearsStr.includes("5")));
  const isEntry = t.includes("graduate") || t.includes("intern") || t.includes("early") || (expYearsStr && (expYearsStr.includes("0 to 1") || expYearsStr.includes("1 to 3")));

  switch (countryCode) {
    case "GB":
      if (isPrincipal) return { min: 65000, max: 95000, currency: "GBP" };
      if (isSenior) return { min: 52000, max: 70000, currency: "GBP" };
      if (isMid) return { min: 38000, max: 52000, currency: "GBP" };
      return { min: 30000, max: 38000, currency: "GBP" };

    case "US":
      if (isPrincipal) return { min: 140000, max: 195000, currency: "USD" };
      if (isSenior) return { min: 110000, max: 145000, currency: "USD" };
      if (isMid) return { min: 85000, max: 115000, currency: "USD" };
      return { min: 70000, max: 90000, currency: "USD" };

    case "CA":
      if (isPrincipal) return { min: 135000, max: 180000, currency: "CAD" };
      if (isSenior) return { min: 105000, max: 135000, currency: "CAD" };
      if (isMid) return { min: 80000, max: 105000, currency: "CAD" };
      return { min: 65000, max: 80000, currency: "CAD" };

    case "AU":
      if (isPrincipal) return { min: 160000, max: 220000, currency: "AUD" };
      if (isSenior) return { min: 125000, max: 165000, currency: "AUD" };
      if (isMid) return { min: 95000, max: 130000, currency: "AUD" };
      return { min: 75000, max: 95000, currency: "AUD" };

    case "AE":
      if (isPrincipal) return { min: 360000, max: 520000, currency: "AED" };
      if (isSenior) return { min: 240000, max: 360000, currency: "AED" };
      if (isMid) return { min: 160000, max: 240000, currency: "AED" };
      return { min: 120000, max: 160000, currency: "AED" };

    case "SA":
      if (isPrincipal) return { min: 380000, max: 540000, currency: "SAR" };
      if (isSenior) return { min: 260000, max: 380000, currency: "SAR" };
      if (isMid) return { min: 180000, max: 260000, currency: "SAR" };
      return { min: 130000, max: 180000, currency: "SAR" };

    case "QA":
      if (isPrincipal) return { min: 350000, max: 500000, currency: "QAR" };
      if (isSenior) return { min: 240000, max: 350000, currency: "QAR" };
      if (isMid) return { min: 160000, max: 240000, currency: "QAR" };
      return { min: 120000, max: 160000, currency: "QAR" };

    case "OM":
      if (isPrincipal) return { min: 36000, max: 52000, currency: "OMR" };
      if (isSenior) return { min: 25000, max: 36000, currency: "OMR" };
      if (isMid) return { min: 16000, max: 25000, currency: "OMR" };
      return { min: 12000, max: 16000, currency: "OMR" };

    case "IN":
      if (isPrincipal) return { min: 2500000, max: 4500000, currency: "INR" };
      if (isSenior) return { min: 1500000, max: 2800000, currency: "INR" };
      if (isMid) return { min: 900000, max: 1600000, currency: "INR" };
      return { min: 500000, max: 900000, currency: "INR" };

    case "PH":
      if (isPrincipal) return { min: 1500000, max: 2500000, currency: "PHP" };
      if (isSenior) return { min: 1000000, max: 1600000, currency: "PHP" };
      if (isMid) return { min: 600000, max: 1000000, currency: "PHP" };
      return { min: 360000, max: 600000, currency: "PHP" };

    case "ZA":
      if (isPrincipal) return { min: 950000, max: 1400000, currency: "ZAR" };
      if (isSenior) return { min: 700000, max: 980000, currency: "ZAR" };
      if (isMid) return { min: 450000, max: 700000, currency: "ZAR" };
      return { min: 300000, max: 450000, currency: "ZAR" };

    default:
      return { min: 80000, max: 120000, currency: "USD" };
  }
}
