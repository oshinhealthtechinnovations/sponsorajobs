/**
 * Job Description Formatter
 *
 * Transforms raw API description text into structured, SEO-optimised HTML sections.
 * Also provides rich description templates per job category for seed / demo data.
 */

export interface FormattedDescription {
  html: string;          // Full structured HTML for display
  plainText: string;     // Stripped plain text for scoring / indexing
  wordCount: number;
  hasSponsorshipSection: boolean;
  hasResponsibilities: boolean;
  hasRequirements: boolean;
  hasSalaryInfo: boolean;
}

// ─── Section detection patterns ──────────────────────────────────────────────
const SECTION_PATTERNS = {
  responsibilities: /\b(responsibilities|key duties|what you.ll do|your role|day[\s-]to[\s-]day|duties)\b/i,
  requirements:     /\b(requirements?|qualifications?|what we.re looking for|you.ll have|about you|skills required)\b/i,
  sponsorship:      /\b(visa|sponsorship|cos|certificate of sponsorship|h-?1b|tss|482|lmia|aewv|work permit|right to work|relocation)\b/i,
  salary:           /\b(salary|compensation|per annum|£|\$|€|aud|usd|gbp|bonus|package|renumeration)\b/i,
  benefits:         /\b(benefits?|perks|what we offer|what you.ll get|we offer)\b/i,
};

/**
 * Format a raw description string into structured HTML sections.
 */
export function formatJobDescription(raw: string): FormattedDescription {
  // Strip HTML tags but preserve line breaks
  const clean = raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|li)[^>]*>/gi, "\n")
    .replace(/<\/?(ul|ol)[^>]*>/gi, "\n")
    .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (_, level, content) =>
      `\n${"#".repeat(Number(level))} ${content.replace(/<[^>]+>/g, "")}\n`
    )
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g,  "&")
    .replace(/&lt;/g,   "<")
    .replace(/&gt;/g,   ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8226;/g, "•")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const plainText = clean;
  const wordCount = clean.split(/\s+/).filter(Boolean).length;

  const hasSponsorshipSection = SECTION_PATTERNS.sponsorship.test(clean);
  const hasResponsibilities   = SECTION_PATTERNS.responsibilities.test(clean);
  const hasRequirements       = SECTION_PATTERNS.requirements.test(clean);
  const hasSalaryInfo         = SECTION_PATTERNS.salary.test(clean);

  // Build HTML
  const html = buildStructuredHtml(clean);

  return {
    html,
    plainText,
    wordCount,
    hasSponsorshipSection,
    hasResponsibilities,
    hasRequirements,
    hasSalaryInfo,
  };
}

function buildStructuredHtml(text: string): string {
  const lines    = text.split("\n");
  const sections: string[] = [];
  let current    = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) sections.push(current);
      current = "";
      continue;
    }
    // Bullet point
    if (/^[•\-\*]\s+/.test(trimmed)) {
      current += `<li>${trimmed.replace(/^[•\-\*]\s+/, "")}</li>`;
    }
    // Heading (markdown)
    else if (/^#{1,3}\s+/.test(trimmed)) {
      current += `<h3 class="jd-section-heading">${trimmed.replace(/^#+\s+/, "")}</h3>`;
    } else {
      current += `<p>${trimmed}</p>`;
    }
  }
  if (current) sections.push(current);

  return `<div class="job-description structured">${sections.join("")}</div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// RICH DESCRIPTION TEMPLATES BY CATEGORY
// Used to enrich seed data with realistic, full-length job descriptions
// ─────────────────────────────────────────────────────────────────────────────

export interface DescriptionTemplateInput {
  title: string;
  companyName: string;
  city: string;
  countryCode: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  remoteType: string;
  sponsorshipLabel: string;
  visaType?: string;
}

export function generateRichDescription(
  category: string,
  input: DescriptionTemplateInput
): string {
  const templates: Record<string, (i: DescriptionTemplateInput) => string> = {
    "engineering":           civilEngineeringTemplate,
    "information-technology": itTemplate,
    "healthcare":            healthcareTemplate,
    "finance":               financeTemplate,
    "construction":          constructionTemplate,
  };

  const fn = templates[category] || itTemplate;
  return fn(input);
}

// ─── Civil Engineering Template ───────────────────────────────────────────────
function civilEngineeringTemplate(i: DescriptionTemplateInput): string {
  const salaryStr = i.salaryMin && i.salaryMax
    ? `${i.currency || "GBP"} ${i.salaryMin.toLocaleString()} – ${i.salaryMax.toLocaleString()} per annum`
    : "Competitive salary based on experience";

  return `${i.title} — ${i.companyName}
