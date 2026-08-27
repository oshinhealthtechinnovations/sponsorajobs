import fs from "fs";
import path from "path";
import { analyzeCVIntelligence } from "../lib/services/atsIntelligenceEngine";
import { rankJobsForCandidate } from "../lib/services/cvJobMatchEngine";
import { CandidateProfileRecord } from "../lib/types/database";

const sumitCVText = `
SUMIT RAJ
Project Coordinator | Project Planning & Controls 
+91 92382 76845 | er.rajsumit49@gmail.com | Indore – Open to Relocation
PROFESSIONAL SUMMARY
Project Controls and Planning professional with 5+ years of experience in project planning, scheduling, project controls, 
cost monitoring, performance reporting, and stakeholder coordination across telecommunications, infrastructure, 
residential, and water projects. Hands-on experience with Primavera P6, Microsoft Project, Advanced Excel, Power BI, 
Oracle ERP, and SharePoint, with expertise in WBS, baseline programme development, CPM, Earned Value Management 
(EVM), SPI/CPI analysis, schedule and cost variance analysis, resource planning, forecasting, risk monitoring, and project 
performance reporting. Experienced in monitoring project performance against baseline programmes, identifying 
schedule and cost variances, supporting corrective actions, and preparing management dashboards, progress reports, and 
executive project controls reporting. MSc in Project & Infrastructure Management from Brunel University London. 
CORE COMPETENCIES & TECHNICAL SKILLS
Project Planning & Scheduling: Primavera P6, Microsoft Project, WBS, Baseline Programme Development, Programme 
Updates, Milestone Scheduling, Look-Ahead Planning, Resource Loading, Progress Tracking, Forecasting, Recovery Planning 
Project Controls: Earned Value Management (EVM), SPI, CPI, CPM, Schedule Variance Analysis, Cost Variance Analysis, S-Curve Analysis, Progress Measurement, Schedule Monitoring, Delay Analysis, Schedule Risk Analysis 
Cost & Financial Controls: Budget Monitoring, Cost Control, Cost Tracking, Cost Forecasting, Cost Variance Analysis, 
Resource Cost Monitoring, Financial Reporting, Invoice Coordination, Timesheet Management 
Reporting & Analytics: Advanced Excel, Power BI, Power Query, Power Pivot, KPI Dashboards, Management Dashboards, 
Progress Reporting, Performance Reporting, Executive Reporting, Data Analysis 
Engineering Software: AutoCAD, Revit, STAAD Pro 
EDUCATION
MSc Project & Infrastructure Management Brunel University London, United Kingdom
Bachelor of Engineering – Civil Engineering IES IPS Academy, India 
`;

const intel = analyzeCVIntelligence(sumitCVText, null, "GB");
console.log("=== CANDIDATE INTELLIGENCE EXTRACTED ===");
console.log("Target Role:", intel.jobMatchDiagnostics.targetRoleTitle);
console.log("SOC Code:", intel.sponsorshipDiagnostics.occupationRule.socCode);
console.log("Seniority:", intel.profile.seniority);
console.log("Years Exp:", intel.profile.estimatedYearsExperience);
console.log("Technical Skills Detected:", intel.profile.technicalSkills);

const rawJobs = JSON.parse(fs.readFileSync(path.join(process.cwd(), "lib/db/realJobsData.json"), "utf8")).jobs;

const candidateProfile: CandidateProfileRecord = {
  id: "cand_test_sumit",
  user_id: null,
  candidate_email: intel.profile.email || null,
  primary_occupation: intel.jobMatchDiagnostics.targetRoleTitle,
  primary_soc_code: intel.sponsorshipDiagnostics.occupationRule.socCode,
  seniority: intel.profile.seniority,
  total_experience_years: intel.profile.estimatedYearsExperience,
  highest_degree: intel.profile.highestDegree,
  degree_field: "Civil / Infrastructure Management",
  detected_skills: intel.profile.technicalSkills,
  preferred_country: "GB",
  sponsorship_preference: "required",
  profile_version: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const matchResult = rankJobsForCandidate(candidateProfile, rawJobs, { countries: ["GB", "ALL"] });

console.log("\n=== TOP 5 MATCHED JOBS FOR SUMIT RAJ ===");
matchResult.recommendations.slice(0, 10).forEach((rec, idx) => {
  console.log(`\n#${idx + 1}: ${rec.job.title} at ${rec.job.company.name}`);
  console.log(`  SponsorJob Match: ${rec.sponsorJobMatchScore}% (Pure: ${rec.jobMatchScore}%)`);
  console.log(`  Breakdown: Skills: ${rec.skillMatchScore}% | Occ: ${rec.occupationMatchScore}% | Exp: ${rec.experienceMatchScore}%`);
});
