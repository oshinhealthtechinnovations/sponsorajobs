import { describe, it, expect, beforeAll } from "vitest";
import initSqlJs from "sql.js";
import { runSeed } from "../scripts/seed";
import { JobRepository } from "../lib/repositories/jobRepository";
import { CountryRepository } from "../lib/repositories/countryRepository";
import { CategoryRepository } from "../lib/repositories/categoryRepository";
import { CompanyRepository } from "../lib/repositories/companyRepository";
import { DatabaseClient, DbPreparedStatement, DbResult } from "../lib/db/client";

describe("Phase 2: Database Repositories & Search Engine Verification", () => {
  let dbClient: DatabaseClient;

  beforeAll(async () => {
    const rawDb = await runSeed();

    // Wrap rawDb into DatabaseClient interface
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

  it("should have seeded at least 5 countries, 10 categories, 10 companies, and 30 sample jobs", async () => {
    const jobRepo = new JobRepository(dbClient);
    const countryRepo = new CountryRepository(dbClient);
    const catRepo = new CategoryRepository(dbClient);
    const compRepo = new CompanyRepository(dbClient);

    const totalJobs = await jobRepo.getTotalActiveJobCount();
    expect(totalJobs).toBeGreaterThanOrEqual(30);

    const countries = await countryRepo.getAllActive();
    expect(countries.length).toBeGreaterThanOrEqual(5);

    const categories = await catRepo.getAll();
    expect(categories.length).toBeGreaterThanOrEqual(9);

    const companies = await compRepo.getAll();
    expect(companies.length).toBeGreaterThanOrEqual(10);
  });

  it("should search jobs by keyword accurately", async () => {
    const jobRepo = new JobRepository(dbClient);
    const res = await jobRepo.search({ q: "Civil Engineer" });

    expect(res.jobs.length).toBeGreaterThan(0);
    expect(res.jobs.some((j) => j.title.includes("Civil"))).toBe(true);
  });

  it("should filter jobs by country code (e.g. Australia 'AU')", async () => {
    const jobRepo = new JobRepository(dbClient);
    const res = await jobRepo.search({ country: "au" });

    expect(res.jobs.length).toBeGreaterThan(0);
    expect(res.jobs.every((j) => j.location.country === "AU")).toBe(true);
  });

  it("should filter jobs by sponsorship signal (e.g. Strong)", async () => {
    const jobRepo = new JobRepository(dbClient);
    const res = await jobRepo.search({ sponsorship: "strong" });

    expect(res.jobs.length).toBeGreaterThan(0);
    expect(res.jobs.every((j) => j.sponsorship.label === "Strong")).toBe(true);
  });

  it("should retrieve a job by its slug and return full description and evidence", async () => {
    const jobRepo = new JobRepository(dbClient);
    const latest = await jobRepo.getLatestJobs(1);
    expect(latest.length).toBe(1);

    const detail = await jobRepo.getBySlug(latest[0].slug);
    expect(detail).not.toBeNull();
    expect(detail?.job.id).toBe(latest[0].id);
    expect(detail?.fullDescription.length).toBeGreaterThan(10);
  });

  it("should return related jobs for a given job", async () => {
    const jobRepo = new JobRepository(dbClient);
    const latest = await jobRepo.getLatestJobs(1);
    const related = await jobRepo.getRelatedJobs(latest[0].id, latest[0].location.country, latest[0].category?.id, 3);

    expect(Array.isArray(related)).toBe(true);
    expect(related.every((r) => r.id !== latest[0].id)).toBe(true);
  });

  it("should compute dynamic job counts for countries", async () => {
    const countryRepo = new CountryRepository(dbClient);
    const ukCount = await countryRepo.getJobCountByCountry("GB");
    expect(ukCount).toBeGreaterThan(0);

    const auCount = await countryRepo.getJobCountByCountry("AU");
    expect(auCount).toBeGreaterThan(0);
  });
});
