import fs from "fs";
import path from "path";

export interface HarvesterSourceStats {
  sourceName: string;
  fetched: number;
  added: number;
  updated: number;
  durationMs: number;
  error?: string;
}

export interface ConstructionHarvestCycleResult {
  cycleId: string;
  timestamp: string;
  durationSeconds: number;
  contractorStats: HarvesterSourceStats[];
  totalFetched: number;
  totalAdded: number;
  totalUpdated: number;
  totalActiveCatalog: number;
  status: "success" | "partial" | "failed";
}

export class ConstructionHarvesterService {
  private dataPath: string;

  constructor(customDataPath?: string) {
    this.dataPath = customDataPath || path.resolve(process.cwd(), "lib/db/realJobsData.json");
  }

  public async runHarvestCycle(options?: { dryRun?: boolean }): Promise<ConstructionHarvestCycleResult> {
    const start = Date.now();
    const cycleId = `harv_cycle_${start}_${Math.random().toString(36).substring(2, 7)}`;
    const contractorStats: HarvesterSourceStats[] = [];

    // Load current real jobs data
    let currentData = { companies: [], jobs: [] };
    try {
      if (fs.existsSync(this.dataPath)) {
        currentData = JSON.parse(fs.readFileSync(this.dataPath, "utf-8"));
      }
    } catch (e: any) {
      console.error("[ConstructionHarvester] Error reading realJobsData.json:", e.message);
    }

    // Run all 7 contractors IN PARALLEL — drops worst-case 42s to ~6s (single timeout window)
    const [
      costainRes,
      wspRes,
      laingRes,
      msRes,
      skanskaRes,
      bamRes,
      gtRes,
    ] = await Promise.all([
      this.harvestCostain(currentData, options?.dryRun),   // 1. Costain Group
      this.harvestWsp(currentData, options?.dryRun),        // 2. WSP UK
      this.harvestLaing(currentData, options?.dryRun),      // 3. Laing O'Rourke
      this.harvestMorganSindall(currentData, options?.dryRun), // 4. Morgan Sindall
      this.harvestSkanska(currentData, options?.dryRun),    // 5. Skanska UK
      this.harvestBam(currentData, options?.dryRun),        // 6. BAM UK
      this.harvestGalliford(currentData, options?.dryRun),  // 7. Galliford Try
    ]);

    contractorStats.push(costainRes, wspRes, laingRes, msRes, skanskaRes, bamRes, gtRes);

    // Save back to disk if not dry run
    if (!options?.dryRun && fs.existsSync(this.dataPath)) {
      try {
        fs.writeFileSync(this.dataPath, JSON.stringify(currentData, null, 2), "utf-8");
      } catch (e: any) {
        console.error("[ConstructionHarvester] Error saving realJobsData.json:", e.message);
      }
    }

    const totalFetched = contractorStats.reduce((acc, s) => acc + s.fetched, 0);
    const totalAdded = contractorStats.reduce((acc, s) => acc + s.added, 0);
    const totalUpdated = contractorStats.reduce((acc, s) => acc + s.updated, 0);
    const durationSeconds = Number(((Date.now() - start) / 1000).toFixed(2));

    const result: ConstructionHarvestCycleResult = {
      cycleId,
      timestamp: new Date().toISOString(),
      durationSeconds,
      contractorStats,
      totalFetched,
      totalAdded,
      totalUpdated,
      totalActiveCatalog: currentData.jobs.length,
      status: contractorStats.some(s => s.error) ? "partial" : "success"
    };

    return result;
  }


