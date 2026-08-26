import { STATIC_COUNTRIES, STATIC_CATEGORIES, STATIC_COMPANIES, STATIC_SOURCES, STATIC_JOBS } from "./staticData";

/**
 * Database client abstraction for SponsorAJobs
 * Supports Cloudflare D1 (Edge runtime), SQL.js (Tests/Scripts), and Edge-safe in-memory store
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

// Mutable in-memory store for Edge environment
const inMemoryJobs: any[] = [...STATIC_JOBS];
const inMemoryCompanies: any[] = [...STATIC_COMPANIES];

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

  // 3. Robust Edge-Safe In-Memory Provider
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
            let res = [...inMemoryCompanies];
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
            let res = [...inMemoryJobs];

            // Specific Job By ID or Slug prefix
            if (q.includes("where j.id = ?") || q.includes("where j.id like ?")) {
              const val = String(boundValues[0] || "").replace(/%/g, "");
              const match = res.filter((j) => j.id === val || j.id.startsWith(val) || j.job_url?.includes(val));
              return { results: match as unknown as T[], success: true };
            }

            // Keyword filter with token matching
            const kwParams = boundValues.filter((v) => typeof v === "string" && v.startsWith("%") && v.endsWith("%"));
            if (kwParams.length > 0) {
              const terms = kwParams.map((kw) => String(kw).slice(1, -1).toLowerCase()).filter(Boolean);
              res = res.filter((j) => {
                const text = `${j.title || ""} ${j.description || ""} ${j.company_name || ""} ${j.location || ""}`.toLowerCase();
                return terms.every((term) => text.includes(term));
              });
            }

            // Country filter
            const countryParam = boundValues.find(
              (v) => typeof v === "string" && ["GB", "US", "AU", "CA", "NZ"].includes(v.toUpperCase())
            );
            if (countryParam) {
              res = res.filter((j) => j.country_code?.toUpperCase() === String(countryParam).toUpperCase());
            }

            // Remote type filter
            if (q.includes("remote_type")) {
              const remoteParam = boundValues.find(
                (v) => typeof v === "string" && ["REMOTE", "HYBRID", "ONSITE"].includes(v.toUpperCase())
              );
              if (remoteParam) {
                res = res.filter((j) => j.remote_type?.toUpperCase() === String(remoteParam).toUpperCase());
              }
            }

            // Employment type filter
            if (q.includes("employment_type")) {
              const empParam = boundValues.find(
                (v) => typeof v === "string" && ["FULL_TIME", "PART_TIME", "CONTRACT"].includes(v.toUpperCase())
              );
              if (empParam) {
                res = res.filter((j) => j.employment_type?.toUpperCase() === String(empParam).toUpperCase());
              }
            }

            // Sponsorship filter
            if (q.includes("sponsorship_label")) {
              const sponParam = boundValues.find(
                (v) => typeof v === "string" && ["Strong", "Likely", "Possible"].includes(v)
              );
              if (sponParam) {
                res = res.filter((j) => j.sponsorship_label === sponParam);
              }
            }

            // Pagination slice
            const numParams = boundValues.filter((v) => typeof v === "number");
            if (numParams.length >= 2) {
              const limit = numParams[numParams.length - 2];
              const offset = numParams[numParams.length - 1];
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
              let res = [...inMemoryJobs];

              const kwParams = boundValues.filter((v) => typeof v === "string" && v.startsWith("%") && v.endsWith("%"));
              if (kwParams.length > 0) {
                const terms = kwParams.map((kw) => String(kw).slice(1, -1).toLowerCase()).filter(Boolean);
                res = res.filter((j) => {
                  const text = `${j.title || ""} ${j.description || ""} ${j.company_name || ""} ${j.location || ""}`.toLowerCase();
                  return terms.every((term) => text.includes(term));
                });
              }

              const countryParam = boundValues.find(
                (v) => typeof v === "string" && ["GB", "US", "AU", "CA", "NZ"].includes(v.toUpperCase())
              );
              if (countryParam) {
                res = res.filter((j) => j.country_code?.toUpperCase() === String(countryParam).toUpperCase());
              }

              const count = res.length;
              return ({ total: count, count } as unknown) as T;
            }
            return ({ total: inMemoryJobs.length, count: inMemoryJobs.length } as unknown) as T;
          }

          const res = await this.all<T>();
          if (!res.results.length) return null;
          const row: any = res.results[0];
          if (col && row[col] !== undefined) return row[col] as T;
          return row as T;
        },
        async run(): Promise<DbResult> {
          const q = query.toLowerCase();

          // Mutate inMemoryJobs on INSERT
          if (q.includes("insert into jobs") || q.includes("insert or replace into jobs")) {
            if (boundValues.length >= 10) {
              const newJob: any = {
                id: boundValues[0],
                source_id: boundValues[1],
                source_job_id: boundValues[2],
                canonical_hash: boundValues[3],
                title: boundValues[4],
                company_id: boundValues[5],
                description: boundValues[6],
                description_clean: boundValues[7],
                location: boundValues[8],
                city: boundValues[9],
                region: boundValues[10],
                country_code: boundValues[11],
                remote_type: boundValues[12],
                employment_type: boundValues[13],
                category_id: boundValues[14],
                salary_min: boundValues[15],
                salary_max: boundValues[16],
                salary_currency: boundValues[17],
                job_url: boundValues[18],
                apply_url: boundValues[19],
                source_url: boundValues[20],
                published_at: boundValues[21],
                sponsorship_score: boundValues[22],
                sponsorship_label: boundValues[23],
                sponsorship_positive_evidence: boundValues[24],
                sponsorship_negative_evidence: boundValues[25],
                visa_keywords: boundValues[26],
                quality_score: boundValues[27] || 100,
                status: "active",
                is_featured: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };

              const existingIdx = inMemoryJobs.findIndex((j) => j.canonical_hash === newJob.canonical_hash || j.id === newJob.id);
              if (existingIdx >= 0) {
                inMemoryJobs[existingIdx] = { ...inMemoryJobs[existingIdx], ...newJob };
              } else {
                inMemoryJobs.unshift(newJob);
              }
            }
          }

          // Mutate inMemoryCompanies on INSERT
          if (q.includes("insert into companies") || q.includes("insert or replace into companies") || q.includes("insert or ignore into companies")) {
            if (boundValues.length >= 2) {
              const compId = boundValues[0];
              const compName = boundValues[1];
              const existing = inMemoryCompanies.find((c) => c.id === compId);
              if (!existing) {
                inMemoryCompanies.push({
                  id: compId,
                  name: compName,
                  normalized_name: compName.toLowerCase(),
                  country_code: boundValues[5] || "GB",
                  industry: "Technology",
                  website: boundValues[3] || null,
                  logo_url: boundValues[4] || null,
                  sponsorship_signal: "high",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
              }
            }
          }

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
