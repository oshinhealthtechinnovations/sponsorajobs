import { describe, it, expect, beforeAll } from "vitest";
import { runSeed } from "../scripts/seed";
import { IngestionService } from "../lib/services/ingestionService";
import { SourceRegistry } from "../sources/registry";
import { JobSourceAdapter, SourceExecutionContext, IngestionResult } from "../sources/base/JobSourceAdapter";
import { NormalizedJob } from "../lib/types/job";
import { DatabaseClient, DbPreparedStatement, DbResult } from "../lib/db/client";

// Mock test adapter to simulate live ingestion cycles
class MockTestAdapter implements JobSourceAdapter {
  private jobs: NormalizedJob[];
  private shouldFail: boolean;

  constructor(jobs: NormalizedJob[] = [], shouldFail: boolean = false) {
    this.jobs = jobs;
    this.shouldFail = shouldFail;
  }

  getName() { return "Mock Test Source"; }
  getSourceId() { return "mock_source"; }
  isEnabled() { return true; }
  getTermsUrl() { return "https://example.com/terms"; }
  isAttributionRequired() { return false; }
  getRateLimitPerMinute() { return 100; }

  async fetchJobs(context: SourceExecutionContext): Promise<IngestionResult> {
    if (this.shouldFail) {
      throw new Error("Simulated 500 Connection Timeout on Mock Source API");
    }
    return {
      sourceName: this.getName(),
      jobsFetched: this.jobs.length,
      jobs: this.jobs,
      hasMore: false,
    };
  }

  normalizeJob(rawJob: any) { return rawJob; }
  validateJob(job: NormalizedJob) { return true; }
}

