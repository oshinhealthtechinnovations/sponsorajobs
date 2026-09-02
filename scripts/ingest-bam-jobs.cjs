/**
 * Ingestion and Smart Listing Engine for BAM UK (BAM Nuttall & BAM Construct UK) Jobs
 * Connects directly to BAM's official Phenom People Careers Portal ATS,
 * crawls all active UK civil engineering, rail, marine, and construction vacancies,
 * formats them using the SponsorAJobs Smart Listing Technique, and ingests them into realJobsData.json.
 * 
 * Strict Mandate: Zero negative visa sponsorship statements.
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../lib/db/realJobsData.json');

const BAM_COMPANY = {
  id: "comp_bam_uk",
  name: "BAM UK",
  normalized_name: "bam uk",
  slug: "bam-uk",
  industry: "Major Civil Engineering, Marine, Rail & Construction",
  website: "https://www.bam.co.uk",
  logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Royal_BAM_Group_logo.svg/320px-Royal_BAM_Group_logo.svg.png",
  country_code: "GB",
  sponsor_rating: "A",
  is_licensed_sponsor: true,
  sponsor_tier: "Worker - Skilled Worker",
  headquarters: "Camberley, Surrey, United Kingdom",
  employee_count: "4,500+",
  founded_year: 1865,
  overview: "BAM UK (incorporating BAM Nuttall and BAM Construct UK) is one of the UK's leading civil engineering and building enterprises. Delivering transformative infrastructure across marine, rail, tunnelling, highways, water, and social infrastructure schemes, BAM is renowned for engineering excellence and sustainable delivery.",
  verified_sponsor: true
};

function parseLocation(cityStr, multiLoc) {
  const raw = cityStr || (Array.isArray(multiLoc) && multiLoc[0]) || "London, United Kingdom";
  const clean = raw.replace(', GBR', '').replace(', UK', '').trim();

  const parts = clean.split(',').map(s => s.trim());
  const city = parts[0] || 'London';
  const region = parts.length > 1 ? parts[1] : 'England';

  return {
    location: `${clean}, United Kingdom`.replace(', United Kingdom, United Kingdom', ', United Kingdom'),
    city,
    region,
    countryCode: 'GB'
  };
}

function inferCategory(title, multiCategory) {
  const t = title.toLowerCase();
  const c = (Array.isArray(multiCategory) ? multiCategory.join(' ') : '').toLowerCase();

  if (t.includes('quantity surveyor') || t.includes('commercial') || t.includes('estimator') || c.includes('commercial')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Commercial & Quantity Surveying'
    };
  }
  if (t.includes('project manager') || t.includes('site agent') || t.includes('sub agent') || t.includes('director') || t.includes('agent')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Site Delivery & Management'
    };
  }
  if (t.includes('electrical') || t.includes('mep') || t.includes('services')) {
    return {
      categoryId: 'cat_eng_elec',
      categorySlug: 'electrical-engineering',
      categoryName: 'Electrical Engineering'
    };
  }
  if (t.includes('mechanical') || t.includes('plant') || t.includes('fitter')) {
    return {
      categoryId: 'cat_eng_mech',
      categorySlug: 'mechanical-engineering',
      categoryName: 'Mechanical Engineering'
    };
  }
  if (t.includes('design') || t.includes('bim') || t.includes('cad') || t.includes('planner')) {
    return {
      categoryId: 'cat_it_ops',
      categorySlug: 'operations-management',
      categoryName: 'Design Management & BIM'
    };
  }

  return {
    categoryId: 'cat_eng_civil',
    categorySlug: 'civil-engineering',
    categoryName: 'Civil & Structural Engineering'
  };
}

function estimateSalary(title) {
  const t = title.toLowerCase();
  if (t.includes('director')) return { min: 96000, max: 138000, currency: 'GBP' };
  if (t.includes('senior') || t.includes('lead') || t.includes('sub agent') || t.includes('principal')) {
    return { min: 56000, max: 80000, currency: 'GBP' };
  }
  if (t.includes('engineer') || t.includes('manager') || t.includes('surveyor') || t.includes('agent')) {
    return { min: 45000, max: 64000, currency: 'GBP' };
  }
  if (t.includes('assistant') || t.includes('technician') || t.includes('supervisor')) {
    return { min: 34000, max: 46000, currency: 'GBP' };
  }
  if (t.includes('graduate') || t.includes('trainee') || t.includes('apprentice')) {
    return { min: 28000, max: 35000, currency: 'GBP' };
  }
  return { min: 43000, max: 61000, currency: 'GBP' };
}

function buildSmartDescription(job, locInfo, salInfo, remoteType, directApplyUrl) {
  const teaser = job.descriptionTeaser || `BAM UK is actively recruiting for a professional ${job.title} to deliver major infrastructure packages.`;
  const skillsList = Array.isArray(job.ml_skills) && job.ml_skills.length > 0
    ? job.ml_skills.slice(0, 8).map(s => `• ${s.charAt(0).toUpperCase() + s.slice(1)}`).join('\n')
    : '• Civil engineering delivery\n• Contract administration (NEC4)\n• Safety and CDM compliance\n• Site leadership';

  return `## Role Overview
• **Position**: ${job.title}
• **Employer**: BAM UK (BAM Nuttall / BAM Construct UK)
• **Location**: ${locInfo.location}
• **Requisition Ref**: ${job.reqId || job.jobSeqNo}
• **Division**: ${job.companyName || 'BAM UK Infrastructure'}
• **Employment Type**: ${job.type || 'Permanent'}
• **Work Arrangement**: ${remoteType}

## Major Infrastructure Practice Scope
${teaser}

BAM UK is at the forefront of the UK civil engineering and construction industry. Operating across major national frameworks, BAM delivers complex civil engineering in marine, rail, highways, energy transition, and modern commercial building sectors. With a proud history dating back over 150 years, BAM blends cutting-edge digital construction with sustainable engineering to deliver lasting community value.

## Core Responsibilities & Impact
• Deliver high-value civil engineering or building packages, ensuring alignment with project drawings, engineering specifications, and safety guidelines.
• Manage subcontractor performance, materials procurement, plant deployment, and day-to-day site operations.
• Uphold rigorous safety leadership in line with CDM regulations and BAM's BeyondZero safety culture.
• Interface effectively with client representatives, design consultants, and multidisciplinary delivery teams.

## Key Competencies & Technical Skills
${skillsList}

## Qualifications & Required Experience
• Degree or HND in Civil Engineering, Structural Engineering, Quantity Surveying, Construction Management, or equivalent practical trade experience.
• Solid background delivering civil engineering, transport, marine, or building schemes within the UK.
• Relevant site certifications (CSCS, SMSTS, or relevant chartered body membership such as ICE/CIOB/RICS).
• Strong collaborative leadership and communication skills.

## Compensation & Benefits Guidance
• **Estimated Remuneration**: GBP £${salInfo.min.toLocaleString()} - £${salInfo.max.toLocaleString()} per annum (competitive market rate commensurate with experience)
• Comprehensive BAM employee benefits including company pension contribution, life assurance, health cash plan, company car or allowance (for qualifying roles), 26 days annual leave, and structured professional development support.

## Official Application Route
• **Direct Employer ATS Link**: Apply directly via BAM UK's official Phenom People careers portal: [${job.title} on BAM UK Careers](${directApplyUrl})`;
}

async function ingestBAM() {
  console.log("🚀 Connecting to BAM UK (BAM Nuttall) Official Careers Portal ATS...");

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  // 1. Update/Add Company Profile
  const compIdx = data.companies.findIndex(c => c.id === BAM_COMPANY.id || c.name.toLowerCase().includes('bam'));
  if (compIdx >= 0) {
    data.companies[compIdx] = { ...data.companies[compIdx], ...BAM_COMPANY };
  } else {
    data.companies.push(BAM_COMPANY);
  }

  // 2. Crawl all pages
  const allParsedJobs = [];
  for (let from = 0; from <= 200; from += 10) {
    const url = `https://www.bamcareers.com/uk/en/search-results?from=${from}&s=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) break;
    const html = await res.text();

    const idx = html.indexOf('"eagerLoadRefineSearch"');
    if (idx === -1) break;

    const jobsMatch = html.indexOf('"jobs":[', idx);
    if (jobsMatch === -1) break;

    const startBracket = jobsMatch + 7;
    let depth = 0;
    let endIdx = -1;

    for (let i = startBracket; i < html.length; i++) {
      if (html[i] === '[') {
        depth++;
      } else if (html[i] === ']') {
        depth--;
        if (depth === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }

    if (endIdx === -1) break;
    const jobsJson = html.slice(startBracket, endIdx);
    const jobs = JSON.parse(jobsJson);
    if (jobs.length === 0) break;

    allParsedJobs.push(...jobs);
    console.log(`From ${from}: extracted ${jobs.length} jobs (Total: ${allParsedJobs.length})`);
    if (allParsedJobs.length >= 190) break;
  }

  console.log(`✅ Extracted ${allParsedJobs.length} live BAM UK requisitions!`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const job of allParsedJobs) {
    const locInfo = parseLocation(job.city, job.multi_location);
    const cat = inferCategory(job.title, job.multi_category);
    const sal = estimateSalary(job.title);

    let remoteType = 'ONSITE';
    if (job.title.toLowerCase().includes('hybrid') || (job.city || '').toLowerCase().includes('hybrid')) {
      remoteType = 'HYBRID';
    }

    const uniqueId = job.jobSeqNo || job.reqId || job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const directApplyUrl = `https://www.bamcareers.com/uk/en/job/${job.jobSeqNo || job.reqId}`;
    const jobId = `job_bam_${job.reqId || uniqueId}_${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 80);
    const smartDescription = buildSmartDescription(job, locInfo, sal, remoteType, directApplyUrl);

    const jobRecord = {
      id: jobId,
      source_id: "bam_phenom_ats",
      source_job_id: `bam_${job.reqId || uniqueId}`,
      canonical_hash: `bam_uk_hash_${job.reqId || uniqueId}`,
      title: `${job.title} (BAM UK)`,
      slug: `${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-bam-uk--${(job.reqId || uniqueId).toLowerCase()}`,
      company_id: "comp_bam_uk",
      company_name: "BAM UK",
      company_website: "https://www.bam.co.uk",
      company_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Royal_BAM_Group_logo.svg/320px-Royal_BAM_Group_logo.svg.png",
      description: smartDescription,
      description_clean: smartDescription,
      location: locInfo.location,
      city: locInfo.city,
      region: locInfo.region,
      country_code: "GB",
      remote_type: remoteType,
      employment_type: "FULL_TIME",
      category_id: cat.categoryId,
      category_slug: cat.categorySlug,
      category_name: cat.categoryName,
      salary_min: sal.min,
      salary_max: sal.max,
      salary_currency: "GBP",
      job_url: directApplyUrl,
      apply_url: directApplyUrl,
      source_url: directApplyUrl,
      publishedAt: job.postedDate ? new Date(job.postedDate).toISOString() : new Date().toISOString(),
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      sponsorship_score: 95,
      sponsorship_label: "Likely",
      sponsorship_positive_evidence: JSON.stringify([
        "BAM Nuttall Ltd is an officially registered A-rated Licensed Sponsor on the UK Home Office Register of Licensed Sponsors (Worker - Skilled Worker Route)",
        "Direct verified BAM UK official Phenom People ATS application URL",
        "Major national infrastructure programs in civil engineering, rail, marine, and highways"
      ]),
      sponsorship_negative_evidence: JSON.stringify([]),
      visa_keywords: JSON.stringify([
        "BAM Nuttall Licensed Sponsor",
        "Skilled Worker Route",
        "Direct Employer ATS",
        "Tier 1 Contractor",
        "UK Infrastructure"
      ]),
      quality_score: 98,
      status: "active",
      is_featured: (job.title.includes('Senior') || job.title.includes('Lead') || job.title.includes('Agent') || job.title.includes('Director')) ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const existingIdx = data.jobs.findIndex(j => j.id === jobId || j.source_job_id === `bam_${job.reqId || uniqueId}`);
    if (existingIdx >= 0) {
      data.jobs[existingIdx] = { ...data.jobs[existingIdx], ...jobRecord };
      updatedCount++;
    } else {
      data.jobs.unshift(jobRecord);
      addedCount++;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n🎉 BAM UK Ingestion Complete!`);
  console.log(`- New jobs added: ${addedCount}`);
  console.log(`- Existing jobs updated: ${updatedCount}`);
  console.log(`- Total jobs in database now: ${data.jobs.length}`);
  console.log(`- Total companies in database: ${data.companies.length}`);
}

ingestBAM().catch(err => {
  console.error("❌ Ingestion error:", err);
  process.exit(1);
});
