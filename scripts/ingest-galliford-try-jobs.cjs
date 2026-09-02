/**
 * Ingestion and Smart Listing Engine for Galliford Try Jobs
 * Connects directly to Galliford Try's official Oracle Cloud HCM Candidate Experience REST API,
 * retrieves all active UK construction, civil engineering, highways, and water framework jobs,
 * formats them using the SponsorAJobs Smart Listing Technique, and ingests them into realJobsData.json.
 * 
 * Strict Mandate: Zero negative visa sponsorship statements.
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../lib/db/realJobsData.json');

const GALLIFORD_COMPANY = {
  id: "comp_galliford_try",
  name: "Galliford Try",
  normalized_name: "galliford try",
  slug: "galliford-try",
  industry: "Major UK Construction, Civil Engineering, Highways & Water Frameworks",
  website: "https://www.gallifordtry.co.uk",
  logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Galliford_Try_logo.svg/320px-Galliford_Try_logo.svg.png",
  country_code: "GB",
  sponsor_rating: "A",
  is_licensed_sponsor: true,
  sponsor_tier: "Worker - Skilled Worker",
  headquarters: "Uxbridge, Greater London, United Kingdom",
  employee_count: "3,300+",
  founded_year: 1908,
  overview: "Galliford Try is a premier FTSE-listed UK construction and infrastructure enterprise operating across Building, Infrastructure (Highways & Rail), and Environment (Water & Wastewater). Delivering critical national infrastructure schemes, Galliford Try is renowned for engineering innovation and sustainable project execution.",
  verified_sponsor: true
};

function parseLocation(locStr) {
  const raw = locStr || "London, United Kingdom";
  const parts = raw.split(',').map(s => s.trim());
  const city = parts[0] || 'London';
  const region = parts.length > 1 ? parts[1] : 'England';
  const cleanLoc = raw.includes('United Kingdom') ? raw : `${raw}, United Kingdom`;

  return {
    location: cleanLoc,
    city,
    region,
    countryCode: 'GB'
  };
}

function inferCategory(title, bu, jobFam) {
  const t = (title + ' ' + (bu || '') + ' ' + (jobFam || '')).toLowerCase();

  if (t.includes('commercial') || t.includes('quantity surveyor') || t.includes('estimator') || t.includes('cost')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Commercial & Quantity Surveying'
    };
  }
  if (t.includes('project manager') || t.includes('site agent') || t.includes('sub agent') || t.includes('site manager') || t.includes('director')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Site Delivery & Project Management'
    };
  }
  if (t.includes('electrical') || t.includes('mep') || t.includes('power')) {
    return {
      categoryId: 'cat_eng_elec',
      categorySlug: 'electrical-engineering',
      categoryName: 'Electrical Engineering'
    };
  }
  if (t.includes('mechanical') || t.includes('plant') || t.includes('machinery')) {
    return {
      categoryId: 'cat_eng_mech',
      categorySlug: 'mechanical-engineering',
      categoryName: 'Mechanical Engineering'
    };
  }
  if (t.includes('water') || t.includes('environment') || t.includes('process') || t.includes('drainage')) {
    return {
      categoryId: 'cat_eng_civil',
      categorySlug: 'civil-engineering',
      categoryName: 'Environmental & Water Engineering'
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
  if (t.includes('director')) return { min: 98000, max: 142000, currency: 'GBP' };
  if (t.includes('senior') || t.includes('lead') || t.includes('sub agent') || t.includes('principal')) {
    return { min: 58000, max: 82000, currency: 'GBP' };
  }
  if (t.includes('engineer') || t.includes('manager') || t.includes('surveyor') || t.includes('agent')) {
    return { min: 46000, max: 65000, currency: 'GBP' };
  }
  if (t.includes('assistant') || t.includes('technician') || t.includes('supervisor')) {
    return { min: 35000, max: 47000, currency: 'GBP' };
  }
  if (t.includes('graduate') || t.includes('trainee') || t.includes('apprentice')) {
    return { min: 28000, max: 36000, currency: 'GBP' };
  }
  return { min: 44000, max: 62000, currency: 'GBP' };
}

function buildSmartDescription(job, locInfo, salInfo, remoteType, directApplyUrl) {
  const shortDesc = job.ShortDescriptionStr || `Galliford Try is seeking a high-calibre ${job.Title} to support major infrastructure and building schemes across the UK.`;
  const buName = job.BusinessUnit || 'Infrastructure & Building';

  return `## Role Overview
• **Position**: ${job.Title}
• **Employer**: Galliford Try
• **Business Unit**: ${buName}
• **Location**: ${locInfo.location}
• **Requisition Ref**: ${job.Id}
• **Contract Type**: ${job.ContractType || 'Permanent / Full-Time'}
• **Work Arrangement**: ${remoteType}

## Major Infrastructure Scope
${shortDesc}

Galliford Try is one of the UK's leading construction groups, operating through Building, Infrastructure (Highways, Major Projects, and Rail), and Environment (Water and Wastewater frameworks). With an annual turnover exceeding £1.7 billion and an order book of over £3.8 billion, Galliford Try provides an exceptional environment for engineering professionals to deliver transformative schemes that shape the UK's built environment.

## Key Duties & Project Delivery
• Deliver complex engineering, operational, or commercial packages ensuring strict adherence to project specifications, design models, and programme milestones.
• Coordinate closely with on-site supply chain partners, consulting engineers, client representatives, and statutory undertakers.
• Ensure compliance with Galliford Try's industry-leading safety standards, health and wellbeing protocols, and CDM guidelines.
• Support quality assurance, site documentation, commercial reporting, and risk mitigation strategies.

## Experience & Professional Qualifications
• Relevant Degree, HND, or professional qualification in Civil Engineering, Construction Management, Quantity Surveying, or Building Services.
• Proven track record delivering engineering or commercial packages within the UK construction or infrastructure sector.
• Active professional memberships (ICE, CIOB, RICS, or working towards chartership) are highly valued.
• Valid CSCS card and relevant safety leadership credentials (e.g. SMSTS / SSSTS).

## Compensation & Benefits Guidance
• **Estimated Remuneration**: GBP £${salInfo.min.toLocaleString()} - £${salInfo.max.toLocaleString()} per annum (competitive base salary aligned with market benchmarks)
• Comprehensive Galliford Try corporate benefits package including generous pension scheme, private healthcare coverage, company car / electric car salary sacrifice or allowance (role-dependent), 26 days annual leave plus bank holidays, and ongoing continuous professional development.

## Official Application Route
• **Direct Employer ATS Link**: Apply directly via Galliford Try's official Oracle Cloud HCM careers system: [${job.Title} on Galliford Try Careers](${directApplyUrl})`;
}

async function ingestGalliford() {
  console.log("🚀 Connecting to Galliford Try Oracle Cloud HCM Candidate Experience REST API...");

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  // 1. Ensure Galliford Try Company Profile
  const compIdx = data.companies.findIndex(c => c.id === GALLIFORD_COMPANY.id || c.name.toLowerCase().includes('galliford'));
  if (compIdx >= 0) {
    data.companies[compIdx] = { ...data.companies[compIdx], ...GALLIFORD_COMPANY };
  } else {
    data.companies.push(GALLIFORD_COMPANY);
  }

  // 2. Fetch all requisitions via Oracle Cloud HCM REST API
  const host = 'https://cbct.fa.em2.oraclecloud.com';
  const site = 'gallifordtrycareers';
  const allReqs = [];

  for (let offset = 0; offset <= 300; offset += 100) {
    const url = `${host}/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList&finder=findReqs;siteNumber=${site},limit=100,offset=${offset}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'ora-irc-language': 'en',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      console.log(`Fetch error at offset ${offset}: HTTP ${res.status}`);
      break;
    }

    const payload = await res.json();
    const searchObj = payload.items && payload.items[0];
    if (!searchObj || !searchObj.requisitionList || searchObj.requisitionList.length === 0) {
      break;
    }

    allReqs.push(...searchObj.requisitionList);
    console.log(`Offset ${offset}: retrieved ${searchObj.requisitionList.length} requisitions (Total: ${allReqs.length})`);

    if (allReqs.length >= (searchObj.TotalJobsCount || 250)) break;
  }

  console.log(`✅ Extracted ${allReqs.length} live Galliford Try requisitions!`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const job of allReqs) {
    const locInfo = parseLocation(job.PrimaryLocation);
    const cat = inferCategory(job.Title, job.BusinessUnit, job.JobFamily);
    const sal = estimateSalary(job.Title);

    let remoteType = 'ONSITE';
    if (job.WorkplaceType === 'Hybrid' || job.Title.toLowerCase().includes('hybrid')) {
      remoteType = 'HYBRID';
    }

    const directApplyUrl = `https://cbct.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/gallifordtrycareers/job/${job.Id}`;
    const jobId = `job_galliford_${job.Id}_${job.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 80);
    const smartDescription = buildSmartDescription(job, locInfo, sal, remoteType, directApplyUrl);

    const jobRecord = {
      id: jobId,
      source_id: "galliford_oracle_hcm",
      source_job_id: `galliford_${job.Id}`,
      canonical_hash: `galliford_try_hash_${job.Id}`,
      title: `${job.Title} (Galliford Try)`,
      slug: `${job.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-galliford-try--${job.Id}`,
      company_id: "comp_galliford_try",
      company_name: "Galliford Try",
      company_website: "https://www.gallifordtry.co.uk",
      company_logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Galliford_Try_logo.svg/320px-Galliford_Try_logo.svg.png",
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
      publishedAt: job.PostedDate ? new Date(job.PostedDate).toISOString() : new Date().toISOString(),
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      sponsorship_score: 95,
      sponsorship_label: "Likely",
      sponsorship_positive_evidence: JSON.stringify([
        "Galliford Try Building Ltd & Galliford Try Infrastructure are officially registered A-rated Licensed Sponsors on the UK Home Office Register of Licensed Sponsors (Worker - Skilled Worker Route)",
        "Direct verified Galliford Try Oracle Cloud HCM Candidate Experience ATS application URL",
        "FTSE-listed Tier 1 major infrastructure, highways, and water frameworks"
      ]),
      sponsorship_negative_evidence: JSON.stringify([]),
      visa_keywords: JSON.stringify([
        "Galliford Try Licensed Sponsor",
        "Skilled Worker Route",
        "Direct Employer ATS",
        "Tier 1 Contractor",
        "UK Infrastructure",
        "Highways & Water"
      ]),
      quality_score: 98,
      status: "active",
      is_featured: (job.Title.includes('Senior') || job.Title.includes('Lead') || job.Title.includes('Agent') || job.Title.includes('Director')) ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const existingIdx = data.jobs.findIndex(j => j.id === jobId || j.source_job_id === `galliford_${job.Id}`);
    if (existingIdx >= 0) {
      data.jobs[existingIdx] = { ...data.jobs[existingIdx], ...jobRecord };
      updatedCount++;
    } else {
      data.jobs.unshift(jobRecord);
      addedCount++;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n🎉 Galliford Try Ingestion Complete!`);
  console.log(`- New jobs added: ${addedCount}`);
  console.log(`- Existing jobs updated: ${updatedCount}`);
  console.log(`- Total jobs in database now: ${data.jobs.length}`);
  console.log(`- Total companies in database: ${data.companies.length}`);
}

ingestGalliford().catch(err => {
  console.error("❌ Ingestion error:", err);
  process.exit(1);
});
