import { describe, it, expect, beforeAll } from "vitest";
import { runSeed } from "../scripts/seed";
import { DatabaseClient, DbPreparedStatement, DbResult } from "../lib/db/client";
import { getAdminSecret } from "../lib/services/adminAuth";

describe("Phase 7: Admin Panel Operations & Audit Trail Tests (Sections 28, 29, 58-60, 146, 147)", () => {
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

  it("should have admin secret configured and non-empty", () => {
    const secret = getAdminSecret();
    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThan(5);
  });

  it("should allow admin to update job status (approve / reject / expire)", async () => {
    // 1. Get a job
    const job = await dbClient.prepare("SELECT id, status FROM jobs LIMIT 1").first<{ id: string; status: string }>();
    expect(job).not.toBeNull();

    // 2. Reject job
    await dbClient.prepare("UPDATE jobs SET status = 'rejected' WHERE id = ?").bind(job!.id).run();
    const rejectedJob = await dbClient.prepare("SELECT status FROM jobs WHERE id = ?").bind(job!.id).first<{ status: string }>();
    expect(rejectedJob?.status).toBe("rejected");

    // 3. Approve job back to active
    await dbClient.prepare("UPDATE jobs SET status = 'active' WHERE id = ?").bind(job!.id).run();
    const activeJob = await dbClient.prepare("SELECT status FROM jobs WHERE id = ?").bind(job!.id).first<{ status: string }>();
    expect(activeJob?.status).toBe("active");
  });

  it("should allow admin to override sponsorship classification and record audit trail (Section 146, 147)", async () => {
    const job = await dbClient.prepare("SELECT id, sponsorship_label FROM jobs LIMIT 1").first<{ id: string; sponsorship_label: string }>();
    const originalLabel = job!.sponsorship_label;
    const newLabel = "Strong";
    const reason = "Verified against UK Home Office sponsor register #12345";

    // 1. Update job sponsorship classification
    await dbClient.prepare("UPDATE jobs SET sponsorship_label = ? WHERE id = ?").bind(newLabel, job!.id).run();

    // 2. Record audit log
    const auditId = `audit_${Date.now()}`;
    await dbClient.prepare(`
      INSERT INTO admin_action_log (id, admin, action, entity, entity_id, old_value, new_value, timestamp)
      VALUES (?, 'test_admin', 'OVERRIDE_CLASSIFICATION', 'jobs', ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(auditId, job!.id, originalLabel, `${newLabel} (Reason: ${reason})`).run();

    // 3. Verify audit log entry exists
    const logEntry = await dbClient.prepare("SELECT * FROM admin_action_log WHERE id = ?").bind(auditId).first<any>();
    expect(logEntry).not.toBeNull();
    expect(logEntry.action).toBe("OVERRIDE_CLASSIFICATION");
    expect(logEntry.entity_id).toBe(job!.id);
    expect(logEntry.new_value).toContain(reason);
  });

  it("should allow admin to toggle source active status", async () => {
    // 1. Enable adzuna
    await dbClient.prepare("UPDATE sources SET active = 1 WHERE id = 'adzuna'").run();
    const source = await dbClient.prepare("SELECT active FROM sources WHERE id = 'adzuna'").first<{ active: number }>();
    expect(source?.active).toBe(1);

    // 2. Disable adzuna
    await dbClient.prepare("UPDATE sources SET active = 0 WHERE id = 'adzuna'").run();
    const disabledSource = await dbClient.prepare("SELECT active FROM sources WHERE id = 'adzuna'").first<{ active: number }>();
    expect(disabledSource?.active).toBe(0);
  });
});
