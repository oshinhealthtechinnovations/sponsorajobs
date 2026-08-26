import { getDatabase, DatabaseClient } from "../db/client";

export interface JobAlertRecord {
  id: string;
  email: string;
  keyword?: string | null;
  country_code?: string | null;
  category_id?: string | null;
  sponsorship_label?: string | null;
  frequency?: "instant" | "daily" | "weekly" | string;
  active: number;
  created_at: string;
}

export interface CreateAlertParams {
  email: string;
  keyword?: string;
  country?: string;
  category?: string;
  frequency?: "instant" | "daily" | "weekly" | string;
}

export class AlertRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || getDatabase();
  }

  async createAlert(params: CreateAlertParams): Promise<JobAlertRecord> {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const email = params.email.toLowerCase().trim();
    const keyword = params.keyword?.trim() || null;
    const country_code = params.country && params.country !== "all" ? params.country.toUpperCase() : null;
    const category_id = params.category && params.category !== "all" ? params.category : null;
    const frequency = params.frequency || "daily";
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO job_alerts (id, email, keyword, country_code, category_id, sponsorship_label, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `;

    try {
      await this.db.prepare(sql).bind(
        id,
        email,
        keyword,
        country_code,
        category_id,
        frequency,
        now
      ).run();
    } catch (err) {
      console.warn("[AlertRepository] Error executing DB insert for alert:", err);
    }

    return {
      id,
      email,
      keyword,
      country_code,
      category_id,
      sponsorship_label: frequency,
      frequency,
      active: 1,
      created_at: now,
    };
  }

  async getAlertsByEmail(email: string): Promise<JobAlertRecord[]> {
    const cleanEmail = email.toLowerCase().trim();
    const sql = `SELECT * FROM job_alerts WHERE LOWER(email) = ? AND active = 1 ORDER BY created_at DESC`;
    const res = await this.db.prepare(sql).bind(cleanEmail).all<JobAlertRecord>();
    return res.results;
  }

  async getAllActiveAlerts(): Promise<JobAlertRecord[]> {
    const sql = `SELECT * FROM job_alerts WHERE active = 1 ORDER BY created_at DESC`;
    const res = await this.db.prepare(sql).all<JobAlertRecord>();
    return res.results;
  }

  async deactivateAlert(id: string): Promise<boolean> {
    const sql = `UPDATE job_alerts SET active = 0 WHERE id = ?`;
    const res = await this.db.prepare(sql).bind(id).run();
    return res.success;
  }
}
