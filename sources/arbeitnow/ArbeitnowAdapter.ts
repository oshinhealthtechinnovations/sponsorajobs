import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import { normalizeRemoteType, normalizeEmploymentType } from "@/normalization";

/**
 * Keyword pattern for sponsorship signal scanning.
 * Used as fallback when the visa_sponsorship flag is absent.
 */
const SPONSORSHIP_KEYWORDS = /\b(visa\s+sponsor|work\s+permit|certificate\s+of\s+sponsor|skilled\s+worker|h-?1b|tss\s+482|subclass\s+482|lmia|aewv|relocation\s+(package|support|assistance)|sponsorship\s+available|sponsor\s+international)\b/i;

/**
 * Arbeitnow Free Job Board API Adapter
 *
 * ✅ No API key required
 * ✅ Jobs tagged with `visa_sponsorship: true` — highest precision source
 * ✅ Real employer job boards (not aggregator scrapes)
 * ✅ International + EU relocation jobs with explicit sponsorship indication
 * ✅ Rate limit: generous, no documented cap
 *
 * API Docs: https://www.arbeitnow.com/api/job-board-api
 */
export class ArbeitnowAdapter implements JobSourceAdapter {
  private enabled: boolean;

  constructor(config?: { enabled?: boolean }) {
    this.enabled = config?.enabled ?? (process.env.ENABLE_ARBEITNOW !== "false");
  }

  getName(): string     { return "Arbeitnow"; }
  getSourceId(): string  { return "arbeitnow"; }
  isEnabled(): boolean   { return this.enabled; }

