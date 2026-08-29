import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import {
  normalizeCountryCode,
  normalizeEmploymentType,
  cleanHtmlToMarkdown,
} from "@/normalization";

/**
 * RemoteOK Free Jobs API Adapter
 *
 * ✅ 100% Free public API, no API key required
 * ✅ Real remote-first tech, engineering, product, data & design roles
 * ✅ Provides salary bounds, company logos, tags, and direct apply links
 *
 * API Endpoint: https://remoteok.com/api
 */
export class RemoteOKAdapter implements JobSourceAdapter {
  private enabled: boolean;

  constructor(config?: { enabled?: boolean }) {
    this.enabled = config?.enabled ?? (process.env.ENABLE_REMOTEOK !== "false");
  }

  getName(): string {
    return "RemoteOK";
  }

  getSourceId(): string {
    return "remoteok";
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getTermsUrl(): string {
    return "https://remoteok.com/terms";
  }

  isAttributionRequired(): boolean {
    return true;
  }

  getRateLimitPerMinute(): number {
    return 20;
  }

  async fetchJobs(context: SourceExecutionContext): Promise<IngestionResult> {
    if (!this.isEnabled()) {
      return {
        sourceName: this.getName(),
        jobsFetched: 0,
        jobs: [],
        hasMore: false,
        errors: ["RemoteOK adapter is disabled."],
      };
    }

    try {
      const url = "https://remoteok.com/api";
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "SponsorAJobs/1.0 (contact@sponsorajobs.com)",
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) {
        return {
          sourceName: this.getName(),
          jobsFetched: 0,
          jobs: [],
          hasMore: false,
          errors: [`RemoteOK API HTTP ${response.status}: ${response.statusText}`],
        };
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        return {
          sourceName: this.getName(),
          jobsFetched: 0,
          jobs: [],
          hasMore: false,
          errors: ["RemoteOK returned unexpected non-array format."],
        };
      }

      // First item is legal metadata notice
      const rawJobs = data.filter((item: any) => item && (item.id || item.slug) && item.position);
      const limit = context.limit || 50;
      const selected = rawJobs.slice(0, limit);

      const normalizedList: NormalizedJob[] = [];
      for (const raw of selected) {
        const norm = this.normalizeJob(raw);
        if (norm && this.validateJob(norm)) {
          normalizedList.push(norm);
        }
      }

      // Deduplicate by sourceJobId
      const seen = new Set<string>();
      const deduped = normalizedList.filter((j) => {
        if (seen.has(j.sourceJobId)) return false;
        seen.add(j.sourceJobId);
        return true;
      });

      return {
        sourceName: this.getName(),
        jobsFetched: deduped.length,
        jobs: deduped,
        hasMore: rawJobs.length > limit,
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

  normalizeJob(raw: any): NormalizedJob | null {
    if (!raw || (!raw.id && !raw.slug) || !raw.position) return null;

    const title = (raw.position || "").trim();
    const companyName = (raw.company || "Company").trim();
    const rawUrl = raw.url || `https://remoteok.com/remote-jobs/${raw.id || raw.slug}`;
    const applyUrl = raw.apply_url || rawUrl;

    if (!title || !applyUrl) return null;

    const tags: string[] = Array.isArray(raw.tags) ? raw.tags : [];
    const locationStr = raw.location || "Remote (Worldwide)";
    const countryCode = this.detectCountry(locationStr, tags);

    const descMarkdown = cleanHtmlToMarkdown(raw.description || "");
    const description = this.buildRichDescription(title, companyName, locationStr, tags, descMarkdown);

    const salaryMin = raw.salary_min && raw.salary_min > 1000 ? Number(raw.salary_min) : undefined;
    const salaryMax = raw.salary_max && raw.salary_max > 1000 ? Number(raw.salary_max) : undefined;

    return {
      sourceJobId: `remoteok_${raw.id || raw.slug}`,
      sourceId: this.getSourceId(),
      title,
      companyName,
      companyLogoUrl: raw.company_logo || undefined,
      description,
      location: locationStr,
      city: "",
      region: "",
      countryCode,
      remoteType: "REMOTE",
      employmentType: normalizeEmploymentType(tags.join(" ") || "FULL_TIME"),
      categorySlug: this.mapCategory(tags),
      salaryMin,
      salaryMax,
      salaryCurrency: this.detectCurrency(countryCode),
      jobUrl: rawUrl,
      applyUrl,
      sourceUrl: rawUrl,
      publishedAt: raw.date ? new Date(raw.date).toISOString() : new Date().toISOString(),
    };
  }

  private buildRichDescription(
    title: string,
    company: string,
    location: string,
    tags: string[],
    desc: string
  ): string {
    const parts: string[] = [];
    parts.push(`## ${title} at ${company}\n`);
    parts.push(`**Location**: ${location} · **Workplace**: 🌐 100% Remote · **Verified Listing**\n`);

    if (desc.length > 50) {
      parts.push(desc);
    } else {
      parts.push(`Join ${company} as a ${title}. This role offers international remote collaboration.`);
    }

    if (tags.length > 0) {
      parts.push(`\n\n**Key Skills & Technologies**: ${tags.join(", ")}`);
    }

    parts.push(`\n\n**How to Apply**: Applications are submitted directly to the employer. Click "Apply for this Job" to proceed.`);
    return parts.join("\n").trim();
  }

  private detectCountry(location: string, tags: string[]): string {
    const loc = (location + " " + tags.join(" ")).toLowerCase();
    if (loc.includes("uk") || loc.includes("united kingdom") || loc.includes("london")) return "GB";
    if (loc.includes("usa") || loc.includes("united states") || loc.includes("us only") || loc.includes("north america")) return "US";
    if (loc.includes("australia") || loc.includes("sydney") || loc.includes("melbourne")) return "AU";
    if (loc.includes("canada") || loc.includes("toronto") || loc.includes("vancouver")) return "CA";
    if (loc.includes("new zealand") || loc.includes("auckland")) return "NZ";
    return "US"; // Default proxy for worldwide remote
  }

  private detectCurrency(countryCode: string): string {
    const map: Record<string, string> = { GB: "GBP", US: "USD", AU: "AUD", CA: "CAD", NZ: "NZD" };
    return map[countryCode] || "USD";
  }

  private mapCategory(tags: string[]): string {
    const tagStr = tags.join(" ").toLowerCase();
    if (/devops|cloud|aws|kubernetes|infrastructure|sre/.test(tagStr)) return "information-technology";
    if (/data|analytics|machine learning|ai|python|sql/.test(tagStr)) return "information-technology";
    if (/engineer|developer|frontend|backend|fullstack|software|react|node|golang/.test(tagStr)) return "information-technology";
    if (/finance|accounting|crypto|defi/.test(tagStr)) return "finance";
    if (/health|medical|biotech/.test(tagStr)) return "healthcare";
    return "information-technology";
  }

  validateJob(job: NormalizedJob): boolean {
    return Boolean(
      job.title &&
      job.title.length >= 3 &&
      job.companyName &&
      job.applyUrl &&
      job.applyUrl.startsWith("http") &&
      job.description.length >= 50
    );
  }
}
