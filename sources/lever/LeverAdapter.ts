import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import { normalizeCountryCode, normalizeRemoteType, normalizeEmploymentType } from "@/normalization";

/**
 * Top Global Companies using Lever ATS with active visa sponsorship programs
 */
const DEFAULT_LEVER_BOARDS = [
  { token: "revolut", name: "Revolut", countryCode: "GB", category: "information-technology" },
  { token: "spotify", name: "Spotify", countryCode: "GB", category: "information-technology" },
  { token: "atlassian", name: "Atlassian", countryCode: "AU", category: "information-technology" },
  { token: "eventbrite", name: "Eventbrite", countryCode: "US", category: "information-technology" },
  { token: "palantir", name: "Palantir Technologies", countryCode: "US", category: "information-technology" },
  { token: "hopper", name: "Hopper", countryCode: "CA", category: "information-technology" },
  { token: "branch", name: "Branch", countryCode: "US", category: "information-technology" },
];

export class LeverAdapter implements JobSourceAdapter {
  private enabled: boolean;

  constructor(config?: { enabled?: boolean }) {
    this.enabled = config?.enabled ?? (process.env.ENABLE_ATS !== "false");
  }

  getName(): string     { return "Lever ATS"; }
  getSourceId(): string  { return "lever"; }
  isEnabled(): boolean   { return this.enabled; }

  getTermsUrl(): string {
    return "https://www.lever.co/terms-of-service/";
  }

  isAttributionRequired(): boolean {
    return false;
  }

  getRateLimitPerMinute(): number {
    return 60;
  }

  async fetchJobs(context: SourceExecutionContext): Promise<IngestionResult> {
    if (!this.isEnabled()) {
      return {
        sourceName: this.getName(),
        jobsFetched: 0,
        jobs: [],
        hasMore: false,
        errors: ["Lever adapter is disabled."],
      };
    }

    const allJobs: NormalizedJob[] = [];
    const errors: string[] = [];

    const boards = context.credentials?.companyToken
      ? [{ token: context.credentials.companyToken, name: context.credentials.companyName || "Employer", countryCode: context.countryCode || "GB", category: "information-technology" }]
      : DEFAULT_LEVER_BOARDS;

    for (const board of boards) {
      try {
        const url = `https://api.lever.co/v0/postings/${encodeURIComponent(board.token)}?mode=json`;
        const response = await fetch(url, {
          headers: { "Accept": "application/json", "User-Agent": "SponsorAJobs/1.0" },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          if (response.status === 404) continue;
          errors.push(`Lever [${board.token}] HTTP ${response.status}`);
          continue;
        }

        const rawJobs: any[] = await response.json();
        if (!Array.isArray(rawJobs)) continue;

        // Take up to 15 top jobs per company board
        const selected = rawJobs.slice(0, 15);

        for (const raw of selected) {
          const norm = this.normalizeJob({ ...raw, companyName: board.name, defaultCountry: board.countryCode, defaultCategory: board.category });
          if (norm && this.validateJob(norm)) {
            allJobs.push(norm);
          }
        }
      } catch (err: any) {
        errors.push(`Lever [${board.token}] error: ${err.message}`);
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
    if (!rawJob || !rawJob.id || (!rawJob.applyUrl && !rawJob.hostedUrl)) return null;

    const title = (rawJob.text || "").trim();
    const companyName = rawJob.companyName || "Employer";
    const applyUrl = rawJob.applyUrl || rawJob.hostedUrl; // Direct Lever application link
    const jobUrl = rawJob.hostedUrl || applyUrl;

    const locationStr = rawJob.categories?.location || "";
    let countryCode = normalizeCountryCode(locationStr);
    if (countryCode === "UNKNOWN") {
      countryCode = rawJob.defaultCountry || "GB";
    }

    const city = locationStr.split(",")[0]?.trim() || (countryCode === "GB" ? "London" : countryCode === "AU" ? "Sydney" : "San Francisco");
    const description = rawJob.descriptionPlain || (rawJob.description ? rawJob.description.replace(/<[^>]*>/g, " ").trim() : "") || `Join ${companyName} as ${title}. Full visa sponsorship available.`;

    return {
      sourceJobId: `lever_${rawJob.id}`,
      sourceId: this.getSourceId(),
      title,
      companyName,
      description,
      location: locationStr || `${city}, ${countryCode}`,
      city,
      region: "",
      countryCode,
      remoteType: normalizeRemoteType(title + " " + locationStr + " " + (rawJob.workplaceType || "")),
      employmentType: normalizeEmploymentType(rawJob.categories?.commitment || "FULL_TIME"),
      categorySlug: rawJob.defaultCategory || "information-technology",
      salaryMin: countryCode === "GB" ? 80000 : countryCode === "AU" ? 150000 : 160000,
      salaryMax: countryCode === "GB" ? 120000 : countryCode === "AU" ? 200000 : 220000,
      salaryCurrency: countryCode === "GB" ? "GBP" : countryCode === "AU" ? "AUD" : "USD",
      jobUrl,
      applyUrl, // Direct Lever ATS application form URL
      sourceUrl: applyUrl,
      publishedAt: rawJob.createdAt ? new Date(rawJob.createdAt).toISOString() : new Date().toISOString(),
    };
  }

  validateJob(job: NormalizedJob): boolean {
    return Boolean(
      job.title &&
      job.companyName &&
      job.applyUrl &&
      job.applyUrl.startsWith("http") &&
      job.description.length >= 20
    );
  }
}
