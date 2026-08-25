import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import { normalizeCountryCode, normalizeRemoteType, normalizeEmploymentType } from "@/normalization";

/**
 * Public Ashby ATS Job Board API Adapter
 * Reference: Section 39 & 40
 */
export class AshbyAdapter implements JobSourceAdapter {
  private enabled: boolean;

  constructor(config?: { enabled?: boolean }) {
    this.enabled = config?.enabled ?? (process.env.ENABLE_ATS === "true");
  }

  getName(): string {
    return "Ashby ATS";
  }

  getSourceId(): string {
    return "ashby";
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getTermsUrl(): string {
    return "https://www.ashbyhq.com/terms";
  }

  isAttributionRequired(): boolean {
    return false;
  }

  getRateLimitPerMinute(): number {
    return 30;
  }

  async fetchJobs(context: SourceExecutionContext): Promise<IngestionResult> {
    const orgId = context.credentials?.orgId || context.credentials?.identifier;
    if (!orgId) {
      return {
        sourceName: this.getName(),
        jobsFetched: 0,
        jobs: [],
        hasMore: false,
        errors: ["Ashby organization ID not specified in context."],
      };
    }

    try {
      const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(orgId)}`;
      const response = await fetch(url, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Ashby HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const jobs = data?.jobs || [];
      const normalizedList: NormalizedJob[] = [];

      for (const job of jobs) {
        const norm = this.normalizeJob({ ...job, orgName: data?.organization?.name || orgId });
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
    if (!rawJob || !rawJob.id) return null;

    const title = rawJob.title || "";
    const companyName = rawJob.orgName || "Company";
    const jobUrl = rawJob.jobUrl || `https://jobs.ashbyhq.com/${rawJob.orgName}/${rawJob.id}`;
    const applyUrl = rawJob.applyUrl || jobUrl;

    const address = rawJob.address?.postalAddress || {};
    const city = address.addressLocality || rawJob.locationName?.split(",")[0]?.trim() || "";
    const countryCode = normalizeCountryCode(address.addressCountry || rawJob.locationName || "");

    const desc = rawJob.descriptionHtml || rawJob.descriptionPlain || title;

    return {
      sourceJobId: rawJob.id,
      sourceId: this.getSourceId(),
      title,
      companyName,
      description: desc,
      location: rawJob.locationName || `${city}, ${countryCode}`,
      city,
      region: address.addressRegion,
      countryCode: countryCode === "UNKNOWN" ? "US" : countryCode,
      remoteType: rawJob.isRemote ? "REMOTE" : normalizeRemoteType(rawJob.employmentType || ""),
      employmentType: normalizeEmploymentType(rawJob.employmentType || "FULL_TIME"),
      jobUrl,
      applyUrl,
      sourceUrl: jobUrl,
      publishedAt: rawJob.publishedAt,
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