  getTermsUrl(): string {
    return "https://www.arbeitnow.com/terms-conditions";
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
        errors: ["Arbeitnow adapter is disabled."],
      };
    }

    const allJobs: NormalizedJob[] = [];
    const errors: string[] = [];

    // Paginate up to 5 pages (100 jobs per page = up to 500 jobs)
    for (let page = 1; page <= 5; page++) {
      try {
        const url = `https://arbeitnow.com/api/job-board-api?page=${page}`;

        const response = await fetch(url, {
          headers: { "Accept": "application/json", "User-Agent": "SponsorAJobs/1.0" },
          signal: AbortSignal.timeout(12000),
        });

        if (!response.ok) {
          if (response.status === 404) break; // No more pages
          errors.push(`Arbeitnow page ${page} HTTP ${response.status}`);
          break;
        }

        const data = await response.json();
        const jobs: any[] = data?.data || [];

        if (jobs.length === 0) break;

        for (const job of jobs) {
          const hasSponsorshipTag = job.visa_sponsorship === true;
          const hasRelocationTag  = job.relocation === true;

          // Primary filter: explicit visa / relocation flags (highest precision)
          // Fallback: keyword scan on title + description when flags are absent
          // (Arbeitnow's flag is sparsely populated on current live data)
          const descText = ((job.title || "") + " " + (job.description || "")).toLowerCase();
          const hasKeywordSignal = SPONSORSHIP_KEYWORDS.test(descText);

          if (!hasSponsorshipTag && !hasRelocationTag && !hasKeywordSignal) continue;

          const norm = this.normalizeJob(job);
          if (norm && this.validateJob(norm)) {
            allJobs.push(norm);
          }
        }
      } catch (err: any) {
        errors.push(`Arbeitnow page ${page} error: ${err.message}`);
        break;
      }
    }

    return {
      sourceName: this.getName(),
      jobsFetched: allJobs.length,
      jobs: allJobs,
      hasMore: false,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  normalizeJob(raw: any): NormalizedJob | null {
    // Parse flags from the raw data fields
    const hasSponsorshipTag = raw.visa_sponsorship === true;
    const hasRelocationTag  = raw.relocation === true;
    return this.normalizeJobWithFlags(raw, { hasSponsorshipTag, hasRelocationTag });
  }

  private normalizeJobWithFlags(
    raw: any,
    flags: { hasSponsorshipTag: boolean; hasRelocationTag: boolean }
  ): NormalizedJob | null {
    if (!raw?.slug || !raw?.url) return null;

    const title       = (raw.title || "").trim();
    const companyName = (raw.company_name || "Employer").trim();

    if (!title) return null;

    const description = this.buildRichDescription(raw, flags);
    const countryCode = this.detectCountry(raw.location || "", raw.tags || []);

    return {
      sourceJobId:    raw.slug,
      sourceId:       this.getSourceId(),
      title,
      companyName,
      companyLogoUrl: raw.company_logo || undefined,
      description,
      location:       raw.location || "Remote",
      city:           this.extractCity(raw.location || ""),
      region:         "",
      countryCode,
      remoteType:     raw.remote ? "REMOTE" : normalizeRemoteType(raw.location + " " + (raw.tags || []).join(" ")),
      employmentType: normalizeEmploymentType(raw.employment_type || "FULL_TIME"),
      categorySlug:   this.mapCategory(raw.tags || []),
      salaryMin:      undefined, // Arbeitnow doesn't provide salary ranges
      salaryMax:      undefined,
      salaryCurrency: this.detectCurrency(countryCode),
      jobUrl:         raw.url,
      applyUrl:       raw.url,
      sourceUrl:      raw.url,
      publishedAt:    raw.created_at
        ? new Date(raw.created_at * 1000).toISOString()
        : new Date().toISOString(),
    };
  }

  private buildRichDescription(
    raw: any,
    flags: { hasSponsorshipTag: boolean; hasRelocationTag: boolean }
  ): string {
    const parts: string[] = [];

    parts.push(`## ${raw.title} at ${raw.company_name}\n`);

    // Visa & relocation banner — this is the KEY differentiator for Arbeitnow jobs
    const badges: string[] = [];
    if (flags.hasSponsorshipTag) badges.push("✅ Visa Sponsorship Available");
    if (flags.hasRelocationTag)  badges.push("✈️ Relocation Package Available");
    if (badges.length > 0) {
      parts.push(`> **${badges.join(" · ")}**\n`);
    }

    // Location & type metadata
    const metaParts = [
      raw.location ? `📍 ${raw.location}` : null,
      raw.remote ? "🌐 Remote-friendly" : null,
      raw.employment_type ? `⏱ ${raw.employment_type}` : null,
    ].filter(Boolean);
    if (metaParts.length > 0) {
      parts.push(metaParts.join(" · ") + "\n");
    }

    // Main description — strip HTML
    const rawDesc = (raw.description || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?(p|div|li|ul|ol|h[1-6]|strong|em|b|i)[^>]*>/gi, (m: string) => {
        if (/ul|ol/i.test(m)) return "\n";
        if (/li/i.test(m)) return "\n• ";
        if (/h[1-6]/i.test(m)) return "\n### ";
        if (/\/h[1-6]/i.test(m)) return "\n";
        return "";
      })
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (rawDesc.length > 80) {
      parts.push(rawDesc);
    }

    // Tags as skills
    if (raw.tags && raw.tags.length > 0) {
      parts.push(`\n\n**Required Skills / Keywords**: ${raw.tags.join(", ")}`);
    }

    parts.push(`\n\n**Application Process**: Click "Apply for this Job" to be directed to the employer's official application page. ${
      flags.hasSponsorshipTag
        ? "This employer has confirmed visa sponsorship availability for qualified international candidates."
        : ""
    }`);

    return parts.join("\n").trim();
  }

  private extractCity(location: string): string {
    if (!location) return "";
    const parts = location.split(",").map((s) => s.trim());
    return parts[0] || "";
  }

  private detectCountry(location: string, tags: string[]): string {
    const text = (location + " " + tags.join(" ")).toLowerCase();
    if (/\buk\b|united kingdom|london|manchester|birmingham|bristol/.test(text)) return "GB";
    if (/\busa?\b|united states|new york|san francisco|seattle|austin|chicago/.test(text)) return "US";
    if (/australia|sydney|melbourne|brisbane|perth/.test(text)) return "AU";
    if (/canada|toronto|vancouver|montreal|calgary/.test(text)) return "CA";
    if (/new zealand|auckland|wellington|christchurch/.test(text)) return "NZ";
    // EU jobs — map to GB as best proxy for sponsorship job seeker interest
    return "GB";
  }

  private detectCurrency(countryCode: string): string {
    const map: Record<string, string> = { GB: "GBP", US: "USD", AU: "AUD", CA: "CAD", NZ: "NZD" };
    return map[countryCode] || "GBP";
  }

  private mapCategory(tags: string[]): string {
    const tagStr = tags.join(" ").toLowerCase();
    if (/javascript|python|react|node|java|kotlin|swift|ruby|php|typescript|backend|frontend|fullstack/.test(tagStr)) return "information-technology";
    if (/devops|docker|kubernetes|aws|gcp|azure|terraform|ci\/cd|cloud/.test(tagStr)) return "information-technology";
    if (/data|sql|analytics|machine learning|ml|ai|nlp/.test(tagStr)) return "information-technology";
    if (/civil|structural|mechanical|electrical|highway|infrastructure/.test(tagStr)) return "engineering";
    if (/nurse|doctor|physician|healthcare|medical|clinical/.test(tagStr)) return "healthcare";
    if (/finance|accounting|cfo|audit|tax|financial/.test(tagStr)) return "finance";
    if (/construction|site|project manager|quantity surveyor/.test(tagStr)) return "construction";
    return "information-technology";
  }

  validateJob(job: NormalizedJob): boolean {
    return Boolean(
      job.title &&
      job.title.length >= 5 &&
      job.companyName &&
      job.applyUrl &&
      job.applyUrl.startsWith("http") &&
      job.description.length >= 100
    );
  }
}