📍 ${i.city}, ${i.countryCode} · ${i.remoteType.toLowerCase()} · Full-Time Permanent

## About the Role

${i.companyName} is seeking an experienced and highly motivated ${i.title} to join our expanding infrastructure and structures division. This is a critical technical leadership role delivering complex civil and structural engineering solutions across major public and private sector programmes.

You will be embedded within a high-performing multi-disciplinary team, working closely with architects, project managers, and environmental engineers to deliver projects that reshape communities and critical national infrastructure.

## Key Responsibilities

• Lead the design, analysis, and specification of civil structural engineering solutions including foundations, retaining structures, bridges, and drainage systems
• Produce detailed engineering calculations using industry-standard software (STAAD, AutoCAD Civil 3D, MicroDrainage, Revit)
• Prepare technical drawings, design reports, and specifications to current BS EN / Eurocode / local standards
• Conduct site visits, inspections, and technical reviews at all project phases from feasibility through to construction delivery
• Manage stakeholder relationships with clients, contractors, statutory bodies, and the local planning authority
• Mentor and develop junior engineers within the team, providing peer review and quality assurance
• Ensure compliance with CDM Regulations, environmental legislation, and Health & Safety obligations throughout project lifecycle

## Requirements

**Essential**
• BEng or MEng in Civil or Structural Engineering from an accredited institution
• Minimum 5 years post-graduate experience in a relevant design consultancy or contractor environment
• Demonstrable experience in multi-disciplinary infrastructure or building structures projects
• Proficiency with AutoCAD, Civil 3D, and structural analysis software
• Excellent report writing and technical communication skills

**Desirable**
• Chartered Engineer (CEng) status with ICE, IStructE, or CIWEM (or actively working towards chartership)
• Experience with NEC3/4 contract administration
• Knowledge of BIM Level 2 workflows

## Visa Sponsorship & International Candidates

${i.companyName} is a licensed Skilled Worker visa sponsor in the ${i.countryCode === "GB" ? "United Kingdom" : i.countryCode}. We actively welcome applications from international candidates who require employer sponsorship.

${i.countryCode === "GB"
  ? "Successful candidates requiring sponsorship will be issued a Certificate of Sponsorship (CoS) under the UK Home Office Skilled Worker route. The role meets the minimum salary threshold (£26,200) and is classified under SOC code 2121 (Civil Engineers). Our internal immigration team will guide you through every step of the visa application process."
  : i.countryCode === "AU"
  ? "We sponsor qualified candidates on TSS Subclass 482 visas with a clear pathway to Subclass 186 permanent residency for engineers meeting the skills assessment requirements of Engineers Australia."
  : i.countryCode === "CA"
  ? "Labour Market Impact Assessment (LMIA) support is available for qualified international candidates. Our HR team works with licensed Canadian immigration consultants to facilitate your work permit application."
  : "Visa sponsorship and relocation assistance are available for qualified international candidates."
}

## Compensation & Benefits

• Salary: ${salaryStr}
• Annual performance-related bonus (up to 15% of base salary)
• Generous pension scheme (employer contribution up to 8%)
• 25 days annual leave + public holidays (rising to 30 days with service)
• Private medical and dental insurance
• Professional membership fees (ICE, IStructE, CIWEM) fully covered
• Structured CPD programme and conference attendance budget
• Relocation assistance of up to ${i.currency === "GBP" ? "£5,000" : "$8,000"} for candidates relocating from overseas

## How to Apply

Click "Apply for this Job" to submit your CV and covering letter directly on ${i.companyName}'s official careers portal. International candidates are strongly encouraged to apply and should indicate their sponsorship requirements in the covering letter.

${i.companyName} is an equal opportunity employer. We are committed to building a diverse and inclusive workforce and welcome applications regardless of nationality, background, or current immigration status.`.trim();
}

// ─── IT / Software Engineering Template ───────────────────────────────────────
function itTemplate(i: DescriptionTemplateInput): string {
  const salaryStr = i.salaryMin && i.salaryMax
    ? `${i.currency || "USD"} ${i.salaryMin.toLocaleString()} – ${i.salaryMax.toLocaleString()} per annum`
    : "Competitive package commensurate with experience";

  return `${i.title} — ${i.companyName}
