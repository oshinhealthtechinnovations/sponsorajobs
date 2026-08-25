import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";

describe("Database Migrations & Schema Verification", () => {
  let db: any;

  beforeAll(async () => {
    const SQL = await initSqlJs();
    db = new SQL.Database();
    
    // Read and run migration 001
    const m1 = fs.readFileSync(path.resolve(__dirname, "../migrations/001_initial_schema.sql"), "utf-8");
    db.exec(m1);

    // Read and run migration 002
    const m2 = fs.readFileSync(path.resolve(__dirname, "../migrations/002_indexes.sql"), "utf-8");
    db.exec(m2);
  });

  it("should create all required tables", () => {
    const res = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const tables = res[0].values.map((v: any[]) => v[0]);

    expect(tables).toContain("countries");
    expect(tables).toContain("categories");
    expect(tables).toContain("companies");
    expect(tables).toContain("sources");
    expect(tables).toContain("company_source_config");
    expect(tables).toContain("jobs");
    expect(tables).toContain("source_runs");
    expect(tables).toContain("admin_action_log");
    expect(tables).toContain("saved_jobs");
    expect(tables).toContain("job_alerts");
  });

  it("should create all required indexes", () => {
    const res = db.exec("SELECT name FROM sqlite_master WHERE type='index'");
    const indexes = res[0].values.map((v: any[]) => v[0]);

    expect(indexes).toContain("idx_jobs_country_code");
    expect(indexes).toContain("idx_jobs_category_id");
    expect(indexes).toContain("idx_jobs_canonical_hash");
    expect(indexes).toContain("idx_jobs_sponsorship_label");
  });

  it("should successfully insert and query jobs with foreign keys", () => {
    // Insert prerequisite country, company, source
    db.run(`
      INSERT INTO countries (id, code, name, slug, flag, currency, created_at, updated_at)
      VALUES ('c_gb', 'GB', 'United Kingdom', 'uk', '🇬🇧', 'GBP', '2026-01-01', '2026-01-01')
    `);

    db.run(`
      INSERT INTO sources (id, name, type, created_at, updated_at)
      VALUES ('s_manual', 'manual_seed', 'api', '2026-01-01', '2026-01-01')
    `);

    db.run(`
      INSERT INTO companies (id, name, normalized_name, country_code, created_at, updated_at)
      VALUES ('comp_1', 'Acme Corp', 'acme corp', 'GB', '2026-01-01', '2026-01-01')
    `);

    // Insert job
    db.run(`
      INSERT INTO jobs (
        id, source_id, source_job_id, canonical_hash, title, company_id,
        description, country_code, remote_type, employment_type,
        job_url, apply_url, sponsorship_score, sponsorship_label,
        quality_score, status, first_seen_at, last_seen_at, created_at, updated_at
      ) VALUES (
        'job_1', 's_manual', 'src_100', 'hash_abc123', 'Senior Structural Engineer', 'comp_1',
        'We offer Skilled Worker visa sponsorship.', 'GB', 'ONSITE', 'FULL_TIME',
        'https://example.com/job/100', 'https://example.com/apply/100', 95, 'Strong',
        100, 'active', '2026-01-01', '2026-01-01', '2026-01-01', '2026-01-01'
      )
    `);

    const result = db.exec("SELECT title, sponsorship_label FROM jobs WHERE id = 'job_1'");
    expect(result[0].values[0][0]).toBe("Senior Structural Engineer");
    expect(result[0].values[0][1]).toBe("Strong");
  });
});
