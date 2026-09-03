import { GreenhouseAdapter } from "../sources/greenhouse/GreenhouseAdapter";
import { LeverAdapter } from "../sources/lever/LeverAdapter";
import { AshbyAdapter } from "../sources/ashby/AshbyAdapter";
import { ArbeitnowAdapter } from "../sources/arbeitnow/ArbeitnowAdapter";
import { RemotiveAdapter } from "../sources/remotive/RemotiveAdapter";
import { RemoteOKAdapter } from "../sources/remoteok/RemoteOKAdapter";
import { JobicyAdapter } from "../sources/jobicy/JobicyAdapter";
import { HimalayasAdapter } from "../sources/himalayas/HimalayasAdapter";
import { TheMuseAdapter } from "../sources/themuse/TheMuseAdapter";
import { JoobleAdapter } from "../sources/jooble/JoobleAdapter";
import { AdzunaAdapter } from "../sources/adzuna/AdzunaAdapter";
import { USAJobsAdapter } from "../sources/usajobs/USAJobsAdapter";
import { resolveDirectApplyUrl } from "../lib/services/urlResolver";
import { classifyJobSponsorship } from "../scoring/classifier";
import { computeQualityScore } from "../scoring/qualityScorer";
import { generateCanonicalHash } from "../normalization";
import fs from "fs";
import path from "path";

