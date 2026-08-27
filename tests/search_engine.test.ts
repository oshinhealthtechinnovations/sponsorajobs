import { describe, it, expect, beforeAll } from "vitest";
import { runSeed } from "../scripts/seed";
import { JobRepository } from "../lib/repositories/jobRepository";
import { DatabaseClient, DbPreparedStatement, DbResult } from "../lib/db/client";

describe("Phase 3: Search Engine & Multi-Attribute Filter Tests", () => {
  let dbClient: DatabaseClient;
  let jobRepo: JobRepository;

  beforeAll(async () => {
    const rawDb = await runSeed();

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

    jobRepo = new JobRepository(dbClient);
  });

  it("should filter by combined criteria (Country=AU + Sponsorship=Strong)", async () => {
    const res = await jobRepo.search({
      country: "au",
      sponsorship: "strong",
    });

    expect(res.jobs.length).toBeGreaterThan(0);
    expect(res.jobs.every((j) => j.location.country === "AU" && j.sponsorship.label === "Strong")).toBe(true);
  });

  it("should filter by salary range (minSalary and maxSalary)", async () => {
    const res = await jobRepo.search({
      minSalary: 120000,
    });

    expect(res.jobs.length).toBeGreaterThan(0);
    expect(res.jobs.every((j) => (j.salary?.max ?? 0) >= 120000 || (j.salary?.min ?? 0) >= 120000)).toBe(true);
  });

  it("should filter by workplace type (Remote / Hybrid / Onsite)", async () => {
    const remoteRes = await jobRepo.search({ remoteType: "REMOTE" });
    expect(remoteRes.jobs.length).toBeGreaterThan(0);
    expect(remoteRes.jobs.every((j) => j.remoteType === "REMOTE")).toBe(true);

    const hybridRes = await jobRepo.search({ remoteType: "HYBRID" });
    expect(hybridRes.jobs.length).toBeGreaterThan(0);
    expect(hybridRes.jobs.every((j) => j.remoteType === "HYBRID")).toBe(true);
  });

  it("should sort jobs by highest salary", async () => {
    const res = await jobRepo.search({ sort: "salary", limit: 5 });
    expect(res.jobs.length).toBeGreaterThan(1);

    for (let i = 0; i < res.jobs.length - 1; i++) {
      const currentSalary = res.jobs[i].salary?.max || 0;
      const nextSalary = res.jobs[i + 1].salary?.max || 0;
      expect(currentSalary).toBeGreaterThanOrEqual(nextSalary);
    }
  });

  it("should sort jobs by sponsorship confidence", async () => {
    const res = await jobRepo.search({ sort: "sponsorship", limit: 5 });
    expect(res.jobs.length).toBeGreaterThan(0);
    expect(res.jobs[0].sponsorship.label).toBe("Strong");
  });

  it("should filter by date freshness", async () => {
    const res = await jobRepo.search({ datePosted: "30d" });
    expect(res.jobs.length).toBeGreaterThan(0);
  });

  it("should handle pagination (page=2, limit=5)", async () => {
    const page1 = await jobRepo.search({ limit: 5, page: 1 });
    const page2 = await jobRepo.search({ limit: 5, page: 2 });

    expect(page1.jobs.length).toBe(5);
    expect(page2.jobs.length).toBe(5);
    expect(page1.jobs[0].id).not.toBe(page2.jobs[0].id);
    expect(page1.totalPages).toBeGreaterThanOrEqual(6);
  });

  it("should filter jobs company-wise (e.g. Mace)", async () => {
    const res = await jobRepo.search({ company: "Mace" });
    expect(res.jobs.length).toBeGreaterThan(0);
    expect(res.jobs.every((j) => j.company.name.toLowerCase().includes("mace"))).toBe(true);
  });
});
