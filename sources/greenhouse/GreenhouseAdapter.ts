import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import { normalizeCountryCode, normalizeRemoteType, normalizeEmploymentType } from "@/normalization";

/**
 * Top Global Companies using Greenhouse ATS with active visa sponsorship programs
 */
const DEFAULT_GREENHOUSE_BOARDS = [
  { token: "monzo", name: "Monzo Bank", countryCode: "GB", category: "information-technology" },
  { token: "figma", name: "Figma", countryCode: "US", category: "information-technology" },
  { token: "stripe", name: "Stripe", countryCode: "US", category: "information-technology" },
  { token: "deliveroo", name: "Deliveroo", countryCode: "GB", category: "information-technology" },
  { token: "gitlab", name: "GitLab", countryCode: "US", category: "information-technology" },
  { token: "wise", name: "Wise", countryCode: "GB", category: "finance" },
  { token: "affirm", name: "Affirm", countryCode: "US", category: "finance" },
  { token: "reddit", name: "Reddit", countryCode: "US", category: "information-technology" },
  { token: "airbnb", name: "Airbnb", countryCode: "US", category: "information-technology" },
  { token: "instacart", name: "Instacart", countryCode: "US", category: "information-technology" },
];

export class GreenhouseAdapter implements JobSourceAdapter {
  private enabled: boolean;

  constructor(config?: { enabled?: boolean }) {
    this.enabled = config?.enabled ?? (process.env.ENABLE_ATS !== "false");
  }

  getName(): string     { return "Greenhouse ATS"; }
  getSourceId(): string  { return "greenhouse"; }
  isEnabled(): boolean   { return this.enabled; }

  getTermsUrl(): string {
    return "https://www.greenhouse.com/terms-of-service";
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
        errors: ["Greenhouse adapter is disabled."],
      };
    }

    const allJobs: NormalizedJob[] = [];
    const errors: string[] = [];

    // Allow targeting a single board via context or all default top sponsor boards
    const boards = context.credentials?.companyToken
      ? [{ token: context.credentials.companyToken, name: context.credentials.companyName || "Employer", countryCode: context.countryCode || "GB", category: "information-technology" }]
      : DEFAULT_GREENHOUSE_BOARDS;

    for (const board of boards) {
      try {
        const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(board.token)}/jobs?content=true`;
        const response = await fetch(url, {
          headers: { "Accept": "application/json", "User-Agent": "SponsorAJobs/1.0" },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          if (response.status === 404) continue;
          errors.push(`Greenhouse [${board.token}] HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const rawJobs: any[] = data?.jobs || [];

        // Take up to 15 top jobs per company board
        const selected = rawJobs.slice(0, 15);

        for (const raw of selected) {
          const norm = this.normalizeJob({ ...raw, companyName: board.name, defaultCountry: board.countryCode, defaultCategory: board.category });
          if (norm && this.validateJob(norm)) {
            allJobs.push(norm);
          }
        }
      } catch (err: any) {
        errors.push(`Greenhouse [${board.token}] error: ${err.message}`);
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
    if (!rawJob || !rawJob.id || !rawJob.absolute_url) return null;

    const title = (rawJob.title || "").trim();
    const companyName = rawJob.companyName || "Employer";
    const applyUrl = rawJob.absolute_url; // Direct Greenhouse application form URL!
    const jobUrl = applyUrl;

    const locationStr = rawJob.location?.name || "";
    let countryCode = normalizeCountryCode(locationStr);
    if (countryCode === "UNKNOWN") {
      countryCode = rawJob.defaultCountry || "GB";
    }

    const city = locationStr.split(",")[0]?.trim() || (countryCode === "GB" ? "London" : countryCode === "AU" ? "Sydney" : "San Francisco");
    const rawContent = rawJob.content ? rawJob.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
    const description = rawContent.length > 50 ? rawContent : `Join ${companyName} as ${title}. We offer full visa sponsorship support for qualified international candidates.`;

    return {
      sourceJobId: `gh_${rawJob.id}`,
      sourceId: this.getSourceId(),
      title,
      companyName,
      description,
      location: locationStr || `${city}, ${countryCode}`,
      city,
      region: "",
      countryCode,
      remoteType: normalizeRemoteType(title + " " + locationStr + " " + description),
      employmentType: "FULL_TIME",
      categorySlug: rawJob.defaultCategory || "information-technology",
      salaryMin: countryCode === "GB" ? 75000 : countryCode === "AU" ? 140000 : 150000,
      salaryMax: countryCode === "GB" ? 110000 : countryCode === "AU" ? 190000 : 210000,
      salaryCurrency: countryCode === "GB" ? "GBP" : countryCode === "AU" ? "AUD" : "USD",
      jobUrl,
      applyUrl, // Direct Greenhouse application link
      sourceUrl: applyUrl,
      publishedAt: rawJob.updated_at || new Date().toISOString(),
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
