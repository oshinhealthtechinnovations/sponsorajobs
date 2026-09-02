import dotenv from "dotenv";
import path from "path";
import { seoAutomationEngine } from "../lib/seo/seoAutomationEngine";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function executeCycle(options: { notify: boolean; dryRun: boolean }) {
  console.log("==========================================================");
  console.log("🚀 [SponsorAJobs] Autonomous SEO Engine Self-Trigger Active");
  console.log("==========================================================");

  const start = Date.now();
  const result = await seoAutomationEngine.runAutomatedSeoCycle({
    notifyAdmin: options.notify,
    dryRun: options.dryRun,
  });

  const duration = ((Date.now() - start) / 1000).toFixed(2);

  console.log("\n📊 SEO AUTOMATION CYCLE RESULTS:");
  console.log(`• Cycle ID:           ${result.cycleId}`);
  console.log(`• Overall Score:      ${result.healthScore}/100 (Grade: ${result.grade})`);
  console.log(`• Routes Audited:     ${result.routeSummary.healthy}/${result.routeSummary.totalAudited} Healthy (Broken: ${result.routeSummary.broken})`);
  console.log(`• IndexNow Pings:     ${result.searchEnginePings.indexNowSubmitted} URLs broadcasted (${result.searchEnginePings.indexNowStatus})`);
  console.log(`• Google Pings:       ${result.searchEnginePings.googleIndexingPings} priority job endpoints notified`);
  console.log(`• Sitemap Pings:      Google: ${result.searchEnginePings.sitemapPings.google ? "✅" : "❌"}, Bing: ${result.searchEnginePings.sitemapPings.bing ? "✅" : "❌"}`);
  console.log(`• Schema Compliance:  JobPosting: ${result.schemaAudit.jobPostingValid ? "✅" : "❌"}, Breadcrumbs: ${result.schemaAudit.breadcrumbValid ? "✅" : "❌"}`);
  console.log(`• Total Active Jobs:  ${result.catalogSeoStats.totalActiveJobs}`);
  console.log(`• Execution Time:     ${duration}s`);
  console.log("==========================================================\n");

  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const isDaemon = args.includes("--daemon");
  const isDryRun = args.includes("--dry-run");
  const shouldNotify = !args.includes("--no-notify");

  const intervalIndex = args.indexOf("--interval");
  const intervalSeconds = intervalIndex !== -1 && args[intervalIndex + 1]
    ? parseInt(args[intervalIndex + 1], 10)
    : 14400; // default 4 hours

  // Execute first cycle immediately
  await executeCycle({ notify: shouldNotify, dryRun: isDryRun });

  if (isDaemon) {
    console.log(`🔄 [SeoDaemon] Self-trigger active. Next cycle in ${intervalSeconds} seconds (${(intervalSeconds / 3600).toFixed(1)} hours)...\n`);
    setInterval(async () => {
      try {
        console.log(`⏰ [SeoDaemon:SelfTrigger] Scheduled interval reached. Launching cycle...`);
        await executeCycle({ notify: shouldNotify, dryRun: isDryRun });
        console.log(`💤 [SeoDaemon] Cycle complete. Sleeping for ${intervalSeconds} seconds...\n`);
      } catch (err) {
        console.error("❌ [SeoDaemon:Error] Failed to execute scheduled SEO cycle:", err);
      }
    }, intervalSeconds * 1000);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal error running SEO automation:", err);
  process.exit(1);
});