📍 ${i.city}, ${i.countryCode} · ${i.remoteType.toLowerCase()} · Full-Time

## About the Role

${i.companyName} is hiring a talented ${i.title} to strengthen our engineering team. You'll be building and scaling production systems that serve millions of users worldwide, working in a collaborative environment that values code quality, innovation, and engineering excellence.

This is an opportunity to own significant technical decisions, mentor other engineers, and ship features that directly impact product direction.

## Key Responsibilities

• Design, build, and maintain scalable, highly available distributed systems and services
• Write clean, well-tested, and maintainable code across the full stack (or your specialization)
• Conduct thorough code reviews, contribute to engineering standards, and improve team processes
• Collaborate cross-functionally with Product, Design, and Data teams to define and deliver features
• Participate in on-call rotations and contribute to incident retrospectives and system reliability improvements
• Contribute to architecture discussions and technical roadmap planning
• Advocate for engineering best practices including CI/CD, observability, and security-by-design

## Requirements

**Essential**
• 4+ years of professional software engineering experience in a production environment
• Strong proficiency in one or more: Python, TypeScript/JavaScript, Go, Java, Kotlin, or Ruby
• Experience designing and operating distributed systems at scale (microservices, event-driven architecture)
• Proficiency with cloud platforms (AWS, GCP, or Azure) and container technologies (Docker, Kubernetes)
• Solid understanding of relational databases (PostgreSQL, MySQL) and caching systems (Redis, Memcached)
• Track record of shipping high-quality software in a fast-paced, iterative environment

**Desirable**
• Experience with infrastructure-as-code (Terraform, Pulumi)
• Contributions to open-source projects
• Familiarity with ML model serving or data pipeline engineering

## Visa Sponsorship

${i.companyName} sponsors work visas for qualified senior software engineering talent globally.

${i.countryCode === "US"
  ? "We offer H-1B visa transfers and will initiate the H-1B cap lottery for new hires who require it. Additionally, we provide Green Card / EB-1/EB-2/EB-3 sponsorship for engineers who join at senior and above levels. Our legal team partners with a specialist US immigration law firm to support you throughout the entire process."
  : i.countryCode === "GB"
  ? "We hold a valid Skilled Worker sponsor licence issued by the UK Home Office. All senior software engineering roles qualify under the Skilled Worker route. We issue Certificates of Sponsorship (CoS) and cover the Immigration Health Surcharge (IHS) as part of our relocation package."
  : i.countryCode === "AU"
  ? "We actively sponsor software engineers through the TSS 482 visa programme (sponsored stream) and support pathways to the Employer Nomination Scheme (ENS) Subclass 186 for permanent residency."
  : "Work permit and visa sponsorship support is available for all qualified international candidates."
}

## Compensation & Benefits

• Base salary: ${salaryStr}
• Equity / stock options programme
• Annual performance bonus (10–20% of base)
• Comprehensive health, dental, and vision insurance
• ${i.currency === "GBP" ? "Pension auto-enrolment with 6% employer contribution" : "401(k) / retirement plan with company match"}
• Home office setup stipend (${i.currency === "GBP" ? "£1,500" : "$2,000"} one-time)
• Monthly internet and phone allowance
• 30 days annual leave + public holidays
• Dedicated learning & development budget (${i.currency === "GBP" ? "£2,000" : "$3,000"} per year)
• Relocation support for international hires

## How to Apply

Click "Apply for this Job" to be directed to ${i.companyName}'s official applicant tracking system. Our recruitment team typically responds within 5 business days. We welcome candidates at all immigration statuses and will discuss your specific situation during the first call.`.trim();
}

