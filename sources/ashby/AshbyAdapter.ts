import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import { normalizeCountryCode, normalizeRemoteType, normalizeEmploymentType } from "@/normalization";

/**
 * Public Ashby ATS Job Board API Adapter
 * Reference: Section 39 & 40
 */
const DEFAULT_ASHBY_BOARDS = [
  { token: "notion", name: "Notion", countryCode: "US" },
  { token: "linear", name: "Linear", countryCode: "US" },
  { token: "ramp", name: "Ramp", countryCode: "US" },
  { token: "deel", name: "Deel", countryCode: "GB" },
  { token: "retool", name: "Retool", countryCode: "US" },
];

export class AshbyAdapter implements JobSourceAdapter {
  private enabled: boolean;

  constructor(config?: { enabled?: boolean }) {
    this.enabled = config?.enabled ?? (process.env.ENABLE_ATS !== "false");
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
    if (!this.isEnabled()) {
      return {
        sourceName: this.getName(),
        jobsFetched: 0,
        jobs: [],
        hasMore: false,
        errors: ["Ashby adapter is disabled."],
      };
    }

    const allJobs: NormalizedJob[] = [];
    const errors: string[] = [];

    const boards = context.credentials?.orgId
      ? [{ token: context.credentials.orgId, name: context.credentials.companyName || context.credentials.orgId, countryCode: context.countryCode || "US" }]
      : DEFAULT_ASHBY_BOARDS;

    for (const board of boards) {
      try {
        const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board.token)}`;
        const response = await fetch(url, {
          headers: { "Accept": "application/json", "User-Agent": "SponsorAJobs/1.0" },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          if (response.status === 404) continue;
          errors.push(`Ashby [${board.token}] HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const jobs = data?.jobs || [];
        const selected = jobs.slice(0, 15);

        for (const job of selected) {
          const norm = this.normalizeJob({ ...job, orgName: board.name, defaultCountry: board.countryCode });
          if (norm && this.validateJob(norm)) {
            allJobs.push(norm);
          }
        }
      } catch (err: any) {
        errors.push(`Ashby [${board.token}] error: ${err.message}`);
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
