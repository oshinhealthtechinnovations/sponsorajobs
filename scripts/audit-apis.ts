import { GreenhouseAdapter } from "../sources/greenhouse/GreenhouseAdapter";
import { LeverAdapter } from "../sources/lever/LeverAdapter";
import { AshbyAdapter } from "../sources/ashby/AshbyAdapter";
import { USAJobsAdapter } from "../sources/usajobs/USAJobsAdapter";
import { AdzunaAdapter } from "../sources/adzuna/AdzunaAdapter";
import { JoobleAdapter } from "../sources/jooble/JoobleAdapter";
import { ArbeitnowAdapter } from "../sources/arbeitnow/ArbeitnowAdapter";
import { RemotiveAdapter } from "../sources/remotive/RemotiveAdapter";

async function auditAllApis() {
  console.log("==================== LIVE API AUDIT REPORT ====================");

  const sources = [
    { name: "Greenhouse ATS", adapter: new GreenhouseAdapter({ enabled: true }) },
    { name: "Lever ATS", adapter: new LeverAdapter({ enabled: true }) },
    { name: "Ashby ATS", adapter: new AshbyAdapter({ enabled: true }) },
    { name: "USAJobs Federal API", adapter: new USAJobsAdapter({ enabled: true, email: "oshinhealthtechinnovations@gmail.com", apiKey: "tTjBDekl7VpbMyoaAJEDasI3+W44QV7DQ2ZO7lIpplY=" }) },
    { name: "Adzuna API", adapter: new AdzunaAdapter({ enabled: true, appId: "ba1d34a6", appKey: "478146c510d2762286ad442bd9414644" }) },
    { name: "Jooble API", adapter: new JoobleAdapter({ enabled: true, apiKey: "cfc868f0-452d-42fc-8b06-6df99d9bc074" }) },
    { name: "Arbeitnow API", adapter: new ArbeitnowAdapter({ enabled: true }) },
    { name: "Remotive API", adapter: new RemotiveAdapter({ enabled: true }) }
  ];

  let totalJobs = 0;
  let passedCount = 0;

  for (const s of sources) {
    const start = Date.now();
    try {
      const res = await s.adapter.fetchJobs({ limit: 10 });
      const duration = Date.now() - start;
      const sample = res.jobs[0];
      passedCount++;
      totalJobs += res.jobs.length;

      console.log(`\n[STATUS: PASS] ✅ ${s.name}`);
      console.log(`  • Response Time : ${duration}ms`);
      console.log(`  • Live Jobs Got : ${res.jobs.length}`);
      if (sample) {
        console.log(`  • Sample Company: ${sample.companyName}`);
        console.log(`  • Sample Role   : ${sample.title}`);
        console.log(`  • Direct Link   : ${sample.applyUrl}`);
      }
    } catch (e: any) {
      console.log(`\n[STATUS: FAIL] ❌ ${s.name}`);
      console.log(`  • Error: ${e.message}`);
    }
  }

  console.log("\n===============================================================");
  console.log(`API Health Score: ${passedCount} / ${sources.length} (${(passedCount / sources.length * 100).toFixed(0)}%) Operational`);
  console.log(`Total Live Jobs Extracted in Audit: ${totalJobs}`);
  console.log("===============================================================");
}

auditAllApis().catch(console.error);
