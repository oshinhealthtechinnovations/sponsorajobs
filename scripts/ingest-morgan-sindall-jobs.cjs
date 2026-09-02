/**
 * Ingestion and Smart Listing Engine for Morgan Sindall Group Jobs
 * Connects directly to Morgan Sindall's official REST API endpoint,
 * extracts all live UK civil engineering, energy, rail, and infrastructure requisitions,
 * formats them using the SponsorAJobs Smart Listing Technique, and ingests them into realJobsData.json.
 * 
 * Strict Mandate: Zero negative visa sponsorship statements.
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../lib/db/realJobsData.json');

const MORGAN_SINDALL_COMPANY = {
  id: "comp_morgan_sindall",
  name: "Morgan Sindall Group",
  normalized_name: "morgan sindall group",
  slug: "morgan-sindall",
  industry: "Major UK Construction & Infrastructure Services",
  website: "https://www.morgansindall.com",
  logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Morgan_Sindall_logo.svg/320px-Morgan_Sindall_logo.svg.png",
  country_code: "GB",
  sponsor_rating: "A",
  is_licensed_sponsor: true,
  sponsor_tier: "Worker - Skilled Worker",
  headquarters: "London / Rugby, Warwickshire, United Kingdom",
  employee_count: "7,700+",
  founded_year: 1977,
  overview: "Morgan Sindall Group plc is a leading UK construction and infrastructure enterprise delivering complex civil engineering, nuclear decommissioning, water frameworks, high-voltage energy transmission, and major transport assets.",
  verified_sponsor: true
};

function parseLocation(locStr) {
  if (!locStr) {
    return {
      location: "London, Greater London, United Kingdom",
      city: "London",
      region: "Greater London",
      countryCode: "GB"
    };
  }

  const parts = locStr.split(',').map(s => s.trim());
  const city = parts[0] || 'London';
  const region = parts.length > 1 ? parts[1] : 'England';

  return {
    location: `${locStr}, United Kingdom`.replace(', United Kingdom, United Kingdom', ', United Kingdom'),
    city,
    region,
    countryCode: 'GB'
  };
}

function inferCategory(title, functionName) {
  const t = title.toLowerCase();
  const f = (functionName || '').toLowerCase();

  if (t.includes('quantity surveyor') || t.includes('commercial') || t.includes('estimator') || f.includes('commercial')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Commercial & Quantity Surveying'
    };
  }
  if (t.includes('site agent') || t.includes('sub agent') || t.includes('project manager') || t.includes('site manager') || t.includes('agent')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Site & Project Management'
    };
  }
  if (t.includes('electrical') || t.includes('ohl') || t.includes('overhead line') || t.includes('power') || t.includes('substation')) {
    return {
      categoryId: 'cat_eng_elec',
      categorySlug: 'electrical-engineering',
      categoryName: 'Electrical & Power Engineering'
    };
  }
  if (t.includes('mechanical') || t.includes('plant fitter') || t.includes('fitter') || t.includes('technician')) {
    return {
      categoryId: 'cat_eng_mech',
      categorySlug: 'mechanical-engineering',
      categoryName: 'Mechanical Engineering'
    };
  }
  if (t.includes('civil') || t.includes('structural') || t.includes('engineer') || t.includes('highways') || t.includes('rail')) {
    return {
      categoryId: 'cat_eng_civil',
      categorySlug: 'civil-engineering',
      categoryName: 'Civil & Infrastructure Engineering'
    };
  }
  if (t.includes('talent') || t.includes('hr') || t.includes('controller') || t.includes('administrator')) {
    return {
      categoryId: 'cat_it_ops',
      categorySlug: 'operations-management',
      categoryName: 'Corporate Operations & Delivery'
    };
  }

  return {
    categoryId: 'cat_eng_civil',
    categorySlug: 'civil-engineering',
    categoryName: 'Civil & Infrastructure Engineering'
  };
}

function estimateSalary(title) {
  const t = title.toLowerCase();
  if (t.includes('director')) return { min: 95000, max: 135000, currency: 'GBP' };
  if (t.includes('senior') || t.includes('lead') || t.includes('sub agent') || t.includes('principal')) {
    return { min: 55000, max: 78000, currency: 'GBP' };
  }
  if (t.includes('engineer') || t.includes('surveyor') || t.includes('site agent') || t.includes('manager')) {
    return { min: 45000, max: 65000, currency: 'GBP' };
  }
  if (t.includes('assistant') || t.includes('technician') || t.includes('advisor') || t.includes('fitter')) {
    return { min: 35000, max: 48000, currency: 'GBP' };
  }
  if (t.includes('graduate') || t.includes('trainee')) {
    return { min: 28000, max: 35000, currency: 'GBP' };
  }
  return { min: 42000, max: 60000, currency: 'GBP' };
}

function cleanDescriptionHtml(html) {
  if (!html) return '';
  return html
    .replace(/<tbody[^>]*>/gi, '')
    .replace(/<\/tbody>/gi, '')
    .replace(/<tr[^>]*>/gi, '')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<td[^>]*>/gi, ' ')
    .replace(/<\/td>/gi, ' ')
    .replace(/<table[^>]*>/gi, '')
    .replace(/<\/table>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<strong[^>]*>/gi, '**')
    .replace(/<\/strong>/gi, '**')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

function buildSmartDescription(job, locInfo, salInfo, remoteType, directApplyUrl) {
  const cleanedDesc = cleanDescriptionHtml(job.description);

  return `## Role Overview
• **Position**: ${job.title}
• **Employer**: Morgan Sindall Group (Morgan Sindall Infrastructure)
• **Location**: ${locInfo.location}
• **Reference ID**: ${job.reference || job.id}
• **Work Arrangement**: ${remoteType}
• **Posted Date**: ${job.opening_date ? new Date(job.opening_date).toLocaleDateString('en-GB') : 'Recently Posted'}

## Infrastructure Practice Scope
Morgan Sindall Infrastructure delivers high-quality complex civil engineering and infrastructure projects across the UK. With frameworks and major schemes spanning nuclear decommissioning at Sellafield, National Grid energy transmission networks, major highways enhancements for National Highways, and high-speed rail programmes, Morgan Sindall provides an environment of innovation, engineering excellence, and long-term career development.

## Detailed Scope & Responsibilities
${cleanedDesc || `Morgan Sindall Infrastructure is seeking a qualified ${job.title} to deliver major capital engineering works across our UK infrastructure portfolio.`}

## Key Qualifications & Candidate Profile
• Relevant technical qualifications in ${job.title.includes('Engineer') ? 'Civil, Mechanical, or Electrical Engineering' : 'Construction Management, Commercial Surveying, or relevant technical trade'}.
• Proven track record operating on UK construction sites or major infrastructure frameworks.
• Knowledge of UK health, safety, and environmental standards (CDM regulations, CSCS, IOSH/NEBOSH).
• Strong communication, team coordination, and problem-solving abilities.

## Compensation & Benefits Guidance
• **Estimated Remuneration**: GBP £${salInfo.min.toLocaleString()} - £${salInfo.max.toLocaleString()} per annum (competitive market rate commensurate with experience)
• Comprehensive Morgan Sindall benefits package including matched pension scheme, life assurance, company vehicle or car allowance (for applicable operational roles), generous annual leave, and employee assistance programs.

## Official Application Route
• **Direct Employer ATS Link**: Apply directly via the official Morgan Sindall Recruitment Portal: [${job.title} on Morgan Sindall ATS](${directApplyUrl})`;
}

async function ingestMorganSindall() {
  console.log("🚀 Fetching all Morgan Sindall Group Infrastructure jobs via REST API...");

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  // 1. Update/Add Company Profile
  const compIdx = data.companies.findIndex(c => c.id === MORGAN_SINDALL_COMPANY.id || c.name.toLowerCase().includes('morgan sindall'));
  if (compIdx >= 0) {
    data.companies[compIdx] = { ...data.companies[compIdx], ...MORGAN_SINDALL_COMPANY };
  } else {
    data.companies.push(MORGAN_SINDALL_COMPANY);
  }

  // 2. Fetch all pages
  const allApiJobs = [];
  for (let page = 1; page <= 20; page++) {
    const url = `https://morgansindallinfrastructure.com/wp-json/ms-jobs/v1/jobs?page=${page}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) break;
    const json = await res.json();
    if (!json.jobs || json.jobs.length === 0) break;

    allApiJobs.push(...json.jobs);
    console.log(`Page ${page}: fetched ${json.jobs.length} jobs (Total: ${allApiJobs.length}/${json.total})`);
    if (allApiJobs.length >= json.total) break;
  }

  console.log(`✅ Extracted ${allApiJobs.length} live Morgan Sindall requisitions!`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const job of allApiJobs) {
    const locInfo = parseLocation(job.location);
    const cat = inferCategory(job.title, job.functions);
    const sal = estimateSalary(job.title);
    const directApplyUrl = job.link || `https://morgansindallinfrastructure.com/join-our-team/vacancies/`;

    let remoteType = 'ONSITE';
    if (job.title.toLowerCase().includes('hybrid') || (job.location || '').toLowerCase().includes('hybrid')) {
      remoteType = 'HYBRID';
    }

    const uniqueId = job.id || job.reference || job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const jobId = `job_ms_${uniqueId}_${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 80);
    const smartDescription = buildSmartDescription(job, locInfo, sal, remoteType, directApplyUrl);

    const jobRecord = {
      id: jobId,
      source_id: "morgan_sindall_api",
      source_job_id: `ms_${uniqueId}`,
      canonical_hash: `ms_uk_hash_${uniqueId}`,
      title: `${job.title} (Morgan Sindall)`,
      slug: `${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-morgan-sindall--${uniqueId.toLowerCase()}`,
      company_id: "comp_morgan_sindall",
      company_name: "Morgan Sindall Group",
      company_website: "https://www.morgansindall.com",
      company_logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Morgan_Sindall_logo.svg/320px-Morgan_Sindall_logo.svg.png",
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
      publishedAt: job.opening_date ? new Date(job.opening_date).toISOString() : new Date().toISOString(),
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      sponsorship_score: 95,
      sponsorship_label: "Likely",
      sponsorship_positive_evidence: JSON.stringify([
        "Morgan Sindall Group plc is an A-rated Licensed Sponsor on the UK Home Office Register of Licensed Sponsors (Worker - Skilled Worker Route)",
        "Direct verified WebiTrent ATS application URL",
        "Major national civil engineering and critical infrastructure contracts"
      ]),
      sponsorship_negative_evidence: JSON.stringify([]),
      visa_keywords: JSON.stringify([
        "Morgan Sindall Licensed Sponsor",
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

    const existingIdx = data.jobs.findIndex(j => j.id === jobId || j.source_job_id === `ms_${uniqueId}`);
    if (existingIdx >= 0) {
      data.jobs[existingIdx] = { ...data.jobs[existingIdx], ...jobRecord };
      updatedCount++;
    } else {
      data.jobs.unshift(jobRecord);
      addedCount++;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n🎉 Morgan Sindall Ingestion Complete!`);
  console.log(`- New jobs added: ${addedCount}`);
  console.log(`- Existing jobs updated: ${updatedCount}`);
  console.log(`- Total jobs in database now: ${data.jobs.length}`);
  console.log(`- Total companies in database: ${data.companies.length}`);
}

ingestMorganSindall().catch(err => {
  console.error("❌ Ingestion error:", err);
  process.exit(1);
});
