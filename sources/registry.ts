import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "./base/JobSourceAdapter";
import { USAJobsAdapter }   from "./usajobs/USAJobsAdapter";
import { AshbyAdapter }     from "./ashby/AshbyAdapter";
import { WorkableAdapter }  from "./workable/WorkableAdapter";
import { AdzunaAdapter }    from "./adzuna/AdzunaAdapter";
import { RemotiveAdapter }  from "./remotive/RemotiveAdapter";
import { ArbeitnowAdapter } from "./arbeitnow/ArbeitnowAdapter";
import { JoobleAdapter }    from "./jooble/JoobleAdapter";

/**
 * Central Source Registry & Execution Orchestrator
 *
 * Registered adapters (in priority order):
 *  1. Arbeitnow   — FREE, no key, visa_sponsorship:true tagged — HIGHEST PRECISION
 *  2. Remotive    — FREE, no key, tech/engineering remote jobs — HIGH VOLUME
 *  3. Adzuna      — Paid API (keys in .env), UK/US/AU/CA/NZ    — BROAD COVERAGE
 *  4. USAJobs     — FREE federal API (key in .env), US only    — US GOVERNMENT
 *  5. Jooble      — FREE tier API (key in .env), 71 countries  — GLOBAL REACH
 *  6. Ashby ATS   — ATS feed integration                       — DIRECT EMPLOYER
 *  7. Workable    — ATS feed integration                       — DIRECT EMPLOYER
 */
export class SourceRegistry {
  private adapters: Map<string, JobSourceAdapter> = new Map();

  constructor() {
    // ── Free zero-key sources (always active) ──────────────────────────────
    this.register(new ArbeitnowAdapter());   // visa_sponsorship:true flag = highest precision
    this.register(new RemotiveAdapter());    // tech/engineering remote jobs, no key needed

    // ── API key sources (active when env vars set) ─────────────────────────
    this.register(new AdzunaAdapter());
    this.register(new USAJobsAdapter());
    this.register(new JoobleAdapter());

    // ── ATS adapters ───────────────────────────────────────────────────────
    this.register(new AshbyAdapter());
    this.register(new WorkableAdapter());
  }

  register(adapter: JobSourceAdapter): void {
    this.adapters.set(adapter.getSourceId(), adapter);
  }

  getAdapter(sourceId: string): JobSourceAdapter | undefined {
    return this.adapters.get(sourceId);
  }

  getAllAdapters(): JobSourceAdapter[] {
    return Array.from(this.adapters.values());
  }

  getActiveAdapters(): JobSourceAdapter[] {
    return this.getAllAdapters().filter((a) => a.isEnabled());
  }

  /**
   * Returns a summary of all registered adapters and their enabled status.
   * Useful for the Admin Sources page.
   */
  getAdapterStatus(): Array<{ id: string; name: string; enabled: boolean; requiresKey: boolean }> {
    return this.getAllAdapters().map((a) => ({
      id:          a.getSourceId(),
      name:        a.getName(),
      enabled:     a.isEnabled(),
      requiresKey: a.getSourceId() === "adzuna" || a.getSourceId() === "usajobs" || a.getSourceId() === "jooble",
    }));
  }

  /**
   * Execute an adapter safely with error isolation (Section 62)
   */
  async executeSource(sourceId: string, context: SourceExecutionContext): Promise<IngestionResult> {
    const adapter = this.getAdapter(sourceId);
    if (!adapter) {
      return {
        sourceName: sourceId,
        jobsFetched: 0,
        jobs: [],
        hasMore: false,
        errors: [`Source adapter '${sourceId}' is not registered.`],
      };
    }

    const startTime = Date.now();
    console.log(`[source=${adapter.getSourceId()}] [event=start_fetch]`);

    try {
      const result = await adapter.fetchJobs(context);
      const elapsed = Date.now() - startTime;
      console.log(
        `[source=${adapter.getSourceId()}] [event=fetch_complete] [count=${result.jobs.length}] [duration=${elapsed}ms] [status=success]`
      );
      return result;
    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      console.error(
        `[source=${adapter.getSourceId()}] [event=fetch_failed] [duration=${elapsed}ms] [error=${err.message}]`
      );
      return {
        sourceName: adapter.getName(),
        jobsFetched: 0,
        jobs: [],
        hasMore: false,
        errors: [err.message],
      };
    }
  }

  /**
   * Execute all active sources in parallel without letting one failure stop others.
   */
  async executeAllActive(context: SourceExecutionContext): Promise<IngestionResult[]> {
    const active   = this.getActiveAdapters();
    const promises = active.map((adapter) => this.executeSource(adapter.getSourceId(), context));
    return Promise.all(promises);
  }
}
