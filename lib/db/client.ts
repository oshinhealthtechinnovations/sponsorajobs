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
const inMemoryAlerts: any[] = [];
const inMemoryCVAnalyses: any[] = [];

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
            if ((q.includes("normalized_name") || q.includes("lower(normalized_name)")) && boundValues.length > 0) {
              const term = String(boundValues[0]).toLowerCase().trim();
              res = res.filter((c) => 
                c.normalized_name?.toLowerCase() === term || 
                c.name?.toLowerCase() === term || 
                c.id?.toLowerCase() === term
              );
            } else if (q.includes("id = ?") && boundValues.length > 0) {
              const id = String(boundValues[0]).toLowerCase();
              res = res.filter((c) => c.id.toLowerCase() === id);
            }
            return { results: res as unknown as T[], success: true };
          }

          // 4. Sources
          if (q.includes("from sources")) {
            return { results: STATIC_SOURCES as unknown as T[], success: true };
          }

          // 5. Jobs
          if (q.includes("from jobs")) {
            if (q.includes("1 = 0")) {
              return { results: [], success: true };
            }
            let res = [...inMemoryJobs];

            // Specific Job By canonical_hash match
            if (q.includes("canonical_hash = ?") || q.includes("canonical_hash =") || q.includes("canonical_hash")) {
              const hashParam = boundValues.find((v) => typeof v === "string" && v.startsWith("job_"));
              const targetHash = hashParam ? String(hashParam) : (boundValues.length > 0 ? String(boundValues[0]) : "");
              const match = res.filter((j) => j.canonical_hash === targetHash);
              return { results: match as unknown as T[], success: true };
            }

            // Specific Job By ID or Slug match
            if (q.includes("where j.id = ?") || q.includes("where id = ?") || q.includes("where j.id like ?") || q.includes("where j.id")) {
              const rawVals = boundValues.map((v) => String(v || "").replace(/%/g, "").toLowerCase()).filter(Boolean);
              const match = res.filter((j) => {
                const jId = (j.id || "").toLowerCase();
                return rawVals.some((val) => {
                  return (
                    jId === val ||
                    val.endsWith(`-${jId}`) ||
                    val.endsWith(`_${jId}`) ||
                    val.endsWith(jId) ||
                    val.includes(jId) ||
                    jId.startsWith(val) ||
                    jId.endsWith(val) ||
                    (j.job_url && j.job_url.toLowerCase().includes(val))
                  );
                });
              });
              return { results: match as unknown as T[], success: true };
            }

            // Filter and score jobs
            const kwParams = boundValues.filter((v) => typeof v === "string" && v.startsWith("%") && v.endsWith("%"));
            const countryParam = boundValues.find(
              (v) => typeof v === "string" && ["GB", "US", "AU", "CA", "NZ"].includes(v.toUpperCase())
            );
            const remoteParam = q.includes("remote_type")
              ? boundValues.find((v) => typeof v === "string" && ["REMOTE", "HYBRID", "ONSITE"].includes(v.toUpperCase()))
              : undefined;
            const empParam = q.includes("employment_type")
              ? boundValues.find((v) => typeof v === "string" && ["FULL_TIME", "PART_TIME", "CONTRACT"].includes(v.toUpperCase()))
              : undefined;
            const sponParam = q.includes("sponsorship_label")
              ? boundValues.find((v) => typeof v === "string" && ["Strong", "Likely", "Possible"].includes(v))
              : undefined;

            if (countryParam) {
              res = res.filter((j) => j.country_code?.toUpperCase() === String(countryParam).toUpperCase());
            }
            if (remoteParam) {
              res = res.filter((j) => j.remote_type?.toUpperCase() === String(remoteParam).toUpperCase());
            }
            if (empParam) {
              res = res.filter((j) => j.employment_type?.toUpperCase() === String(empParam).toUpperCase());
            }
            if (sponParam) {
              res = res.filter((j) => j.sponsorship_label === sponParam);
            }

            // Company filter (only apply when a dedicated company condition is in the WHERE clause, not table joins)
            if (q.includes("lower(c.normalized_name) like ?") || q.includes("lower(c.name) like ?") || q.includes("lower(j.company_id) like ?")) {
              const compParam = boundValues.find(
                (v) => typeof v === "string" && (
                  v.startsWith("%comp_") || 
                  v.startsWith("comp_") || 
                  inMemoryCompanies.some((c) => {
                    const cleanV = String(v).replace(/%/g, "").toLowerCase().trim();
                    if (!cleanV) return false;
                    const cName = (c.name || "").toLowerCase().trim();
                    const cNorm = (c.normalized_name || "").toLowerCase().trim();
                    const cId = (c.id || "").toLowerCase().trim();
                    return (
                      cName === cleanV ||
                      cNorm === cleanV ||
                      cName.replace(/-/g, " ") === cleanV.replace(/-/g, " ") ||
                      cId === cleanV ||
                      (cleanV.length >= 3 && (cName.includes(cleanV) || cNorm.includes(cleanV) || cId.includes(cleanV)))
                    );
                  })
                )
              );
              if (compParam) {
                const term = String(compParam).replace(/%/g, "").toLowerCase().replace(/\s*\(.*\)/, "").trim();
                const termSpaced = term.replace(/-/g, " ");
                const termHyphen = term.replace(/\s+/g, "-");
                const termStripped = term.replace(/[^a-z0-9]/g, "");
                res = res.filter((j) => {
                  const jCompId = (j.company_id || "").toLowerCase();
                  const jCompName = (j.company_name || "").toLowerCase();
                  return (
                    jCompId.includes(term) ||
                    jCompId.includes(termHyphen) ||
                    jCompId.includes(termStripped) ||
                    jCompName.includes(term) ||
                    jCompName.includes(termSpaced) ||
                    jCompName.replace(/[^a-z0-9]/g, "").includes(termStripped)
                  );
                });
              }
            }

            // Category filter
            if (q.includes("cat.slug in") || q.includes("cat.slug =") || q.includes("j.category_id =") || q.includes("j.category_id in")) {
              const catSlugs = boundValues.filter(
                (v) => typeof v === "string" && !v.startsWith("%") && !["GB", "US", "AU", "CA", "NZ", "ALL"].includes(v.toUpperCase()) && !v.startsWith("comp_")
              ).map((v) => String(v).toLowerCase());

              if (catSlugs.length > 0) {
                res = res.filter((j) => {
                  const jCatId = (j.category_id || "").toLowerCase();
                  const jCatSlug = (j.category_slug || "").toLowerCase();
                  const jCatName = (j.category_name || "").toLowerCase();
                  const jTitle = (j.title || "").toLowerCase();
                  const jCompName = (j.company_name || "").toLowerCase();

                  return catSlugs.some((s) => {
                    return (
                      jCatSlug === s ||
                      jCatId === s ||
                      jCatName === s.replace(/-/g, " ") ||
                      (s === "construction" && (jCatId.startsWith("cat_const") || jCatSlug.includes("construction") || jCatName.includes("construction") || jCatId === "cat_eng_civil" || jCatSlug.includes("civil") || jTitle.includes("construction") || jTitle.includes("builder") || jTitle.includes("site") || jTitle.includes("structural") || jTitle.includes("civil") || jTitle.includes("surveyor") || jTitle.includes("steel") || jCompName.includes("bluescope"))) ||
                      (s === "engineering" && (jCatId.startsWith("cat_eng") || jCatSlug.includes("engineering") || jCatName.includes("engineering") || jTitle.includes("engineer") || jTitle.includes("structural") || jTitle.includes("civil") || jTitle.includes("mechanical"))) ||
                      (s === "information-technology" && (jCatId.startsWith("cat_tech") || jCatId === "cat_it" || jCatSlug.includes("technology") || jCatName.includes("technology") || jCatSlug.includes("software") || jTitle.includes("developer") || jTitle.includes("software") || jTitle.includes("frontend") || jTitle.includes("backend") || jTitle.includes("full stack"))) ||
                      (s === "healthcare" && (jCatId.startsWith("cat_health") || jCatSlug.includes("health") || jCatName.includes("health") || jCatName.includes("nursing") || jTitle.includes("nurse") || jTitle.includes("clinical") || jTitle.includes("medical") || jTitle.includes("care"))) ||
                      (s === "finance" && (jCatId.startsWith("cat_fin") || jCatSlug.includes("finance") || jCatName.includes("finance") || jTitle.includes("analyst") || jTitle.includes("accountant") || jTitle.includes("credit") || jTitle.includes("risk"))) ||
                      (s === "logistics" && (jCatId.startsWith("cat_logistics") || jCatSlug.includes("logistics") || jCatName.includes("logistics") || jTitle.includes("supply chain") || jTitle.includes("warehouse") || jTitle.includes("logistics") || jTitle.includes("transport"))) ||
                      (s === "hospitality" && (jCatId.startsWith("cat_hosp") || jCatSlug.includes("hospitality") || jCatName.includes("hospitality") || jTitle.includes("chef") || jTitle.includes("hotel") || jTitle.includes("restaurant"))) ||
                      (s === "education" && (jCatId.startsWith("cat_edu") || jCatSlug.includes("education") || jCatName.includes("education") || jTitle.includes("teacher") || jTitle.includes("lecturer") || jTitle.includes("tutor"))) ||
                      (s === "administration" && (jCatId.startsWith("cat_admin") || jCatSlug.includes("admin") || jCatName.includes("admin") || jTitle.includes("admin") || jTitle.includes("operations") || jTitle.includes("coordinator") || jTitle.includes("assistant") || jTitle.includes("officer") || jTitle.includes("partner") || jTitle.includes("specialist") || jTitle.includes("reception")))
                    );
                  });
                });
              }
            }

            // Keyword filter (only apply if the query includes specific title/description keyword conditions)
            if (kwParams.length > 0 && (q.includes("lower(j.title) like ?") || q.includes("lower(j.description) like ?"))) {
              const rawTerms = kwParams.map((kw) => String(kw).slice(1, -1).toLowerCase()).filter(Boolean);
              const terms = Array.from(new Set(rawTerms));
              const phrase = terms.join(" ");

              const scored: Array<{ job: any; score: number }> = [];

              for (const j of res) {
                const title = (j.title || "").toLowerCase();
                const desc = (j.description || "").toLowerCase();
                const comp = (j.company_name || j.company_id || "").toLowerCase();
                const cat = (j.category_name || j.category_slug || "").toLowerCase();

                let score = 0;
                let titleMatches = 0;
                let descMatches = 0;

                if (phrase && title === phrase) {
                  score += 10000;
                } else if (phrase && title.includes(phrase)) {
                  score += 5000;
                }

                for (const t of terms) {
                  if (title.includes(t)) {
                    score += 1000;
                    titleMatches++;
                  }
                  if (desc.includes(t)) {
                    descMatches++;
                  }
                  if (comp.includes(t)) {
                    score += 250;
                  }
                  if (cat.includes(t)) {
                    score += 300;
                  }
                }

                if (terms.length > 1 && titleMatches >= terms.length) {
                  score += 3000;
                }

                if (phrase && desc.includes(phrase)) {
                  score += 400;
                }

                score += descMatches * 15;
                score += (Number(j.sponsorship_score) || 50) * 0.2;
                score += (Number(j.quality_score) || 50) * 0.1;

                let isRelevant = false;
                if (terms.length <= 1) {
                  isRelevant = titleMatches > 0 || (phrase && desc.includes(phrase)) || comp.includes(phrase) || cat.includes(phrase) || descMatches > 0;
                } else {
                  const hasRoleOrTitleRelevance = titleMatches > 0 || (phrase && desc.includes(phrase)) || comp.includes(phrase);
                  isRelevant = Boolean(hasRoleOrTitleRelevance || (descMatches === terms.length && score >= 100));
                }

                if (isRelevant) {
                  scored.push({ job: j, score });
                }
              }

              scored.sort((a, b) => b.score - a.score);
              res = scored.map((s) => s.job);
            } else {
              // Default sorting when no search query keywords provided
              const qLower = q.toLowerCase();
              if (qLower.includes("order by j.sponsorship_score desc")) {
                res.sort((a, b) => (Number(b.sponsorship_score) || 0) - (Number(a.sponsorship_score) || 0) || new Date(b.published_at || b.first_seen_at || 0).getTime() - new Date(a.published_at || a.first_seen_at || 0).getTime());
              } else if (qLower.includes("order by j.salary_max desc")) {
                res.sort((a, b) => (Number(b.salary_max) || 0) - (Number(a.salary_max) || 0));
              } else {
                res.sort((a, b) => {
                  const timeA = new Date(a.published_at || a.first_seen_at || a.created_at || 0).getTime();
                  const timeB = new Date(b.published_at || b.first_seen_at || b.created_at || 0).getTime();
                  return timeB - timeA;
                });
              }
            }

            // Return count aggregation if requested
            if (q.includes("count(*)") || q.includes("count(1)")) {
              return { results: [{ total: res.length }] as unknown as T[], success: true };
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

          // 6. Job Alerts
          if (q.includes("from job_alerts")) {
            let res = [...inMemoryAlerts];
            if (q.includes("lower(email) = ?") && boundValues.length > 0) {
              const email = String(boundValues[0]).toLowerCase().trim();
              res = res.filter((a) => a.email.toLowerCase().trim() === email);
            }
            if (q.includes("active = 1")) {
              res = res.filter((a) => a.active === 1);
            }
            return { results: res as unknown as T[], success: true };
          }

          // 7. CV Analyses
          if (q.includes("from cv_analyses")) {
            let res = [...inMemoryCVAnalyses];
            if (q.includes("where id = ?") && boundValues.length > 0) {
              const id = String(boundValues[0]);
              res = res.filter((c) => c.id === id);
            } else if (q.includes("where share_token = ?") && boundValues.length > 0) {
              const token = String(boundValues[0]);
              res = res.filter((c) => c.share_token === token);
            }

            if (q.includes("count(*)")) {
              return { results: [{ total: res.length, count: res.length }] as unknown as T[], success: true };
            }

            if (q.includes("order by created_at desc")) {
              res.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            }
            const numParams = boundValues.filter((v) => typeof v === "number");
            if (numParams.length >= 2) {
              const limit = numParams[numParams.length - 2];
              const offset = numParams[numParams.length - 1];
              res = res.slice(offset, offset + limit);
            } else if (numParams.length === 1) {
              res = res.slice(0, numParams[0]);
            }
            return { results: res as unknown as T[], success: true };
          }

          return { results: [], success: true };
        },
        async first<T = any>(col?: string): Promise<T | null> {
          const res = await this.all<T>();
          if (!res.results.length) return null;
          const row: any = res.results[0];
          if (col && row[col] !== undefined) return row[col] as T;
          return row as T;
        },
        async run(): Promise<DbResult> {
          const q = query.toLowerCase();

          // Mutate inMemoryAlerts on INSERT
          if (q.includes("insert into job_alerts")) {
            if (boundValues.length >= 2) {
              inMemoryAlerts.unshift({
                id: boundValues[0],
                email: boundValues[1],
                keyword: boundValues[2] || null,
                country_code: boundValues[3] || null,
                category_id: boundValues[4] || null,
                sponsorship_label: boundValues[5] || null,
                active: 1,
                created_at: boundValues[6] || new Date().toISOString(),
              });
            }
            return { results: [], success: true };
          }

          // Deactivate Alert on UPDATE
          // Mutate inMemoryCVAnalyses on INSERT
          if (q.includes("insert into cv_analyses") || q.includes("insert or replace into cv_analyses")) {
            if (boundValues.length >= 10) {
              const record: any = {
                id: boundValues[0],
                user_id: boundValues[1] || null,
                candidate_email: boundValues[2] || null,
                candidate_phone: boundValues[3] || null,
                target_country: boundValues[4] || "GB",
                target_role: boundValues[5] || "Software Engineer",
                soc_code: boundValues[6] || null,
                seniority: boundValues[7] || "Mid-Level",
                highest_degree: boundValues[8] || "Bachelor's",
                years_experience: Number(boundValues[9]) || 0,
                word_count: Number(boundValues[10]) || 0,
                overall_score: Number(boundValues[11]) || 0,
                cv_quality_score: Number(boundValues[12]) || 0,
                ats_compatibility_score: Number(boundValues[13]) || 0,
                job_match_score: Number(boundValues[14]) || 0,
                sponsorship_score: Number(boundValues[15]) || 0,
                parsing_risk: boundValues[16] || "Low",
                detected_skills: boundValues[17] || "[]",
                missing_skills: boundValues[18] || "[]",
                raw_text_snippet: boundValues[19] || null,
                full_result_json: boundValues[20] || "{}",
                share_token: boundValues[21] || boundValues[0],
                created_at: boundValues[22] || new Date().toISOString(),
                updated_at: boundValues[23] || new Date().toISOString(),
              };
              inMemoryCVAnalyses.unshift(record);
            }
            return { results: [], success: true };
          }

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
                first_seen_at: new Date().toISOString(),
                last_seen_at: new Date().toISOString(),
                sponsorship_score: boundValues[22],
                sponsorship_label: boundValues[23],
                sponsorship_positive_evidence: boundValues[24],
                sponsorship_negative_evidence: boundValues[25],
                visa_keywords: boundValues[26],
                quality_score: boundValues[27] || 100,
                status: boundValues[28] || "active",
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
            return { results: [], success: true };
          }

          // Mutate inMemoryJobs on UPDATE
          if (q.includes("update jobs")) {
            const targetId = boundValues[boundValues.length - 1];
            if (targetId) {
              const idx = inMemoryJobs.findIndex((j) => j.id === targetId || j.canonical_hash === targetId);
              if (idx >= 0) {
                inMemoryJobs[idx].last_seen_at = new Date().toISOString();
                inMemoryJobs[idx].updated_at = new Date().toISOString();
                inMemoryJobs[idx].status = "active";
              }
            }
            return { results: [], success: true };
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
            return { results: [], success: true };
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
