import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import {
  normalizeCountryCode,
  normalizeEmploymentType,
  cleanHtmlToMarkdown,
} from "@/normalization";

/**
 * Himalayas.app Free Remote Tech Jobs API Adapter
 *
 * ✅ 100% Free public API, no API key required
 * ✅ Curated remote tech, engineering, product, AI, and design roles
 * ✅ Clean company metadata, location restriction tagging, and salary ranges
 *
 * API Docs: https://himalayas.app/jobs/api
 */
export class HimalayasAdapter implements JobSourceAdapter {
  private enabled: boolean;

  constructor(config?: { enabled?: boolean }) {
    this.enabled = config?.enabled ?? (process.env.ENABLE_HIMALAYAS !== "false");
  }

  getName(): string {
    return "Himalayas";
  }

  getSourceId(): string {
    return "himalayas";
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getTermsUrl(): string {
    return "https://himalayas.app/terms";
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
        errors: ["Himalayas adapter is disabled."],
      };
    }

    try {
      const limit = Math.min(50, context.limit || 50);
      const url = `https://himalayas.app/jobs/api?limit=${limit}`;

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
          errors: [`Himalayas API HTTP ${response.status}: ${response.statusText}`],
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
    if (!raw || !raw.title) return null;

    const title = (raw.title || "").trim();
    const companyName = (raw.companyName || "Company").trim();
    const applyUrl = raw.applicationLink || raw.guid || "";
    const jobUrl = raw.guid || raw.applicationLink || applyUrl;

    if (!title || !applyUrl) return null;

    const rawId = raw.guid || raw.applicationLink || `${raw.companySlug || "himalayas"}_${title}`;
    const sourceJobId = `himalayas_${rawId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(-50)}`;

    const locationRestrictions: string[] = Array.isArray(raw.locationRestrictions)
      ? raw.locationRestrictions
      : [];
    const locationStr = locationRestrictions.length > 0
      ? `Remote (${locationRestrictions.join(", ")})`
      : "Remote (Worldwide)";
    const countryCode = this.detectCountry(locationRestrictions.join(" "));

    const descMarkdown = cleanHtmlToMarkdown(raw.description || raw.excerpt || "");
    const description = this.buildRichDescription(title, companyName, locationRestrictions, descMarkdown);

    const salaryMin = raw.minSalary && Number(raw.minSalary) > 1000 ? Number(raw.minSalary) : undefined;
    const salaryMax = raw.maxSalary && Number(raw.maxSalary) > 1000 ? Number(raw.maxSalary) : undefined;
    const salaryCurrency = raw.currency || raw.salaryCurrency || (countryCode === "GB" ? "GBP" : countryCode === "AU" ? "AUD" : countryCode === "CA" ? "CAD" : "USD");

    return {
      sourceJobId,
      sourceId: this.getSourceId(),
      title,
      companyName,
      companyLogoUrl: raw.companyLogo || undefined,
      description,
      location: locationStr,
      city: "",
      region: "",
      countryCode,
      remoteType: "REMOTE",
      employmentType: normalizeEmploymentType(raw.employmentType || "FULL_TIME"),
      categorySlug: this.mapCategory(raw.categories || [title]),
      salaryMin,
      salaryMax,
      salaryCurrency,
      jobUrl,
      applyUrl,
      sourceUrl: jobUrl,
      publishedAt: raw.pubDate
        ? (typeof raw.pubDate === "number" ? new Date(raw.pubDate * 1000).toISOString() : new Date(raw.pubDate).toISOString())
        : new Date().toISOString(),
    };
  }

  private buildRichDescription(
    title: string,
    company: string,
    restrictions: string[],
    desc: string
  ): string {
    const parts: string[] = [];
    parts.push(`## ${title} at ${company}\n`);
    parts.push(`**Location Guidelines**: ${restrictions.length > 0 ? restrictions.join(", ") : "Worldwide"} · **Workplace**: 🌐 Remote\n`);

    if (desc.length > 50) {
      parts.push(desc);
    } else {
      parts.push(`Join ${company} as a ${title}. Apply directly via the official employer portal.`);
    }

    parts.push(`\n\n**How to Apply**: Click "Apply for this Job" to be redirected directly to ${company}'s official application form.`);
    return parts.join("\n").trim();
  }

  private detectCountry(text: string): string {
    const t = text.toLowerCase();
    if (t.includes("uk") || t.includes("united kingdom") || t.includes("london") || t.includes("britain")) return "GB";
    if (t.includes("usa") || t.includes("united states") || t.includes("us")) return "US";
    if (t.includes("australia") || t.includes("sydney") || t.includes("melbourne")) return "AU";
    if (t.includes("canada") || t.includes("toronto") || t.includes("vancouver")) return "CA";
    if (t.includes("new zealand") || t.includes("auckland")) return "NZ";
    return "US";
  }

  private mapCategory(categories: string[]): string {
    const catStr = categories.join(" ").toLowerCase();
    if (/devops|infrastructure|cloud|security|sre/.test(catStr)) return "information-technology";
    if (/data|ai|machine learning|analytics/.test(catStr)) return "information-technology";
    if (/engineer|developer|software|frontend|backend|full-stack/.test(catStr)) return "information-technology";
    if (/finance|accounting/.test(catStr)) return "finance";
    if (/health|clinical|medical/.test(catStr)) return "healthcare";
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
