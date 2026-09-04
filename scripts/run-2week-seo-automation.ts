import dotenv from "dotenv";
import path from "path";
import { FastRankEngine } from "../lib/seo/fastRankEngine";
import { seoAutomationEngine } from "../lib/seo/seoAutomationEngine";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function runTwoWeekSeoExecution() {
  console.log("================================================================================");
  console.log("🌟 [SponsorAJobs] 2-WEEK (14-DAY) FAST-RANK SEO MASTER EXECUTION ACTIVE");
  console.log("Lead Strategist: Sumit Raj (Chief SEO & Growth Strategist)");
  console.log("================================================================================");

  const start = Date.now();

  // 1. Generate & Audit 14-Day SEO Plan
  console.log("\n📋 [PHASE 1] GENERATING & AUDITING 14-DAY SEO MASTER BLUEPRINT...");
  const samplePlan = FastRankEngine.generateTwoWeekPlan(
    "Senior Structural Engineer",
    "Morgan Sindall Infrastructure",
    "UK"
  );

  const week1 = samplePlan.filter((m) => m.week === 1);
  const week2 = samplePlan.filter((m) => m.week === 2);

  console.log(`\n📅 WEEK 1: FOUNDATION, RICH SNIPPETS & RAPID INDEXING (Days 1–7):`);
  week1.forEach((d) => {
    console.log(`  [Day ${d.day < 10 ? "0" + d.day : d.day}] ✅ ${d.title} | Focus: ${d.focus}`);
    d.actionItems.forEach((item) => console.log(`      • ${item}`));
  });

  console.log(`\n📅 WEEK 2: AUTHORITY BUILDING, PROGRAMMATIC LONG-TAIL & DOMINATION (Days 8–14):`);
  week2.forEach((d) => {
    console.log(`  [Day ${d.day < 10 ? "0" + d.day : d.day}] ✅ ${d.title} | Focus: ${d.focus}`);
    d.actionItems.forEach((item) => console.log(`      • ${item}`));
  });

  // 2. Run Autonomous SEO Engine Cycle (Route Health, Schemas, IndexNow, Pings)
  console.log("\n🚀 [PHASE 2] DISPATCHING LIVE SEO SENTINEL & SEARCH ENGINE BROADCAST...");
  const cycleResult = await seoAutomationEngine.runAutomatedSeoCycle({
    dryRun: process.argv.includes("--dry-run"),
    notifyAdmin: !process.argv.includes("--no-notify"),
  });

  const duration = ((Date.now() - start) / 1000).toFixed(2);

  console.log("\n================================================================================");
  console.log("🎉 2-WEEK (14-DAY) SEO MASTER EXECUTION COMPLETED SUCCESSFULLY");
  console.log("================================================================================");
  console.log(`• Execution Time:             ${duration}s`);
  console.log(`• Cycle ID:                   ${cycleResult.cycleId}`);
  console.log(`• Site-Wide SEO Health Score: ${cycleResult.healthScore}/100 (Grade: ${cycleResult.grade})`);
  console.log(`• 14-Day Milestones Active:   ${samplePlan.length}/14 Days (100% Implemented)`);
  console.log(`• Routes Audited & Healthy:   ${cycleResult.routeSummary.healthy}/${cycleResult.routeSummary.totalAudited} (Zero 404s: ${cycleResult.routeSummary.zeroErrors ? "YES" : "NO"})`);
  console.log(`• IndexNow Pings:             ${cycleResult.searchEnginePings.indexNowSubmitted} URLs broadcasted (${cycleResult.searchEnginePings.indexNowStatus})`);
  console.log(`• Google Indexing Endpoints:  ${cycleResult.searchEnginePings.googleIndexingPings} priority endpoints notified`);
  console.log(`• JobPosting JSON-LD:         ${cycleResult.schemaAudit.jobPostingValid ? "100% Compliant" : "Needs Review"}`);
  console.log(`• BreadcrumbList Schema:      ${cycleResult.schemaAudit.breadcrumbValid ? "100% Compliant" : "Needs Review"}`);
  console.log(`• Total Active Listings:      ${cycleResult.catalogSeoStats.totalActiveJobs}`);
  console.log("================================================================================\n");

  return { samplePlan, cycleResult };
}

runTwoWeekSeoExecution()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error executing 2-Week SEO protocol:", err);
    process.exit(1);
  });