  private async harvestCostain(data: any, dryRun?: boolean): Promise<HarvesterSourceStats> {
    const sStart = Date.now();
    const stats: HarvesterSourceStats = { sourceName: "Costain Group", fetched: 0, added: 0, updated: 0, durationMs: 0 };
    try {
      const url = "https://ekfa.fa.em2.oraclecloud.com/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList&finder=findReqs;siteNumber=CX_1001,limit=100,offset=0";
      const res = await fetch(url, { headers: { "Accept": "application/json", "ora-irc-language": "en" }, signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const payload = await res.json();
        const reqs = payload.items?.[0]?.requisitionList || [];
        stats.fetched = reqs.length;
        for (const r of reqs) {
          const jobId = `job_costain_${r.Id}`;
          const existing = data.jobs?.find((j: any) => j.id === jobId || j.source_job_id === `costain_${r.Id}`);
          if (existing) stats.updated++;
          else stats.added++;
        }
      }
    } catch (e: any) {
      stats.error = e.message;
    }
    stats.durationMs = Date.now() - sStart;
    return stats;
  }

  private async harvestWsp(data: any, dryRun?: boolean): Promise<HarvesterSourceStats> {
    const sStart = Date.now();
    const stats: HarvesterSourceStats = { sourceName: "WSP UK", fetched: 0, added: 0, updated: 0, durationMs: 0 };
    try {
      const url = "https://wsp.wd3.myworkdayjobs.com/wsp/jobs";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appliedFacets: { locationCountry: ["f2e609fe92974a5f9762d8d112332e16"] }, limit: 20, offset: 0 }),
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        const payload = await res.json();
        const jobPostings = payload.jobPostings || [];
        stats.fetched = jobPostings.length;
        for (const p of jobPostings) {
          const bId = p.bulletFields?.[0] || p.title;
          const existing = data.jobs?.find((j: any) => j.source_job_id === `wsp_${bId}` || (j.company_id === "comp_wsp" && j.title.includes(p.title)));
          if (existing) stats.updated++;
          else stats.added++;
        }
      }
    } catch (e: any) {
      stats.error = e.message;
    }
    stats.durationMs = Date.now() - sStart;
    return stats;
  }

  private async harvestLaing(data: any, dryRun?: boolean): Promise<HarvesterSourceStats> {
    const sStart = Date.now();
    const stats: HarvesterSourceStats = { sourceName: "Laing O'Rourke", fetched: 0, added: 0, updated: 0, durationMs: 0 };
    try {
      const url = "https://careers.laingorourke.com/search/";
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const html = await res.text();
        const matches = html.match(/href="\/job\/[^"]*\/(\d+)\/"/gi) || [];
        stats.fetched = matches.length;
        for (const m of matches) {
          const idMatch = m.match(/\/(\d+)\//);
          if (idMatch) {
            const reqId = idMatch[1];
            const existing = data.jobs?.find((j: any) => j.source_job_id === `laing_${reqId}`);
            if (existing) stats.updated++;
            else stats.added++;
          }
        }
      }
    } catch (e: any) {
      stats.error = e.message;
    }
    stats.durationMs = Date.now() - sStart;
    return stats;
  }

  private async harvestMorganSindall(data: any, dryRun?: boolean): Promise<HarvesterSourceStats> {
    const sStart = Date.now();
    const stats: HarvesterSourceStats = { sourceName: "Morgan Sindall", fetched: 0, added: 0, updated: 0, durationMs: 0 };
    try {
      const url = "https://morgansindallinfrastructure.com/wp-json/ms-jobs/v1/jobs?page=1";
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const payload = await res.json();
        const jobs = payload.jobs || [];
        stats.fetched = jobs.length;
        for (const j of jobs) {
          const reqId = j.reference || j.id;
          const existing = data.jobs?.find((x: any) => x.source_job_id === `ms_${reqId}`);
          if (existing) stats.updated++;
          else stats.added++;
        }
      }
    } catch (e: any) {
      stats.error = e.message;
    }
    stats.durationMs = Date.now() - sStart;
    return stats;
  }

  private async harvestSkanska(data: any, dryRun?: boolean): Promise<HarvesterSourceStats> {
    const sStart = Date.now();
    const stats: HarvesterSourceStats = { sourceName: "Skanska UK", fetched: 0, added: 0, updated: 0, durationMs: 0 };
    try {
      const url = "https://skanska.avature.net/careers/SearchJobs/?jobOffset=0";
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const html = await res.text();
        const articles = html.match(/<article class="article article--result"[\s\S]*?<\/article>/gi) || [];
        stats.fetched = articles.length;
        for (const art of articles) {
          const linkMatch = art.match(/<a[^>]+href="([^"]*JobDetail\/[^"]*)"[^>]*>/i);
          if (linkMatch) {
            const reqId = linkMatch[1].split("/").pop() || "";
            const existing = data.jobs?.find((x: any) => x.source_job_id === `skanska_${reqId}`);
            if (existing) stats.updated++;
            else stats.added++;
          }
        }
      }
    } catch (e: any) {
      stats.error = e.message;
    }
    stats.durationMs = Date.now() - sStart;
    return stats;
  }

  private async harvestBam(data: any, dryRun?: boolean): Promise<HarvesterSourceStats> {
    const sStart = Date.now();
    const stats: HarvesterSourceStats = { sourceName: "BAM UK", fetched: 0, added: 0, updated: 0, durationMs: 0 };
    try {
      const url = "https://www.bamcareers.com/uk/en/search-results?from=0&s=1";
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const html = await res.text();
        const idx = html.indexOf('"eagerLoadRefineSearch"');
        if (idx !== -1) {
          const jobsMatch = html.indexOf('"jobs":[', idx);
          if (jobsMatch !== -1) {
            const startBracket = jobsMatch + 7;
            let depth = 0, endIdx = -1;
            for (let i = startBracket; i < html.length; i++) {
              if (html[i] === '[') depth++;
              else if (html[i] === ']') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
            }
            if (endIdx !== -1) {
              const jobs = JSON.parse(html.slice(startBracket, endIdx));
              stats.fetched = jobs.length;
              for (const j of jobs) {
                const uniqueId = j.jobSeqNo || j.reqId;
                const existing = data.jobs?.find((x: any) => x.source_job_id === `bam_${uniqueId}`);
                if (existing) stats.updated++;
                else stats.added++;
              }
            }
          }
        }
      }
    } catch (e: any) {
      stats.error = e.message;
    }
    stats.durationMs = Date.now() - sStart;
    return stats;
  }

  private async harvestGalliford(data: any, dryRun?: boolean): Promise<HarvesterSourceStats> {
    const sStart = Date.now();
    const stats: HarvesterSourceStats = { sourceName: "Galliford Try", fetched: 0, added: 0, updated: 0, durationMs: 0 };
    try {
      const url = "https://cbct.fa.em2.oraclecloud.com/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList&finder=findReqs;siteNumber=gallifordtrycareers,limit=50,offset=0";
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", "ora-irc-language": "en", "Accept": "application/json" }, signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const payload = await res.json();
        const reqs = payload.items?.[0]?.requisitionList || [];
        stats.fetched = reqs.length;
        for (const r of reqs) {
          const existing = data.jobs?.find((x: any) => x.source_job_id === `galliford_${r.Id}`);
          if (existing) stats.updated++;
          else stats.added++;
        }
      }
    } catch (e: any) {
      stats.error = e.message;
    }
    stats.durationMs = Date.now() - sStart;
    return stats;
  }
}

export const constructionHarvesterService = new ConstructionHarvesterService();
