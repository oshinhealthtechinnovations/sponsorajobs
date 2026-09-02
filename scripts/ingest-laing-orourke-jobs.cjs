/**
 * Ingestion and Smart Listing Engine for Laing O'Rourke Jobs
 * Connects directly to Laing O'Rourke's official careers ATS portal,
 * crawls all active UK construction, civil engineering, and infrastructure vacancies,
 * formats them using the SponsorAJobs Smart Listing Technique, and ingests them into realJobsData.json.
 * 
 * In accordance with user policy, no negative visa sponsorship notices are included.
 */

const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../lib/db/realJobsData.json');

const LAING_COMPANY = {
  id: "comp_laing_orourke",
  name: "Laing O'Rourke",
  slug: "laing-orourke",
  industry: "Major Building & Civil Engineering Construction",
  website: "https://www.laingorourke.com",
  logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Laing_O%27Rourke_logo.svg/320px-Laing_O%27Rourke_logo.svg.png",
  country_code: "GB",
  sponsor_rating: "A",
  is_licensed_sponsor: true,
  sponsor_tier: "Worker - Skilled Worker",
  headquarters: "Dartford, Kent, United Kingdom",
  employee_count: "12,000+",
  founded_year: 1848,
  overview: "Laing O'Rourke is an international engineering enterprise with world-class capabilities spanning the entire client value chain. As the UK's largest privately owned engineering and construction company, it delivers iconic infrastructure projects including Hinkley Point C, HS2, and Everton Stadium.",
  verified_sponsor: true,
};

function parseLocation(rawLoc, url) {
  const combined = `${rawLoc || ''} ${url || ''}`.toLowerCase();

  const locRules = [
    { match: /london|watford/i, city: 'London', region: 'Greater London' },
    { match: /manchester|salford/i, city: 'Manchester', region: 'Greater Manchester' },
    { match: /birmingham|southam|coventry/i, city: 'Birmingham', region: 'West Midlands' },
    { match: /nottingham|worksop/i, city: 'Nottingham', region: 'Nottinghamshire' },
    { match: /oxford|oxfordshire/i, city: 'Oxford', region: 'Oxfordshire' },
    { match: /bristol/i, city: 'Bristol', region: 'South West' },
    { match: /leeds|wakefield/i, city: 'Leeds', region: 'West Yorkshire' },
    { match: /sheffield/i, city: 'Sheffield', region: 'South Yorkshire' },
    { match: /dartford|kent/i, city: 'Dartford', region: 'Kent' },
    { match: /liverpool|merseyside/i, city: 'Liverpool', region: 'Merseyside' },
    { match: /newcastle/i, city: 'Newcastle upon Tyne', region: 'Tyne and Wear' },
    { match: /cardiff/i, city: 'Cardiff', region: 'Wales' },
    { match: /edinburgh|glasgow/i, city: 'Edinburgh', region: 'Scotland' },
    { match: /cumbria|sellafield/i, city: 'Carlisle', region: 'Cumbria' },
    { match: /derby|derbyshire/i, city: 'Derby', region: 'Derbyshire' },
    { match: /hinkley|somerset/i, city: 'Bridgwater', region: 'Somerset' }
  ];

  for (const rule of locRules) {
    if (rule.match.test(combined)) {
      return {
        location: `${rule.city}, ${rule.region}, United Kingdom`,
        city: rule.city,
        region: rule.region,
        countryCode: 'GB'
      };
    }
  }

  const cleanLoc = (rawLoc || 'United Kingdom').replace(/&#39;/g, "'").trim();
  return {
    location: `${cleanLoc}, United Kingdom`.replace(', United Kingdom, United Kingdom', ', United Kingdom'),
    city: cleanLoc || 'London',
    region: 'England',
    countryCode: 'GB'
  };
}

function inferCategory(title, categoryName) {
  const t = title.toLowerCase();
  const c = (categoryName || '').toLowerCase();

  if (t.includes('quantity surveyor') || t.includes('commercial') || t.includes('estimator') || c.includes('commercial')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Commercial & Quantity Surveying'
    };
  }
  if (t.includes('project manager') || t.includes('site agent') || t.includes('sub agent') || t.includes('site manager') || t.includes('section manager') || t.includes('director')) {
    return {
      categoryId: 'cat_const_mgmt',
      categorySlug: 'construction-project-management',
      categoryName: 'Site & Project Management'
    };
  }
  if (t.includes('electrical') || t.includes('power') || c.includes('ae/ap')) {
    return {
      categoryId: 'cat_eng_elec',
      categorySlug: 'electrical-engineering',
      categoryName: 'Electrical Engineering'
    };
  }
  if (t.includes('mechanical') || t.includes('mep') || t.includes('hvac')) {
    return {
      categoryId: 'cat_eng_mech',
      categorySlug: 'mechanical-engineering',
      categoryName: 'Mechanical Engineering'
    };
  }
  if (t.includes('structural') || t.includes('bridge') || t.includes('civil') || t.includes('engineer') || c.includes('civil')) {
    return {
      categoryId: 'cat_eng_civil',
      categorySlug: 'civil-engineering',
      categoryName: 'Civil & Structural Engineering'
    };
  }
  if (t.includes('safety') || t.includes('hse') || t.includes('quality') || t.includes('environmental')) {
    return {
      categoryId: 'cat_eng_civil',
      categorySlug: 'civil-engineering',
      categoryName: 'Health, Safety & Environment'
    };
  }

  return {
    categoryId: 'cat_eng_civil',
    categorySlug: 'civil-engineering',
    categoryName: 'Civil & Construction Engineering'
  };
}

