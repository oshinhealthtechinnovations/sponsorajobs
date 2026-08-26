import { getDatabase, DatabaseClient } from "../db/client";
import { JobRecord, CompanyRecord, CategoryRecord, CountryRecord } from "../types/database";
import { PublicJobDTO } from "../types/job";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { normalizeSearchQuery } from "@/lib/utils/searchNormalizer";

export interface JobSearchParams {
  q?: string;
  country?: string;
  category?: string;
  city?: string;
  remoteType?: string;
  employmentType?: string;
  sponsorship?: string;
  minSalary?: number;
  maxSalary?: number;
  datePosted?: "today" | "week" | "month" | "all" | string;
  sort?: "newest" | "relevance" | "sponsorship" | "salary";
  page?: number;
  limit?: number;
}

export interface JobSearchResult {
  jobs: PublicJobDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  fallbackJobs?: PublicJobDTO[];
  isRelaxed?: boolean;
}

export class JobRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || getDatabase();
  }

  private mapToDTO(
    job: JobRecord,
    company?: CompanyRecord | null,
    category?: CategoryRecord | null
  ): PublicJobDTO {
    let positiveEvidence: string[] = [];
    let negativeEvidence: string[] = [];
    let visaKeywords: string[] = [];

    try {
      if (job.sponsorship_positive_evidence) {
        positiveEvidence = JSON.parse(job.sponsorship_positive_evidence);
      }
      if (job.sponsorship_negative_evidence) {
        negativeEvidence = JSON.parse(job.sponsorship_negative_evidence);
      }
      if (job.visa_keywords) {
        visaKeywords = JSON.parse(job.visa_keywords);
      }
    } catch {
      // Ignored if JSON parsing fails
    }

    const companyName = company?.name || "Verified Employer";
    const slugSuffix = job.id.replace(/[^a-z0-9]+/g, "-");
    const slug = `${job.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}--${slugSuffix}`;

    return {
      id: job.id,
      slug,
      title: job.title,
      company: {
        id: job.company_id,
        name: companyName,
        logoUrl: company?.logo_url || null,
        industry: company?.industry || null,
        website: company?.website || null,
      },
      location: {
        city: job.city,
        region: job.region,
        country: job.country_code,
        formatted: job.location || `${job.city ? job.city + ", " : ""}${job.country_code}`,
      },
      employmentType: job.employment_type,
      remoteType: job.remote_type,
      category: category
        ? { id: category.id, name: category.name, slug: category.slug }
        : null,
      salary:
        job.salary_min || job.salary_max
          ? {
              min: job.salary_min,
              max: job.salary_max,
              currency: job.salary_currency || "USD",
            }
          : null,
      sponsorship: {
        label: job.sponsorship_label,
        evidenceMessage:
          job.sponsorship_label === "Strong"
            ? "Visa sponsorship detected directly in job listing"
            : job.sponsorship_label === "Likely"
            ? "Strong sponsorship signals identified"
            : job.sponsorship_label === "Possible"
            ? "Potential visa support mentioned; subject to employer confirmation"
            : job.sponsorship_label === "Explicitly Not Offered"
            ? "Employer states sponsorship is not available"
            : "No explicit sponsorship signals detected",
        positiveEvidence,
        negativeEvidence,
        visaKeywords,
      },
      postedAt: job.published_at || job.first_seen_at,
      applyUrl: job.apply_url,
      sourceName: job.source_id,
    };
  }

  async search(params: JobSearchParams): Promise<JobSearchResult> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ["j.status = 'active'"];
    const bindings: any[] = [];

    // 1. Keyword search with smart typo tolerance and multi-word tokenization
    if (params.q) {
      const { tokens } = normalizeSearchQuery(params.q);
      const cleanQ = params.q.trim().toLowerCase();
      if (tokens.length === 1) {
        conditions.push("(LOWER(j.title) LIKE ? OR LOWER(j.description) LIKE ? OR LOWER(c.name) LIKE ?)");
        const term = `%${tokens[0].toLowerCase()}%`;
        bindings.push(term, term, term);
      } else if (tokens.length > 1) {
        const titleTokensCond = tokens.map(() => "LOWER(j.title) LIKE ?").join(" OR ");
        const allTokensDescCond = tokens.map(() => "LOWER(j.description) LIKE ?").join(" AND ");
        const titleParams = tokens.map((t) => `%${t.toLowerCase()}%`);
        const descParams = tokens.map((t) => `%${t.toLowerCase()}%`);

        conditions.push(
          `(${titleTokensCond} OR LOWER(j.title) LIKE ? OR LOWER(j.description) LIKE ? OR LOWER(c.name) LIKE ? OR (${allTokensDescCond}))`
        );
        bindings.push(...titleParams, `%${cleanQ}%`, `%${cleanQ}%`, `%${cleanQ}%`, ...descParams);
      } else if (params.q.trim().length > 0 && tokens.length === 0) {
        // Query consisted only of discarded non-alphanumeric punctuation or stop words
        conditions.push("1 = 0");
      }
    }

    // 2. Country filter
    if (params.country && params.country !== "ALL") {
      conditions.push("UPPER(j.country_code) = ?");
      bindings.push(params.country.toUpperCase());
    }

    // 3. Category filter (with hierarchical parent-child resolution)
    if (params.category) {
      const catSlug = params.category.toLowerCase();
      const parentCat = INITIAL_CATEGORIES.find((c) => c.slug === catSlug);
      if (parentCat && parentCat.subcategories && parentCat.subcategories.length > 0) {
        const matchingSlugs = [parentCat.slug, ...parentCat.subcategories.map((s) => s.slug)];
        const placeholders = matchingSlugs.map(() => "?").join(", ");
        conditions.push(`(cat.slug IN (${placeholders}) OR j.category_id = ?)`);
        bindings.push(...matchingSlugs, parentCat.id);
      } else {
        conditions.push("(cat.slug = ? OR j.category_id = ?)");
        bindings.push(catSlug, params.category);
      }
    }

    // 4. City filter
    if (params.city) {
      conditions.push("LOWER(j.city) = ?");
      bindings.push(params.city.toLowerCase().trim());
    }

    // 5. Workplace / Remote filter
    if (params.remoteType) {
      conditions.push("j.remote_type = ?");
      bindings.push(params.remoteType.toUpperCase());
    }

    // 6. Employment type filter
    if (params.employmentType) {
      conditions.push("j.employment_type = ?");
      bindings.push(params.employmentType.toUpperCase());
    }

    // 7. Sponsorship confidence filter
    if (params.sponsorship) {
      conditions.push("LOWER(j.sponsorship_label) = ?");
      bindings.push(params.sponsorship.toLowerCase());
    }

    // 8. Salary Range filters (minSalary / maxSalary)
    if (params.minSalary !== undefined && params.minSalary > 0) {
      conditions.push("(j.salary_max >= ? OR j.salary_min >= ?)");
      bindings.push(Number(params.minSalary), Number(params.minSalary));
    }
    if (params.maxSalary !== undefined && params.maxSalary > 0) {
      conditions.push("(j.salary_min <= ? OR j.salary_max <= ?)");
      bindings.push(Number(params.maxSalary), Number(params.maxSalary));
    }

    // 9. Date Freshness filter (today, week, month)
    if (params.datePosted && params.datePosted !== "all") {
      let days = 30;
      if (params.datePosted === "today" || params.datePosted === "24h") days = 1;
      else if (params.datePosted === "week" || params.datePosted === "7d") days = 7;
      else if (params.datePosted === "month" || params.datePosted === "30d") days = 30;

      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      conditions.push("(j.published_at >= ? OR j.first_seen_at >= ?)");
      bindings.push(cutoff, cutoff);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // 10. Sorting — When searching by keyword (q), default to intelligent RELEVANCE sorting
    const effectiveSort = params.sort || (params.q ? "relevance" : "newest");
    let orderClause = "ORDER BY j.quality_score DESC, j.published_at DESC, j.created_at DESC";
    if (effectiveSort === "newest") {
      orderClause = "ORDER BY j.published_at DESC, j.first_seen_at DESC";
    } else if (effectiveSort === "sponsorship") {
      orderClause = "ORDER BY j.sponsorship_score DESC, j.quality_score DESC, j.published_at DESC";
    } else if (effectiveSort === "salary") {
      orderClause = "ORDER BY j.salary_max DESC NULLS LAST, j.salary_min DESC NULLS LAST, j.quality_score DESC";
    } else if (effectiveSort === "relevance" && params.q) {
      const cleanQ = params.q.trim().toLowerCase();
      const tokens = normalizeSearchQuery(params.q).tokens;
      const titleTokenCases = tokens
        .map((t) => `WHEN LOWER(j.title) LIKE '%${t.replace(/'/g, "''")}%' THEN 1000`)
        .join(" ");

      orderClause = `ORDER BY (
        CASE
          WHEN LOWER(j.title) = '${cleanQ.replace(/'/g, "''")}' THEN 10000
          WHEN LOWER(j.title) LIKE '%${cleanQ.replace(/'/g, "''")}%' THEN 5000
          ${titleTokenCases}
          WHEN LOWER(c.name) LIKE '%${cleanQ.replace(/'/g, "''")}%' THEN 400
          WHEN LOWER(j.description) LIKE '%${cleanQ.replace(/'/g, "''")}%' THEN 300
          ELSE 0
        END + (COALESCE(j.sponsorship_score, 50) * 0.2) + (COALESCE(j.quality_score, 50) * 0.1)
      ) DESC, j.published_at DESC`;
    }

    // Count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN categories cat ON j.category_id = cat.id
      ${whereClause}
    `;

    const totalRow = await this.db.prepare(countSql).bind(...bindings).first<{ total: number }>();
    const total = totalRow?.total ?? 0;

    // Data query with joins
    const dataSql = `
      SELECT j.*, 
             c.name as company_name, c.logo_url as company_logo, c.industry as company_industry, c.website as company_website,
             cat.name as category_name, cat.slug as category_slug
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN categories cat ON j.category_id = cat.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const res = await this.db.prepare(dataSql).bind(...bindings, limit, offset).all<any>();

    const jobs: PublicJobDTO[] = res.results.map((row) => {
      const company: CompanyRecord = {
        id: row.company_id,
        name: row.company_name || "Verified Employer",
        normalized_name: (row.company_name || "").toLowerCase(),
        website: row.company_website || null,
        careers_url: null,
        logo_url: row.company_logo || null,
        industry: row.company_industry || null,
        description: null,
        country_code: row.country_code,
        sponsorship_signal: null,
        created_at: "",
        updated_at: "",
      };

      const category: CategoryRecord | null = row.category_id
        ? {
            id: row.category_id,
            name: row.category_name || "",
            slug: row.category_slug || "",
            parent_id: null,
            active: 1,
            seo_title: null,
            seo_description: null,
            created_at: "",
            updated_at: "",
          }
        : null;

      return this.mapToDTO(row, company, category);
    });

    let fallbackJobs: PublicJobDTO[] | undefined;
    if (total === 0) {
      fallbackJobs = await this.getFallbackSuggestions(
        { q: params.q, country: params.country, category: params.category },
        6
      );
    }

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      fallbackJobs,
    };
  }

  async getById(id: string): Promise<PublicJobDTO | null> {
    const dataSql = `
      SELECT j.*, 
             c.name as company_name, c.logo_url as company_logo, c.industry as company_industry, c.website as company_website,
             cat.name as category_name, cat.slug as category_slug
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN categories cat ON j.category_id = cat.id
      WHERE j.id = ?
    `;
    const row = await this.db.prepare(dataSql).bind(id).first<any>();
    if (!row) return null;

    const company: CompanyRecord = {
      id: row.company_id,
      name: row.company_name || "Verified Employer",
      normalized_name: (row.company_name || "").toLowerCase(),
      website: row.company_website || null,
      careers_url: null,
      logo_url: row.company_logo || null,
      industry: row.company_industry || null,
      description: null,
      country_code: row.country_code,
      sponsorship_signal: null,
      created_at: "",
      updated_at: "",
    };

    const category: CategoryRecord | null = row.category_id
      ? {
          id: row.category_id,
          name: row.category_name || "",
          slug: row.category_slug || "",
          parent_id: null,
          active: 1,
          seo_title: null,
          seo_description: null,
          created_at: "",
          updated_at: "",
        }
      : null;

    return this.mapToDTO(row, company, category);
  }

  async getBySlug(slug: string): Promise<{ job: PublicJobDTO; fullDescription: string } | null> {
    let exactId = "";
    if (slug.includes("--")) {
      const parts = slug.split("--");
      exactId = parts[parts.length - 1].replace(/-/g, "_");
    } else {
      const parts = slug.split("-");
      exactId = parts[parts.length - 1];
    }

    const dataSql = `
      SELECT j.*, 
             c.name as company_name, c.logo_url as company_logo, c.industry as company_industry, c.website as company_website,
             cat.name as category_name, cat.slug as category_slug
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN categories cat ON j.category_id = cat.id
      WHERE j.id = ? OR j.id = ? OR j.id LIKE ? OR j.id LIKE ?
      LIMIT 1
    `;

    const row = await this.db.prepare(dataSql).bind(exactId, slug, `${exactId}%`, `%${exactId}`).first<any>();
    if (!row) return null;

    const company: CompanyRecord = {
      id: row.company_id,
      name: row.company_name || "Verified Employer",
      normalized_name: (row.company_name || "").toLowerCase(),
      website: row.company_website || null,
      careers_url: null,
      logo_url: row.company_logo || null,
      industry: row.company_industry || null,
      description: null,
      country_code: row.country_code,
      sponsorship_signal: null,
      created_at: "",
      updated_at: "",
    };

    const category: CategoryRecord | null = row.category_id
      ? {
          id: row.category_id,
          name: row.category_name || "",
          slug: row.category_slug || "",
          parent_id: null,
          active: 1,
          seo_title: null,
          seo_description: null,
          created_at: "",
          updated_at: "",
        }
      : null;

    const dto = this.mapToDTO(row, company, category);
    return {
      job: dto,
      fullDescription: row.description,
    };
  }

  async getRelatedJobs(jobId: string, countryCode: string, categoryId?: string | null, limit: number = 4): Promise<PublicJobDTO[]> {
    let sql = `
      SELECT j.*, 
             c.name as company_name, c.logo_url as company_logo, c.industry as company_industry, c.website as company_website,
             cat.name as category_name, cat.slug as category_slug
      FROM jobs j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN categories cat ON j.category_id = cat.id
      WHERE j.id != ? AND j.status = 'active' AND (j.country_code = ? OR j.category_id = ?)
      ORDER BY j.sponsorship_score DESC, j.published_at DESC
      LIMIT ?
    `;
    const res = await this.db.prepare(sql).bind(jobId, countryCode, categoryId || "", limit).all<any>();

    return res.results.map((row) => {
      const company: CompanyRecord = {
        id: row.company_id,
        name: row.company_name || "Verified Employer",
        normalized_name: (row.company_name || "").toLowerCase(),
        website: null,
        careers_url: null,
        logo_url: row.company_logo || null,
        industry: null,
        description: null,
        country_code: row.country_code,
        sponsorship_signal: null,
        created_at: "",
        updated_at: "",
      };
      return this.mapToDTO(row, company, null);
    });
  }

  async getLatestJobs(limit: number = 10): Promise<PublicJobDTO[]> {
    return (await this.search({ limit, sort: "newest" })).jobs;
  }

  async getFallbackSuggestions(
    params: { q?: string; country?: string; category?: string },
    limit: number = 6
  ): Promise<PublicJobDTO[]> {
    // 1. If category provided, find top jobs in category
    if (params.category && params.category !== "all") {
      const res = await this.search({ category: params.category, limit, sort: "sponsorship" });
      if (res.jobs.length > 0) return res.jobs;
    }
    // 2. If country provided, find top jobs in country
    if (params.country && params.country !== "ALL" && params.country !== "all") {
      const res = await this.search({ country: params.country, limit, sort: "sponsorship" });
      if (res.jobs.length > 0) return res.jobs;
    }
    // 3. Global top-scoring sponsorship jobs
    const res = await this.search({ limit, sort: "sponsorship" });
    return res.jobs;
  }

  async getTotalActiveJobCount(): Promise<number> {
    const row = await this.db
      .prepare("SELECT COUNT(*) as total FROM jobs WHERE status = 'active'")
      .first<{ total: number }>();
    return row?.total ?? 0;
  }
}
