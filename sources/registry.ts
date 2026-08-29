import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "./base/JobSourceAdapter";
import { USAJobsAdapter }   from "./usajobs/USAJobsAdapter";
import { AshbyAdapter }     from "./ashby/AshbyAdapter";
import { WorkableAdapter }  from "./workable/WorkableAdapter";
import { GreenhouseAdapter } from "./greenhouse/GreenhouseAdapter";
import { LeverAdapter }     from "./lever/LeverAdapter";
import { AdzunaAdapter }    from "./adzuna/AdzunaAdapter";
import { RemotiveAdapter }  from "./remotive/RemotiveAdapter";
import { ArbeitnowAdapter } from "./arbeitnow/ArbeitnowAdapter";
import { JoobleAdapter }    from "./jooble/JoobleAdapter";
import { RemoteOKAdapter }  from "./remoteok/RemoteOKAdapter";
import { JobicyAdapter }    from "./jobicy/JobicyAdapter";
import { HimalayasAdapter } from "./himalayas/HimalayasAdapter";
import { TheMuseAdapter }   from "./themuse/TheMuseAdapter";

/**
 * Central Source Registry & Execution Orchestrator
 *
 * Registered adapters (in priority order):
 *  1. Greenhouse  — DIRECT COMPANY ATS (Stripe, Figma, Monzo, Canva, Deliveroo, Wise)
 *  2. Lever       — DIRECT COMPANY ATS (Revolut, Spotify, Atlassian, Eventbrite)
 *  3. Ashby       — DIRECT COMPANY ATS (Notion, Linear, Ramp, Deel, Retool)
 *  4. Arbeitnow   — FREE, no key, visa_sponsorship:true tagged
 *  5. RemoteOK    — FREE, no key, global tech & engineering jobs
 *  6. Jobicy      — FREE, no key, geo-targeted remote jobs
 *  7. Himalayas   — FREE, no key, curated remote tech jobs
 *  8. The Muse    — FREE, no key, corporate employer postings
 *  9. Adzuna      — Active API, UK/US/AU/CA/NZ
 * 10. USAJobs     — Active federal API, US direct federal hire
 * 11. Jooble      — Active API, global reach
 * 12. Remotive    — Tech/engineering remote jobs
 * 13. Workable    — ATS feed integration
 */
export class SourceRegistry {
  private adapters: Map<string, JobSourceAdapter> = new Map();

  constructor() {
    // ── Direct Company ATS Sources (100% Direct Employer Application URLs) ─
    this.register(new GreenhouseAdapter());
    this.register(new LeverAdapter());
    this.register(new AshbyAdapter());

    // ── Free zero-key sources ──────────────────────────────────────────────
    this.register(new ArbeitnowAdapter());
    this.register(new RemoteOKAdapter());
    this.register(new JobicyAdapter());
    this.register(new HimalayasAdapter());
    this.register(new TheMuseAdapter());
    this.register(new RemotiveAdapter());

    // ── Active API key sources ─────────────────────────────────────────────
    this.register(new AdzunaAdapter());
    this.register(new USAJobsAdapter());
    this.register(new JoobleAdapter());

    // ── ATS adapters ───────────────────────────────────────────────────────
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
