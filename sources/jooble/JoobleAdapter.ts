import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import { normalizeRemoteType, normalizeEmploymentType } from "@/normalization";

/**
 * Jooble API Adapter
 *
 * ✅ Free API key signup at https://jooble.org/api/
 * ✅ 1,000 requests per day on free tier
 * ✅ 71 countries covered
 * ✅ UK, US, AU, CA, NZ fully supported with salary data
 * ✅ Search by keyword + location for precise sponsorship job targeting
 *
 * API Docs: https://jooble.org/api/
 */

const JOOBLE_COUNTRY_ENDPOINTS: Record<string, string> = {
  GB: "jooble.org/api",
  US: "jooble.org/api",
  AU: "jooble.org/api",
  CA: "jooble.org/api",
  NZ: "jooble.org/api",
};

const SPONSORSHIP_SEARCH_KEYWORDS = [
  "visa sponsorship",
  "work permit",
  "certificate of sponsorship",
  "h1b sponsorship",
  "skilled worker visa",
  "employer sponsorship",
];

export class JoobleAdapter implements JobSourceAdapter {
  private apiKey: string;
  private enabled: boolean;

  constructor(config?: { apiKey?: string; enabled?: boolean }) {
    this.apiKey = config?.apiKey || process.env.JOOBLE_API_KEY || "";
    this.enabled = config?.enabled ?? (process.env.ENABLE_JOOBLE === "true");
  }

  getName(): string     { return "Jooble"; }
  getSourceId(): string  { return "jooble"; }
  isEnabled(): boolean   { return this.enabled && Boolean(this.apiKey); }

  getTermsUrl(): string {
    return "https://jooble.org/api-terms";
  }

  isAttributionRequired(): boolean {
    return true;
  }

  getRateLimitPerMinute(): number {
    return 10; // Conservative to stay within daily limit
  }

  async fetchJobs(context: SourceExecutionContext): Promise<IngestionResult> {
    if (!this.isEnabled()) {
      return {
        sourceName: this.getName(),
        jobsFetched: 0,
        jobs: [],
        hasMore: false,
        errors: ["Jooble: disabled or JOOBLE_API_KEY not set. Get a free key at https://jooble.org/api/"],
      };
    }

    const targetCountry = (context.countryCode || "GB").toUpperCase();
    const locationMap: Record<string, string> = {
      GB: "United Kingdom", US: "United States",
      AU: "Australia", CA: "Canada", NZ: "New Zealand",
    };
    const locationLabel = locationMap[targetCountry] || "United Kingdom";

    const allJobs: NormalizedJob[] = [];
    const errors: string[] = [];

    // Search with sponsorship-specific keywords for highest precision
    for (const keyword of SPONSORSHIP_SEARCH_KEYWORDS.slice(0, 3)) {
      try {
        const body = JSON.stringify({
          keywords: keyword,
          location: locationLabel,
          resultsOnPage: 20,
          page: 1,
        });

        const url = `https://jooble.org/api/${this.apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body,
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          errors.push(`Jooble [${keyword}] HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const jobs: any[] = data?.jobs || [];

        for (const job of jobs) {
          const norm = this.normalizeJobForCountry(job, targetCountry);
          if (norm && this.validateJob(norm)) {
            allJobs.push(norm);
          }
        }
      } catch (err: any) {
        errors.push(`Jooble [${keyword}] error: ${err.message}`);
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

  /**
   * Satisfy the JobSourceAdapter interface (single-argument signature).
   * Defaults to "GB" if country cannot be inferred from the raw job data.
   */
  normalizeJob(raw: any): NormalizedJob | null {
    return this.normalizeJobForCountry(raw, "GB");
  }

  private normalizeJobForCountry(raw: any, countryCode: string): NormalizedJob | null {
    if (!raw?.id || !raw?.link) return null;

    const title       = (raw.title || "").replace(/\s+/g, " ").trim();
    const companyName = (raw.company || "Employer").trim();

    if (!title || title.length < 5) return null;

    const description = this.buildDescription(raw);
    const city        = this.extractCity(raw.location || "");

    const salaryMin = raw.salary ? this.parseSalaryValue(raw.salary, "min") : undefined;
    const salaryMax = raw.salary ? this.parseSalaryValue(raw.salary, "max") : undefined;

    return {
      sourceJobId:    String(raw.id),
      sourceId:       this.getSourceId(),
      title,
      companyName,
      description,
      location:       raw.location || countryCode,
      city,
      region:         "",
      countryCode,
      remoteType:     normalizeRemoteType(raw.type + " " + raw.location + " " + (raw.snippet || "")),
      employmentType: normalizeEmploymentType(raw.type || ""),
      categorySlug:   this.mapCategory(title, raw.snippet || ""),
      salaryMin,
      salaryMax,
      salaryCurrency: this.getCurrency(countryCode),
      jobUrl:         raw.link,
      applyUrl:       raw.link,
      sourceUrl:      raw.link,
      publishedAt:    raw.updated || new Date().toISOString(),
    };
  }

  private buildDescription(raw: any): string {
    const parts: string[] = [];

    parts.push(`## ${raw.title || "Role"}`);
    if (raw.company)  parts.push(`**Company**: ${raw.company}`);
    if (raw.location) parts.push(`**Location**: ${raw.location}`);
    if (raw.salary)   parts.push(`**Salary**: ${raw.salary}`);
    if (raw.type)     parts.push(`**Type**: ${raw.type}`);
    parts.push("");

    const snippet = (raw.snippet || "")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
      .trim();

    if (snippet.length > 50) {
      parts.push(snippet);
    }

    parts.push(`\n**How to Apply**: Click "Apply for this Job" to visit the original job posting. This listing has been identified as containing visa sponsorship language.`);

    return parts.join("\n").trim();
  }

  private extractCity(location: string): string {
    return location.split(",")[0].trim();
  }

  private getCurrency(code: string): string {
    const map: Record<string, string> = { GB: "GBP", US: "USD", AU: "AUD", CA: "CAD", NZ: "NZD" };
    return map[code] || "USD";
  }

  private parseSalaryValue(salaryStr: string, part: "min" | "max"): number | undefined {
    const nums = salaryStr.replace(/[^\d\-\.k]/gi, " ").split(/[\s\-]+/)
      .map((s) => {
        const n = parseFloat(s.replace(/k$/i, ""));
        return s.toLowerCase().endsWith("k") ? n * 1000 : n;
      })
      .filter((n) => n > 5000);
    if (nums.length === 0) return undefined;
    return part === "min" ? Math.min(...nums) : Math.max(...nums);
  }

  private mapCategory(title: string, desc: string): string {
    const text = (title + " " + desc).toLowerCase();
    if (/civil|structural|highway|geotechnical|infrastructure/.test(text))  return "engineering";
    if (/nurse|doctor|gp|clinical|healthcare|physician|midwife/.test(text)) return "healthcare";
    if (/software|developer|engineer|devops|cloud|data|python|react/.test(text)) return "information-technology";
    if (/finance|accounting|audit|tax|cfa|cpa|actuary/.test(text))          return "finance";
    if (/construction|site manager|quantity surveyor|project delivery/.test(text)) return "construction";
    return "information-technology";
  }

  validateJob(job: NormalizedJob): boolean {
    return Boolean(
      job.title &&
      job.companyName &&
      job.applyUrl?.startsWith("http") &&
      job.description.length >= 80
    );
  }
}
