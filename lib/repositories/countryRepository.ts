import { getDatabase, DatabaseClient } from "../db/client";
import { CountryRecord } from "../types/database";
import { INITIAL_COUNTRIES } from "@/config/countries";

export class CountryRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || getDatabase();
  }

  async getAllActive(): Promise<CountryRecord[]> {
    const res = await this.db
      .prepare("SELECT * FROM countries WHERE active = 1 ORDER BY name ASC")
      .all<CountryRecord>();
    
    if (res.results.length === 0) {
      // Fallback to static config if DB hasn't been seeded yet
      return INITIAL_COUNTRIES.map((c) => ({
        id: `c_${c.code.toLowerCase()}`,
        code: c.code,
        name: c.name,
        slug: c.slug,
        flag: c.flag,
        currency: c.currency,
        active: 1,
        seo_title: c.seoTitle,
        seo_description: c.seoDescription,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
    return res.results;
  }

  async getByCode(code: string): Promise<CountryRecord | null> {
    const upper = code.toUpperCase();
    const row = await this.db
      .prepare("SELECT * FROM countries WHERE UPPER(code) = ? AND active = 1")
      .bind(upper)
      .first<CountryRecord>();
    
    if (!row) {
      const fallback = INITIAL_COUNTRIES.find((c) => c.code === upper);
      if (!fallback) return null;
      return {
        id: `c_${fallback.code.toLowerCase()}`,
        code: fallback.code,
        name: fallback.name,
        slug: fallback.slug,
        flag: fallback.flag,
        currency: fallback.currency,
        active: 1,
        seo_title: fallback.seoTitle,
        seo_description: fallback.seoDescription,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return row;
  }

  async getBySlug(slug: string): Promise<CountryRecord | null> {
    const lower = slug.toLowerCase();
    const row = await this.db
      .prepare("SELECT * FROM countries WHERE LOWER(slug) = ? AND active = 1")
      .bind(lower)
      .first<CountryRecord>();
    
    if (!row) {
      const fallback = INITIAL_COUNTRIES.find((c) => c.slug === lower);
      if (!fallback) return null;
      return {
        id: `c_${fallback.code.toLowerCase()}`,
        code: fallback.code,
        name: fallback.name,
        slug: fallback.slug,
        flag: fallback.flag,
        currency: fallback.currency,
        active: 1,
        seo_title: fallback.seoTitle,
        seo_description: fallback.seoDescription,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return row;
  }

  async getJobCountByCountry(code: string): Promise<number> {
    const row = await this.db
      .prepare("SELECT COUNT(*) as count FROM jobs WHERE UPPER(country_code) = ? AND status = 'active'")
      .bind(code.toUpperCase())
      .first<{ count: number }>();
    return row?.count ?? 0;
  }
}
