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

export function getCountryByCode(code: string): CountryConfig | undefined {
  return COUNTRY_CODE_MAP.get(code.toUpperCase() as any);
}

export function getCountryBySlug(slug: string): CountryConfig | undefined {
  return COUNTRY_SLUG_MAP.get(slug.toLowerCase());
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
