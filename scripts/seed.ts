import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import initSqlJs from "sql.js";
import { INITIAL_COUNTRIES } from "../config/countries";
import { INITIAL_CATEGORIES } from "../config/categories";
import realData from "../lib/db/realJobsData.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_SOURCES = [
  { id: "arbeitnow", name: "Arbeitnow Visa Jobs API", type: "api", active: 1, terms: "https://www.arbeitnow.com/terms-conditions", attribution: 0 },
  { id: "remotive", name: "Remotive Remote Jobs API", type: "api", active: 1, terms: "https://remotive.com/api/terms", attribution: 1 },
  { id: "jooble", name: "Jooble Global Jobs API", type: "api", active: 1, terms: "https://jooble.org/api-terms", attribution: 1 },
  { id: "usajobs", name: "USAJobs Federal API", type: "api", active: 0, terms: "https://developer.usajobs.gov/API-Terms", attribution: 0 },
  { id: "adzuna", name: "Adzuna Job API", type: "api", active: 0, terms: "https://developer.adzuna.com/terms", attribution: 1 },
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

  // 3. Seed Sources
  for (const s of SEED_SOURCES) {
    db.run(
      `INSERT OR REPLACE INTO sources (id, name, type, active, terms_url, attribution_required, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [s.id, s.name, s.type, s.active, s.terms, s.attribution]
    );
  }

  // 4. Seed Real Companies
  for (const comp of realData.companies) {
    db.run(
      `INSERT OR REPLACE INTO companies (id, name, normalized_name, website, country_code, industry, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        comp.id ?? null,
        comp.name ?? "Employer",
        comp.normalized_name ?? (comp.name || "").toLowerCase(),
        comp.website ?? null,
        comp.country_code ?? "GB",
        comp.industry ?? "Technology"
      ]
    );
  }

  // 5. Seed Real Jobs
  for (let i = 0; i < realData.jobs.length; i++) {
    const raw: any = realData.jobs[i];

    const companyId = raw.company_id ?? (typeof raw.company === "object" ? raw.company?.id : raw.company) ?? null;
    const locationStr = typeof raw.location === "string" ? raw.location : (raw.location?.formatted || raw.location?.raw || "United Kingdom");
    const cityStr = raw.city ?? (typeof raw.location === "object" ? raw.location?.city : null);
    const countryCodeStr = raw.country_code ?? (typeof raw.location === "object" ? raw.location?.country : "GB") ?? "GB";
    const categoryIdStr = raw.category_id ?? (typeof raw.category === "string" ? raw.category : (raw.category?.id || "engineering"));
    const salaryMin = raw.salary_min ?? (typeof raw.salary === "object" ? raw.salary?.min : null);
    const salaryMax = raw.salary_max ?? (typeof raw.salary === "object" ? raw.salary?.max : null);
    const salaryCurrency = raw.salary_currency ?? (typeof raw.salary === "object" ? raw.salary?.currency : "GBP") ?? "GBP";
    const sponsorshipScore = raw.sponsorship_score ?? (typeof raw.sponsorship === "object" ? raw.sponsorship?.score : 80) ?? 80;
    const sponsorshipLabel = raw.sponsorship_label ?? (typeof raw.sponsorship === "object" ? raw.sponsorship?.status : "Strong") ?? "Strong";
    const posEvidence = typeof raw.sponsorship_positive_evidence === "string" 
      ? raw.sponsorship_positive_evidence 
      : JSON.stringify(raw.sponsorship?.reasons || raw.sponsorship_positive_evidence || []);
    const negEvidence = typeof raw.sponsorship_negative_evidence === "string" 
      ? raw.sponsorship_negative_evidence 
      : JSON.stringify(raw.sponsorship_negative_evidence || []);
    const visaKeywords = typeof raw.visa_keywords === "string" 
      ? raw.visa_keywords 
      : JSON.stringify(raw.tags || raw.visa_keywords || []);

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
        raw.id ?? `job_${i + 1}`,
        raw.source_id ?? (typeof raw.source === "object" ? raw.source?.id : "direct") ?? "direct",
        raw.source_job_id ?? String(i + 1),
        raw.canonical_hash ?? raw.canonicalHash ?? String(i + 1),
        raw.title ?? "Job Title",
        companyId,
        raw.description ?? "",
        raw.description_clean ?? raw.description ?? "",
        locationStr,
        cityStr,
        raw.region ?? null,
        countryCodeStr,
        raw.remote_type ?? raw.remoteType ?? "REMOTE",
        raw.employment_type ?? raw.employmentType ?? "FULL_TIME",
        categoryIdStr,
        salaryMin,
        salaryMax,
        salaryCurrency,
        raw.job_url ?? raw.apply_url ?? raw.applyUrl ?? null,
        raw.apply_url ?? raw.applyUrl ?? null,
        raw.source_url ?? raw.apply_url ?? raw.applyUrl ?? null,
        raw.published_at ?? raw.publishedAt ?? new Date().toISOString(),
        sponsorshipScore,
        sponsorshipLabel,
        posEvidence,
        negEvidence,
        visaKeywords,
        raw.quality_score ?? raw.qualityScore ?? 85,
        raw.is_featured ?? 0
      ]
    );
  }

  console.log(`[Seed] Successfully seeded 5 countries, ${INITIAL_CATEGORIES.length} categories, ${SEED_SOURCES.length} sources, ${realData.companies.length} real companies, and ${realData.jobs.length} real jobs.`);

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