// ─── Healthcare Template ───────────────────────────────────────────────────────
function healthcareTemplate(i: DescriptionTemplateInput): string {
  const salaryStr = i.salaryMin && i.salaryMax
    ? `${i.currency || "GBP"} ${i.salaryMin.toLocaleString()} – ${i.salaryMax.toLocaleString()} per annum`
    : "NHS pay band / competitive equivalent";

  return `${i.title} — ${i.companyName}
📍 ${i.city}, ${i.countryCode} · ${i.remoteType.toLowerCase()} · Full-Time / Part-Time Available

## About the Role

${i.companyName} has an exciting opportunity for a dedicated ${i.title} to join our team. We are committed to delivering outstanding patient care and are actively recruiting internationally qualified professionals to help address critical staffing needs across our services.

This post is open to candidates from overseas who hold or are working towards the relevant professional registration in ${i.countryCode === "GB" ? "the United Kingdom (NMC, GMC, or HCPC)" : "the target country"}.

## Key Responsibilities

• Provide high-quality, evidence-based clinical care to patients in accordance with departmental protocols and national guidelines
• Assess, plan, implement, and evaluate individualized care packages for patients under your clinical remit
• Collaborate with the multi-disciplinary team (MDT) including doctors, physiotherapists, social workers, and support workers
• Accurately document all patient care activities in the electronic patient record (EPR) system
• Participate in handover meetings, ward rounds, and team briefings
• Adhere to infection prevention and control procedures at all times
• Contribute to the clinical supervision, mentoring, and induction of newly qualified and international staff
• Support audit, quality improvement, and research initiatives within the department

## Requirements

**Essential**
• Current professional registration (${i.countryCode === "GB" ? "NMC PIN, GMC Number, or HCPC registration" : "equivalent national professional registration"}) or eligibility to register
• ${i.countryCode === "GB" ? "Minimum 2 years post-qualifying experience in an acute/specialist setting" : "Minimum 2 years relevant clinical experience"}
• Excellent clinical assessment skills and ability to work autonomously
• Strong English language proficiency (IELTS 7.0+ or OET Grade B equivalent for international applicants)
• Understanding of safeguarding principles and statutory frameworks

**Desirable**
• Post-graduate qualification or specialist certification in a relevant clinical area
• Experience with [relevant specialist area e.g., ICU, oncology, A&E, CAMHS]
• Research or quality improvement project leadership experience

## Visa Sponsorship & International Support

${i.companyName} is an approved ${i.countryCode === "GB" ? "UK Visas and Immigration (UKVI) licensed Skilled Worker sponsor" : "employer sponsor"}. We have a dedicated International Recruitment Team who will support you through every step of your journey to ${i.countryCode === "GB" ? "the UK" : "relocation"}.

${i.countryCode === "GB"
  ? `Our comprehensive international recruitment support includes:
• Certificate of Sponsorship (CoS) issued under the Health and Care Worker visa route
• Immigration Health Surcharge (IHS) waived for Health and Care Worker visa holders
• Professional registration support (NMC, GMC, or HCPC) — including OSCE preparation, CBT/OSCEs and adaptation period support
• Funded language assessment (OET or IELTS)
• Dedicated pastoral support from arrival — including airport collection, temporary accommodation, and bank account setup
• Relocation allowance of up to £3,000`
  : "Visa sponsorship and full relocation support including accommodation assistance and immigration legal advice are provided."
}

## Compensation & Benefits

• Salary: ${salaryStr}
• ${i.countryCode === "GB" ? "NHS Pension Scheme (employer contribution 20.6%)" : "Competitive pension/retirement plan"}
• Unsocial hours enhancements (nights, weekends, bank holidays)
• Annual leave: 27–33 days (depending on length of service)
• Access to extensive NHS / employer staff benefits and discounts
• CPD and mandatory training fully funded
• Career progression pathways into senior, specialist, and management roles

## How to Apply

Submit your application via ${i.companyName}'s official recruitment portal by clicking "Apply for this Job". International applicants should attach copies of their professional registration, qualification certificates, and a personal statement addressing their clinical experience.`.trim();
}

