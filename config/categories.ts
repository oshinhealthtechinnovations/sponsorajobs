/**
 * Initial Job Categories Configuration (Hierarchical Support)
 * As required by Master Build Prompt Section 26
 */

export interface CategoryConfig {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  active: boolean;
  seoTitle?: string;
  seoDescription?: string;
  subcategories?: { id: string; name: string; slug: string }[];
}

export const INITIAL_CATEGORIES: CategoryConfig[] = [
  {
    id: "cat_eng",
    name: "Engineering",
    slug: "engineering",
    active: true,
    seoTitle: "Engineering Visa Sponsorship Jobs | SponsorAJobs",
    seoDescription: "Browse Civil, Mechanical, Electrical, and Structural Engineering jobs with visa sponsorship signals.",
    subcategories: [
      { id: "cat_eng_civil", name: "Civil Engineering", slug: "civil-engineering" },
      { id: "cat_eng_mech", name: "Mechanical Engineering", slug: "mechanical-engineering" },
      { id: "cat_eng_struct", name: "Structural Engineering", slug: "structural-engineering" },
      { id: "cat_eng_elec", name: "Electrical Engineering", slug: "electrical-engineering" },
    ]
  },
  {
    id: "cat_tech",
    name: "Information Technology",
    slug: "information-technology",
    active: true,
    seoTitle: "Tech & Software Visa Sponsorship Jobs | SponsorAJobs",
    seoDescription: "Search software engineer, DevOps, AI, and cybersecurity positions with work visa sponsorship.",
    subcategories: [
      { id: "cat_tech_swe", name: "Software Engineering", slug: "software-engineering" },
      { id: "cat_tech_data", name: "Data & Analytics", slug: "data-analytics" },
      { id: "cat_tech_sec", name: "Cybersecurity", slug: "cybersecurity" },
      { id: "cat_tech_devops", name: "Cloud & DevOps", slug: "cloud-devops" },
    ]
  },
  {
    id: "cat_health",
    name: "Healthcare",
    slug: "healthcare",
    active: true,
    seoTitle: "Healthcare & Nursing Visa Sponsorship Jobs | SponsorAJobs",
    seoDescription: "Find nursing, medical, and allied healthcare vacancies offering overseas visa sponsorship.",
    subcategories: [
      { id: "cat_health_nurse", name: "Nursing", slug: "nursing" },
      { id: "cat_health_doctor", name: "Doctors & Physicians", slug: "doctors-physicians" },
      { id: "cat_health_care", name: "Care Work", slug: "care-work" },
    ]
  },
  {
    id: "cat_const",
    name: "Construction",
    slug: "construction",
    active: true,
    seoTitle: "Construction & Trades Visa Sponsorship Jobs | SponsorAJobs",
    seoDescription: "Construction management, site engineering, and skilled trades positions with visa support.",
    subcategories: [
      { id: "cat_const_mgmt", name: "Site & Project Management", slug: "construction-project-management" },
      { id: "cat_const_trades", name: "Skilled Trades", slug: "skilled-trades" },
    ]
  },
  {
    id: "cat_fin",
    name: "Finance",
    slug: "finance",
    active: true,
    seoTitle: "Finance & Accounting Visa Sponsorship Jobs | SponsorAJobs",
    seoDescription: "Discover accounting, audit, financial analysis, and banking jobs with visa sponsorship.",
    subcategories: [
      { id: "cat_fin_acct", name: "Accounting & Audit", slug: "accounting-audit" },
      { id: "cat_fin_analyst", name: "Financial Analysis", slug: "financial-analysis" },
    ]
  },
  {
    id: "cat_logistics",
    name: "Logistics & Supply Chain",
    slug: "logistics",
    active: true,
    seoTitle: "Logistics & Supply Chain Visa Sponsorship Jobs | SponsorAJobs",
    seoDescription: "Supply chain management, warehouse operations, and transport opportunities with sponsorship.",
  },
  {
    id: "cat_hosp",
    name: "Hospitality",
    slug: "hospitality",
    active: true,
    seoTitle: "Hospitality & Culinary Visa Sponsorship Jobs | SponsorAJobs",
    seoDescription: "Chefs, hotel management, and hospitality positions with visa support signals.",
  },
  {
    id: "cat_edu",
    name: "Education",
    slug: "education",
    active: true,
    seoTitle: "Education & Teaching Visa Sponsorship Jobs | SponsorAJobs",
    seoDescription: "Teaching, university lecturers, and academic positions offering international visa sponsorship.",
  },
  {
    id: "cat_admin",
    name: "Administration",
    slug: "administration",
    active: true,
    seoTitle: "Administration & Operations Visa Sponsorship Jobs | SponsorAJobs",
    seoDescription: "Operations, administrative support, and office coordination jobs.",
  }
];

export const CATEGORY_MAP = new Map(INITIAL_CATEGORIES.map((c) => [c.slug, c]));

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORY_MAP.get(slug.toLowerCase());
}
