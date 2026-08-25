import { NormalizedJob } from "@/lib/types/job";

export interface SourceExecutionContext {
  countryCode?: string;
  category?: string;
  limit?: number;
  credentials?: Record<string, string>;
}

export interface IngestionResult {
  sourceName: string;
  jobsFetched: number;
  jobs: NormalizedJob[];
  hasMore: boolean;
  errors?: string[];
}

/**
 * Source-Agnostic Job Ingestion Interface
 * As specified in Master Build Prompt Section 5 & 81
 */
export interface JobSourceAdapter {
  getName(): string;
  getSourceId(): string;
  isEnabled(): boolean;
  getTermsUrl(): string;
  isAttributionRequired(): boolean;
  getRateLimitPerMinute(): number;
  
  /**
   * Fetch jobs from external source, strictly respecting rate limits and error handlers
   */
  fetchJobs(context: SourceExecutionContext): Promise<IngestionResult>;

  /**
   * Normalizes raw third-party payload into standard NormalizedJob object
   */
  normalizeJob(rawJob: any): NormalizedJob | null;

  /**
   * Basic validation to reject spam, empty description, or missing mandatory fields
   */
  validateJob(job: NormalizedJob): boolean;
}
