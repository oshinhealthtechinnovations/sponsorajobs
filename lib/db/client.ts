import { STATIC_COUNTRIES, STATIC_CATEGORIES, STATIC_COMPANIES, STATIC_SOURCES, STATIC_JOBS } from "./staticData";

/**
 * Database client abstraction for SponsorAJobs
 * Seamlessly supports Cloudflare D1 (Edge runtime), SQL.js (Tests/Scripts), and Edge-safe Pure JS in-memory fallback
 */

export interface DbResult<T = any> {
  results: T[];
  success: boolean;
  meta?: any;
}

export interface DbPreparedStatement {
  bind(...values: any[]): DbPreparedStatement;
  all<T = any>(): Promise<DbResult<T>>;
  first<T = any>(column?: string): Promise<T | null>;
  run(): Promise<DbResult>;
}

export interface DatabaseClient {
  prepare(query: string): DbPreparedStatement;
  batch(statements: DbPreparedStatement[]): Promise<DbResult[]>;
  exec(query: string): Promise<void>;
}

let localSqliteInstance: any = null;

export function getDatabase(env?: { DB?: any }): DatabaseClient {
  // 1. Cloudflare D1 environment binding in Workers/Pages runtime
  if (env?.DB) {
    return {
      prepare(query: string) {
        return env.DB.prepare(query);
      },
      batch(statements: DbPreparedStatement[]) {
        return env.DB.batch(statements);
      },
      async exec(query: string) {
        await env.DB.exec(query);
      }
    };
  }

  // 2. Local Vitest / Test SQL.js instance (if manually set)
  if (localSqliteInstance) {
    return createSqlJsWrapper(localSqliteInstance);
  }

  // 3. Robust Edge-Safe Pure JS In-Memory Provider
  return createEdgeMemoryClient();
}

export function setLocalDatabaseInstance(db: any) {
  localSqliteInstance = db;
}

function createSqlJsWrapper(db: any): DatabaseClient {
  return {
    prepare(query: string) {
      let boundValues: any[] = [];
      const stmtObj: DbPreparedStatement = {
        bind(...values: any[]) {
          boundValues = values;
          return stmtObj;
        },
        async all<T = any>(): Promise<DbResult<T>> {
          try {
            const stmt = db.prepare(query);
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
            db.run(query, boundValues);
            return { results: [], success: true };
          } catch (err: any) {
            return { results: [], success: false, meta: { error: err.message } };
          }
        }
      };
      return stmtObj;
    },
    async batch(statements: DbPreparedStatement[]): Promise<DbResult[]> {
      const results: DbResult[] = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    },
    async exec(query: string): Promise<void> {
      db.exec(query);
    }
  };
}

function createEdgeMemoryClient(): DatabaseClient {
  return {
    prepare(query: string) {
      let boundValues: any[] = [];
      const stmtObj: DbPreparedStatement = {
        bind(...values: any[]) {
          boundValues = values;
          return stmtObj;
        },
        async all<T = any>(): Promise<DbResult<T>> {
          const q = query.toLowerCase();

          // 1. Countries
          if (q.includes("from countries")) {
            let res = [...STATIC_COUNTRIES];
            if (q.includes("upper(code) = ?") && boundValues.length > 0) {
              const code = String(boundValues[0]).toUpperCase();
              res = res.filter((c) => c.code.toUpperCase() === code);
            } else if (q.includes("lower(slug) = ?") && boundValues.length > 0) {
              const slug = String(boundValues[0]).toLowerCase();
              res = res.filter((c) => c.slug.toLowerCase() === slug);
            }
            return { results: res as unknown as T[], success: true };
          }

          // 2. Categories
          if (q.includes("from categories")) {
            let res = [...STATIC_CATEGORIES];
            if (q.includes("parent_id is null")) {
              res = res.filter((c) => !c.parent_id);
            } else if (q.includes("lower(slug) = ?") && boundValues.length > 0) {
              const slug = String(boundValues[0]).toLowerCase();
              res = res.filter((c) => c.slug.toLowerCase() === slug);
            }
            return { results: res as unknown as T[], success: true };
          }

          // 3. Companies
          if (q.includes("from companies")) {
            let res = [...STATIC_COMPANIES];
            if (q.includes("id = ?") && boundValues.length > 0) {
              const id = String(boundValues[0]);
              res = res.filter((c) => c.id === id);
            }
            return { results: res as unknown as T[], success: true };
          }

          // 4. Sources
          if (q.includes("from sources")) {
            return { results: STATIC_SOURCES as unknown as T[], success: true };
          }

          // 5. Jobs
          if (q.includes("from jobs")) {
            let res = [...STATIC_JOBS];

            // Specific Job By ID or Slug
            if (q.includes("where j.id = ?") || q.includes("where j.id like ?")) {
              const val = String(boundValues[0] || "").replace(/%/g, "");
              const match = res.filter((j) => j.id.startsWith(val) || j.id === val || j.job_url.includes(val));
              return { results: match as unknown as T[], success: true };
            }

            // Keyword filter
            const kwParam = boundValues.find((v) => typeof v === "string" && v.startsWith("%") && v.endsWith("%"));
            if (kwParam) {
              const rawKw = String(kwParam).slice(1, -1).toLowerCase();
              res = res.filter(
                (j) =>
                  j.title.toLowerCase().includes(rawKw) ||
                  j.description.toLowerCase().includes(rawKw) ||
                  j.company_name.toLowerCase().includes(rawKw)
              );
            }

            // Country filter
            const countryParam = boundValues.find(
              (v) => typeof v === "string" && ["GB", "US", "AU", "CA", "NZ"].includes(v.toUpperCase())
            );
            if (countryParam) {
              res = res.filter((j) => j.country_code.toUpperCase() === String(countryParam).toUpperCase());
            }

            // Pagination slice
            const limit = typeof boundValues[boundValues.length - 2] === "number" ? boundValues[boundValues.length - 2] : 20;
            const offset = typeof boundValues[boundValues.length - 1] === "number" ? boundValues[boundValues.length - 1] : 0;
            if (offset > 0 || limit < res.length) {
              res = res.slice(offset, offset + limit);
            }

            return { results: res as unknown as T[], success: true };
          }

          return { results: [], success: true };
        },
        async first<T = any>(col?: string): Promise<T | null> {
          const q = query.toLowerCase();

          // Count Queries
          if (q.includes("count(*)")) {
            if (q.includes("from jobs")) {
              let count = STATIC_JOBS.length;
              if (boundValues.length > 0 && typeof boundValues[0] === "string") {
                const cCode = boundValues[0].toUpperCase();
                if (["GB", "US", "AU", "CA", "NZ"].includes(cCode)) {
                  count = STATIC_JOBS.filter((j) => j.country_code.toUpperCase() === cCode).length;
                }
              }
              return ({ total: count, count: count } as unknown) as T;
            }
            return ({ total: 10, count: 10 } as unknown) as T;
          }

          const res = await this.all<T>();
          if (!res.results.length) return null;
          const row: any = res.results[0];
          if (col && row[col] !== undefined) return row[col] as T;
          return row as T;
        },
        async run(): Promise<DbResult> {
          return { results: [], success: true };
        }
      };
      return stmtObj;
    },
    async batch(statements: DbPreparedStatement[]): Promise<DbResult[]> {
      const results: DbResult[] = [];
      for (const stmt of statements) {
        results.push(await stmt.run());
      }
      return results;
    },
    async exec(): Promise<void> {}
  };
}
