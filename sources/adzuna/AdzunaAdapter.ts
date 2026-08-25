import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import { normalizeCountryCode, normalizeRemoteType, normalizeEmploymentType } from "@/normalization";

/**
 * Adzuna Jobs API Adapter
 * Reference: Section 37, 78 & 79
 */
export class AdzunaAdapter implements JobSourceAdapter {
  private appId: string;
  private appKey: string;
  private enabled: boolean;

  constructor(config?: { appId?: string; appKey?: string; enabled?: boolean }) {
    this.appId = config?.appId || process.env.ADZUNA_APP_ID || "";
    this.appKey = config?.appKey || process.env.ADZUNA_APP_KEY || "";
    this.enabled = config?.enabled ?? (process.env.ENABLE_ADZUNA === "true");
  }

  getName(): string {
    return "Adzuna";
  }

  getSourceId(): string {
    return "adzuna";
  }

  isEnabled(): boolean {
    return this.enabled && Boolean(this.appId && this.appKey);
  }

  getTermsUrl(): string {
    return "https://developer.adzuna.com/terms";
  }

  isAttributionRequired(): boolean {
    return true; // Section 78: Specific attribution mandated
  }

  getRateLimitPerMinute(): number {
    return 25; // Section 79: 25/min limit
  }

  async fetchJobs(context: SourceExecutionContext): Promise<IngestionResult> {
    if (!this.isEnabled()) {
      return {
        sourceName: this.getName(),
        jobsFetched: 0,
        jobs: [],
        hasMore: false,
        errors: ["Adzuna source is disabled by default until license and API keys are confirmed."],
      };
    }

    const countryCode = (context.countryCode || "gb").toLowerCase();
    const validCountries = ["gb", "us", "au", "ca", "nz"];
    const targetCountry = validCountries.includes(countryCode) ? countryCode : "gb";

    try {
      const keyword = context.category || "engineer";
      const limit = Math.min(20, context.limit || 10);
      const url = `https://api.adzuna.com/v1/api/jobs/${targetCountry}/search/1?app_id=${encodeURIComponent(this.appId)}&app_key=${encodeURIComponent(this.appKey)}&results_per_page=${limit}&what=${encodeURIComponent(keyword)}`;

      const response = await fetch(url, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Adzuna HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const results = data?.results || [];
      const normalizedList: NormalizedJob[] = [];

      for (const item of results) {
        const norm = this.normalizeJob(item);
        if (norm && this.validateJob(norm)) {
          normalizedList.push(norm);
        }
      }

      return {
        sourceName: this.getName(),
        jobsFetched: results.length,
        jobs: normalizedList,
        hasMore: data?.count > results.length,
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

    const title = rawJob.title ? rawJob.title.replace(/<[^>]*>/g, "").trim() : "";
    const companyName = rawJob.company?.display_name || "Verified Employer";
    const jobUrl = rawJob.redirect_url || "";
    const applyUrl = jobUrl;

    const locationArea = rawJob.location?.area || [];
    const countryCode = normalizeCountryCode(locationArea[0] || "");
    const city = locationArea[locationArea.length - 1] || "";

    const desc = rawJob.description ? rawJob.description.replace(/<[^>]*>/g, "").trim() : title;

    return {
      sourceJobId: String(rawJob.id),
      sourceId: this.getSourceId(),
      title,
      companyName,
      description: desc,
      location: rawJob.location?.display_name || `${city}, ${countryCode}`,
      city,
      countryCode: countryCode === "UNKNOWN" ? "GB" : countryCode,
      remoteType: normalizeRemoteType(title + " " + desc),
      employmentType: normalizeEmploymentType(rawJob.contract_time || rawJob.contract_type || ""),
      salaryMin: rawJob.salary_min ? parseFloat(rawJob.salary_min) : undefined,
      salaryMax: rawJob.salary_max ? parseFloat(rawJob.salary_max) : undefined,
      salaryCurrency: countryCode === "GB" ? "GBP" : countryCode === "AU" ? "AUD" : countryCode === "CA" ? "CAD" : countryCode === "NZ" ? "NZD" : "USD",
      jobUrl,
      applyUrl,
      sourceUrl: jobUrl,
      publishedAt: rawJob.created,
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
