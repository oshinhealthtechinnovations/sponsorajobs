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
    const norm = slug.toLowerCase().replace(/-/g, " ");
    return this.db
      .prepare("SELECT * FROM companies WHERE LOWER(normalized_name) = ? OR LOWER(id) = ?")
      .bind(norm, slug.toLowerCase())
      .first<CompanyRecord>();
  }
}
