import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import { normalizeCountryCode, normalizeRemoteType, normalizeEmploymentType } from "@/normalization";

/**
 * Public Workable ATS Widget API Adapter
 * Reference: Section 39 & 40
 */
export class WorkableAdapter implements JobSourceAdapter {
  private enabled: boolean;

  constructor(config?: { enabled?: boolean }) {
    this.enabled = config?.enabled ?? (process.env.ENABLE_ATS === "true");
  }

  getName(): string {
    return "Workable ATS";
  }

  getSourceId(): string {
    return "workable";
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getTermsUrl(): string {
    return "https://www.workable.com/terms";
  }

  isAttributionRequired(): boolean {
    return false;
  }

  getRateLimitPerMinute(): number {
    return 30;
  }

  async fetchJobs(context: SourceExecutionContext): Promise<IngestionResult> {
    const accountId = context.credentials?.accountId || context.credentials?.identifier;
    if (!accountId) {
      return {
        sourceName: this.getName(),
        jobsFetched: 0,
        jobs: [],
        hasMore: false,
        errors: ["Workable account ID not specified in context."],
      };
    }

    try {
      const url = `https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(accountId)}`;
      const response = await fetch(url, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Workable HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const jobs = data?.jobs || [];
      const normalizedList: NormalizedJob[] = [];

      for (const job of jobs) {
        const norm = this.normalizeJob({ ...job, companyName: data?.name || accountId });
        if (norm && this.validateJob(norm)) {
          normalizedList.push(norm);
        }
      }

      return {
        sourceName: this.getName(),
        jobsFetched: jobs.length,
        jobs: normalizedList,
        hasMore: false,
      };
    } catch (err: any) {
      return {
        sourceName: this.getName(),
        jobsFetched: 0,
        jobs: [],
        hasMore: false,
        errors: [err.message],
      };
    }
  }

  normalizeJob(rawJob: any): NormalizedJob | null {
    if (!rawJob || !rawJob.shortcode) return null;

    const title = rawJob.title || "";
    const companyName = rawJob.companyName || "Company";
    const jobUrl = rawJob.url || `https://apply.workable.com/${companyName}/j/${rawJob.shortcode}`;
    const applyUrl = jobUrl;

    const city = rawJob.city || "";
    const region = rawJob.state || rawJob.region || "";
    const countryCode = normalizeCountryCode(rawJob.country || "");

    const desc = rawJob.description || rawJob.requirements || title;

    return {
      sourceJobId: rawJob.shortcode,
      sourceId: this.getSourceId(),
      title,
      companyName,
      description: desc,
      location: `${city ? city + ", " : ""}${countryCode}`,
      city,
      region,
      countryCode: countryCode === "UNKNOWN" ? "US" : countryCode,
      remoteType: rawJob.telecommuting ? "REMOTE" : normalizeRemoteType(rawJob.employment_type || ""),
      employmentType: normalizeEmploymentType(rawJob.employment_type || "FULL_TIME"),
      jobUrl,
      applyUrl,
      sourceUrl: jobUrl,
      publishedAt: rawJob.published_on,
    };
  }

  validateJob(job: NormalizedJob): boolean {
    return Boolean(
      job.title &&
      job.companyName &&
      job.applyUrl &&
      job.description.length >= 20
    );
  }
}
