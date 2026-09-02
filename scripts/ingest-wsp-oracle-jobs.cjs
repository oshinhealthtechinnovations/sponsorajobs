/**
 * Ingestion and Smart Listing Engine for WSP UK Jobs
 * Connects directly to WSP's official Oracle Cloud ATS API (CX_2001),
 * fetches all active UK engineering and infrastructure job requisitions,
 * formats them using the SponsorAJobs Smart Listing Technique, and ingests them into realJobsData.json.
 * 
 * In accordance with user policy, no negative visa sponsorship notices are included.
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../lib/db/realJobsData.json');

const WSP_COMPANY = {
  id: "comp_wsp",
  name: "WSP",
  normalized_name: "wsp",
  slug: "wsp",
  industry: "Global Engineering, Infrastructure & Environmental Advisory",
  website: "https://www.wsp.com",
  logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/WSP_logo.svg/320px-WSP_logo.svg.png",
  country_code: "GB",
  sponsor_rating: "A",
  is_licensed_sponsor: true,
  sponsor_tier: "Worker - Skilled Worker",
  headquarters: "London, United Kingdom / Montreal",
  employee_count: "69,000+ Globally (10,000+ UK)",
  founded_year: 1885,
  overview: "WSP is a world-leading multidisciplinary engineering, environmental and professional services consultancy, leading high-profile infrastructure projects including HS2, Crossrail, Net Zero energy transition, and smart transportation networks.",
  verified_sponsor: true,
};

function parseLocation(rawLocation) {
  let locationStr = (rawLocation || 'United Kingdom').trim();
  const lower = locationStr.toLowerCase();

  if (lower.includes('home based') || lower.includes('remote') || lower.includes('flexible')) {
    return {
      location: 'Hybrid / Flexible, United Kingdom',
      city: 'London',
      region: 'United Kingdom',
      countryCode: 'GB'
    };
  }

  const locRules = [
    { match: /london/i, city: 'London', region: 'Greater London' },
    { match: /manchester|salford|bolton/i, city: 'Manchester', region: 'Greater Manchester' },
    { match: /birmingham|solihull|coventry/i, city: 'Birmingham', region: 'West Midlands' },
    { match: /bristol/i, city: 'Bristol', region: 'South West' },
    { match: /leeds|wakefield|bradford/i, city: 'Leeds', region: 'West Yorkshire' },
    { match: /sheffield/i, city: 'Sheffield', region: 'South Yorkshire' },
    { match: /newcastle|gateshead|sunderland/i, city: 'Newcastle upon Tyne', region: 'Tyne and Wear' },
    { match: /liverpool/i, city: 'Liverpool', region: 'Merseyside' },
    { match: /glasgow/i, city: 'Glasgow', region: 'Scotland' },
    { match: /edinburgh/i, city: 'Edinburgh', region: 'Scotland' },
    { match: /belfast/i, city: 'Belfast', region: 'Northern Ireland' },
    { match: /cardiff|swansea/i, city: 'Cardiff', region: 'Wales' },
    { match: /nottingham/i, city: 'Nottingham', region: 'Nottinghamshire' },
    { match: /reading|berkshire|slough/i, city: 'Reading', region: 'Berkshire' },
    { match: /cambridge/i, city: 'Cambridge', region: 'Cambridgeshire' },
    { match: /oxford/i, city: 'Oxford', region: 'Oxfordshire' },
    { match: /southampton|portsmouth|hampshire/i, city: 'Southampton', region: 'Hampshire' },
    { match: /guildford|surrey/i, city: 'Guildford', region: 'Surrey' },
    { match: /exeter|plymouth|devon/i, city: 'Exeter', region: 'Devon' },
    { match: /norwich|norfolk/i, city: 'Norwich', region: 'Norfolk' },
    { match: /york/i, city: 'York', region: 'North Yorkshire' },
    { match: /chester|cheshire|warrington/i, city: 'Chester', region: 'Cheshire' }
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

  if (t.includes('structural') || t.includes('bridge') || t.includes('tunnelling') || t.includes('geotechnical') || t.includes('ground engineering')) {
    return {
      categoryId: 'cat_eng_civil',
      categorySlug: 'civil-engineering',
      categoryName: 'Civil & Structural Engineering'
    };
  }
  if (t.includes('civil') || t.includes('highways') || t.includes('traffic') || t.includes('transport') || t.includes('rail') || t.includes('track')) {
    return {
      categoryId: 'cat_eng_civil',
      categorySlug: 'civil-engineering',
      categoryName: 'Civil & Infrastructure Engineering'
    };
  }
  if (t.includes('mechanical') || t.includes('building services') || t.includes('hvac') || t.includes('mep')) {
    return {
      categoryId: 'cat_eng_mech',
      categorySlug: 'mechanical-engineering',
      categoryName: 'Mechanical Engineering'
    };
  }
  if (t.includes('electrical') || t.includes('power') || t.includes('substation') || t.includes('grid') || t.includes('renewable')) {
    return {
      categoryId: 'cat_eng_elec',
      categorySlug: 'electrical-engineering',
      categoryName: 'Electrical & Energy Engineering'
    };
  }
  if (t.includes('environmental') || t.includes('ecology') || t.includes('water') || t.includes('sustainability') || t.includes('carbon') || t.includes('climate') || t.includes('acoustics') || t.includes('flood')) {
    return {
      categoryId: 'cat_eng_civil',
      categorySlug: 'civil-engineering',
      categoryName: 'Environmental & Water Engineering'
    };
  }
  if (t.includes('project manager') || t.includes('commercial manager') || t.includes('cost consultant') || t.includes('quantity surveyor') || t.includes('programme') || t.includes('director') || t.includes('planner')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Project Management & Consultancy'
    };
  }
  if (t.includes('digital') || t.includes('software') || t.includes('data') || t.includes('bim') || t.includes('gis') || t.includes('oracle') || t.includes('developer') || t.includes('cloud')) {
    return {
      categoryId: 'cat_tech_devops',
      categorySlug: 'cloud-devops',
      categoryName: 'Digital Advisory & Technology'
    };
  }
  if (t.includes('finance') || t.includes('accounting') || t.includes('audit') || t.includes('tax')) {
    return {
      categoryId: 'cat_fin_acct',
      categorySlug: 'accounting-audit',
      categoryName: 'Finance & Corporate Services'
    };
  }

  return {
    categoryId: 'cat_eng_civil',
    categorySlug: 'civil-engineering',
    categoryName: 'Engineering & Consulting'
  };
}

function estimateSalary(title) {
  const t = title.toLowerCase();
  if (t.includes('director') || t.includes('head of')) {
    return { min: 88000, max: 125000, currency: 'GBP' };
  }
  if (t.includes('associate') || t.includes('technical director') || t.includes('principal') || t.includes('senior')) {
    return { min: 56000, max: 80000, currency: 'GBP' };
  }
  if (t.includes('manager') || t.includes('engineer') || t.includes('consultant') || t.includes('surveyor') || t.includes('planner')) {
    return { min: 42000, max: 62000, currency: 'GBP' };
  }
  if (t.includes('assistant') || t.includes('coordinator') || t.includes('technician') || t.includes('analyst')) {
    return { min: 32000, max: 44000, currency: 'GBP' };
  }
  if (t.includes('graduate') || t.includes('intern') || t.includes('apprentice')) {
    return { min: 29000, max: 36000, currency: 'GBP' };
  }
  return { min: 44000, max: 62000, currency: 'GBP' };
}

function buildSmartDescription(job, locInfo, salInfo, remoteType, directApplyUrl) {
  const shortDesc = job.ShortDescriptionStr || `WSP UK is recruiting for an exceptional ${job.Title} to deliver forward-looking engineering, environmental, and infrastructure consultancy across the United Kingdom.`;

  return `## Role Overview
• **Position**: ${job.Title}
• **Employer**: WSP (WSP UK Limited)
• **Location**: ${locInfo.location}
• **Requisition Ref**: ${job.Id}
• **Work Arrangement**: ${remoteType}
• **Employment Type**: Full-Time

## Project & Multidisciplinary Practice Scope
${shortDesc}

As one of the world's leading engineering professional services consultancies, WSP brings together 10,000+ experts across the UK. WSP designs and delivers future-ready infrastructure, spanning high-speed rail (HS2), major transport corridors, renewable energy networks, decarbonised building systems, and sustainable water resources.

## Core Responsibilities & Technical Impact
• Provide technical and design leadership or project advisory services in accordance with UK engineering codes and client requirements.
• Collaborate closely with multidisciplinary engineering disciplines including Civil, Structural, MEP, Environmental, and Digital Engineering (BIM/GIS).
• Champion sustainability, Net Zero carbon strategies, and innovation across project lifecycle phases.
• Manage client interfaces, technical reporting, design reviews, and regulatory submissions.

## Qualifications & Professional Attributes
• Degree or higher qualification in ${job.Title.includes('Engineer') ? 'Civil, Structural, Mechanical, Electrical Engineering, Environmental Science, or related technical field' : 'Engineering, Environmental Management, Urban Planning, or Project Delivery'}.
• Professional registration or progression towards Chartered status (CEng, MICE, MIET, MCIBSE, CEnv, or equivalent).
• Strong communication, analytical modeling, and stakeholder collaboration skills.
• Commitment to delivering sustainable, socially valuable infrastructure outcomes.

## Compensation & Employee Benefits Guidance
• **Estimated Remuneration**: GBP £${salInfo.min.toLocaleString()} - £${salInfo.max.toLocaleString()} per annum (based on seniority and specialist expertise)
• WSP Total Reward package including competitive pension scheme, private healthcare, flexible working culture, professional subscription funding, continuous learning opportunities, and employee share schemes.

## Official Application Method
• **Direct ATS Link**: Apply directly via the official WSP Global Oracle Cloud Careers Portal: [${job.Title} on WSP Careers](${directApplyUrl})`;
}

async function fetchAndIngestWspJobs() {
  console.log("🚀 Connecting to WSP UK Official Oracle Cloud ATS API (CX_2001)...");

  // 1. Read existing database
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  // 2. Update WSP company record
  const compIndex = data.companies.findIndex(c => c.id === WSP_COMPANY.id || c.name.toLowerCase() === 'wsp');
  if (compIndex >= 0) {
    data.companies[compIndex] = { ...data.companies[compIndex], ...WSP_COMPANY };
  } else {
    data.companies.push(WSP_COMPANY);
  }

  // 3. Remove old generic Jobicy stub jobs for WSP
  const beforeCount = data.jobs.length;
  data.jobs = data.jobs.filter(j => !(j.company_id === 'comp_wsp' && (j.source_id === 'jobicy' || (j.job_url || '').includes('jobicy.com'))));
  const removedStubs = beforeCount - data.jobs.length;
  if (removedStubs > 0) {
    console.log(`🧹 Cleaned up ${removedStubs} old Jobicy WSP stub listings in favor of direct official ATS feeds.`);
  }

  // 4. Fetch all UK jobs with pagination
  const allRequisitions = [];
  let offset = 0;
  const limit = 25;

  while (true) {
    const url = `https://emit.fa.ca3.oraclecloud.com/hcmRestApi/resources/latest/recruitingCEJobRequisitions?finder=findReqs;siteNumber=CX_2001,location=United%20Kingdom,offset=${offset},limit=${limit}&expand=all`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.log(`Warning: Request failed with status ${res.status}`);
      break;
    }
    const resJson = await res.json();
    const list = resJson.items?.[0]?.requisitionList || [];
    if (list.length === 0) break;

    allRequisitions.push(...list);
    console.log(`Fetched offset ${offset}, got ${list.length} WSP UK jobs (Total: ${allRequisitions.length})`);
    offset += list.length;
    if (list.length < limit) break;
  }

  console.log(`✅ Successfully fetched ${allRequisitions.length} live WSP UK requisitions from Oracle Cloud!`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const job of allRequisitions) {
    const directApplyUrl = `https://emit.fa.ca3.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_2001/job/${job.Id}`;
    const locInfo = parseLocation(job.PrimaryLocation);
    const cat = inferCategory(job.Title, job.ShortDescriptionStr);
    const sal = estimateSalary(job.Title);

    let remoteType = 'HYBRID';
    const wp = (job.WorkplaceType || '').toLowerCase();
    if (wp.includes('site') || wp.includes('office')) remoteType = 'ONSITE';
    else if (wp.includes('remote') || locInfo.location.includes('Remote')) remoteType = 'REMOTE';

    const jobId = `job_wsp_${job.Id}_${job.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 80);
    const smartDescription = buildSmartDescription(job, locInfo, sal, remoteType, directApplyUrl);

    const jobRecord = {
      id: jobId,
      source_id: "wsp_oracle_ats",
      source_job_id: `wsp_${job.Id}`,
      canonical_hash: `wsp_uk_hash_${job.Id}`,
      title: `${job.Title} (WSP)`,
      slug: `${job.Title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-wsp--${job.Id}`,
      company_id: "comp_wsp",
      company_name: "WSP",
      company_website: "https://www.wsp.com",
      company_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/WSP_logo.svg/320px-WSP_logo.svg.png",
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
      sponsorship_score: 95,
      sponsorship_label: "Likely",
      sponsorship_positive_evidence: JSON.stringify([
        "WSP UK Limited is an officially registered A-rated Sponsor under the UK Home Office Register of Licensed Sponsors (Worker - Skilled Worker Route)",
        "Direct verified WSP Global Oracle Cloud ATS requisition application URL",
        "Major national infrastructure, engineering, environmental, and Net Zero advisory frameworks"
      ]),
      sponsorship_negative_evidence: JSON.stringify([]),
      visa_keywords: JSON.stringify([
        "WSP Licensed Sponsor",
        "Skilled Worker Route",
        "Direct Employer ATS",
        "UK Infrastructure",
        "Tier 1 Consultancy"
      ]),
      quality_score: 99,
      status: "active",
      is_featured: (job.Title.includes('Associate') || job.Title.includes('Director') || job.Title.includes('Lead') || job.Title.includes('Principal')) ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const existingIdx = data.jobs.findIndex(j => j.id === jobId || j.source_job_id === `wsp_${job.Id}`);
    if (existingIdx >= 0) {
      data.jobs[existingIdx] = { ...data.jobs[existingIdx], ...jobRecord };
      updatedCount++;
    } else {
      data.jobs.unshift(jobRecord);
      addedCount++;
    }
  }

  // 5. Save to database
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n🎉 WSP UK Ingestion Complete!`);
  console.log(`- New WSP UK jobs added: ${addedCount}`);
  console.log(`- Existing WSP UK jobs updated: ${updatedCount}`);
  console.log(`- Total jobs in database now: ${data.jobs.length}`);
  console.log(`- Total companies in database: ${data.companies.length}`);
}

fetchAndIngestWspJobs().catch(err => {
  console.error("❌ WSP Ingestion error:", err);
  process.exit(1);
});
