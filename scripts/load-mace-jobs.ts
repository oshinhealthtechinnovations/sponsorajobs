import fs from "fs";
import path from "path";

interface MaceJobInput {
  title: string;
  url: string;
  city: string;
  category: string;
  status: "active" | "expired";
  notes: string;
}

const maceJobs: MaceJobInput[] = [
  {
    title: "Senior Project Manager",
    url: "https://careers.macegroup.com/gb/en/job/41474/Senior-Project-Manager",
    city: "London",
    category: "project-management",
    status: "expired", // Closed/filled
    notes: "Project & Programme Management role (Position marked closed/filled by employer)."
  },
  {
    title: "Operations Director – Project Management",
    url: "https://careers.macegroup.com/gb/en/job/42584/Operations-Director-Project-Management",
    city: "London",
    category: "project-management",
    status: "active",
    notes: "Executive Project & Programme Management leadership role overseeing large-scale developments."
  },
  {
    title: "Planning Manager",
    url: "https://careers.macegroup.com/gb/en/job/27296/Planning-Manager",
    city: "London",
    category: "project-management",
    status: "active",
    notes: "Project & Programme Management planning role across complex construction schedules."
  },
  {
    title: "Associate Project Director",
    url: "https://careers.macegroup.com/gb/en/job/42590/Associate-Project-Director",
    city: "London",
    category: "project-management",
    status: "active",
    notes: "Senior leadership in project direction and client engagement across major UK programmes."
  },
  {
    title: "Information Manager",
    url: "https://careers.macegroup.com/gb/en/job/MACEGB46751EXTERNALENGB",
    city: "London",
    category: "information-technology",
    status: "active",
    notes: "Technical Services & BIM/Information Management across construction projects."
  },
  {
    title: "Associate Director – Cost Consultancy (Private Sector, Mixed Use Developments)",
    url: "https://careers.macegroup.com/gb/en/job/46333/Associate-Director-Cost-Consultancy-Private-Sector-Mixed-Used-Developments",
    city: "London",
    category: "finance",
    status: "active",
    notes: "Commercial cost consultancy and quantity surveying for mixed-use private developments."
  },
  {
    title: "Design Manager",
    url: "https://careers.macegroup.com/gb/en/job/45543/Design-Manager",
    city: "London",
    category: "engineering",
    status: "active",
    notes: "Technical Services and architectural/engineering design management on active sites."
  },
  {
    title: "Payroll and Benefits Assistant",
    url: "https://careers.macegroup.com/gb/en/job/39128/Payroll-and-Benefits-Assistant-S4",
    city: "London",
    category: "human-resources",
    status: "active",
    notes: "Corporate HR, compensation, and employee benefits operations role."
  },
  {
    title: "Project Controls Manager – Defence",
    url: "https://careers.macegroup.com/gb/en/job/MACEGB45036EXTERNALENGB",
    city: "Preston",
    category: "project-management",
    status: "expired", // Closed/filled
    notes: "Project Controls in Defence sector (Position marked closed/filled by employer)."
  },
  {
    title: "South West England Opportunities",
    url: "https://careers.macegroup.com/gb/en/job/46790/South-West-England-Opportunities",
    city: "Bristol",
    category: "project-management",
    status: "expired", // Closed/filled
    notes: "Regional construction and project opportunities (Position marked closed/filled by employer)."
  }
];

