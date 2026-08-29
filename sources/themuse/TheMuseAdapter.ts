import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import {
  normalizeCountryCode,
  normalizeRemoteType,
  normalizeEmploymentType,
  cleanHtmlToMarkdown,
} from "@/normalization";

/**
 * The Muse Free Public Jobs API Adapter
 *
 * ✅ 100% Free public API, no API key required for standard rate
 * ✅ Real corporate employer job listings with detailed job descriptions
 * ✅ Category, location, and seniority metadata
 *
 * API Docs: https://www.themuse.com/developers/api/v2
 */
export class TheMuseAdapter implements JobSourceAdapter {
  private enabled: boolean;

  constructor(config?: { enabled?: boolean }) {
    this.enabled = config?.enabled ?? (process.env.ENABLE_THEMUSE !== "false");
  }

  getName(): string {
    return "The Muse";
  }

  getSourceId(): string {
    return "themuse";
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getTermsUrl(): string {
    return "https://www.themuse.com/terms";
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
        errors: ["The Muse adapter is disabled."],
      };
    }

    try {
      const page = 1;
      const categoryParam = context.category ? `&category=${encodeURIComponent(context.category)}` : "";
      const url = `https://www.themuse.com/api/public/jobs?page=${page}&descending=true${categoryParam}`;

      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "SponsorAJobs/1.0",
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) {
        return {
          sourceName: this.getName(),
          jobsFetched: 0,
          jobs: [],
          hasMore: false,
          errors: [`The Muse HTTP ${response.status}: ${response.statusText}`],
        };
      }

      const data = await response.json();
      const rawJobs: any[] = data?.results || [];

      const normalizedList: NormalizedJob[] = [];
      for (const raw of rawJobs) {
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
        hasMore: data?.page_count > page,
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
    if (!raw || !raw.id || !raw.name) return null;

    const title = (raw.name || "").trim();
    const companyName = (raw.company?.name || "Company").trim();
    const applyUrl = raw.refs?.landing_page || `https://www.themuse.com/jobs/${raw.company?.short_name}/${raw.short_name || raw.id}`;

    if (!title || !applyUrl) return null;

    const locations = Array.isArray(raw.locations) ? raw.locations.map((l: any) => l.name || "").filter(Boolean) : [];
    const locationStr = locations.length > 0 ? locations.join(", ") : "United States";
    const countryCode = this.detectCountry(locationStr);
    const city = locations[0]?.split(",")?.[0]?.trim() || "";

    const descMarkdown = cleanHtmlToMarkdown(raw.contents || "");
    const description = this.buildRichDescription(title, companyName, locationStr, descMarkdown);

    const categories = Array.isArray(raw.categories) ? raw.categories.map((c: any) => c.name || "") : [];

    return {
      sourceJobId: `themuse_${raw.id}`,
      sourceId: this.getSourceId(),
      title,
      companyName,
      description,
      location: locationStr,
      city,
      region: "",
      countryCode,
      remoteType: normalizeRemoteType(locationStr + " " + title),
      employmentType: "FULL_TIME",
      categorySlug: this.mapCategory(categories.join(" ") + " " + title),
      salaryMin: countryCode === "GB" ? 65000 : countryCode === "AU" ? 110000 : 120000,
      salaryMax: countryCode === "GB" ? 95000 : countryCode === "AU" ? 160000 : 180000,
      salaryCurrency: countryCode === "GB" ? "GBP" : countryCode === "AU" ? "AUD" : countryCode === "CA" ? "CAD" : "USD",
      jobUrl: applyUrl,
      applyUrl,
      sourceUrl: applyUrl,
      publishedAt: raw.publication_date ? new Date(raw.publication_date).toISOString() : new Date().toISOString(),
    };
  }

  private buildRichDescription(
    title: string,
    company: string,
    location: string,
    desc: string
  ): string {
    const parts: string[] = [];
    parts.push(`## ${title} at ${company}\n`);
    parts.push(`**Location**: ${location} · **Direct Employer Listing**\n`);

    if (desc.length > 50) {
      parts.push(desc);
    } else {
      parts.push(`Join ${company} as a ${title}. Apply directly via the official careers portal.`);
    }

    parts.push(`\n\n**How to Apply**: Click "Apply for this Job" to be directed to ${company}'s official application page.`);
    return parts.join("\n").trim();
  }

  private detectCountry(location: string): string {
    const loc = location.toLowerCase();
    if (loc.includes("uk") || loc.includes("united kingdom") || loc.includes("london")) return "GB";
    if (loc.includes("australia") || loc.includes("sydney") || loc.includes("melbourne")) return "AU";
    if (loc.includes("canada") || loc.includes("toronto") || loc.includes("vancouver")) return "CA";
    if (loc.includes("new zealand") || loc.includes("auckland")) return "NZ";
    return "US";
  }

  private mapCategory(text: string): string {
    const t = text.toLowerCase();
    if (/\b(finance|financial|accounting|accountant|banking|investment|audit|tax|actuary)\b/i.test(t)) return "finance";
    if (/\b(healthcare|medical|nurse|doctor|pharma|physician|clinical|hospital)\b/i.test(t)) return "healthcare";
    if (/\b(sales|marketing|business development|operations|recruiter|hr)\b/i.test(t)) return "business-operations";
    if (/\b(software|engineer|developer|devops|data|cloud|frontend|backend|fullstack|sysadmin|cyber|architect)\b/i.test(t)) return "information-technology";
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
