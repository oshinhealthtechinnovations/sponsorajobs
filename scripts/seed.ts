import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";
import { INITIAL_COUNTRIES } from "../config/countries";
import { INITIAL_CATEGORIES } from "../config/categories";
import { classifyJobSponsorship } from "../scoring/classifier";
import { generateCanonicalHash } from "../normalization";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_SOURCES = [
  { id: "seed_direct", name: "SponsorAJobs Direct Feed", type: "feed", active: 1, terms: "https://sponsorajobs.com/terms", attribution: 0 },
  { id: "usajobs", name: "USAJobs Federal API", type: "api", active: 0, terms: "https://developer.usajobs.gov/API-Terms", attribution: 0 },
  { id: "adzuna", name: "Adzuna Job API", type: "api", active: 0, terms: "https://developer.adzuna.com/terms", attribution: 1 },
  { id: "ashby", name: "Ashby ATS Feeds", type: "ats", active: 0, terms: "https://www.ashbyhq.com/terms", attribution: 0 },
  { id: "workable", name: "Workable ATS Feeds", type: "ats", active: 0, terms: "https://www.workable.com/terms", attribution: 0 },
];

const SEED_COMPANIES = [
  { id: "comp_atlassian", name: "Atlassian", country: "AU", industry: "Technology", website: "https://atlassian.com" },
  { id: "comp_canva", name: "Canva", country: "AU", industry: "Technology", website: "https://canva.com" },
  { id: "comp_revolut", name: "Revolut", country: "GB", industry: "Fintech", website: "https://revolut.com" },
  { id: "comp_monzo", name: "Monzo Bank", country: "GB", industry: "Fintech", website: "https://monzo.com" },
  { id: "comp_nhs", name: "NHS England Trust", country: "GB", industry: "Healthcare", website: "https://nhs.uk" },
  { id: "comp_arup", name: "Arup Engineering", country: "GB", industry: "Engineering", website: "https://arup.com" },
  { id: "comp_shopify", name: "Shopify", country: "CA", industry: "E-Commerce", website: "https://shopify.com" },
  { id: "comp_xero", name: "Xero", country: "NZ", industry: "Technology", website: "https://xero.com" },
  { id: "comp_bhp", name: "BHP Mining", country: "AU", industry: "Engineering", website: "https://bhp.com" },
  { id: "comp_datacom", name: "Datacom NZ", country: "NZ", industry: "Technology", website: "https://datacom.com" },
];

