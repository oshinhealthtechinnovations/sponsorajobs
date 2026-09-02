import { getDatabase, DatabaseClient } from "../db/client";
import { CountryRecord } from "../types/database";
import { INITIAL_COUNTRIES, getCountryBySlug, getCountryByCode } from "@/config/countries";

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
    if (!code) return null;
    const upper = code.trim().toUpperCase();
    const config = getCountryByCode(code) || getCountryBySlug(code);
    const targetCode = config ? config.code : upper;

    const row = await this.db
      .prepare("SELECT * FROM countries WHERE (UPPER(code) = ? OR UPPER(code) = ?) AND active = 1")
      .bind(upper, targetCode)
      .first<CountryRecord>();
    
    if (!row) {
      if (!config) return null;
      return {
        id: `c_${config.code.toLowerCase()}`,
        code: config.code,
        name: config.name,
        slug: config.slug,
        flag: config.flag,
        currency: config.currency,
        active: 1,
        seo_title: config.seoTitle,
        seo_description: config.seoDescription,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return row;
  }

  async getBySlug(slug: string): Promise<CountryRecord | null> {
    if (!slug) return null;
    const lower = slug.trim().toLowerCase();
    const config = getCountryBySlug(lower) || getCountryByCode(lower);
    const targetSlug = config ? config.slug : lower;
    const targetCode = config ? config.code : lower.toUpperCase();

    const row = await this.db
      .prepare("SELECT * FROM countries WHERE (LOWER(slug) = ? OR LOWER(slug) = ? OR UPPER(code) = ?) AND active = 1")
      .bind(lower, targetSlug, targetCode)
      .first<CountryRecord>();
    
    if (!row) {
      if (!config) return null;
      return {
        id: `c_${config.code.toLowerCase()}`,
        code: config.code,
        name: config.name,
        slug: config.slug,
        flag: config.flag,
        currency: config.currency,
        active: 1,
        seo_title: config.seoTitle,
        seo_description: config.seoDescription,
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
