import fs from "fs";
import path from "path";
import { analyzeCVIntelligence, detectCandidateOccupationFromCV } from "../lib/services/atsIntelligenceEngine";
import { rankJobsForCandidate } from "../lib/services/cvJobMatchEngine";
import { CandidateProfileRecord } from "../lib/types/database";

const rawJobs = JSON.parse(fs.readFileSync(path.join(process.cwd(), "lib/db/realJobsData.json"), "utf8")).jobs;

const PROFILES = [
  {
    name: "Senior Full Stack Developer",
    text: `
ALEX RIVERA
Senior Full Stack Engineer | alex.rivera@example.com | London, UK
SUMMARY
Full Stack Engineer with 6+ years of experience designing and shipping scalable web applications. Strong expertise in TypeScript, React, Next.js, Node.js, and PostgreSQL.
SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
Frontend: React.js, Next.js, Redux Toolkit, TailwindCSS
Backend: Node.js, Express, NestJS, REST APIs, GraphQL, PostgreSQL, Redis
Cloud & DevOps: AWS (ECS, S3, RDS, Lambda), Docker, CI/CD (GitHub Actions)
EXPERIENCE
Senior Full Stack Engineer | FinTech Innovations Ltd (2022 - Present)
• Architected microservices handling 2M+ daily transactions using Node.js and PostgreSQL.
• Led migration of legacy monolith to Next.js 14.
    `,
  },
  {
    name: "Data Scientist & Machine Learning Lead",
    text: `
DR. PRIYA SHARMA
Lead Data Scientist & ML Engineer | priya.sharma@example.com | Cambridge, UK
SUMMARY
Staff Data Scientist with 7+ years of experience in predictive modeling, deep learning (PyTorch, TensorFlow), NLP, and production ML pipelines.
SKILLS
Languages: Python, SQL, R, Bash
ML & AI: PyTorch, TensorFlow, Scikit-Learn, XGBoost, Transformers, HuggingFace, LLMs
Data & Cloud: Apache Spark, BigQuery, Snowflake, Pandas, NumPy, AWS SageMaker
EXPERIENCE
Lead Data Scientist | HealthAI Systems (2021 - Present)
• Built clinical NLP models processing 500k+ medical records with 94.2% accuracy.
    `,
  },
  {
    name: "Principal Cloud & DevOps Architect",
    text: `
MARCUS CHEN
Principal Cloud & DevOps Architect | marcus.chen@example.com | Manchester, UK
SUMMARY
Cloud Infrastructure Architect with 8+ years of enterprise experience designing fault-tolerant AWS/Azure architectures, Kubernetes orchestration, and GitOps automation.
SKILLS
Cloud: AWS, Microsoft Azure, Google Cloud Platform (GCP)
DevOps & IaC: Terraform, Ansible, Docker, Kubernetes (K8s), Helm, ArgoCD, GitHub Actions
Monitoring: Prometheus, Grafana, Datadog, ELK Stack
Languages: Go, Python, Bash, Shell scripting
EXPERIENCE
Principal DevOps Architect | Enterprise Cloud Systems (2021 - Present)
• Orchestrated zero-downtime migration of 140+ microservices to multi-region Kubernetes clusters on AWS.
    `,
  },
  {
    name: "Project Planning & Controls Specialist (Sumit Raj)",
    text: `
SUMIT RAJ
Project Coordinator | Project Planning & Controls | er.rajsumit49@gmail.com | Indore, India
SUMMARY
Project Controls and Planning professional with 5+ years of experience in project planning, scheduling, project controls, cost monitoring across infrastructure projects.
SKILLS
Project Planning & Scheduling: Primavera P6, Microsoft Project, WBS, Baseline Programme Development, CPM, Earned Value Management (EVM), SPI/CPI analysis, S-Curve Analysis
Cost & Financial Controls: Budget Monitoring, Cost Control, Cost Forecasting
Engineering Software: AutoCAD, Revit, STAAD Pro
EXPERIENCE
Project Coordinator | Armour Construction (Dec 2024 - Present)
• Lead project planning, scheduling, and project controls activities for BSNL OFC Infrastructure Project.
    `,
  },
];

console.log("===============================================================");
console.log("      UNIVERSAL MATCH ENGINE MULTI-PROFILE VERIFICATION        ");
console.log("===============================================================\n");

PROFILES.forEach((p) => {
  const intel = analyzeCVIntelligence(p.text, null, "GB");
  const detectedOcc = detectCandidateOccupationFromCV(p.text);

  const candidateProfile: CandidateProfileRecord = {
    id: `cand_${p.name.replace(/\s+/g, "_").toLowerCase()}`,
    user_id: null,
    candidate_email: intel.profile.email || null,
    primary_occupation: detectedOcc.name,
    primary_soc_code: detectedOcc.ukSocCode,
    seniority: intel.profile.seniority,
    total_experience_years: intel.profile.estimatedYearsExperience,
    highest_degree: intel.profile.highestDegree,
    degree_field: "STEM",
    detected_skills: intel.profile.technicalSkills,
    preferred_country: "GB",
    sponsorship_preference: "required",
    profile_version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const matchRes = rankJobsForCandidate(candidateProfile, rawJobs, { countries: ["GB", "ALL"] });

  console.log(`\n---------------------------------------------------------------`);
  console.log(`CANDIDATE: [${p.name}]`);
  console.log(`Detected Occ: ${detectedOcc.name} (SOC ${detectedOcc.ukSocCode})`);
  console.log(`Skills (${intel.profile.technicalSkills.length}): ${intel.profile.technicalSkills.slice(0, 6).join(", ")}`);
  console.log(`Top 3 Recommended Matches:`);

  matchRes.recommendations.slice(0, 3).forEach((rec, idx) => {
    const comp = rec.job.company?.name || (rec.job as any).company_name || "Employer";
    console.log(`  #${idx + 1}: ${rec.job.title} at ${comp}`);
    console.log(`     Match: ${rec.sponsorJobMatchScore}% | Skills: ${rec.skillMatchScore}% | Occ: ${rec.occupationMatchScore}% | Exp: ${rec.experienceMatchScore}%`);
  });
});
