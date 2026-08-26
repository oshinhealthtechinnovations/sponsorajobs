import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";
import realData from "./realJobsData.json";

export const STATIC_SOURCES = [
  { id: "arbeitnow", name: "Arbeitnow Visa Jobs API", type: "api", active: 1, terms_url: "https://www.arbeitnow.com/terms-conditions", attribution_required: 0 },
  { id: "remotive", name: "Remotive Remote Jobs API", type: "api", active: 1, terms_url: "https://remotive.com/api/terms", attribution_required: 1 },
  { id: "jooble", name: "Jooble Global Jobs API", type: "api", active: 1, terms_url: "https://jooble.org/api-terms", attribution_required: 1 },
  { id: "usajobs", name: "USAJobs Federal API", type: "api", active: 0, terms_url: "https://developer.usajobs.gov/API-Terms", attribution_required: 0 },
  { id: "adzuna", name: "Adzuna Job API", type: "api", active: 0, terms_url: "https://developer.adzuna.com/terms", attribution_required: 1 },
];

export const STATIC_COUNTRIES = INITIAL_COUNTRIES.map((c) => ({
  id: `c_${c.code.toLowerCase()}`,
  code: c.code,
  name: c.name,
  slug: c.slug,
  flag: c.flag,
  currency: c.currency,
  active: 1,
  seo_title: c.seoTitle,
  seo_description: c.seoDescription,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
}));

export const STATIC_CATEGORIES = INITIAL_CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  parent_id: c.parentId || null,
  active: 1,
  seo_title: c.seoTitle || null,
  seo_description: c.seoDescription || null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
}));

// Real companies extracted from live APIs (Arbeitnow, Remotive, Jooble)
export const STATIC_COMPANIES = realData.companies || [];

// Real jobs extracted from live APIs (Arbeitnow, Remotive, Jooble) with 100% direct apply URLs
export const STATIC_JOBS = (realData.jobs || []).map((j: any) => {
  const comp = STATIC_COMPANIES.find((c: any) => c.id === j.company_id);
  const cat = STATIC_CATEGORIES.find((c) => c.slug === j.category_slug || c.id === j.category_id);
  return {
    ...j,
    company_name: j.company_name || comp?.name || "Verified Employer",
    company_logo: comp?.logo_url || null,
    company_industry: comp?.industry || "Technology",
    company_website: comp?.website || null,
    category_id: cat?.id || j.category_id || "cat_tech",
    category_name: cat?.name || j.category_name || "Information Technology",
    category_slug: cat?.slug || j.category_slug || "information-technology",
  };
});
