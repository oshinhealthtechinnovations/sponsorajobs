/**
 * Initial Target Countries Configuration (GB, US, AU, CA, NZ)
 * As required by Master Build Prompt Section 6 & 27
 */

export interface CountryConfig {
  code: 'GB' | 'US' | 'AU' | 'CA' | 'NZ';
  name: string;
  slug: string;
  flag: string;
  currency: string;
  active: boolean;
  seoTitle: string;
  seoDescription: string;
  popularCities: string[];
}

export const INITIAL_COUNTRIES: CountryConfig[] = [
  {
    code: "GB",
    name: "United Kingdom",
    slug: "uk",
    flag: "🇬🇧",
    currency: "GBP",
    active: true,
    seoTitle: "Visa Sponsorship Jobs UK | SponsorAJobs",
    seoDescription: "Discover verified UK jobs offering Skilled Worker visa sponsorship and Certificate of Sponsorship (CoS) support across London, Manchester, and Birmingham.",
    popularCities: ["London", "Manchester", "Birmingham", "Edinburgh", "Leeds", "Bristol"]
  },
  {
    code: "US",
    name: "United States",
    slug: "usa",
    flag: "🇺🇸",
    currency: "USD",
    active: true,
    seoTitle: "Visa Sponsorship Jobs USA | SponsorAJobs",
    seoDescription: "Search employment opportunities with H-1B, Green Card, and O-1 visa sponsorship signals across New York, San Francisco, Texas, and Seattle.",
    popularCities: ["New York", "San Francisco", "Austin", "Seattle", "Chicago", "Boston"]
  },
  {
    code: "AU",
    name: "Australia",
    slug: "australia",
    flag: "🇦🇺",
    currency: "AUD",
    active: true,
    seoTitle: "Visa Sponsorship Jobs Australia | SponsorAJobs",
    seoDescription: "Explore Australian jobs with Subclass 482 TSS, Skills in Demand, and 186 Employer Nomination visa support in Sydney, Melbourne, and Brisbane.",
    popularCities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"]
  },
  {
    code: "CA",
    name: "Canada",
    slug: "canada",
    flag: "🇨🇦",
    currency: "CAD",
    active: true,
    seoTitle: "Visa Sponsorship Jobs Canada | SponsorAJobs",
    seoDescription: "Find Canadian job listings featuring LMIA support, Work Permit support, and Provincial Nominee pathways across Toronto, Vancouver, and Montreal.",
    popularCities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"]
  },
  {
    code: "NZ",
    name: "New Zealand",
    slug: "new-zealand",
    flag: "🇳🇿",
    currency: "NZD",
    active: true,
    seoTitle: "Visa Sponsorship Jobs New Zealand | SponsorAJobs",
    seoDescription: "Find jobs with Accredited Employer Work Visa (AEWV) and Green List sponsorship opportunities in Auckland, Wellington, and Christchurch.",
    popularCities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga"]
  }
];

export const COUNTRY_CODE_MAP = new Map(INITIAL_COUNTRIES.map((c) => [c.code, c]));
export const COUNTRY_SLUG_MAP = new Map(INITIAL_COUNTRIES.map((c) => [c.slug, c]));

export const COUNTRY_ALIASES: Record<string, string> = {
  us: "usa",
  usa: "usa",
  "united-states": "usa",
  "united-states-of-america": "usa",
  america: "usa",
  gb: "uk",
  uk: "uk",
  "united-kingdom": "uk",
  "great-britain": "uk",
  britain: "uk",
  england: "uk",
  au: "australia",
  aus: "australia",
  australia: "australia",
  ca: "canada",
  can: "canada",
  canada: "canada",
  nz: "new-zealand",
  "new-zealand": "new-zealand",
  newzealand: "new-zealand",
  de: "germany",
  germany: "germany",
  deutschland: "germany",
  ie: "ireland",
  ireland: "ireland",
  fr: "france",
  france: "france",
  sg: "singapore",
  singapore: "singapore",
  in: "india",
  india: "india",
  ae: "uae",
  uae: "uae",
};

export function getCountryByCode(code: string): CountryConfig | undefined {
  if (!code) return undefined;
  const upper = code.trim().toUpperCase();
  const direct = COUNTRY_CODE_MAP.get(upper as any);
  if (direct) return direct;

  const canonical = COUNTRY_ALIASES[code.trim().toLowerCase()];
  if (canonical) {
    return COUNTRY_SLUG_MAP.get(canonical);
  }
  return undefined;
}

export function getCountryBySlug(slug: string): CountryConfig | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  const canonicalSlug = COUNTRY_ALIASES[clean] || clean;

  // 1. Match canonical slug
  const direct = COUNTRY_SLUG_MAP.get(canonicalSlug) || COUNTRY_SLUG_MAP.get(clean);
  if (direct) return direct;

  // 2. Match by code (e.g. US -> United States)
  const byCode = COUNTRY_CODE_MAP.get(clean.toUpperCase() as any);
  if (byCode) return byCode;

  // 3. Match by name
  return INITIAL_COUNTRIES.find(
    (c) => c.name.toLowerCase() === clean || c.name.toLowerCase().replace(/\s+/g, "-") === clean
  );
}

const GLOBAL_COUNTRY_NAMES: Record<string, string> = {
  GB: "United Kingdom",
  UK: "United Kingdom",
  US: "United States",
  USA: "United States",
  AU: "Australia",
  CA: "Canada",
  NZ: "New Zealand",
  DE: "Germany",
  ES: "Spain",
  FR: "France",
  IE: "Ireland",
  NL: "Netherlands",
  SG: "Singapore",
  CH: "Switzerland",
  SE: "Sweden",
  IN: "India",
  AE: "UAE",
  JP: "Japan",
  BR: "Brazil",
  IT: "Italy",
  DK: "Denmark",
  NO: "Norway",
  FI: "Finland",
  PL: "Poland",
  PT: "Portugal",
  AT: "Austria",
  BE: "Belgium",
};

export function getCountryDisplayName(codeOrSlug?: string): string {
  if (!codeOrSlug) return "Global";
  const upper = codeOrSlug.trim().toUpperCase();
  if (GLOBAL_COUNTRY_NAMES[upper]) return GLOBAL_COUNTRY_NAMES[upper];
  const cfg = getCountryBySlug(codeOrSlug);
  if (cfg) return cfg.name;
  return upper;
}