const SAMPLE_JOBS_RAW = [
  // UK
  {
    title: "Senior Civil Structural Engineer",
    companyId: "comp_arup",
    categorySlug: "engineering",
    city: "London",
    region: "Greater London",
    country: "GB",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 65000,
    salaryMax: 85000,
    currency: "GBP",
    desc: "Arup is looking for a Senior Civil Structural Engineer in London. We offer full UK Skilled Worker visa sponsorship and Certificate of Sponsorship (CoS) for international candidates.",
    source: "seed_direct",
  },
  {
    title: "Staff Backend Engineer (Fintech)",
    companyId: "comp_revolut",
    categorySlug: "information-technology",
    city: "London",
    region: "Greater London",
    country: "GB",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 110000,
    salaryMax: 145000,
    currency: "GBP",
    desc: "Join Revolut as Staff Backend Engineer. Visa sponsorship is available for eligible senior software engineering candidates.",
    source: "seed_direct",
  },
  {
    title: "Registered Nurse - Acute Care",
    companyId: "comp_nhs",
    categorySlug: "healthcare",
    city: "Birmingham",
    region: "West Midlands",
    country: "GB",
    remoteType: "ONSITE",
    employmentType: "FULL_TIME",
    salaryMin: 34000,
    salaryMax: 42000,
    currency: "GBP",
    desc: "NHS Trust invites applications for Registered Nurses. UK Health and Care Worker visa sponsorship provided along with OSCE support.",
    source: "seed_direct",
  },
  {
    title: "Junior Data Analyst",
    companyId: "comp_monzo",
    categorySlug: "information-technology",
    city: "London",
    region: "Greater London",
    country: "GB",
    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryMin: 45000,
    salaryMax: 55000,
    currency: "GBP",
    desc: "Entry-to-mid level Data Analyst role. Note: candidates must have unrestricted work authorization to apply; sponsorship is not available.",
    source: "seed_direct",
  },
  {
    title: "Project Delivery Manager - Construction",
    companyId: "comp_arup",
    categorySlug: "construction",
    city: "Manchester",
    region: "Greater Manchester",
    country: "GB",
    remoteType: "ONSITE",
    employmentType: "CONTRACT",
    salaryMin: 55000,
    salaryMax: 70000,
    currency: "GBP",
    desc: "Lead infrastructure project deliveries. Visa support may be available for exceptional project managers with specialized major rail experience.",
    source: "seed_direct",
  },
  {
    title: "Lead Site Reliability Engineer",
    companyId: "comp_monzo",
    categorySlug: "information-technology",
    city: "London",
    region: "Greater London",
    country: "GB",
    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryMin: 120000,
    salaryMax: 160000,
    currency: "GBP",
    desc: "Architect scalable infrastructure for Monzo. Skilled Worker visa sponsorship available.",
    source: "seed_direct",
  },

  // US
  {
    title: "Principal Distributed Systems Architect",
    companyId: "comp_atlassian",
    categorySlug: "information-technology",
    city: "San Francisco",
    region: "California",
    country: "US",
    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryMin: 210000,
    salaryMax: 270000,
    currency: "USD",
    desc: "Lead core distributed systems. We offer H-1B transfer and Green Card sponsorship for senior and principal tier engineers.",
    source: "seed_direct",
  },
  {
    title: "Geotechnical Mining Engineer",
    companyId: "comp_bhp",
    categorySlug: "engineering",
    city: "Austin",
    region: "Texas",
    country: "US",
    remoteType: "ONSITE",
    employmentType: "FULL_TIME",
    salaryMin: 130000,
    salaryMax: 175000,
    currency: "USD",
    desc: "BHP is expanding US mining operations. Employment sponsorship and O-1/H-1B visa support provided for specialized geological candidates.",
    source: "seed_direct",
  },
  {
    title: "Financial Planning & Analysis Manager",
    companyId: "comp_shopify",
    categorySlug: "finance",
    city: "New York",
    region: "New York",
    country: "US",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 140000,
    salaryMax: 180000,
    currency: "USD",
    desc: "Manage group-wide financial forecasts. Candidates must already have the right to work in the US without employer sponsorship.",
    source: "seed_direct",
  },
  {
    title: "Full Stack Product Engineer",
    companyId: "comp_canva",
    categorySlug: "information-technology",
    city: "Seattle",
    region: "Washington",
    country: "US",
    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryMin: 160000,
    salaryMax: 205000,
    currency: "USD",
    desc: "Build next-gen creative tools. H-1B sponsorship and work visa sponsorship offered for qualified candidates.",
    source: "seed_direct",
  },
  {
    title: "Healthcare Compliance Specialist",
    companyId: "comp_nhs",
    categorySlug: "healthcare",
    city: "Boston",
    region: "Massachusetts",
    country: "US",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 95000,
    salaryMax: 120000,
    currency: "USD",
    desc: "US citizenship or Green Card required exclusively for federal compliance clearances.",
    source: "seed_direct",
  },
  {
    title: "Machine Learning Research Scientist",
    companyId: "comp_canva",
    categorySlug: "information-technology",
    city: "San Francisco",
    region: "California",
    country: "US",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 220000,
    salaryMax: 310000,
    currency: "USD",
    desc: "Generative AI research. Visa sponsorship is available and relocation package included.",
    source: "seed_direct",
  },

  // Australia
  {
    title: "Senior Full Stack Engineer (React/Node)",
    companyId: "comp_atlassian",
    categorySlug: "information-technology",
    city: "Sydney",
    region: "New South Wales",
    country: "AU",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 160000,
    salaryMax: 210000,
    currency: "AUD",
    desc: "Join Atlassian in Sydney. We sponsor international talent on TSS Subclass 482 and Skills in Demand visas.",
    source: "seed_direct",
  },
  {
    title: "Civil Highway Design Engineer",
    companyId: "comp_arup",
    categorySlug: "engineering",
    city: "Melbourne",
    region: "Victoria",
    country: "AU",
    remoteType: "ONSITE",
    employmentType: "FULL_TIME",
    salaryMin: 125000,
    salaryMax: 155000,
    currency: "AUD",
    desc: "Design major arterial highways. Employer sponsored position via subclass 482 visa with pathway to subclass 186 permanent residency.",
    source: "seed_direct",
  },
  {
    title: "Senior Product Designer",
    companyId: "comp_canva",
    categorySlug: "information-technology",
    city: "Sydney",
    region: "New South Wales",
    country: "AU",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 150000,
    salaryMax: 195000,
    currency: "AUD",
    desc: "Lead Canva design systems. Relocation and work visa sponsorship provided for international applicants.",
    source: "seed_direct",
  },
  {
    title: "Principal Mining Mechanical Engineer",
    companyId: "comp_bhp",
    categorySlug: "engineering",
    city: "Perth",
    region: "Western Australia",
    country: "AU",
    remoteType: "ONSITE",
    employmentType: "FULL_TIME",
    salaryMin: 180000,
    salaryMax: 240000,
    currency: "AUD",
    desc: "Oversee heavy machinery assets. Subclass 482 employer sponsorship available for experienced mining engineers.",
    source: "seed_direct",
  },
  {
    title: "Clinical Nurse Specialist - Oncology",
    companyId: "comp_nhs",
    categorySlug: "healthcare",
    city: "Brisbane",
    region: "Queensland",
    country: "AU",
    remoteType: "ONSITE",
    employmentType: "FULL_TIME",
    salaryMin: 98000,
    salaryMax: 120000,
    currency: "AUD",
    desc: "State healthcare system hiring international oncology nurses. Employer sponsorship provided via subclass 482 / 186.",
    source: "seed_direct",
  },
  {
    title: "Commercial Construction Project Manager",
    companyId: "comp_arup",
    categorySlug: "construction",
    city: "Adelaide",
    region: "South Australia",
    country: "AU",
    remoteType: "ONSITE",
    employmentType: "FULL_TIME",
    salaryMin: 140000,
    salaryMax: 175000,
    currency: "AUD",
    desc: "Deliver landmark commercial projects in Adelaide. Visa sponsorship available for chartered project managers.",
    source: "seed_direct",
  },

  // Canada
  {
    title: "Staff Cloud Platform Architect",
    companyId: "comp_shopify",
    categorySlug: "information-technology",
    city: "Toronto",
    region: "Ontario",
    country: "CA",
    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryMin: 180000,
    salaryMax: 240000,
    currency: "CAD",
    desc: "Architect Shopify's global commerce engine. This position has positive LMIA support and work permit sponsorship for eligible international candidates.",
    source: "seed_direct",
  },
  {
    title: "Senior Geotechnical Structural Engineer",
    companyId: "comp_arup",
    categorySlug: "engineering",
    city: "Vancouver",
    region: "British Columbia",
    country: "CA",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 120000,
    salaryMax: 160000,
    currency: "CAD",
    desc: "Seismic and structural geotechnical modeling. LMIA supported work visa available for licensed P.Eng / internationally qualified candidates.",
    source: "seed_direct",
  },
  {
    title: "Senior Risk & Compliance Analyst",
    companyId: "comp_revolut",
    categorySlug: "finance",
    city: "Montreal",
    region: "Quebec",
    country: "CA",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 90000,
    salaryMax: 120000,
    currency: "CAD",
    desc: "Manage Canadian regulatory reporting. Candidates must have unrestricted work authorization; no sponsorship provided.",
    source: "seed_direct",
  },
  {
    title: "Senior Frontend Engineer (Design Systems)",
    companyId: "comp_shopify",
    categorySlug: "information-technology",
    city: "Ottawa",
    region: "Ontario",
    country: "CA",
    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryMin: 155000,
    salaryMax: 200000,
    currency: "CAD",
    desc: "Build Polaris design components. Employer sponsorship and Canadian work permit support offered.",
    source: "seed_direct",
  },
  {
    title: "Supply Chain Operations Lead",
    companyId: "comp_shopify",
    categorySlug: "logistics",
    city: "Calgary",
    region: "Alberta",
    country: "CA",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 95000,
    salaryMax: 130000,
    currency: "CAD",
    desc: "Oversee Canadian fulfillment network logistics. Temporary foreign worker LMIA support may be considered.",
    source: "seed_direct",
  },
  {
    title: "Cybersecurity Threat Hunter",
    companyId: "comp_shopify",
    categorySlug: "information-technology",
    city: "Toronto",
    region: "Ontario",
    country: "CA",
    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryMin: 140000,
    salaryMax: 190000,
    currency: "CAD",
    desc: "Detect complex intrusions. Work visa sponsorship provided for senior security analysts.",
    source: "seed_direct",
  },

  // New Zealand
  {
    title: "Principal Software Architect",
    companyId: "comp_xero",
    categorySlug: "information-technology",
    city: "Wellington",
    region: "Wellington",
    country: "NZ",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 165000,
    salaryMax: 215000,
    currency: "NZD",
    desc: "Xero is an Accredited Employer. We provide full Accredited Employer Work Visa (AEWV) and Green List fast-track residency sponsorship.",
    source: "seed_direct",
  },
  {
    title: "Senior Cloud Infrastructure Engineer",
    companyId: "comp_datacom",
    categorySlug: "information-technology",
    city: "Auckland",
    region: "Auckland",
    country: "NZ",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 140000,
    salaryMax: 180000,
    currency: "NZD",
    desc: "Enterprise cloud migrations on AWS/Azure. AEWV accredited employer sponsorship provided.",
    source: "seed_direct",
  },
  {
    title: "Structural Seismic Engineer",
    companyId: "comp_arup",
    categorySlug: "engineering",
    city: "Christchurch",
    region: "Canterbury",
    country: "NZ",
    remoteType: "ONSITE",
    employmentType: "FULL_TIME",
    salaryMin: 120000,
    salaryMax: 155000,
    currency: "NZD",
    desc: "Earthquake engineering & structural assessment. Accredited employer work visa sponsorship available on Green List Tier 1.",
    source: "seed_direct",
  },
  {
    title: "Registered Midwife / Neonatal Nurse",
    companyId: "comp_nhs",
    categorySlug: "healthcare",
    city: "Auckland",
    region: "Auckland",
    country: "NZ",
    remoteType: "ONSITE",
    employmentType: "FULL_TIME",
    salaryMin: 85000,
    salaryMax: 110000,
    currency: "NZD",
    desc: "Health NZ accredited employer sponsorship and Green List Straight to Residence pathway for registered nurses.",
    source: "seed_direct",
  },
  {
    title: "Senior Commercial Solicitor",
    companyId: "comp_xero",
    categorySlug: "finance",
    city: "Auckland",
    region: "Auckland",
    country: "NZ",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    salaryMin: 130000,
    salaryMax: 170000,
    currency: "NZD",
    desc: "Lead SaaS enterprise contracts. Note: candidates must hold a current NZ practicing certificate and unrestricted right to work.",
    source: "seed_direct",
  },
  {
    title: "Civil Project Surveyor",
    companyId: "comp_arup",
    categorySlug: "construction",
    city: "Hamilton",
    region: "Waikato",
    country: "NZ",
    remoteType: "ONSITE",
    employmentType: "FULL_TIME",
    salaryMin: 95000,
    salaryMax: 125000,
    currency: "NZD",
    desc: "Geodetic and cadastral surveying for major highway projects. Visa sponsorship available for registered surveyors.",
    source: "seed_direct",
  }
];

