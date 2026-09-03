import dotenv from "dotenv";
import path from "path";
import { backendAdminSupervisor } from "../lib/services/backendAdminSupervisor";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  const args = process.argv.slice(2);
  const shouldNotify = !args.includes("--no-notify");
  const targetEmail = process.env.ADMIN_EMAIL || "admin@sponsorajobs.com";

  console.log("================================================================================");
  console.log("🛡️  SPONSORAJOB EXECUTIVE BACKEND SUPERVISOR — 6-PILLAR SYSTEM INSPECTION");
  console.log("================================================================================");

  const start = Date.now();
  const audit = await backendAdminSupervisor.performFullSystemInspection();
  const duration = ((Date.now() - start) / 1000).toFixed(2);

  console.log(`\n📋 AUDIT ID: ${audit.auditId}`);
  console.log(`⏱️ TIMESTAMP: ${audit.timestamp}`);
  console.log(`🏆 OVERALL HEALTH: ${audit.overallHealthScore}/100 (GRADE: ${audit.overallGrade})\n`);

  console.log("────────────────────────────────────────────────────────────────────────────────");
  console.log("🏛️  SIX BACKEND PILLARS STATUS:");
  console.log("────────────────────────────────────────────────────────────────────────────────");
  
  const pillars = [
    { label: "1. Database & Job Catalog", p: audit.pillars.database },
    { label: "2. Ingestion & Multi-Source", p: audit.pillars.ingestion },
    { label: "3. SEO & Search Engine Indexing", p: audit.pillars.seo },
    { label: "4. Applicant Tracking & Candidate Auth", p: audit.pillars.usersAndAuth },
    { label: "5. Transactional Email & Resend/Gmail Relay", p: audit.pillars.emailAndCommunications },
    { label: "6. Security & Route Sentinels", p: audit.pillars.securityAndSentinels },
  ];

  for (const item of pillars) {
    const icon = item.p.status === "HEALTHY" ? "🟢" : item.p.status === "DEGRADED" ? "🟡" : "🔴";
    console.log(`${icon} ${item.label.padEnd(46)} | Score: ${item.p.score}/100 | Status: ${item.p.status}`);
  }

  console.log("\n────────────────────────────────────────────────────────────────────────────────");
  console.log("📊 LIVE SYSTEM TELEMETRY:");
  console.log("────────────────────────────────────────────────────────────────────────────────");
  console.log(`• Active Job Listings:      ${audit.liveMetrics.activeJobs}`);
  console.log(`• Verified Employers:       ${audit.liveMetrics.totalCompanies}`);
  console.log(`• System Routes Audited:    ${audit.liveMetrics.totalRoutesAudited} (Broken 404s: ${audit.liveMetrics.brokenRoutesCount})`);
  console.log(`• Resend Daily Quota:       ${audit.liveMetrics.resendUsedToday}/${audit.liveMetrics.resendDailyLimit} Used`);
  console.log(`• Active Email Provider:    ${audit.liveMetrics.activeEmailProvider.toUpperCase()}`);
  console.log(`• Supabase Candidates:      ${audit.liveMetrics.supabaseCandidateCount}`);
  console.log(`• Inspection Completed In:  ${duration}s`);

  if (shouldNotify) {
    console.log(`\n📨 Dispatching Hourly Executive Update to: ${targetEmail}...`);
    const updateResult = await backendAdminSupervisor.dispatchHourlyExecutiveUpdate(targetEmail);
    console.log(`✅ Dispatched successfully! Message:`, updateResult.dispatchResult?.messageId || "Dispatched");
  }

  console.log("================================================================================\n");
}

main().catch((err) => {
  console.error("Fatal error running Backend Admin Supervisor:", err);
  process.exit(1);
});