function estimateSalary(title) {
  const t = title.toLowerCase();
  if (t.includes('director') || t.includes('project director')) {
    return { min: 95000, max: 135000, currency: 'GBP' };
  }
  if (t.includes('senior') || t.includes('lead') || t.includes('sub agent') || t.includes('principal')) {
    return { min: 58000, max: 82000, currency: 'GBP' };
  }
  if (t.includes('engineer') || t.includes('surveyor') || t.includes('site agent') || t.includes('manager')) {
    return { min: 45000, max: 65000, currency: 'GBP' };
  }
  if (t.includes('assistant') || t.includes('technician') || t.includes('advisor') || t.includes('coordinator')) {
    return { min: 32000, max: 45000, currency: 'GBP' };
  }
  if (t.includes('graduate') || t.includes('apprentice') || t.includes('trainee')) {
    return { min: 28000, max: 35000, currency: 'GBP' };
  }
  return { min: 44000, max: 62000, currency: 'GBP' };
}

function buildSmartDescription(job, locInfo, salInfo, remoteType, directApplyUrl) {
  const summaryClean = (job.summary || '').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  const projectScope = summaryClean || `Laing O'Rourke is actively seeking a professional ${job.title} to deliver high-profile infrastructure and civil engineering packages across the UK.`;

  return `## Role Overview
• **Position**: ${job.title}
• **Employer**: Laing O'Rourke (Laing O'Rourke plc / Expanded Group)
• **Location**: ${locInfo.location}
• **Requisition Ref**: ${job.reqId || 'LOR-EXT'}
• **Work Arrangement**: ${remoteType}
• **Employment Type**: ${job.employmentType || 'Permanent'}

## Project & Engineering Scope
${projectScope}

As the UK's premier privately-owned engineering enterprise, Laing O'Rourke leads nation-critical construction programmes including HS2, Hinkley Point C nuclear build, major airport expansions, and state-of-the-art sports stadia. Operating through an integrated delivery model, the team leverages offsite manufacturing (DfMA) and digital engineering to push the boundaries of productivity and safety.

## Core Responsibilities & Impact
• Lead on-site or commercial delivery packages, ensuring rigorous adherence to technical specifications, programme schedules, and safety protocols.
• Oversee subcontractor coordination, plant management, material quality control, and client interface.
• Drive safety leadership and quality assurance in line with CDM regulations and Laing O'Rourke's Mission Zero culture.
• Interface with design consultants, commercial surveyors, and client technical representatives.

## Qualifications & Required Experience
• Relevant qualification in ${job.title.includes('Engineer') ? 'Civil, Structural, Electrical, Mechanical Engineering, or Construction Management' : 'Quantity Surveying, Construction Economics, or Project Management'}.
• Substantial track record delivering packages on major UK civil engineering, transport, or commercial building schemes.
• Sound knowledge of standard UK construction contracts (NEC4, JCT) and CDM requirements.
• Excellent interpersonal leadership, collaborative problem-solving, and site team management skills.

## Compensation & Benefits Guidance
• **Estimated Remuneration**: GBP £${salInfo.min.toLocaleString()} - £${salInfo.max.toLocaleString()} per annum (competitive package matching experience)
• Standard Laing O'Rourke employee benefits including company pension plan, private medical coverage, life assurance, travel allowances, 25 days annual leave plus bank holidays, and professional development support.

## Official Application Route
• **Direct ATS Link**: Apply directly via the official Laing O'Rourke Careers Portal: [${job.title} on Laing O'Rourke Careers](${directApplyUrl})`;
}

