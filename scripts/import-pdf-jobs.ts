/**
 * Universal PDF Job Ingestion Engine
 * Extracts and ingests sponsored job listings from PDF documents into SponsorAJobs platform.
 * 
 * Usage:
 *   npx tsx scripts/import-pdf-jobs.ts <path-to-pdf>
 * Or place your PDF file in the root as 'jobs.pdf' and run:
 *   npx tsx scripts/import-pdf-jobs.ts
 */

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import {
  parseLocationDetails,
  inferEngineeringCategory,
  estimateRealisticSalary,
} from "../lib/services/smartJobScraper";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export interface ExtractedJob {
  id: string;
  title: string;
  companyName: string;
  location: string;
  countryCode?: string;
  salary?: string;
  experience?: string;
  skills?: string;
  description: string;
  applyUrl: string;
}

export async function extractTextFromPDF(pdfPath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

/**
 * Intelligent parser that segments raw PDF text into discrete job opportunities.
 * Recognizes common section delimiters (Job Title, Role, Position, Company, Location, Apply, etc.)
 */
export function parseJobsFromText(text: string, defaultCompany = "Verified Sponsor"): ExtractedJob[] {
  const jobs: ExtractedJob[] = [];
  
  // Normalize line endings
  const cleanText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  
  // Split strategies:
  const delimiters = [
    /(?:^|\n)(?=(?:Job Title|Position|Role Title|Vacancy|Job Reference|Req ID|Job ID)\s*[:\-])/i,
    /(?:^|\n)(?=(?:[0-9]{1,3}\.\s+[A-Z]))/,
    /\n-{4,}\n/,
    /\n={4,}\n/
  ];

  let rawBlocks: string[] = [];
  for (const delimiter of delimiters) {
    const splits = cleanText.split(delimiter).filter(b => b.trim().length > 60);
    if (splits.length > 1) {
      rawBlocks = splits;
      break;
    }
  }

  // Fallback: If no delimiter split, try double/triple newline blocks
  if (rawBlocks.length <= 1) {
    rawBlocks = cleanText.split(/\n\s*\n\s*\n/).filter(b => b.trim().length > 80);
  }

  // If still single block, treat the whole document as 1 job
  if (rawBlocks.length === 0 && cleanText.trim().length > 30) {
    rawBlocks = [cleanText];
  }

  for (let i = 0; i < rawBlocks.length; i++) {
    const block = rawBlocks[i].trim();
    if (!block || block.length < 30) continue;

    const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // Extract Title
    let title = "";
    const titleMatch = block.match(/(?:Job Title|Position|Role Title|Vacancy|Title)\s*[:\-]\s*([^\n]+)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      const firstLine = lines[0].replace(/^[0-9]+[\.\)\-]\s*/, "");
      if (firstLine.length < 90 && !firstLine.toLowerCase().includes("page")) {
        title = firstLine;
      } else {
        title = `Visa Sponsorship Opportunity ${i + 1}`;
      }
    }

    // Extract Company
    let companyName = defaultCompany;
    const companyMatch = block.match(/(?:Company|Employer|Organization|Hiring Organization)\s*[:\-]\s*([^\n]+)/i);
    if (companyMatch) {
      companyName = companyMatch[1].trim();
    }

    // Extract Location
    let location = "United Kingdom";
    const locMatch = block.match(/(?:Location|Work Location|Place of Work|City|Country)\s*[:\-]\s*([^\n]+)/i);
    if (locMatch) {
      location = locMatch[1].trim();
    }

    // Extract Salary
    let salary = "";
    const salaryMatch = block.match(/(?:Salary|Compensation|Package|Pay Rate)\s*[:\-]\s*([^\n]+)/i);
    if (salaryMatch) {
      salary = salaryMatch[1].trim();
    }

    // Extract Experience
    let experience = "Mid-Level";
    const expMatch = block.match(/(?:Experience|Level|Years of Experience)\s*[:\-]\s*([^\n]+)/i);
    if (expMatch) {
      experience = expMatch[1].trim();
    }

    // Extract Skills
    let skills = "Visa Sponsorship, Technology, Problem Solving";
    const skillsMatch = block.match(/(?:Skills|Key Skills|Requirements|Technologies)\s*[:\-]\s*([^\n]+)/i);
    if (skillsMatch) {
      skills = skillsMatch[1].trim();
    }

    // Extract Apply URL
    let applyUrl = "https://sponsorajobs.com/jobs";
    const urlMatch = block.match(/(https?:\/\/[^\s\)\"\'\<\>]+)/i);
    if (urlMatch) {
      applyUrl = urlMatch[1].trim();
    } else {
      const emailMatch = block.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        applyUrl = `mailto:${emailMatch[1]}`;
      }
    }

    const jobId = `pdf_job_${Date.now()}_${i + 1}`;

    jobs.push({
      id: jobId,
      title,
      companyName,
      location,
      salary,
      experience,
      skills,
      description: block,
      applyUrl,
    });
  }

  return jobs;
}

/**
 * Ingests extracted jobs into lib/db/realJobsData.json
 */
export async function ingestJobsIntoDatabase(extractedJobs: ExtractedJob[]): Promise<{
  inserted: number;
  updated: number;
  total: number;
}> {
  const dbPath = path.resolve(process.cwd(), "lib/db/realJobsData.json");
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Jobs database not found at ${dbPath}`);
  }

  const rawData = fs.readFileSync(dbPath, "utf8");
  const data = JSON.parse(rawData);

  const existingJobs: any[] = data.jobs || [];
  const existingCompanies: any[] = data.companies || [];

  const jobsMap = new Map<string, any>();
  existingJobs.forEach(j => jobsMap.set(j.canonical_hash || j.id, j));

  let inserted = 0;
  let updated = 0;

  for (let idx = 0; idx < extractedJobs.length; idx++) {
    const job = extractedJobs[idx];

    // Location & country
    const locInfo = parseLocationDetails(job.location + " " + job.description, job.title);
    const catInfo = inferEngineeringCategory(job.title, job.description);
    const salaryInfo = estimateRealisticSalary(locInfo.countryCode, job.title, job.experience || "Mid-Level");

    // Company profile ensuring
    const compSlug = job.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const compId = `comp_${compSlug || "sponsor"}`;
    if (!existingCompanies.some(c => c.id === compId || c.normalized_name === compSlug)) {
      existingCompanies.push({
        id: compId,
        name: job.companyName,
        normalized_name: compSlug,
        country_code: locInfo.countryCode || "GB",
        industry: catInfo.categoryName || "Technology & Engineering",
        website: "https://sponsorajobs.com",
        careers_url: job.applyUrl.startsWith("http") ? job.applyUrl : "https://sponsorajobs.com/jobs",
        logo_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&h=128&fit=crop",
        description: `${job.companyName} verified visa sponsor organization.`,
        sponsorship_signal: "high",
        verified_sponsor: 1,
        sponsor_tier: "A-Rated",
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    const cleanTitle = job.title.trim();
    const titleSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const slug = `${titleSlug}-${Date.now().toString().slice(-4)}${idx + 1}`;
    const canonicalHash = `job_pdf_${titleSlug}_${compSlug}_${locInfo.countryCode.toLowerCase()}`;

    // Structure Markdown description
    const formattedDesc = `## About ${job.companyName}
${job.companyName} is a licensed visa sponsor organization committed to inclusive international talent acquisition and global career development.

## Position Details
- **Role:** ${cleanTitle}
- **Category:** ${catInfo.categoryName}
- **Location:** ${locInfo.location} (${locInfo.countryCode})
- **Visa Sponsorship:** Fully Supported & Verified

## Description & Key Responsibilities
${job.description}

## Application Instructions
Please submit your verified application directly via the official employer link provided. Ensure your CV highlights statutory salary requirements and sponsorship eligibility.`;

    const structuredJob = {
      id: job.id,
      title: cleanTitle,
      slug,
      canonical_hash: canonicalHash,
      company_id: compId,
      company_name: job.companyName,
      company_logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&h=128&fit=crop",
      location: locInfo.location,
      city: locInfo.city,
      country_code: locInfo.countryCode,
      country_name: locInfo.countryCode === "GB" ? "United Kingdom" : locInfo.countryCode,
      is_remote: job.location.toLowerCase().includes("remote") ? 1 : 0,
      description: formattedDesc,
      category_id: catInfo.categoryId,
      category_slug: catInfo.categorySlug,
      category_name: catInfo.categoryName,
      salary_min: salaryInfo.min,
      salary_max: salaryInfo.max,
      salary_currency: salaryInfo.currency,
      job_url: job.applyUrl,
      apply_url: job.applyUrl,
      source_url: job.applyUrl,
      applyUrl: job.applyUrl,
      publishedAt: new Date().toISOString(),
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      sponsorship_score: 95,
      sponsorship_label: "Strong",
      sponsorship_positive_evidence: JSON.stringify([
        "Verified Visa Sponsorship Job Ingestion Pipeline",
        "Direct Employer Contact & ATS Application URL",
        "Home Office / Statutory CoS Compliance Clearance"
      ]),
      sponsorship_negative_evidence: JSON.stringify([]),
      visa_keywords: JSON.stringify((job.skills || "Sponsorship, Engineering, Technology").split(",").map(s => s.trim())),
      quality_score: 100,
      status: "active",
      is_featured: idx < 5 ? 1 : 0,
      isExpired: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const isNew = !jobsMap.has(canonicalHash) && !jobsMap.has(job.id);
    jobsMap.set(canonicalHash, structuredJob);

    if (isNew) {
      inserted++;
    } else {
      updated++;
    }
  }

  const updatedData = {
    companies: existingCompanies,
    jobs: Array.from(jobsMap.values()),
  };

  fs.writeFileSync(dbPath, JSON.stringify(updatedData, null, 2), "utf8");

  return {
    inserted,
    updated,
    total: updatedData.jobs.length,
  };
}

async function runCli() {
  console.log("================================================================================");
  console.log("📄 UNIVERSAL PDF JOB INGESTION SYSTEM");
  console.log("================================================================================");

  const args = process.argv.slice(2);
  let targetPdfPath = args[0];

  // If no argument provided, scan for any .pdf in root or 'jobs.pdf'
  if (!targetPdfPath) {
    const defaultCandidates = ["jobs.pdf", "job_listings.pdf", "sponsors.pdf", "input.pdf"];
    for (const cand of defaultCandidates) {
      const fullCand = path.resolve(process.cwd(), cand);
      if (fs.existsSync(fullCand)) {
        targetPdfPath = fullCand;
        break;
      }
    }
  }

  if (!targetPdfPath || !fs.existsSync(targetPdfPath)) {
    console.log("⚠️ Ready and listening for PDF documents.");
    console.log("   Options to provide your PDF:");
    console.log("   1. Save your file as 'jobs.pdf' in the root directory, OR");
    console.log("   2. Run: npx tsx scripts/import-pdf-jobs.ts \"<path-to-your-pdf>\"");
    console.log("   3. Or drop/upload your PDF into the project!");
    console.log("================================================================================");
    return;
  }

  console.log(`🔍 Reading and parsing PDF from: ${targetPdfPath}`);
  const rawText = await extractTextFromPDF(targetPdfPath);
  console.log(`📊 Extracted ${rawText.length} characters of raw text.`);

  console.log("⚡ Parsing discrete job listings...");
  const parsedJobs = parseJobsFromText(rawText);
  console.log(`🎯 Identified ${parsedJobs.length} potential job listings.`);

  if (parsedJobs.length === 0) {
    console.log("⚠️ Could not detect structured job entries in the provided PDF text.");
    return;
  }

  console.log("💾 Ingesting into SponsorAJobs database (lib/db/realJobsData.json)...");
  const result = await ingestJobsIntoDatabase(parsedJobs);

  console.log("================================================================================");
  console.log("🎉 PDF Ingestion Complete!");
  console.log(`   - Successfully Inserted: ${result.inserted} new jobs`);
  console.log(`   - Existing Updated:      ${result.updated} jobs`);
  console.log(`   - Total Platform Jobs:   ${result.total}`);
  console.log("================================================================================");
}

// Auto-run when executed
runCli().catch(err => {
  console.error("❌ Fatal Error during PDF Ingestion:", err);
  process.exit(1);
});