async function harvestRealJobs() {
  console.log("Fetching live jobs directly from Employer ATS (Greenhouse, Lever, Ashby) and API feeds...");

  const greenhouse = new GreenhouseAdapter({ enabled: true });
  const lever = new LeverAdapter({ enabled: true });
  const ashby = new AshbyAdapter({ enabled: true });
  const arbeitnow = new ArbeitnowAdapter({ enabled: true });
  const remotive = new RemotiveAdapter({ enabled: true });
  const remoteok = new RemoteOKAdapter({ enabled: true });
  const jobicy = new JobicyAdapter({ enabled: true });
  const himalayas = new HimalayasAdapter({ enabled: true });
  const themuse = new TheMuseAdapter({ enabled: true });
  const jooble = new JoobleAdapter({ enabled: true, apiKey: "cfc868f0-452d-42fc-8b06-6df99d9bc074" });
  const adzuna = new AdzunaAdapter({ enabled: true, appId: "ba1d34a6", appKey: "478146c510d2762286ad442bd9414644" });
  const usajobs = new USAJobsAdapter({ enabled: true, email: process.env.USAJOBS_EMAIL || "api@sponsorajobs.com", apiKey: "tTjBDekl7VpbMyoaAJEDasI3+W44QV7DQ2ZO7lIpplY=" });

  const allRawJobs: any[] = [];

  // 1. Direct Greenhouse ATS
  try {
    console.log("Fetching from Greenhouse ATS (Monzo, Stripe, Figma, Deliveroo, Wise, Canva, Airbnb)...");
    const resGH = await greenhouse.fetchJobs({});
    console.log(`Greenhouse: fetched ${resGH.jobs.length} direct jobs`);
    allRawJobs.push(...resGH.jobs);
  } catch (e) {
    console.error("Greenhouse error:", e);
  }

  // 2. Direct Lever ATS
  try {
    console.log("Fetching from Lever ATS (Revolut, Spotify, Atlassian, Palantir)...");
    const resLever = await lever.fetchJobs({});
    console.log(`Lever: fetched ${resLever.jobs.length} direct jobs`);
    allRawJobs.push(...resLever.jobs);
  } catch (e) {
    console.error("Lever error:", e);
  }

  // 3. Direct Ashby ATS
  try {
    console.log("Fetching from Ashby ATS (Notion, Linear, Ramp, Deel, Retool)...");
    const resAshby = await ashby.fetchJobs({});
    console.log(`Ashby: fetched ${resAshby.jobs.length} direct jobs`);
    allRawJobs.push(...resAshby.jobs);
  } catch (e) {
    console.error("Ashby error:", e);
  }

  // 4. Arbeitnow API
  try {
    console.log("Fetching from Arbeitnow...");
    const resArbeit = await arbeitnow.fetchJobs({});
    console.log(`Arbeitnow: fetched ${resArbeit.jobs.length} jobs`);
    allRawJobs.push(...resArbeit.jobs);
  } catch (e) {
    console.error("Arbeitnow error:", e);
  }

  // 5. Remotive API
  try {
    console.log("Fetching from Remotive...");
    const resRemotive = await remotive.fetchJobs({});
    console.log(`Remotive: fetched ${resRemotive.jobs.length} jobs`);
    allRawJobs.push(...resRemotive.jobs);
  } catch (e) {
    console.error("Remotive error:", e);
  }

  // 5b. RemoteOK API
  try {
    console.log("Fetching from RemoteOK...");
    const resRemoteOK = await remoteok.fetchJobs({});
    console.log(`RemoteOK: fetched ${resRemoteOK.jobs.length} jobs`);
    allRawJobs.push(...resRemoteOK.jobs);
  } catch (e) {
    console.error("RemoteOK error:", e);
  }

  // 5c. Jobicy API
  try {
    console.log("Fetching from Jobicy...");
    const resJobicy = await jobicy.fetchJobs({});
    console.log(`Jobicy: fetched ${resJobicy.jobs.length} jobs`);
    allRawJobs.push(...resJobicy.jobs);
  } catch (e) {
    console.error("Jobicy error:", e);
  }

  // 5d. Himalayas API
  try {
    console.log("Fetching from Himalayas...");
    const resHimalayas = await himalayas.fetchJobs({});
    console.log(`Himalayas: fetched ${resHimalayas.jobs.length} jobs`);
    allRawJobs.push(...resHimalayas.jobs);
  } catch (e) {
    console.error("Himalayas error:", e);
  }

  // 5e. The Muse API
  try {
    console.log("Fetching from The Muse...");
    const resTheMuse = await themuse.fetchJobs({});
    console.log(`The Muse: fetched ${resTheMuse.jobs.length} jobs`);
    allRawJobs.push(...resTheMuse.jobs);
  } catch (e) {
    console.error("The Muse error:", e);
  }

  // 6. Jooble API
  try {
    console.log("Fetching from Jooble...");
    const resJooble = await jooble.fetchJobs({});
    console.log(`Jooble: fetched ${resJooble.jobs.length} jobs`);
    allRawJobs.push(...resJooble.jobs);
  } catch (e) {
    console.error("Jooble error:", e);
  }

  // 7. Adzuna API
  try {
    console.log("Fetching from Adzuna...");
    const resAdzuna = await adzuna.fetchJobs({});
    console.log(`Adzuna: fetched ${resAdzuna.jobs.length} jobs`);
    allRawJobs.push(...resAdzuna.jobs);
  } catch (e) {
    console.error("Adzuna error:", e);
  }

  // 8. USAJobs Federal API
  try {
    console.log("Fetching from USAJobs...");
    const resUSA = await usajobs.fetchJobs({ limit: 30 });
    console.log(`USAJobs: fetched ${resUSA.jobs.length} jobs`);
    allRawJobs.push(...resUSA.jobs);
  } catch (e) {
    console.error("USAJobs error:", e);
  }

  console.log(`Total raw jobs fetched across all sources: ${allRawJobs.length}`);

  // Deduplicate and resolve clean direct ATS application links
  const seenHashes = new Set<string>();
  const processedJobs: any[] = [];
  const processedCompanies = new Map();

  for (let i = 0; i < allRawJobs.length; i++) {
    const raw = allRawJobs[i];
    if (!raw.title || !raw.applyUrl || !raw.companyName) continue;

    // Unroll aggregator URL into direct employer application URL
    const directApplyUrl = resolveDirectApplyUrl({
      applyUrl: raw.applyUrl,
      description: raw.description,
      companyName: raw.companyName,
    });

    const hash = generateCanonicalHash(
      raw.companyName,
      raw.title,
      raw.location || `${raw.city}, ${raw.countryCode}`,
      directApplyUrl
    );

    if (seenHashes.has(hash)) continue;
    seenHashes.add(hash);

    const compId = `comp_${raw.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30)}`;
    if (!processedCompanies.has(compId)) {
      processedCompanies.set(compId, {
        id: compId,
        name: raw.companyName,
        normalized_name: raw.companyName.toLowerCase(),
        country_code: raw.countryCode || "GB",
        industry: "Technology",
        website: raw.companyWebsite || null,
        careers_url: directApplyUrl,
        logo_url: raw.companyLogoUrl || null,
        description: `${raw.companyName} open positions with visa sponsorship support.`,
        sponsorship_signal: "high",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    const classification = classifyJobSponsorship(raw.description, raw.countryCode || "GB");
    const qualityBreakdown = computeQualityScore({
      title: raw.title,
      description: raw.description,
      sponsorshipScore: classification.score,
      salaryMin: raw.salaryMin,
      salaryMax: raw.salaryMax,
      salaryCurrency: raw.salaryCurrency,
      applyUrl: directApplyUrl,
      jobUrl: directApplyUrl,
      city: raw.city,
      region: raw.region,
      countryCode: raw.countryCode || "GB",
      employmentType: raw.employmentType,
      categorySlug: raw.categorySlug,
      companyName: raw.companyName,
      remoteType: raw.remoteType,
      publishedAt: raw.publishedAt,
    });

    const jobId = `job_real_${i + 1}_${Math.random().toString(36).slice(2, 7)}`;
    processedJobs.push({
      id: jobId,
      source_id: raw.sourceId,
      source_job_id: raw.sourceJobId,
      canonical_hash: hash,
      title: raw.title,
      company_id: compId,
      company_name: raw.companyName,
      description: raw.description,
      description_clean: raw.description,
      location: raw.location || `${raw.city ? raw.city + ", " : ""}${raw.countryCode}`,
      city: raw.city || null,
      region: raw.region || null,
      country_code: raw.countryCode || "GB",
      remote_type: raw.remoteType || "REMOTE",
      employment_type: raw.employmentType || "FULL_TIME",
      category_id: `cat_${raw.categorySlug || "tech"}`,
      category_slug: raw.categorySlug || "information-technology",
      category_name: "Information Technology",
      salary_min: raw.salaryMin || null,
      salary_max: raw.salaryMax || null,
      salary_currency: raw.salaryCurrency || (raw.countryCode === "GB" ? "GBP" : "USD"),
      job_url: directApplyUrl,
      apply_url: directApplyUrl, // 100% direct employer URL
      source_url: directApplyUrl,
      publishedAt: raw.publishedAt || new Date().toISOString(),
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      sponsorship_score: classification.score,
      sponsorship_label: classification.label,
      sponsorship_positive_evidence: JSON.stringify(classification.positiveEvidence),
      sponsorship_negative_evidence: JSON.stringify(classification.negativeEvidence),
      visa_keywords: JSON.stringify(classification.keywords),
      quality_score: qualityBreakdown.total,
      status: "active",
      is_featured: i % 8 === 0 ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // Load and merge with existing jobs from previous days
  let existingJobs: any[] = [];
  let existingCompanies: any[] = [];
  try {
    const rawPrev = fs.readFileSync(path.resolve("./lib/db/realJobsData.json"), "utf8");
    const parsedPrev = JSON.parse(rawPrev);
    existingJobs = parsedPrev.jobs || [];
    existingCompanies = parsedPrev.companies || [];
  } catch (e) {
    // If file doesn't exist, start fresh
  }

  // Deduplicate and merge jobs
  const mergedJobsMap = new Map<string, any>();
  existingJobs.forEach((j) => mergedJobsMap.set(j.canonical_hash || j.id, j));
  processedJobs.forEach((j) => mergedJobsMap.set(j.canonical_hash || j.id, j));

  // Deduplicate and merge companies
  const mergedCompaniesMap = new Map<string, any>();
  existingCompanies.forEach((c) => mergedCompaniesMap.set(c.id, c));
  Array.from(processedCompanies.values()).forEach((c) => mergedCompaniesMap.set(c.id, c));

  console.log(`Successfully merged today's harvest with historical listings: ${mergedJobsMap.size} total jobs across ${mergedCompaniesMap.size} companies!`);

  const outData = {
    companies: Array.from(mergedCompaniesMap.values()),
    jobs: Array.from(mergedJobsMap.values()),
  };

  fs.writeFileSync(path.resolve("./lib/db/realJobsData.json"), JSON.stringify(outData, null, 2));
  console.log("Saved cumulative jobs dataset to ./lib/db/realJobsData.json");
}

harvestRealJobs().catch(console.error);