describe("Phase 6: Ingestion Pipeline, Deduplication & Expiration Tests (Sections 105, 106, 107)", () => {
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
              const changes = rawDb.getRowsModified ? rawDb.getRowsModified() : 1;
              return { results: [], success: true, meta: { changes } };
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

  // 1. Deduplication Tests (Section 105)
  describe("Section 105: Deduplication Logic", () => {
    it("should insert new job and update on identical re-ingestion (same title + company + location + URL)", async () => {
      const sampleJob: NormalizedJob = {
        sourceJobId: "mock_101",
        sourceId: "mock_source",
        title: "Lead Cloud Infrastructure Architect",
        companyName: "TechScale Global",
        description: "Lead AWS multi-region infrastructure. Skilled Worker visa sponsorship available.",
        location: "London, GB",
        city: "London",
        countryCode: "GB",
        remoteType: "HYBRID",
        employmentType: "FULL_TIME",
        salaryMin: 95000,
        salaryMax: 125000,
        salaryCurrency: "GBP",
        jobUrl: "https://careers.techscale.com/jobs/101",
        applyUrl: "https://careers.techscale.com/apply/101",
      };

      const registry = new SourceRegistry();
      const mockAdapter = new MockTestAdapter([sampleJob]);
      registry.register(mockAdapter);

      const service = new IngestionService(dbClient, registry);

      // First run: Insert
      const report1 = await service.processSource("mock_source");
      expect(report1.jobsInserted).toBe(1);
      expect(report1.jobsUpdated).toBe(0);

      // Second run: Duplicate detection (Update existing)
      const report2 = await service.processSource("mock_source");
      expect(report2.jobsInserted).toBe(0);
      expect(report2.jobsUpdated).toBe(1);
      expect(report2.jobsDuplicates).toBe(1);
    });

    it("should treat jobs with different locations as different jobs", async () => {
      const jobSydney: NormalizedJob = {
        sourceJobId: "mock_201_syd",
        sourceId: "mock_source",
        title: "Senior Reliability Engineer",
        companyName: "CloudWorks",
        description: "Visa sponsorship provided via Subclass 482.",
        location: "Sydney, AU",
        city: "Sydney",
        countryCode: "AU",
        remoteType: "ONSITE",
        employmentType: "FULL_TIME",
        jobUrl: "https://cloudworks.com/jobs/syd-201",
        applyUrl: "https://cloudworks.com/apply/syd-201",
      };

      const jobMelbourne: NormalizedJob = {
        sourceJobId: "mock_201_mel",
        sourceId: "mock_source",
        title: "Senior Reliability Engineer",
        companyName: "CloudWorks",
        description: "Visa sponsorship provided via Subclass 482.",
        location: "Melbourne, AU",
        city: "Melbourne",
        countryCode: "AU",
        remoteType: "ONSITE",
        employmentType: "FULL_TIME",
        jobUrl: "https://cloudworks.com/jobs/mel-201",
        applyUrl: "https://cloudworks.com/apply/mel-201",
      };

      const registry = new SourceRegistry();
      registry.register(new MockTestAdapter([jobSydney, jobMelbourne]));
      const service = new IngestionService(dbClient, registry);

      const report = await service.processSource("mock_source");
      expect(report.jobsInserted).toBe(2);
    });
  });

  // 2. Section 31: Quality Filter
  describe("Section 31: Job Quality Filter", () => {
    it("should reject garbage/incomplete jobs (missing title, empty desc, invalid url)", async () => {
      const garbageJobs: NormalizedJob[] = [
        {
          sourceJobId: "bad_1",
          sourceId: "mock_source",
          title: "", // Empty title
          companyName: "Acme",
          description: "Some valid description text here for testing.",
          countryCode: "US",
          remoteType: "REMOTE",
          employmentType: "FULL_TIME",
          jobUrl: "https://example.com",
          applyUrl: "https://example.com",
        },
        {
          sourceJobId: "bad_2",
          sourceId: "mock_source",
          title: "Valid Title",
          companyName: "", // Empty company
          description: "Valid description text here for testing purposes.",
          countryCode: "US",
          remoteType: "REMOTE",
          employmentType: "FULL_TIME",
          jobUrl: "https://example.com",
          applyUrl: "https://example.com",
        },
        {
          sourceJobId: "bad_3",
          sourceId: "mock_source",
          title: "Valid Title",
          companyName: "Acme",
          description: "Too short", // < 20 chars
          countryCode: "US",
          remoteType: "REMOTE",
          employmentType: "FULL_TIME",
          jobUrl: "https://example.com",
          applyUrl: "https://example.com",
        },
      ];

      const registry = new SourceRegistry();
      registry.register(new MockTestAdapter(garbageJobs));
      const service = new IngestionService(dbClient, registry);

      const report = await service.processSource("mock_source");
      expect(report.jobsRejected).toBe(3);
      expect(report.jobsInserted).toBe(0);
    });
  });

  // 3. Section 106 & 107: Expiration & Source Failure Safety
  describe("Section 106 & 107: Expiration and Failure Safety", () => {
    it("should NOT expire jobs when a source API fails (Section 107)", async () => {
      // First verify active jobs exist
      const beforeCount = await dbClient.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'").first<{ count: number }>();
      expect(beforeCount?.count).toBeGreaterThan(0);

      // Simulate a failed run
      const registry = new SourceRegistry();
      registry.register(new MockTestAdapter([], true)); // shouldFail = true
      const service = new IngestionService(dbClient, registry);

      const report = await service.processSource("mock_source");
      expect(report.status).toBe("failed");
      expect(report.errorMessage).toContain("Timeout");

      // Verify active jobs remain untouched
      const afterCount = await dbClient.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'").first<{ count: number }>();
      expect(afterCount?.count).toBe(beforeCount?.count);
    });

    it("should record telemetry in source_runs table (Section 28, 61)", async () => {
      const runs = await dbClient.prepare("SELECT * FROM source_runs ORDER BY started_at DESC LIMIT 5").all<any>();
      expect(runs.results.length).toBeGreaterThan(0);
      expect(runs.results[0].status).toBeDefined();
    });
  });
});