// ─── Finance Template ─────────────────────────────────────────────────────────
function financeTemplate(i: DescriptionTemplateInput): string {
  const salaryStr = i.salaryMin && i.salaryMax
    ? `${i.currency || "USD"} ${i.salaryMin.toLocaleString()} – ${i.salaryMax.toLocaleString()} per annum`
    : "Competitive package";

  return `${i.title} — ${i.companyName}
📍 ${i.city}, ${i.countryCode} · ${i.remoteType.toLowerCase()} · Full-Time

## About the Role

${i.companyName} is seeking an experienced ${i.title} to join our Finance function. This is a high-impact role within a fast-growing organisation, offering the opportunity to influence strategic financial decisions and drive business performance at scale.

## Key Responsibilities

• Prepare and review monthly, quarterly, and annual financial reports including P&L, balance sheet, and cash flow statements
• Lead budgeting, forecasting, and long-range financial planning processes across business units
• Perform detailed variance analysis and present actionable commentary to senior leadership
• Manage relationships with external auditors, tax advisors, and regulatory bodies
• Ensure compliance with IFRS/GAAP, local GAAP, and applicable regulatory requirements
• Drive process automation and efficiency improvements across finance operations
• Support M&A due diligence, business case development, and capital allocation decisions

## Requirements

**Essential**
• Qualified accountant: ACA, ACCA, CPA, CFA, or equivalent professional designation
• 5+ years of post-qualification experience in a finance, audit, or advisory role
• Strong financial modelling skills (advanced Excel, ideally including Power BI or Tableau)
• Experience with ERP systems (SAP, Oracle, NetSuite, or Workday Financials)
• Excellent analytical and written communication skills

**Desirable**
• Experience in FinTech, banking, or regulated financial services
• Knowledge of tax structuring and transfer pricing

## Visa Sponsorship

${i.countryCode === "GB"
  ? "This role is eligible for UK Skilled Worker visa sponsorship. The salary exceeds the required threshold, and the occupation is listed on the Shortage Occupation List / Eligible Occupations list. We are a licensed Home Office sponsor."
  : i.countryCode === "US"
  ? "H-1B transfer and TN visa (Canada/Mexico nationals) sponsorship available. Green Card sponsorship is available for senior finance hires."
  : "Work visa and relocation sponsorship available for qualified international candidates."
}

## Compensation

• ${salaryStr}
• Annual bonus up to 20% of base
• Company pension with employer match
• Private healthcare and life assurance
• Flexible and hybrid working arrangements

## How to Apply

Apply directly at ${i.companyName}'s careers page via the link above. Candidates requiring sponsorship should note this in their application.`.trim();
}

// ─── Construction Template ────────────────────────────────────────────────────
function constructionTemplate(i: DescriptionTemplateInput): string {
  const salaryStr = i.salaryMin && i.salaryMax
    ? `${i.currency || "GBP"} ${i.salaryMin.toLocaleString()} – ${i.salaryMax.toLocaleString()} per annum`
    : "Competitive salary";

  return `${i.title} — ${i.companyName}
📍 ${i.city}, ${i.countryCode} · Site-Based · ${i.remoteType.toLowerCase()} · Full-Time

## About the Role

${i.companyName} is currently delivering major infrastructure and construction projects and is seeking an experienced ${i.title} to join our site delivery team. You will play a central role in managing the day-to-day construction activities, subcontractor coordination, programme delivery, and quality assurance.

## Key Responsibilities

• Manage and coordinate site activities including groundworks, structural frame, M&E coordination, and fit-out
• Develop and maintain construction programmes using Asta Powerproject or MS Project
• Supervise and direct subcontractors, ensuring compliance with the contract programme, quality standards, and site rules
• Maintain comprehensive site diaries, RFI logs, progress reports, and health & safety records
• Conduct daily toolbox talks and ensure all operatives hold current CSCS/CPCS cards
• Liaise with client representatives, design teams, and statutory authorities
• Lead weekly site progress meetings and produce written minutes and action registers
• Implement and monitor the site-specific Health & Safety Plan and Environmental Management Plan

## Requirements

**Essential**
• Minimum HNC/HND or degree in Construction Management, Civil Engineering, or a related discipline (or equivalent experience)
• 5+ years site-based experience on major infrastructure, civils, or commercial construction projects (£5M+ value)
• Valid SMSTS certification (or SSSTS with demonstrable progression plan)
• First Aid at Work certification
• Proficiency in construction software and Microsoft Office Suite

**Desirable**
• NEBOSH Construction Certificate
• NEC3/4 contract experience
• Experience on rail, utilities, or highway projects

## Visa Sponsorship

${i.companyName} is an approved Skilled Worker sponsor. Construction and site management roles at this level qualify under the relevant SOC codes for UK Home Office sponsorship. We work with specialist immigration solicitors to issue Certificates of Sponsorship and guide candidates through the full visa application process.

Relocation allowance and temporary furnished accommodation (first 4 weeks) provided for candidates relocating from overseas.

## Compensation & Benefits

• ${salaryStr} + site allowances
• Company vehicle or vehicle allowance
• Annual performance bonus
• Pension scheme (employer 5% contribution)
• 24 days holiday + public holidays
• CITB Training Levy covered

## How to Apply

Click "Apply for this Job" to submit your CV directly to ${i.companyName}'s recruitment team. Include details of your most relevant projects, contract values, and any current visa or sponsorship requirements.`.trim();
}
