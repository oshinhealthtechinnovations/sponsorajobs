import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "./base/JobSourceAdapter";
import { USAJobsAdapter } from "./usajobs/USAJobsAdapter";
import { AshbyAdapter } from "./ashby/AshbyAdapter";
import { WorkableAdapter } from "./workable/WorkableAdapter";
import { AdzunaAdapter } from "./adzuna/AdzunaAdapter";

/**
 * Central Source Registry & Execution Orchestrator
 * As specified in Master Build Prompt Sections 34, 62, 63, 81
 */
export class SourceRegistry {
  private adapters: Map<string, JobSourceAdapter> = new Map();

  constructor() {
    // Register standard adapters
    this.register(new USAJobsAdapter());
    this.register(new AshbyAdapter());
    this.register(new WorkableAdapter());
    this.register(new AdzunaAdapter());
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
   * Execute all active sources in parallel without letting one failure stop others
   */
  async executeAllActive(context: SourceExecutionContext): Promise<IngestionResult[]> {
    const active = this.getActiveAdapters();
    const promises = active.map((adapter) => this.executeSource(adapter.getSourceId(), context));
    return Promise.all(promises);
  }
}
