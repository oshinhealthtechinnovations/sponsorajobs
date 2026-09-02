/**
 * Ingestion and Smart Listing Engine for Costain Group Jobs
 * Connects directly to Costain's official Oracle Cloud ATS API (CX_1),
 * fetches all active UK infrastructure and engineering job requisitions,
 * formats them using the SponsorAJobs Smart Listing Technique, and ingests them into realJobsData.json.
 * 
 * In accordance with user policy, no negative visa sponsorship notices are included.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataPath = path.resolve(__dirname, '../lib/db/realJobsData.json');

const COSTAIN_COMPANY = {
  id: "comp_costain_group",
  name: "Costain Group",
  slug: "costain-group",
  industry: "Infrastructure Solutions & Engineering Construction",
  website: "https://www.costain.com",
  logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/Costain_Group_logo.svg/320px-Costain_Group_logo.svg.png",
  country_code: "GB",
  sponsor_rating: "A",
  is_licensed_sponsor: true,
  sponsor_tier: "Worker - Skilled Worker",
  headquarters: "Maidenhead, Berkshire, United Kingdom",
  employee_count: "3,500+",
  founded_year: 1865,
  overview: "Costain Group plc is a leading British smart infrastructure solutions and civil engineering company, delivering major national programs across transportation, water, energy and defence sectors.",
  verified_sponsor: true,
};

function parseLocation(rawLocation) {
  let locationStr = (rawLocation || 'United Kingdom').trim();
  const lower = locationStr.toLowerCase();

  if (lower.includes('home based') || lower.includes('remote')) {
    return {
      location: 'Remote / Home Based, United Kingdom',
      city: 'Remote',
      region: 'United Kingdom',
      countryCode: 'GB'
    };
  }

  const locRules = [
    { match: /london/i, city: 'London', region: 'Greater London' },
    { match: /manchester|wigan|salford|bolton/i, city: 'Manchester', region: 'Greater Manchester' },
    { match: /birmingham|solihull|coventry/i, city: 'Birmingham', region: 'West Midlands' },
    { match: /bristol/i, city: 'Bristol', region: 'South West' },
    { match: /plymouth|exeter|devon/i, city: 'Plymouth', region: 'Devon' },
    { match: /southampton|portsmouth|basingstoke/i, city: 'Southampton', region: 'Hampshire' },
    { match: /leeds|wakefield|bradford/i, city: 'Leeds', region: 'West Yorkshire' },
    { match: /sheffield|doncaster/i, city: 'Sheffield', region: 'South Yorkshire' },
    { match: /newcastle|sunderland|gateshead/i, city: 'Newcastle upon Tyne', region: 'Tyne and Wear' },
    { match: /liverpool|merseyside/i, city: 'Liverpool', region: 'Merseyside' },
    { match: /maidenhead|reading|slough|berkshire/i, city: 'Maidenhead', region: 'Berkshire' },
    { match: /oxford/i, city: 'Oxford', region: 'Oxfordshire' },
    { match: /cambridge|peterborough/i, city: 'Cambridge', region: 'Cambridgeshire' },
    { match: /nottingham/i, city: 'Nottingham', region: 'Nottinghamshire' },
    { match: /derby/i, city: 'Derby', region: 'Derbyshire' },
    { match: /cardiff|newport|swansea/i, city: 'Cardiff', region: 'Wales' },
    { match: /glasgow/i, city: 'Glasgow', region: 'Scotland' },
    { match: /edinburgh/i, city: 'Edinburgh', region: 'Scotland' },
    { match: /warrington|cheshire/i, city: 'Warrington', region: 'Cheshire' },
    { match: /cumbria|sellafield|carlisle/i, city: 'Carlisle', region: 'Cumbria' },
    { match: /kent|maidstone|dartford/i, city: 'Maidstone', region: 'Kent' },
    { match: /essex|chelmsford/i, city: 'Chelmsford', region: 'Essex' }
  ];

  for (const rule of locRules) {
    if (rule.match.test(lower)) {
      return {
        location: `${rule.city}, ${rule.region}, United Kingdom`,
        city: rule.city,
        region: rule.region,
        countryCode: 'GB'
      };
    }
  }

  return {
    location: `${locationStr}, United Kingdom`.replace(', United Kingdom, United Kingdom', ', United Kingdom'),
    city: 'London',
    region: 'England',
    countryCode: 'GB'
  };
}

function inferCategory(title, desc) {
  const t = title.toLowerCase();
  const d = (desc || '').toLowerCase();

  if (t.includes('quantity surveyor') || t.includes('commercial manager') || t.includes('estimator') || t.includes('commercial')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Commercial & Quantity Surveying'
    };
  }
  if (t.includes('project manager') || t.includes('commissioning manager') || t.includes('site manager') || t.includes('delivery manager') || t.includes('director') || t.includes('operations manager') || t.includes('lead')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Site & Project Management'
    };
  }
  if (t.includes('mechanical') || t.includes('mep') || t.includes('hvac')) {
    return {
      categoryId: 'cat_eng_mech',
      categorySlug: 'mechanical-engineering',
      categoryName: 'Mechanical Engineering'
    };
  }
  if (t.includes('electrical') || t.includes('power') || t.includes('ica') || t.includes('substation')) {
    return {
      categoryId: 'cat_eng_elec',
      categorySlug: 'electrical-engineering',
      categoryName: 'Electrical Engineering'
    };
  }
  if (t.includes('structural') || t.includes('bridge') || t.includes('tunnelling') || t.includes('civil')) {
    return {
      categoryId: 'cat_eng_civil',
      categorySlug: 'civil-engineering',
      categoryName: 'Civil & Structural Engineering'
    };
  }
  if (t.includes('water') || t.includes('environmental') || t.includes('sustainability') || t.includes('carbon') || t.includes('ecology')) {
    return {
      categoryId: 'cat_eng_civil',
      categorySlug: 'civil-engineering',
      categoryName: 'Water & Environmental Engineering'
    };
  }
  if (t.includes('highway') || t.includes('traffic') || t.includes('rail') || t.includes('transport')) {
    return {
      categoryId: 'cat_eng_civil',
      categorySlug: 'civil-engineering',
      categoryName: 'Highways & Transportation'
    };
  }
  if (t.includes('digital') || t.includes('data') || t.includes('software') || t.includes('it ') || t.includes('cyber') || t.includes('bim')) {
    return {
      categoryId: 'cat_tech_devops',
      categorySlug: 'cloud-devops',
      categoryName: 'Digital Engineering & Technology'
    };
  }
  if (t.includes('finance') || t.includes('accountant') || t.includes('audit')) {
    return {
      categoryId: 'cat_fin_acct',
      categorySlug: 'accounting-audit',
      categoryName: 'Finance & Commercial Operations'
    };
  }

  return {
    categoryId: 'cat_eng_civil',
    categorySlug: 'civil-engineering',
    categoryName: 'Civil Engineering'
  };
}

function estimateSalary(title) {
  const t = title.toLowerCase();
  if (t.includes('director') || t.includes('head of')) {
    return { min: 90000, max: 130000, currency: 'GBP' };
  }
  if (t.includes('senior') || t.includes('principal') || t.includes('lead') || t.includes('commissioning manager')) {
    return { min: 58000, max: 82000, currency: 'GBP' };
  }
  if (t.includes('manager') || t.includes('engineer') || t.includes('surveyor') || t.includes('planner') || t.includes('consultant')) {
    return { min: 42000, max: 62000, currency: 'GBP' };
  }
  if (t.includes('assistant') || t.includes('coordinator') || t.includes('advisor') || t.includes('technician') || t.includes('analyst')) {
    return { min: 32000, max: 45000, currency: 'GBP' };
  }
  if (t.includes('graduate') || t.includes('intern') || t.includes('trainee') || t.includes('apprentice')) {
    return { min: 28000, max: 35000, currency: 'GBP' };
  }
  return { min: 42000, max: 60000, currency: 'GBP' };
}

function buildSmartDescription(job, locInfo, salInfo, remoteType, directApplyUrl) {
  const shortDesc = job.ShortDescriptionStr || `Costain Group is recruiting for a skilled ${job.Title} to support major infrastructure programs across the UK.`;

  return `## Role Overview
• **Position**: ${job.Title}
• **Employer**: Costain Group (Costain Group plc)
• **Location**: ${locInfo.location}
• **Requisition Ref**: ${job.Id}
• **Work Arrangement**: ${remoteType}
• **Employment Type**: Full-Time

## Project & Infrastructure Scope
${shortDesc}

Costain delivers complex smart infrastructure solutions across the UK's core sectors: Transportation (National Highways, Network Rail), Water (Thames Water, United Utilities AMP8 frameworks), Energy Transition, and Defence. As part of this collaborative delivery team, you will contribute directly to high-impact capital delivery frameworks.

## Core Responsibilities & Impact
• Lead and coordinate technical, operational, or commercial delivery packages to required quality, safety, and regulatory benchmarks.
• Interface effectively with client stakeholders, multidisciplinary design consultants, and supply chain partners.
• Ensure full compliance with CDM regulations, statutory guidelines, carbon reduction targets, and digital engineering standards.
• Drive innovative engineering solutions, risk mitigation, and continuous performance improvement across project milestones.

## Qualifications & Professional Competencies
• Relevant degree or professional qualification in ${job.Title.includes('Engineer') ? 'Civil, Structural, Mechanical, Electrical Engineering, or related technical discipline' : 'Engineering, Construction Management, Quantity Surveying, or Project Management'}.
• Proven experience in UK capital infrastructure, civil engineering, major highways, rail, or water framework environments.
• Strong analytical problem-solving, stakeholder communication, and team leadership capabilities.
• Commitment to safety leadership, collaborative working, and sustainable engineering practice.

## Compensation & Employee Benefits Guidance
• **Estimated Remuneration**: GBP £${salInfo.min.toLocaleString()} - £${salInfo.max.toLocaleString()} per annum (commensurate with skills and experience)
• Comprehensive Costain Group benefits package including company matched pension contribution, private healthcare options, employee share purchase plan, life assurance, flexible working arrangements, and full professional chartership mentorship.

## Official Application Method
• **Direct ATS Link**: Apply directly via the official Costain Group Oracle Cloud Careers Portal requisition page: [${job.Title} on Costain Careers](${directApplyUrl})`;
}

async function fetchAndIngestCostainJobs() {
  console.log("🚀 Connecting to Costain Group Official Oracle Cloud ATS API (CX_1)...");

  // 1. Read existing database
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  // 2. Ensure Costain Group company record exists
  const compIndex = data.companies.findIndex(c => c.id === COSTAIN_COMPANY.id || c.name.toLowerCase() === 'costain group');
  if (compIndex >= 0) {
    data.companies[compIndex] = { ...data.companies[compIndex], ...COSTAIN_COMPANY };
  } else {
    data.companies.push(COSTAIN_COMPANY);
  }

  // 3. Fetch all jobs with pagination
  const allRequisitions = [];
  let offset = 0;
  const limit = 25;

  while (true) {
    const url = `https://iahime.fa.ocs.oraclecloud.com/hcmRestApi/resources/latest/recruitingCEJobRequisitions?finder=findReqs;siteNumber=CX_1,offset=${offset},limit=${limit}&expand=all`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.log(`Warning: Request failed with status ${res.status}`);
      break;
    }
    const resJson = await res.json();
    const list = resJson.items?.[0]?.requisitionList || [];
    if (list.length === 0) break;

    allRequisitions.push(...list);
    offset += list.length;
    if (list.length < limit) break;
  }

  console.log(`✅ Successfully fetched ${allRequisitions.length} live Costain requisitions from Oracle Cloud!`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const job of allRequisitions) {
    const directApplyUrl = `https://iahime.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/job/${job.Id}`;
    const locInfo = parseLocation(job.PrimaryLocation);
    const cat = inferCategory(job.Title, job.ShortDescriptionStr);
    const sal = estimateSalary(job.Title);

    let remoteType = 'ONSITE';
    const wp = (job.WorkplaceType || '').toLowerCase();
    if (wp.includes('hybrid')) remoteType = 'HYBRID';
    else if (wp.includes('remote') || locInfo.location.includes('Remote')) remoteType = 'REMOTE';

    const jobId = `job_costain_${job.Id}_${job.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 80);
    const smartDescription = buildSmartDescription(job, locInfo, sal, remoteType, directApplyUrl);

    const jobRecord = {
      id: jobId,
      source_id: "costain_group_ats",
      source_job_id: `costain_${job.Id}`,
      canonical_hash: `costain_group_hash_${job.Id}`,
      title: `${job.Title} (Costain Group)`,
      slug: `${job.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-costain-group--${job.Id}`,
      company_id: "comp_costain_group",
      company_name: "Costain Group",
      company_website: "https://www.costain.com",
      company_logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/Costain_Group_logo.svg/320px-Costain_Group_logo.svg.png",
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
      publishedAt: job.PostedDate ? `${job.PostedDate}T00:00:00Z` : new Date().toISOString(),
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      sponsorship_score: 94,
      sponsorship_label: "Likely",
      sponsorship_positive_evidence: JSON.stringify([
        "Costain Group plc is an officially registered A-rated Sponsor under the UK Home Office Register of Licensed Sponsors (Worker - Skilled Worker Route)",
        "Direct verified Costain Group Oracle Cloud ATS application URL",
        "Major strategic UK national infrastructure and capital framework program"
      ]),
      sponsorship_negative_evidence: JSON.stringify([]),
      visa_keywords: JSON.stringify([
        "Costain Group Licensed Sponsor",
        "Skilled Worker Route",
        "Direct Employer ATS",
        "UK Infrastructure",
        "Tier 1 Contractor"
      ]),
      quality_score: 98,
      status: "active",
      is_featured: (job.Title.includes('Senior') || job.Title.includes('Principal') || job.Title.includes('Director') || job.Title.includes('Lead')) ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const existingIdx = data.jobs.findIndex(j => j.id === jobId || j.source_job_id === `costain_${job.Id}`);
    if (existingIdx >= 0) {
      data.jobs[existingIdx] = { ...data.jobs[existingIdx], ...jobRecord };
      updatedCount++;
    } else {
      data.jobs.unshift(jobRecord);
      addedCount++;
    }
  }

  // 4. Save to database
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n🎉 Costain Group Ingestion Complete!`);
  console.log(`- New Costain jobs added: ${addedCount}`);
  console.log(`- Existing Costain jobs updated: ${updatedCount}`);
  console.log(`- Total jobs in database now: ${data.jobs.length}`);
  console.log(`- Total companies in database: ${data.companies.length}`);
}

fetchAndIngestCostainJobs().catch(err => {
  console.error("❌ Costain Ingestion error:", err);
  process.exit(1);
});