const maceCompany = {
  id: "comp_mace_group",
  name: "Mace",
  normalized_name: "mace",
  country_code: "GB",
  industry: "Construction & Project Management",
  website: "https://www.macegroup.com",
  careers_url: "https://careers.macegroup.com",
  logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Mace_Group_logo.svg/320px-Mace_Group_logo.svg.png",
  description: "Mace is a global consultancy and construction company delivering major infrastructure and property developments worldwide. Mace Ltd is a licensed sponsor under the UK Home Office Register of Licensed Sponsors.",
  sponsorship_signal: "high",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

function generateDescription(job: MaceJobInput): string {
  const statusNote = job.status === "expired"
    ? "🔴 **Status:** This listing was previously recorded as closed or filled. Please visit the official careers portal to check for active openings or re-advertised positions."
    : "🟢 **Status:** Active / Open for Applications on Mace Careers.";

  return `### **About the Role: ${job.title} at Mace**

${job.notes}

📍 **Location:** ${job.city}, United Kingdom (GB)  
🏢 **Employer:** Mace (Mace Group)  
💼 **Category:** ${job.category.replace(/-/g, " ").toUpperCase()}  
${statusNote}

---

### ⚠️ **Important Transparency & Application Guidance (Please Read):**

> **1. Visa Sponsorship Policy:**  
> Mace Ltd is an approved **UK Home Office Licensed Sponsor (Skilled Worker Route)**. However, individual vacancy visa sponsorship availability, minimum salary thresholds, and Certificate of Sponsorship (CoS) allocation are **not explicitly published** on this public listing. **Please confirm your specific visa sponsorship eligibility directly with the Mace HR / Talent Acquisition team during the initial application process.**
>
> **2. Salary & Compensation:**  
> Exact salary bands are not published in the public posting. Competitive compensation, pension, and benefits will be discussed directly with candidates by Mace hiring managers.
>
> **3. Work Arrangement:**  
> Hybrid / Onsite working arrangements depend on project site and client requirements — please verify with HR upon application.

---

### **How to Apply:**
Apply directly on the official Mace career portal at the verified application link below.`;
}

async function run() {
  const dataPath = path.resolve("./lib/db/realJobsData.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const data = JSON.parse(raw);

  // 1. Upsert Mace Company
  const compIndex = data.companies.findIndex((c: any) => c.id === maceCompany.id);
  if (compIndex >= 0) {
    data.companies[compIndex] = { ...data.companies[compIndex], ...maceCompany };
  } else {
    data.companies.unshift(maceCompany);
  }

  // 2. Format and Upsert 10 Mace Jobs
  const formattedJobs = maceJobs.map((j, idx) => {
    const slugId = j.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
    const jobId = `job_mace_${idx + 1}_${slugId}`;
    const desc = generateDescription(j);

    return {
      id: jobId,
      source_id: "mace_careers",
      source_job_id: `mace_${idx + 1}`,
      canonical_hash: `mace_hash_${idx + 1}_${slugId}`,
      title: j.title,
      company_id: maceCompany.id,
      company_name: maceCompany.name,
      description: desc,
      description_clean: desc,
      location: `${j.city}, United Kingdom`,
      city: j.city,
      region: "England",
      country_code: "GB",
      remote_type: "HYBRID",
      employment_type: "FULL_TIME",
      category_id: `cat_${j.category}`,
      category_slug: j.category,
      category_name: j.category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      salary_min: null,
      salary_max: null,
      salary_currency: "GBP",
      job_url: j.url,
      apply_url: j.url,
      source_url: j.url,
      publishedAt: new Date().toISOString(),
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      sponsorship_score: 75,
      sponsorship_label: "Possible",
      sponsorship_positive_evidence: JSON.stringify([
        "Mace Ltd is a registered UK Home Office Licensed Sponsor (Skilled Worker Route)",
        "Direct Employer Official ATS Application Link provided"
      ]),
      sponsorship_negative_evidence: JSON.stringify([
        "Individual vacancy sponsorship eligibility not stated in public posting — confirm directly with Mace HR team"
      ]),
      visa_keywords: JSON.stringify([
        "UK Home Office Licensed Sponsor",
        "Confirm CoS with HR Team",
        "Mace Careers Direct"
      ]),
      quality_score: 85,
      status: j.status,
      is_featured: j.status === "active" ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });

  // Remove existing mace jobs if any, then prepend
  data.jobs = data.jobs.filter((j: any) => !j.id.startsWith("job_mace_"));
  data.jobs.unshift(...formattedJobs);

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`Successfully loaded and indexed ${formattedJobs.length} Mace jobs into realJobsData.json!`);
}

run().catch(console.error);
