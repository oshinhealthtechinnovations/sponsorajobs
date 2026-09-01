import { getDatabase, DatabaseClient } from "../db/client";
import { CompanyRecord } from "../types/database";

export class CompanyRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || getDatabase();
  }

  async getAll(): Promise<CompanyRecord[]> {
    const res = await this.db
      .prepare("SELECT * FROM companies ORDER BY name ASC")
      .all<CompanyRecord>();
    return res.results;
  }

  async getById(id: string): Promise<CompanyRecord | null> {
    return this.db
      .prepare("SELECT * FROM companies WHERE id = ?")
      .bind(id)
      .first<CompanyRecord>();
  }

  async getBySlug(slug: string): Promise<CompanyRecord | null> {
    if (!slug) return null;
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    // 1. Check all loaded companies with slug normalization
    const companies = await this.getAll();
    const found = companies.find((c) => {
      if (!c) return false;
      const cNameSlug = (c.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const cNormSlug = (c.normalized_name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const cIdSlug = (c.id || "").toLowerCase().replace(/^comp_/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const rawId = (c.id || "").toLowerCase();

      return (
        cNameSlug === cleanSlug ||
        cNormSlug === cleanSlug ||
        cIdSlug === cleanSlug ||
        rawId === slug.toLowerCase() ||
        (c.normalized_name && c.normalized_name.toLowerCase() === slug.toLowerCase().replace(/-/g, " ")) ||
        (c.name && c.name.toLowerCase() === slug.toLowerCase().replace(/-/g, " "))
      );
    });

    if (found) return found;

    // 2. Direct DB fallback query
    const norm = slug.toLowerCase().replace(/-/g, " ");
    return this.db
      .prepare("SELECT * FROM companies WHERE LOWER(normalized_name) = ? OR LOWER(name) = ? OR LOWER(id) = ?")
      .bind(norm, norm, slug.toLowerCase())
      .first<CompanyRecord>();
  }
}
