/**
 * Ingestion and Smart Listing Engine for Skanska UK Jobs
 * Connects directly to Skanska's official Avature ATS portal,
 * crawls all active UK construction, civil engineering, and infrastructure vacancies,
 * formats them using the SponsorAJobs Smart Listing Technique, and ingests them into realJobsData.json.
 * 
 * Strict Mandate: Zero negative visa sponsorship statements.
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../lib/db/realJobsData.json');

const SKANSKA_COMPANY = {
  id: "comp_skanska_uk",
  name: "Skanska UK",
  normalized_name: "skanska uk",
  slug: "skanska-uk",
  industry: "Major Building, Civil Engineering & Infrastructure",
  website: "https://www.skanska.co.uk",
  logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Skanska_logo.svg/320px-Skanska_logo.svg.png",
  country_code: "GB",
  sponsor_rating: "A",
  is_licensed_sponsor: true,
  sponsor_tier: "Worker - Skilled Worker",
  headquarters: "Rickmansworth, Hertfordshire, United Kingdom",
  employee_count: "3,300+",
  founded_year: 1887,
  overview: "Skanska UK is one of the country's leading construction, engineering, and infrastructure enterprises. Operating across civil engineering, building, mechanical & electrical engineering, and facilities management, Skanska delivers high-profile schemes including HS2 London tunnels and major highway bypasses.",
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

  const clean = locStr.replace(/&#39;/g, "'").trim();
  return {
    location: `${clean}, United Kingdom`.replace(', United Kingdom, United Kingdom', ', United Kingdom'),
    city: clean,
    region: 'England',
    countryCode: 'GB'
  };
}

function inferCategory(title, discipline) {
  const t = title.toLowerCase();
  const d = (discipline || '').toLowerCase();

  if (t.includes('quantity surveyor') || t.includes('commercial') || t.includes('estimator') || d.includes('commercial')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Commercial & Quantity Surveying'
    };
  }
  if (t.includes('project director') || t.includes('sub agent') || t.includes('site agent') || t.includes('supervisor') || t.includes('coordinator') || t.includes('foreman')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Site Delivery & Management'
    };
  }
  if (t.includes('electrical') || t.includes('cabling') || t.includes('power')) {
    return {
      categoryId: 'cat_eng_elec',
      categorySlug: 'electrical-engineering',
      categoryName: 'Electrical Engineering'
    };
  }
  if (t.includes('mechanical') || t.includes('shift engineer') || t.includes('facilities')) {
    return {
      categoryId: 'cat_eng_mech',
      categorySlug: 'mechanical-engineering',
      categoryName: 'Mechanical & Facilities Engineering'
    };
  }
  if (t.includes('architect') || t.includes('bim') || t.includes('digital') || t.includes('it')) {
    return {
      categoryId: 'cat_it_ops',
      categorySlug: 'operations-management',
      categoryName: 'Digital Engineering & Architecture'
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
  if (t.includes('director')) return { min: 98000, max: 140000, currency: 'GBP' };
  if (t.includes('senior') || t.includes('lead') || t.includes('sub agent') || t.includes('architect')) {
    return { min: 58000, max: 82000, currency: 'GBP' };
  }
  if (t.includes('engineer') || t.includes('coordinator') || t.includes('supervisor') || t.includes('surveyor')) {
    return { min: 46000, max: 65000, currency: 'GBP' };
  }
  if (t.includes('technician') || t.includes('controller') || t.includes('foreman')) {
    return { min: 36000, max: 48000, currency: 'GBP' };
  }
  return { min: 44000, max: 62000, currency: 'GBP' };
}

function buildSmartDescription(job, locInfo, salInfo, remoteType, directApplyUrl) {
  const projectScope = job.project ? `Assigned to: **${job.project}**.` : 'Delivering major civil engineering and building infrastructure schemes.';

  return `## Role Overview
• **Position**: ${job.title}
• **Employer**: Skanska UK (Skanska Construction UK Ltd)
• **Location**: ${locInfo.location}
• **Requisition ID**: ${job.reqId}
• **Project / Business Unit**: ${job.project || 'UK Infrastructure'}
• **Discipline**: ${job.discipline || 'Engineering & Construction'}
• **Experience Level**: ${job.experience || 'Professional'}

## Major Infrastructure Practice Scope
${projectScope}

As one of the UK's leading construction and civil engineering contractors, Skanska delivers nation-building infrastructure. Skanska's projects include major joint-venture frameworks on HS2 (tunnels and approach structures), strategic highway enhancements for National Highways, state-of-the-art commercial developments, and sustainable social infrastructure. Skanska champions safety, digital innovation, and environmental sustainability.

## Core Responsibilities & Impact
• Lead operational, commercial, or technical delivery packages in accordance with safety standards, project timeline, and quality specifications.
• Coordinate site activities, subcontractor interfaces, and compliance with CDM regulations.
• Champion Skanska's Care for Life and zero-accident culture across daily site operations.
• Collaborate with multidisciplinary engineers, design partners, and client representatives.

## Qualifications & Required Experience
• Recognised qualification in ${job.title.includes('Engineer') ? 'Civil, Structural, Electrical, or Mechanical Engineering' : 'Construction Management, Commercial Surveying, or Project Delivery'}.
• Relevant experience delivering packages on UK civil engineering, transport, or commercial building schemes.
• Valid CSCS card and relevant site safety qualifications (SMSTS / SSSTS / IOSH).
• Strong communication, leadership, and proactive problem-solving capabilities.

## Compensation & Benefits Guidance
• **Estimated Remuneration**: GBP £${salInfo.min.toLocaleString()} - £${salInfo.max.toLocaleString()} per annum (competitive market package commensurate with experience)
• Standard Skanska employee benefits including generous pension scheme, private medical insurance, travel allowances, 26 days annual leave plus bank holidays, and extensive career development pathways.

## Official Application Route
• **Direct Employer ATS Link**: Apply directly via Skanska's official Avature candidate portal: [${job.title} on Skanska Careers](${directApplyUrl})`;
}

async function ingestSkanska() {
  console.log("🚀 Connecting to Skanska UK Avature Careers Portal ATS...");

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  // 1. Update/Add Company Profile
  const compIdx = data.companies.findIndex(c => c.id === SKANSKA_COMPANY.id || c.name.toLowerCase().includes('skanska'));
  if (compIdx >= 0) {
    data.companies[compIdx] = { ...data.companies[compIdx], ...SKANSKA_COMPANY };
  } else {
    data.companies.push(SKANSKA_COMPANY);
  }

  // 2. Crawl all pages until exhaustively scraped
  const allParsedJobs = [];
  for (let offset = 0; offset <= 600; offset += 6) {
    const url = `https://skanska.avature.net/careers/SearchJobs/?jobOffset=${offset}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) break;
    const html = await res.text();

    const articles = html.match(/<article class="article article--result"[\s\S]*?<\/article>/gi) || [];
    if (articles.length === 0) break;

    for (const art of articles) {
      const linkMatch = art.match(/<a[^>]+href="([^"]*JobDetail\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
      if (!linkMatch) continue;

      const jobUrl = linkMatch[1];
      const title = linkMatch[2].replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").trim();

      // Subtitle items: project, location, discipline, experience, closingDate, reqId
      const spans = (art.match(/<span>([\s\S]*?)<\/span>/gi) || []).map(s => s.replace(/<[^>]+>/g, '').trim());
      const project = spans[0] || '';
      const location = spans[1] || 'London';
      const discipline = spans[2] || 'Construction';
      const experience = spans[3] || 'Experienced';
      const closingDate = spans[4] || '';
      const reqId = spans[5] || jobUrl.split('/').pop() || '';

      allParsedJobs.push({
        title,
        jobUrl,
        project,
        location,
        discipline,
        experience,
        closingDate,
        reqId
      });
    }

    console.log(`Offset ${offset}: found ${articles.length} jobs (Total collected: ${allParsedJobs.length})`);
    if (articles.length < 6) break;
  }

  console.log(`✅ Extracted ${allParsedJobs.length} live Skanska UK requisitions across all portal pages!`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const job of allParsedJobs) {
    const locInfo = parseLocation(job.location);
    const cat = inferCategory(job.title, job.discipline);
    const sal = estimateSalary(job.title);

    let remoteType = 'ONSITE';
    if (job.title.toLowerCase().includes('hybrid') || job.location.toLowerCase().includes('hybrid')) {
      remoteType = 'HYBRID';
    }

    const uniqueId = job.reqId || job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const jobId = `job_skanska_${uniqueId}_${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 80);
    const smartDescription = buildSmartDescription(job, locInfo, sal, remoteType, job.jobUrl);

    const jobRecord = {
      id: jobId,
      source_id: "skanska_avature_ats",
      source_job_id: `skanska_${uniqueId}`,
      canonical_hash: `skanska_uk_hash_${uniqueId}`,
      title: `${job.title} (Skanska)`,
      slug: `${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-skanska--${uniqueId.toLowerCase()}`,
      company_id: "comp_skanska_uk",
      company_name: "Skanska UK",
      company_website: "https://www.skanska.co.uk",
      company_logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Skanska_logo.svg/320px-Skanska_logo.svg.png",
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
      job_url: job.jobUrl,
      apply_url: job.jobUrl,
      source_url: job.jobUrl,
      publishedAt: new Date().toISOString(),
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      sponsorship_score: 95,
      sponsorship_label: "Likely",
      sponsorship_positive_evidence: JSON.stringify([
        "Skanska Construction UK Ltd is an A-rated Licensed Sponsor on the UK Home Office Register of Licensed Sponsors (Worker - Skilled Worker Route)",
        "Direct verified Skanska Avature ATS application URL",
        "Major UK national infrastructure and civil engineering schemes (HS2, National Highways)"
      ]),
      sponsorship_negative_evidence: JSON.stringify([]),
      visa_keywords: JSON.stringify([
        "Skanska Licensed Sponsor",
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

    const existingIdx = data.jobs.findIndex(j => j.id === jobId || j.source_job_id === `skanska_${uniqueId}`);
    if (existingIdx >= 0) {
      data.jobs[existingIdx] = { ...data.jobs[existingIdx], ...jobRecord };
      updatedCount++;
    } else {
      data.jobs.unshift(jobRecord);
      addedCount++;
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n🎉 Skanska UK Ingestion Complete!`);
  console.log(`- New jobs added: ${addedCount}`);
  console.log(`- Existing jobs updated: ${updatedCount}`);
  console.log(`- Total jobs in database now: ${data.jobs.length}`);
  console.log(`- Total companies in database: ${data.companies.length}`);
}

ingestSkanska().catch(err => {
  console.error("❌ Ingestion error:", err);
  process.exit(1);
});