export async function runSeed(dbInstance?: any) {
  let db = dbInstance;

  if (!db) {
    const SQL = await initSqlJs();
    db = new SQL.Database();

    // Apply migrations
    const m1 = fs.readFileSync(path.resolve(__dirname, "../migrations/001_initial_schema.sql"), "utf-8");
    db.exec(m1);
    const m2 = fs.readFileSync(path.resolve(__dirname, "../migrations/002_indexes.sql"), "utf-8");
    db.exec(m2);
  }

  // 1. Seed Countries
  for (const c of INITIAL_COUNTRIES) {
    db.run(
      `INSERT OR REPLACE INTO countries (id, code, name, slug, flag, currency, active, seo_title, seo_description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [`c_${c.code.toLowerCase()}`, c.code, c.name, c.slug, c.flag, c.currency, 1, c.seoTitle, c.seoDescription]
    );
  }

  // 2. Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    db.run(
      `INSERT OR REPLACE INTO categories (id, name, slug, parent_id, active, seo_title, seo_description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [cat.id, cat.name, cat.slug, null, 1, cat.seoTitle, cat.seoDescription]
    );
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        db.run(
          `INSERT OR REPLACE INTO categories (id, name, slug, parent_id, active, seo_title, seo_description, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [sub.id, sub.name, sub.slug, cat.id, 1, `${sub.name} Visa Sponsorship Jobs`, `Browse ${sub.name} jobs`]
        );
      }
    }
  }

  // 3. Seed Sources (All 5 registered sources)
  for (const s of SEED_SOURCES) {
    db.run(
      `INSERT OR REPLACE INTO sources (id, name, type, active, terms_url, attribution_required, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [s.id, s.name, s.type, s.active, s.terms, s.attribution]
    );
  }

  // 4. Seed Companies
  for (const comp of SEED_COMPANIES) {
    db.run(
      `INSERT OR REPLACE INTO companies (id, name, normalized_name, website, country_code, industry, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [comp.id, comp.name, comp.name.toLowerCase(), comp.website, comp.country, comp.industry]
    );
  }

  // 5. Seed 30 Sample Jobs
  for (let i = 0; i < SAMPLE_JOBS_RAW.length; i++) {
    const raw = SAMPLE_JOBS_RAW[i];
    const jobId = `job_seed_${i + 1}`;
    const comp = SEED_COMPANIES.find((c) => c.id === raw.companyId);
    const companyName = comp ? comp.name : "Employer";
    const applyUrl = `https://careers.example.com/apply/${jobId}?source=sponsorajobs`;
    const jobUrl = `https://sponsorajobs.com/job/${jobId}`;
    const hash = generateCanonicalHash(companyName, raw.title, `${raw.city}, ${raw.country}`, applyUrl);

    const classification = classifyJobSponsorship(raw.desc, raw.country);

    db.run(
      `INSERT OR REPLACE INTO jobs (
        id, source_id, source_job_id, canonical_hash, title, company_id,
        description, description_clean, location, city, region, country_code,
        remote_type, employment_type, category_id, salary_min, salary_max, salary_currency,
        job_url, apply_url, source_url, published_at, first_seen_at, last_seen_at,
        sponsorship_score, sponsorship_label, sponsorship_positive_evidence,
        sponsorship_negative_evidence, visa_keywords, quality_score, status, is_featured,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, 'active', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        jobId,
        raw.source,
        `src_${i + 1}`,
        hash,
        raw.title,
        raw.companyId,
        raw.desc,
        raw.desc,
        `${raw.city}, ${raw.country}`,
        raw.city,
        raw.region,
        raw.country,
        raw.remoteType,
        raw.employmentType,
        `cat_${raw.categorySlug === 'engineering' ? 'eng' : raw.categorySlug === 'healthcare' ? 'health' : raw.categorySlug === 'construction' ? 'const' : raw.categorySlug === 'finance' ? 'fin' : raw.categorySlug === 'logistics' ? 'logistics' : 'tech'}`,
        raw.salaryMin,
        raw.salaryMax,
        raw.currency,
        jobUrl,
        applyUrl,
        applyUrl,
        new Date(Date.now() - i * 86400000 * 0.7).toISOString(),
        classification.score,
        classification.label,
        JSON.stringify(classification.positiveEvidence),
        JSON.stringify(classification.negativeEvidence),
        JSON.stringify(classification.keywords),
        100,
        i % 5 === 0 ? 1 : 0
      ]
    );
  }

  console.log(`[Seed] Successfully seeded 5 countries, ${INITIAL_CATEGORIES.length} categories, ${SEED_SOURCES.length} sources, ${SEED_COMPANIES.length} companies, and ${SAMPLE_JOBS_RAW.length} jobs.`);

  return db;
}

// Execute if run directly via CLI
if (process.argv[1] && process.argv[1].includes("seed")) {
  runSeed().then((db) => {
    try {
      const data = db.export();
      const dbPath = path.resolve(__dirname, "../local.sqlite");
      fs.writeFileSync(dbPath, Buffer.from(data));
      console.log(`[Seed] Saved database to ${dbPath}`);
    } catch (err) {
      console.error("[Seed] Failed to write database file:", err);
    }
  }).catch(console.error);
}
