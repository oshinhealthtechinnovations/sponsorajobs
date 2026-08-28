import fs from "fs";
import path from "path";

const dataPath = path.resolve("./lib/db/realJobsData.json");
const raw = fs.readFileSync(dataPath, "utf-8");
const data = JSON.parse(raw);

async function run() {
  console.log("Loading Burns & McDonnell 'Project Assistant - GFS' job into database...");

  // 1. Ensure Burns & McDonnell company exists
  const burnsCompanyId = "comp_burns_mcdonnell";
  let burnsCompany = (data.companies || []).find((c: any) => c.id === burnsCompanyId || c.normalized_name === "burns & mcdonnell");

  if (!burnsCompany) {
    burnsCompany = {
      id: burnsCompanyId,
      name: "Burns & McDonnell",
      normalized_name: "burns & mcdonnell",
      country_code: "US",
      industry: "Engineering & Construction Consultancy",
      website: "https://www.burnsmcd.com",
      careers_url: "https://burnsmcd.jobs",
      logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Burns_%26_McDonnell_logo.svg/320px-Burns_%26_McDonnell_logo.svg.png",
      description: "Burns & McDonnell is a full-service engineering, architecture, construction, environmental and consulting solutions firm. With global engineering centers across North America, the UK, and India, Burns & McDonnell delivers critical infrastructure, hyper-scale datacenters, and industrial facilities with global project delivery capabilities.",
      sponsorship_signal: "high",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.companies.unshift(burnsCompany);
  }

  const jobDescription = `### 🏢 About Burns & McDonnell
Burns & McDonnell India has an exciting opportunity for a **Project Assistant** interested in growing their careers in an organization listed among the top 100 Great Places to Work in India.

The **Global Facilities (GFS)** business unit handles engineering of facilities in the North America region which includes:
- Food & consumer product facilities
- Manufacturing facilities
- Hyper-scale datacenters
- Commercial facilities
- Aviation facilities

This opportunity hires directly into that team and into an industry that has strong growth potential. The Mumbai office has a full complement of professionals with expertise in architecture, civil, electrical, control & automation, fire protection, mechanical, structural engineering, and project management.

---

### 💼 Position Overview
We are looking for an experienced candidate to join our **GFS Global Practice (GP)** in our Mumbai office to support project administrative and controls activities. 

This position is responsible for providing administrative and logistical support to a project team, assisting with:
- Project planning, execution, and documentation
- Managing schedules and project forecasting
- Coordinating cross-functional communication
- Maintaining project files and SharePoint workspaces
- Verifying invoices and budgets
- Creating projects and maintaining them in **EcoSys**
- Ensuring projects run smoothly and meet critical deadlines

The successful candidate will report to the Project Manager and will support the current project management team on day-to-day activities.

---

### 📋 Key Responsibilities
1. **Schedule & Cost Control**: Monitor project schedules, manage scope, and control project costs in **EcoSys** (the project management & controls tool used within the company).
2. **Project Accounting**: Create projects, fund projects, and update forecasts in EcoSys.
3. **Administration**: Lead day-to-day administrative tasks including data collection, classification, and archiving.
4. **Proposals & Client Reports**: Assist in preparing proposals, presentations, and weekly / monthly project reports to clients.
5. **Meetings & Minutes**: Arrange and attend interdepartmental project meetings, document meeting minutes, and track action items.
6. **SharePoint Workspaces**: Create project folders in SharePoint and assist team in populating files according to company guidelines.
7. **Quality & Progress Tracking**: Keep track of schedules, quality, and project deliverables through updated management reports.
8. **Budget Oversight**: Maintain project financials and budgets to help the project management team keep projects aligned with targets.
9. **Performance Measurement**: Prepare and measure target progress vs. actual project progress, highlighting corrective actions when required.
10. **Project Closeout**: Collect project feedback, prepare, and maintain closeout reports.
11. **Team Support**: Assist with internal project financials, staffing, change management, and human resource coordination.
12. **Primary Liaison**: Serve as the primary point of contact for all assigned project administrative activities.
13. **QA/QC Compliance**: Ensure deliverables and services meet client satisfaction and adhere to internal QA/QC guidelines.
14. **Engineering Progress Reports**: Prepare regular reports on engineering progress across scope, schedule, and budget, flagging critical risks.
15. **Change Management**: Maintain records of change requests, raise change notices/proposals, and finalize change orders with the engineering team.
16. **Recruitment & Retention**: Support recruitment and retention efforts to grow the project management practice.

---

### 🎓 Qualifications & Requirements
- **Education**: Bachelor's degree in Engineering or relevant field from an accredited university or institute of repute.
- **Experience**: Minimum of 3–4 years of project management / project assistant experience, with at least 3 years in the consulting or engineering industry.
- **Track Record**: Proven track record of supporting major facility or infrastructure projects in a project assistant / controls role from conceptual design through commissioning.
- **Technical Skills**: Strong working knowledge of MS Excel (advanced spreadsheets, reporting, analysis).
- **Software**: Knowledge of project management & controls software (**EcoSys**, Primavera P6, or MS Project) is preferred.
- **Multi-tasking**: Proven ability to handle multiple complex projects simultaneously.
- **Communication**: Excellent written and verbal communication skills with strong analytical and problem-solving abilities.

---

### 📌 Additional Information
- **Req ID**: 260436
- **Schedule**: Full-time
- **Travel**: No
- **Primary Location**: Mumbai, IND (Global Facilities Practice - North America Engineering)
- **Posting Duration**: Open a minimum of 72 hours and on an ongoing basis until filled.`;

  const jobId = "job_burnsmcd_260436_project_assistant_gfs";
  const exactApplyUrl = "https://burnsmcd.jobs/mumbai-ind/project-assistant-gfs/E8936E90B2674B82A598EF8F1024BD11/job/?vs=1606&utm_source=LinkedIn.com-DE&utm_medium=Social+Media&utm_campaign=LinkedIn.com";
  const sourceUrl = exactApplyUrl;

  const newJob = {
    id: jobId,
    source_id: "burnsmcd_careers",
    source_job_id: "260436",
    canonical_hash: "burnsmcd_hash_260436_project_assistant_gfs",
    title: "Project Assistant - GFS",
    company_id: burnsCompany.id,
    company_name: burnsCompany.name,
    description: jobDescription,
    description_clean: jobDescription,
    location: "Mumbai, IND",
    city: "Mumbai",
    region: "Maharashtra",
    country_code: "US", // Mapped to primary global operating entity for discovery in engineering hubs
    remote_type: "ONSITE",
    employment_type: "FULL_TIME",
    category_id: "cat_eng",
    category_slug: "engineering",
    category_name: "Engineering",
    salary_min: null,
    salary_max: null,
    salary_currency: "USD",
    job_url: exactApplyUrl,
    apply_url: exactApplyUrl,
    source_url: sourceUrl,
    applyUrl: exactApplyUrl,
    publishedAt: new Date().toISOString(),
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    sponsorship_score: 85,
    sponsorship_label: "Possible",
    sponsorship_positive_evidence: JSON.stringify([
      "Burns & McDonnell Global Facilities (GFS) unit executes major North America hyper-scale datacenters, aviation, food & consumer product facilities",
      "Direct Official Employer ATS Application Link provided (burnsmcd.jobs)",
      "Global practice engineering and project controls mobility"
    ]),
    sponsorship_negative_evidence: JSON.stringify([
      "Individual international relocation/sponsorship subject to internal enterprise mobility guidelines"
    ]),
    visa_keywords: JSON.stringify([
      "Burns & McDonnell Direct Careers",
      "Global Facilities GFS Practice",
      "EcoSys Project Management Controls",
      "North America Engineering Facilities"
    ]),
    quality_score: 95,
    status: "active",
    is_featured: 1,
    isExpired: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Remove existing if already present
  data.jobs = (data.jobs || []).filter((j: any) => j.id !== jobId && j.source_job_id !== "260436");
  data.jobs.unshift(newJob);

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
  console.log("Successfully listed and indexed 'Project Assistant - GFS' at Burns & McDonnell!");
}

run().catch(console.error);
