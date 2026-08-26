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
        errors: ["Adzuna: disabled or ADZUNA_APP_ID/ADZUNA_APP_KEY not set."],
      };
    }

    const targetCountries = ["gb", "us", "au", "ca", "nz"];
    const keywords = ["visa sponsorship", "skilled worker"];
    const allJobs: NormalizedJob[] = [];
    const errors: string[] = [];

    for (const country of targetCountries) {
      for (const kw of keywords) {
        try {
          const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${encodeURIComponent(this.appId)}&app_key=${encodeURIComponent(this.appKey)}&results_per_page=15&what=${encodeURIComponent(kw)}`;

          const response = await fetch(url, {
            headers: { "Accept": "application/json", "User-Agent": "SponsorAJobs/1.0" },
            signal: AbortSignal.timeout(10000),
          });

          if (!response.ok) {
            errors.push(`Adzuna [${country}/${kw}] HTTP ${response.status}`);
            continue;
          }

          const data = await response.json();
          const results = data?.results || [];

          for (const item of results) {
            const norm = this.normalizeJob(item);
            if (norm && this.validateJob(norm)) {
              allJobs.push(norm);
            }
          }
        } catch (err: any) {
          errors.push(`Adzuna [${country}/${kw}] error: ${err.message}`);
        }
      }
    }

    // Deduplicate by sourceJobId
    const seen = new Set<string>();
    const deduped = allJobs.filter((j) => {
      if (seen.has(j.sourceJobId)) return false;
      seen.add(j.sourceJobId);
      return true;
    });

    return {
      sourceName: this.getName(),
      jobsFetched: deduped.length,
      jobs: deduped,
      hasMore: false,
      errors: errors.length > 0 ? errors : undefined,
    };
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
