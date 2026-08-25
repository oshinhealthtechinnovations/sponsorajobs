import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../base/JobSourceAdapter";
import { NormalizedJob } from "@/lib/types/job";
import { normalizeRemoteType, normalizeEmploymentType } from "@/normalization";

/**
 * Remotive.com Free Jobs API Adapter
 *
 * ✅ No API key required
 * ✅ No rate limit on free tier
 * ✅ Real remote-first jobs: Tech, Engineering, Finance, HR, Data
 * ✅ Global companies (UK, US, AU, EU, CA) actively hiring internationally
 *
 * API Docs: https://remotive.com/api/remote-jobs
 */

const REMOTIVE_CATEGORY_MAP: Record<string, string[]> = {
  "software-dev":    ["Software Dev", "Engineering"],
  "devops-sysadmin": ["DevOps / Sysadmin"],
  "data":            ["Data"],
  "finance-legal":   ["Finance / Legal"],
  "qa":              ["QA"],
  "product":         ["Product"],
  "design":          ["Design"],
  "marketing":       ["Marketing"],
  "business-dev":    ["Business Dev"],
};

export class RemotiveAdapter implements JobSourceAdapter {
  private enabled: boolean;

  constructor(config?: { enabled?: boolean }) {
    // Always enabled by default — no credentials needed
    this.enabled = config?.enabled ?? (process.env.ENABLE_REMOTIVE !== "false");
  }

  getName(): string    { return "Remotive"; }
  getSourceId(): string { return "remotive"; }
  isEnabled(): boolean  { return this.enabled; }

  getTermsUrl(): string {
    return "https://remotive.com/api/terms";
  }

  isAttributionRequired(): boolean {
    return true; // Remotive requests attribution
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
        errors: ["Remotive adapter is disabled."],
      };
    }

    const allJobs: NormalizedJob[] = [];
    const errors: string[] = [];

    // Fetch from key sponsor-relevant categories
    const categoriesToFetch = ["software-dev", "devops-sysadmin", "data", "finance-legal", "qa"];

    for (const cat of categoriesToFetch) {
      try {
        const url = `https://remotive.com/api/remote-jobs?category=${encodeURIComponent(cat)}&limit=50`;

        const response = await fetch(url, {
          headers: { "Accept": "application/json", "User-Agent": "SponsorAJobs/1.0" },
          signal: AbortSignal.timeout(12000),
        });

        if (!response.ok) {
          errors.push(`Remotive [${cat}] HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        const jobs: any[] = data?.jobs || [];

        for (const job of jobs) {
          const norm = this.normalizeJob(job);
          if (norm && this.validateJob(norm)) {
            allJobs.push(norm);
          }
        }
      } catch (err: any) {
        errors.push(`Remotive [${cat}] error: ${err.message}`);
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

  normalizeJob(raw: any): NormalizedJob | null {
    if (!raw?.id || !raw?.url) return null;

    const title = (raw.title || "").trim();
    const company = (raw.company_name || "Remote Company").trim();
    const description = this.buildRichDescription(raw);
    const applyUrl = raw.url || raw.company_logo_url || "";

    if (!title || !applyUrl) return null;

    // Detect country from tags and company location
    const tags: string[] = raw.tags || [];
    const countryCode = this.detectCountry(raw.candidate_required_location || "", tags);

    return {
      sourceJobId:     String(raw.id),
      sourceId:        this.getSourceId(),
      title,
      companyName:     company,
      companyLogoUrl:  raw.company_logo_url || undefined,
      companyWebsite:  undefined,
      description,
      location:        raw.candidate_required_location || "Remote (Worldwide)",
      city:            "",
      region:          "",
      countryCode,
      remoteType:      "REMOTE",
      employmentType:  normalizeEmploymentType(raw.job_type || "full_time"),
      categorySlug:    this.mapCategory(raw.category || ""),
      salaryMin:       this.parseSalary(raw.salary, "min"),
      salaryMax:       this.parseSalary(raw.salary, "max"),
      salaryCurrency:  this.detectCurrency(countryCode),
      jobUrl:          raw.url,
      applyUrl:        raw.url,
      sourceUrl:       raw.url,
      publishedAt:     raw.publication_date || new Date().toISOString(),
    };
  }

  private buildRichDescription(raw: any): string {
    const parts: string[] = [];

    // Lead with clean title + company context
    parts.push(`## ${raw.title || "Role"} at ${raw.company_name || "Company"}\n`);

    if (raw.candidate_required_location) {
      parts.push(`**Location**: ${raw.candidate_required_location} · **Work Type**: ${raw.job_type || "Full-time"} · **Category**: ${raw.category || "Technology"}\n`);
    }

    // Core description from API (strip basic HTML)
    const rawDesc = (raw.description || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?(p|div|li|ul|ol|h[1-6])[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (rawDesc.length > 50) {
      parts.push(rawDesc);
    }

    // Append tags as skill keywords
    if (raw.tags && raw.tags.length > 0) {
      parts.push(`\n\n**Key Skills & Technologies**: ${raw.tags.join(", ")}`);
    }

    // Salary if present
    if (raw.salary) {
      parts.push(`\n\n**Compensation**: ${raw.salary}`);
    }

    parts.push(`\n\n**How to Apply**: Click the "Apply for this Job" button above to go directly to the company's official application page. Applications are submitted on the employer's official careers portal.`);

    return parts.join("\n").trim();
  }

  private detectCountry(location: string, tags: string[]): string {
    const loc = (location + " " + tags.join(" ")).toLowerCase();
    if (loc.includes("uk") || loc.includes("united kingdom") || loc.includes("britain")) return "GB";
    if (loc.includes("usa") || loc.includes("united states") || loc.includes("u.s.")) return "US";
    if (loc.includes("australia") || loc.includes("sydney") || loc.includes("melbourne")) return "AU";
    if (loc.includes("canada") || loc.includes("toronto") || loc.includes("vancouver")) return "CA";
    if (loc.includes("new zealand") || loc.includes("auckland")) return "NZ";
    // Default to US for worldwide remote (largest market for our categories)
    return "US";
  }

  private detectCurrency(countryCode: string): string {
    const map: Record<string, string> = { GB: "GBP", US: "USD", AU: "AUD", CA: "CAD", NZ: "NZD" };
    return map[countryCode] || "USD";
  }

  private mapCategory(remotiveCategory: string): string {
    const cat = remotiveCategory.toLowerCase();
    if (cat.includes("software") || cat.includes("dev")) return "information-technology";
    if (cat.includes("devops") || cat.includes("sysadmin")) return "information-technology";
    if (cat.includes("data")) return "information-technology";
    if (cat.includes("finance")) return "finance";
    if (cat.includes("design")) return "information-technology";
    if (cat.includes("qa")) return "information-technology";
    if (cat.includes("product")) return "information-technology";
    return "information-technology";
  }

  private parseSalary(salaryStr: string | undefined, part: "min" | "max"): number | undefined {
    if (!salaryStr) return undefined;
    const nums = salaryStr.replace(/[^\d\-\.k]/gi, " ").trim().split(/[\s\-]+/).filter(Boolean);
    const values = nums.map((n) => {
      const v = parseFloat(n.replace(/k$/i, ""));
      return n.toLowerCase().endsWith("k") ? v * 1000 : v;
    }).filter((v) => v > 1000);
    if (values.length === 0) return undefined;
    if (part === "min") return Math.min(...values);
    if (part === "max") return Math.max(...values);
    return undefined;
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
