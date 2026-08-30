import fs from "fs";
import path from "path";
import { enrichJobListing, RawPartialJobInput } from "../lib/services/jobAutoEnricher";

/**
 * CLI Script to automatically enrich, autocomplete, and import manual or scraped jobs
 * Usage: npx tsx scripts/import-scraped-jobs.ts [path-to-json-or-csv]
 */
async function importJobs() {
  const filePath = process.argv[2] || "./scraped-jobs.json";
  const absPath = path.resolve(filePath);

  if (!fs.existsSync(absPath)) {
    console.log(`[Import] No file found at ${absPath}. Creating a sample template at ./scraped-jobs-template.json`);
    const sample: RawPartialJobInput[] = [
      {
        title: "Senior Backend Engineer (Python)",
        companyName: "Monzo Bank",
        location: "London, UK",
        applyUrl: "https://job-boards.greenhouse.io/monzo/jobs/sample",
        description: "We are hiring a Senior Backend Engineer. We offer full UK Skilled Worker visa sponsorship and relocation support. Salary £90,000 - £120,000.",
      },
      {
        title: "Staff Cloud Architect",
        companyName: "Stripe",
        location: "San Francisco, CA",
        applyUrl: "https://job-boards.greenhouse.io/stripe/jobs/sample2",
        description: "H-1B transfer and direct green card sponsorship provided for senior engineering staff. $180k - $240k.",
      }
    ];
    fs.writeFileSync(path.resolve("./scraped-jobs-template.json"), JSON.stringify(sample, null, 2));
    console.log(`Created sample template at ./scraped-jobs-template.json. You can populate it and re-run.`);
    return;
  }

  const rawContent = fs.readFileSync(absPath, "utf8");
  let rawJobs: RawPartialJobInput[] = [];

  if (filePath.endsWith(".json")) {
    rawJobs = JSON.parse(rawContent);
  } else if (filePath.endsWith(".csv")) {
    rawJobs = parseCsv(rawContent);
  }

  console.log(`[Import] Found ${rawJobs.length} raw jobs in ${filePath}. Autocompleting missing details...`);

  // Load existing database
  const dbPath = path.resolve("./lib/db/realJobsData.json");
  let existingJobs: any[] = [];
  let existingCompanies: any[] = [];
  try {
    const existing = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    existingJobs = existing.jobs || [];
    existingCompanies = existing.companies || [];
  } catch (e) {
    // start fresh if needed
  }

  const jobsMap = new Map<string, any>();
  existingJobs.forEach((j) => jobsMap.set(j.canonical_hash || j.id, j));

  const companiesMap = new Map<string, any>();
  existingCompanies.forEach((c) => companiesMap.set(c.id, c));

  let addedCount = 0;
  let updatedCount = 0;

  for (const raw of rawJobs) {
    if (!raw.title) continue;

    // Intelligent auto-enrichment fills all missing gaps
    const enriched = enrichJobListing(raw);

    const isNew = !jobsMap.has(enriched.canonical_hash);
    jobsMap.set(enriched.canonical_hash, enriched);

    if (isNew) addedCount++;
    else updatedCount++;

    if (!companiesMap.has(enriched.company_id)) {
      companiesMap.set(enriched.company_id, {
        id: enriched.company_id,
        name: enriched.company_name,
        normalized_name: enriched.company_name.toLowerCase(),
        slug: enriched.company_name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        website: enriched.company_website,
        careers_url: enriched.apply_url,
        logo_url: enriched.company_logo_url,
        industry: enriched.category_name,
        is_verified_sponsor: enriched.sponsorship_score >= 60 ? 1 : 0,
        active: 1,
        created_at: enriched.created_at,
        updated_at: enriched.updated_at,
      });
    }
  }

  const finalData = {
    companies: Array.from(companiesMap.values()),
    jobs: Array.from(jobsMap.values()),
  };

  fs.writeFileSync(dbPath, JSON.stringify(finalData, null, 2));

  console.log(`\n========================================`);
  console.log(`[Import Success]`);
  console.log(` • New Jobs Added: ${addedCount}`);
  console.log(` • Jobs Updated/Deduplicated: ${updatedCount}`);
  console.log(` • Total Active Database Jobs: ${finalData.jobs.length}`);
  console.log(` • Total Verified Companies: ${finalData.companies.length}`);
  console.log(`========================================\n`);
}

function parseCsv(content: string): RawPartialJobInput[] {
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length <= 1) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const results: RawPartialJobInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const item: any = {};
    headers.forEach((h, idx) => {
      item[h] = row[idx] || undefined;
    });
    results.push(item);
  }

  return results;
}

importJobs().catch(console.error);