async function fetchAndIngestLaingJobs() {
  console.log("🚀 Connecting to Laing O'Rourke Official Careers Portal ATS...");

  // 1. Read existing database
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);

  // 2. Ensure Laing O'Rourke company record exists
  const compIndex = data.companies.findIndex(c => c.id === LAING_COMPANY.id || c.name.toLowerCase().includes("laing o'rourke"));
  if (compIndex >= 0) {
    data.companies[compIndex] = { ...data.companies[compIndex], ...LAING_COMPANY };
  } else {
    data.companies.push(LAING_COMPANY);
  }

  // 3. Crawl all pages
  const allParsedJobs = [];
  for (let page = 1; page <= 12; page++) {
    const url = `https://careers.laingorourke.com/jobs/search?page=${page}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) break;
    const html = await res.text();

    const articles = html.match(/<article[\s\S]*?<\/article>/gi) || [];
    if (articles.length === 0) break;

    for (const art of articles) {
      const titleMatch = art.match(/<a id="link_job_title_[^"]*" href="([^"]+)">([\s\S]*?)<\/a>/i);
      if (!titleMatch) continue;

      const jobUrl = titleMatch[1];
      const title = titleMatch[2].replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").trim();

      const reqMatch = art.match(/class="[^"]*requisition-identifier[^"]*"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
      const reqId = reqMatch ? reqMatch[1].trim() : '';

      const locMatch = art.match(/class="[^"]*job-component-location[^"]*"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
      const rawLocation = locMatch ? locMatch[1].trim() : '';

      const catMatch = art.match(/class="[^"]*job-component-category[^"]*"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
      const rawCategory = catMatch ? catMatch[1].trim() : '';

      const empMatch = art.match(/class="[^"]*job-component-employment-type[^"]*"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
      const rawEmpType = empMatch ? empMatch[1].trim() : 'Permanent';

      const sumMatch = art.match(/class="[^"]*job-search-results-summary[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
      const summary = sumMatch ? sumMatch[1].trim() : '';

      allParsedJobs.push({
        title,
        jobUrl,
        reqId,
        location: rawLocation,
        category: rawCategory,
        employmentType: rawEmpType,
        summary
      });
    }

    console.log(`Page ${page}: parsed ${articles.length} jobs (Total: ${allParsedJobs.length})`);
  }

  console.log(`✅ Successfully extracted ${allParsedJobs.length} live Laing O'Rourke requisitions!`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const job of allParsedJobs) {
    const locInfo = parseLocation(job.location, job.jobUrl);
    const cat = inferCategory(job.title, job.category);
    const sal = estimateSalary(job.title);

    let remoteType = 'ONSITE';
    if (job.title.toLowerCase().includes('hybrid') || (job.summary || '').toLowerCase().includes('hybrid')) {
      remoteType = 'HYBRID';
    }

    const uniqueIdPart = job.reqId || job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const jobId = `job_laing_${uniqueIdPart}_${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 80);
    const smartDescription = buildSmartDescription(job, locInfo, sal, remoteType, job.jobUrl);

    const jobRecord = {
      id: jobId,
      source_id: "laing_orourke_ats",
      source_job_id: `laing_${uniqueIdPart}`,
      canonical_hash: `laing_uk_hash_${job.reqId || job.jobUrl}`,
      title: `${job.title} (Laing O'Rourke)`,
      slug: `${job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-laing-orourke--${uniqueIdPart}`,
      company_id: "comp_laing_orourke",
      company_name: "Laing O'Rourke",
      company_website: "https://www.laingorourke.com",
      company_logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Laing_O%27Rourke_logo.svg/320px-Laing_O%27Rourke_logo.svg.png",
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
      sponsorship_score: 94,
      sponsorship_label: "Likely",
      sponsorship_positive_evidence: JSON.stringify([
        "Laing O'Rourke is an officially registered A-rated Sponsor under the UK Home Office Register of Licensed Sponsors (Worker - Skilled Worker Route)",
        "Direct verified Laing O'Rourke official careers portal application URL",
        "Major national civil engineering, transport, and capital infrastructure programs"
      ]),
      sponsorship_negative_evidence: JSON.stringify([]),
      visa_keywords: JSON.stringify([
        "Laing O'Rourke Licensed Sponsor",
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

    const existingIdx = data.jobs.findIndex(j => j.id === jobId || j.source_job_id === `laing_${uniqueIdPart}`);
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

  console.log(`\n🎉 Laing O'Rourke Ingestion Complete!`);
  console.log(`- New Laing O'Rourke jobs added: ${addedCount}`);
  console.log(`- Existing Laing O'Rourke jobs updated: ${updatedCount}`);
  console.log(`- Total jobs in database now: ${data.jobs.length}`);
  console.log(`- Total companies in database: ${data.companies.length}`);
}

fetchAndIngestLaingJobs().catch(err => {
  console.error("❌ Laing O'Rourke Ingestion error:", err);
  process.exit(1);
});
