import { getDatabase, DatabaseClient } from "../db/client";
import { CategoryRecord } from "../types/database";
import { INITIAL_CATEGORIES } from "@/config/categories";

export class CategoryRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || getDatabase();
  }

  async getAll(): Promise<CategoryRecord[]> {
    const res = await this.db
      .prepare("SELECT * FROM categories WHERE active = 1 ORDER BY name ASC")
      .all<CategoryRecord>();

    if (res.results.length === 0) {
      return INITIAL_CATEGORIES.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parent_id: c.parentId || null,
        active: 1,
        seo_title: c.seoTitle || null,
        seo_description: c.seoDescription || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    }
    return res.results;
  }

  async getBySlug(slug: string): Promise<CategoryRecord | null> {
    const lower = slug.toLowerCase();
    const row = await this.db
      .prepare("SELECT * FROM categories WHERE LOWER(slug) = ? AND active = 1")
      .bind(lower)
      .first<CategoryRecord>();

    if (!row) {
      const fallback = INITIAL_CATEGORIES.find((c) => c.slug === lower);
      if (!fallback) return null;
      return {
        id: fallback.id,
        name: fallback.name,
        slug: fallback.slug,
        parent_id: fallback.parentId || null,
        active: 1,
        seo_title: fallback.seoTitle || null,
        seo_description: fallback.seoDescription || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return row;
  }

  async getJobCountByCategory(categoryId: string): Promise<number> {
    const row = await this.db
      .prepare("SELECT COUNT(*) as count FROM jobs WHERE category_id = ? AND status = 'active'")
      .bind(categoryId)
      .first<{ count: number }>();
    return row?.count ?? 0;
  }
}
