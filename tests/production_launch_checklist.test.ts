import { describe, it, expect, beforeAll } from "vitest";
import { runSeed } from "../scripts/seed";
import { INITIAL_COUNTRIES } from "../config/countries";
import { INITIAL_CATEGORIES } from "../config/categories";
import { POSITIVE_SPONSORSHIP_PATTERNS, NEGATIVE_SPONSORSHIP_PATTERNS } from "../config/sponsorship-rules";
import { DatabaseClient, DbPreparedStatement, DbResult } from "../lib/db/client";
import { GET as healthHandler } from "../app/api/health/route";

describe("Phase 10: Production Launch Checklist & System Verification (Sections 99, 148, 150)", () => {
  let dbClient: DatabaseClient;
  let rawDb: any;

  beforeAll(async () => {
    rawDb = await runSeed();

    dbClient = {
      prepare(query: string) {
        let boundValues: any[] = [];
        const stmtObj: DbPreparedStatement = {
          bind(...values: any[]) {
            boundValues = values;
            return stmtObj;
          },
          async all<T = any>(): Promise<DbResult<T>> {
            try {
              const stmt = rawDb.prepare(query);
              stmt.bind(boundValues);
              const results: T[] = [];
              while (stmt.step()) {
                results.push(stmt.getAsObject() as T);
              }
              stmt.free();
              return { results, success: true };
            } catch (err: any) {
              return { results: [], success: false, meta: { error: err.message } };
            }
          },
          async first<T = any>(col?: string): Promise<T | null> {
            const res = await this.all<T>();
            if (!res.results.length) return null;
            const row: any = res.results[0];
            if (col && row[col] !== undefined) return row[col] as T;
            return row as T;
          },
          async run(): Promise<DbResult> {
            try {
              rawDb.run(query, boundValues);
              return { results: [], success: true };
            } catch (err: any) {
              return { results: [], success: false, meta: { error: err.message } };
            }
          }
        };
        return stmtObj;
      },
      async batch(statements: DbPreparedStatement[]): Promise<DbResult[]> {
        const res: DbResult[] = [];
        for (const s of statements) res.push(await s.run());
        return res;
      },
      async exec(query: string): Promise<void> {
        rawDb.exec(query);
      }
    };
  });

  // 1. Database Schema Completeness (Section 25-29)
  it("should have all 9 core schema tables created and accessible", async () => {
    const tables = [
      "countries",
      "categories",
      "companies",
      "sources",
      "company_source_config",
      "jobs",
      "source_runs",
      "admin_action_log",
      "saved_jobs",
      "job_alerts",
    ];

    for (const table of tables) {
      const res = await dbClient.prepare(`SELECT count(*) as count FROM ${table}`).all();
      expect(res.success).toBe(true);
    }
  });

  // 2. 5 Target Countries Verification
  it("should have 5 active target countries configured", () => {
    expect(INITIAL_COUNTRIES.length).toBe(5);
    const codes = INITIAL_COUNTRIES.map((c) => c.code);
    expect(codes).toContain("GB");
    expect(codes).toContain("US");
    expect(codes).toContain("AU");
    expect(codes).toContain("CA");
    expect(codes).toContain("NZ");
  });

  // 3. 9 Core Industry Categories Verification
  it("should have 9 active categories configured", () => {
    expect(INITIAL_CATEGORIES.length).toBe(9);
    const slugs = INITIAL_CATEGORIES.map((c) => c.slug);
    expect(slugs).toContain("information-technology");
    expect(slugs).toContain("healthcare");
    expect(slugs).toContain("engineering");
    expect(slugs).toContain("finance");
  });

  // 4. Sponsorship Pattern Lexicon Verification
  it("should have positive and negative sponsorship patterns defined", () => {
    expect(POSITIVE_SPONSORSHIP_PATTERNS.length).toBeGreaterThan(5);
    expect(NEGATIVE_SPONSORSHIP_PATTERNS.length).toBeGreaterThan(2);
  });

  // 5. Health API Endpoint Check (Section 148)
  it("should return healthy status, active jobs count, and source adapter states from /api/health", async () => {
    const response = await healthHandler();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.platform).toBe("SponsorAJobs");
    expect(body.checks.database.status).toBe("healthy");
    expect(body.checks.database.activeJobs).toBeGreaterThan(0);
    expect(body.checks.sources.registeredCount).toBeGreaterThanOrEqual(4);
  });
});
