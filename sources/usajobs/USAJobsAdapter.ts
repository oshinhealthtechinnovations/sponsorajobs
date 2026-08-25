import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import { normalizeCountryCode, normalizeRemoteType, normalizeEmploymentType } from "@/normalization";

/**
 * Official USAJobs Search API Adapter
 * Reference: Section 38 & 80
 */
export class USAJobsAdapter implements JobSourceAdapter {
  private apiKey: string;
  private email: string;
  private enabled: boolean;

  constructor(config?: { apiKey?: string; email?: string; enabled?: boolean }) {
    this.apiKey = config?.apiKey || process.env.USAJOBS_API_KEY || "";
    this.email = config?.email || process.env.USAJOBS_EMAIL || "";
    this.enabled = config?.enabled ?? (process.env.ENABLE_USAJOBS === "true");
  }

  getName(): string {
    return "USAJobs";
  }

  getSourceId(): string {
    return "usajobs";
  }

  isEnabled(): boolean {
    return this.enabled && Boolean(this.apiKey && this.email);
  }

  getTermsUrl(): string {
    return "https://developer.usajobs.gov/API-Terms";
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
        errors: ["USAJobs source is disabled or API credentials are not configured."],
      };
    }

    try {
      const keyword = context.category || "engineer";
      const limit = Math.min(50, context.limit || 20);
      const url = `https://data.usajobs.gov/api/search?Keyword=${encodeURIComponent(keyword)}&ResultsPerPage=${limit}`;

      const response = await fetch(url, {
        headers: {
          "Host": "data.usajobs.gov",
          "User-Agent": this.email,
          "Authorization-Key": this.apiKey,
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout per Section 35
      });

      if (!response.ok) {
        throw new Error(`USAJobs HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const items = data?.SearchResult?.SearchResultItems || [];
      const normalizedList: NormalizedJob[] = [];

      for (const item of items) {
        const norm = this.normalizeJob(item);
        if (norm && this.validateJob(norm)) {
          normalizedList.push(norm);
        }
      }

      return {
        sourceName: this.getName(),
        jobsFetched: items.length,
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
    if (!rawJob || !rawJob.MatchedObjectId) return null;

    const desc = rawJob.MatchedObjectDescriptor || {};
    const title = desc.PositionTitle || "";
    const companyName = desc.OrganizationName || desc.DepartmentName || "U.S. Federal Government";
    const jobUrl = desc.PositionURI || `https://www.usajobs.gov/job/${rawJob.MatchedObjectId}`;
    const applyUrl = desc.ApplyURI?.[0] || jobUrl;

    const locationDesc = desc.PositionLocationDisplay || "";
    const locationParts = locationDesc.split(",").map((s: string) => s.trim());
    const city = locationParts[0] || "Washington";
    const region = locationParts[1] || "DC";

    const salaryMin = desc.PositionRemuneration?.[0]?.MinimumRange
      ? parseFloat(desc.PositionRemuneration[0].MinimumRange)
      : undefined;
    const salaryMax = desc.PositionRemuneration?.[0]?.MaximumRange
      ? parseFloat(desc.PositionRemuneration[0].MaximumRange)
      : undefined;

    const fullDescription = [
      desc.UserArea?.Details?.JobSummary || "",
      desc.QualificationSummary || "",
      desc.UserArea?.Details?.MajorDuties?.join("\n") || "",
    ]
      .filter(Boolean)
      .join("\n\n");

    return {
      sourceJobId: rawJob.MatchedObjectId,
      sourceId: this.getSourceId(),
      title,
      companyName,
      description: fullDescription || title,
      location: locationDesc || "United States",
      city,
      region,
      countryCode: "US",
      remoteType: desc.PositionTelework?.toLowerCase().includes("telework eligible") ? "HYBRID" : "ONSITE",
      employmentType: normalizeEmploymentType(desc.PositionOfferingType?.[0]?.Name || "FULL_TIME"),
      salaryMin,
      salaryMax,
      salaryCurrency: "USD",
      jobUrl,
      applyUrl,
      sourceUrl: jobUrl,
      publishedAt: desc.PublicationStartDate,
    };
  }

  validateJob(job: NormalizedJob): boolean {
    return Boolean(
      job.title &&
      job.companyName &&
      job.countryCode === "US" &&
      job.applyUrl &&
      job.description.length >= 20
    );
  }
}
