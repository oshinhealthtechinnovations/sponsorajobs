import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import {
  normalizeCountryCode,
  normalizeEmploymentType,
  cleanHtmlToMarkdown,
} from "@/normalization";

/**
 * Jobicy.com Free Remote Jobs API Adapter
 *
 * ✅ 100% Free public API, no API key required
 * ✅ High-precision geographical regions (jobGeo: USA, UK, Canada, Australia, Anywhere)
 * ✅ Structured salary ranges (annualSalaryMin, annualSalaryMax, salaryCurrency)
 * ✅ Rich job descriptions and company logos
 *
 * API Docs: https://jobicy.com/jobs-rss-feed
 */
export class JobicyAdapter implements JobSourceAdapter {
  private enabled: boolean;

  constructor(config?: { enabled?: boolean }) {
    this.enabled = config?.enabled ?? (process.env.ENABLE_JOBICY !== "false");
  }

  getName(): string {
    return "Jobicy";
  }

  getSourceId(): string {
    return "jobicy";
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getTermsUrl(): string {
    return "https://jobicy.com/terms";
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
        errors: ["Jobicy adapter is disabled."],
      };
    }

    try {
      const count = Math.min(50, context.limit || 50);
      const url = `https://jobicy.com/api/v2/remote-jobs?count=${count}`;

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
          errors: [`Jobicy HTTP ${response.status}: ${response.statusText}`],
        };
      }

      const data = await response.json();
      const rawJobs: any[] = data?.jobs || [];

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

  normalizeJob(raw: any): NormalizedJob | null {
    if (!raw || !raw.id || !raw.url || !raw.jobTitle) return null;

    const title = String(raw.jobTitle || "").trim();
    const companyName = String(raw.companyName || "Company").trim();
    const applyUrl = String(raw.url || "").trim();

    if (!title || !applyUrl) return null;

    const geoRaw = raw.jobGeo || raw.jobLocation || "";
    const geoStr = Array.isArray(geoRaw) ? geoRaw.join(" ") : String(geoRaw).trim();
    const countryCode = this.detectCountry(geoStr);

    const descMarkdown = cleanHtmlToMarkdown(raw.jobDescription || raw.jobExcerpt || "");
    const description = this.buildRichDescription(title, companyName, geoStr, descMarkdown);

    const salaryMin = raw.annualSalaryMin && Number(raw.annualSalaryMin) > 1000 ? Number(raw.annualSalaryMin) : undefined;
    const salaryMax = raw.annualSalaryMax && Number(raw.annualSalaryMax) > 1000 ? Number(raw.annualSalaryMax) : undefined;
    const salaryCurrency = raw.salaryCurrency || (countryCode === "GB" ? "GBP" : countryCode === "AU" ? "AUD" : countryCode === "CA" ? "CAD" : "USD");

    const industryRaw = raw.jobIndustry || raw.jobCategory || title;
    const industryStr = Array.isArray(industryRaw) ? industryRaw.join(" ") : String(industryRaw);

    return {
      sourceJobId: `jobicy_${raw.id}`,
      sourceId: this.getSourceId(),
      title,
      companyName,
      companyLogoUrl: raw.companyLogo || undefined,
      description,
      location: geoStr ? `Remote (${geoStr})` : "Remote (Worldwide)",
      city: "",
      region: "",
      countryCode,
      remoteType: "REMOTE",
      employmentType: normalizeEmploymentType(raw.jobType || "FULL_TIME"),
      categorySlug: this.mapCategory(industryStr),
      salaryMin,
      salaryMax,
      salaryCurrency,
      jobUrl: applyUrl,
      applyUrl,
      sourceUrl: applyUrl,
      publishedAt: raw.pubDate ? new Date(raw.pubDate).toISOString() : new Date().toISOString(),
    };
  }

  private buildRichDescription(
    title: string,
    company: string,
    geo: string,
    desc: string
  ): string {
    const parts: string[] = [];
    parts.push(`## ${title} at ${company}\n`);
    parts.push(`**Eligible Region**: ${geo || "Worldwide"} · **Workplace**: 🌐 Remote\n`);

    if (desc.length > 50) {
      parts.push(desc);
    } else {
      parts.push(`Join ${company} as a ${title}. Apply directly via the link below.`);
    }

    parts.push(`\n\n**Application**: Click "Apply for this Job" to submit your application directly on the employer's portal.`);
    return parts.join("\n").trim();
  }

  private detectCountry(geo: string): string {
    const g = geo.toLowerCase();
    if (g.includes("uk") || g.includes("united kingdom") || g.includes("london") || g.includes("great britain")) return "GB";
    if (g.includes("usa") || g.includes("united states") || g.includes("north america") || g.includes("us")) return "US";
    if (g.includes("australia") || g.includes("aus") || g.includes("sydney")) return "AU";
    if (g.includes("canada") || g.includes("can") || g.includes("toronto")) return "CA";
    if (g.includes("new zealand") || g.includes("nz")) return "NZ";
    return "US"; // default global remote proxy
  }

  private mapCategory(category: string): string {
    const c = category.toLowerCase();
    if (/dev|engineer|software|tech|data|cloud|devops|security/.test(c)) return "information-technology";
    if (/finance|accounting|banking/.test(c)) return "finance";
    if (/health|medical|clinical/.test(c)) return "healthcare";
    if (/sales|marketing|business/.test(c)) return "business-operations";
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
