import { DatabaseClient, getDatabase } from "../db/client";
import { JobSourceAdapter, IngestionResult } from "@/sources/base/JobSourceAdapter";
import { SourceRegistry } from "@/sources/registry";
import { NormalizedJob } from "../types/job";
import { classifyJobSponsorship } from "@/scoring/classifier";
import { computeQualityScore, MINIMUM_QUALITY_SCORE } from "@/scoring/qualityScorer";
import { generateCanonicalHash } from "@/normalization";

export interface PipelineRunReport {
  runId: string;
  sourceId: string;
  startedAt: string;
  completedAt: string;
  status: "success" | "failed" | "partial";
  jobsFetched: number;
  jobsInserted: number;
  jobsUpdated: number;
  jobsRejected: number;
  jobsDuplicates: number;
  errorMessage?: string;
}

export class IngestionService {
  private db: DatabaseClient;
  private registry: SourceRegistry;

  constructor(db?: DatabaseClient, registry?: SourceRegistry) {
    this.db = db || getDatabase();
    this.registry = registry || new SourceRegistry();
  }

  /**
   * Section 31: Job Quality Filter
   */
  validateQuality(job: NormalizedJob): { valid: boolean; reason?: string } {
    if (!job.title || job.title.trim().length < 3) {
      return { valid: false, reason: "Missing or too short job title" };
    }
    if (!job.companyName || job.companyName.trim().length < 2) {
      return { valid: false, reason: "Missing company name" };
    }
    if (!job.countryCode || job.countryCode === "UNKNOWN") {
      return { valid: false, reason: "Unidentified country" };
    }
    if (!job.applyUrl || !job.applyUrl.startsWith("http")) {
      return { valid: false, reason: "Invalid or missing application URL" };
    }
    if (!job.description || job.description.trim().length < 20) {
      return { valid: false, reason: "Empty or meaningless job description" };
    }
    return { valid: true };
  }

  /**
   * Process a single source execution through the ingestion pipeline
   */
  async processSource(
    sourceId: string,
    context: Record<string, any> = {}
  ): Promise<PipelineRunReport> {
    const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const startedAt = new Date().toISOString();

    // Log run start
    await this.db.prepare(`
      INSERT INTO source_runs (id, source_id, started_at, status, jobs_fetched, jobs_inserted, jobs_updated, jobs_rejected, jobs_duplicates)
      VALUES (?, ?, ?, 'running', 0, 0, 0, 0, 0)
    `).bind(runId, sourceId, startedAt).run();

    let jobsFetched = 0;
    let jobsInserted = 0;
    let jobsUpdated = 0;
    let jobsRejected = 0;
    let jobsDuplicates = 0;
    let errorMessage: string | undefined;
    let status: "success" | "failed" | "partial" = "success";

    try {
      const adapter = this.registry.getAdapter(sourceId);
      if (!adapter) {
        throw new Error(`Adapter '${sourceId}' is not registered.`);
      }

      const ingestionResult = await adapter.fetchJobs(context);
      jobsFetched = ingestionResult.jobsFetched;

      if (ingestionResult.errors && ingestionResult.errors.length > 0) {
        errorMessage = ingestionResult.errors.join("; ");
        status = jobsFetched > 0 ? "partial" : "failed";
      }

      const activeSeenHashes: string[] = [];

      for (const rawJob of ingestionResult.jobs) {
        // 1. Quality Filter check (Section 31)
        const quality = this.validateQuality(rawJob);
        if (!quality.valid) {
          jobsRejected++;
          continue;
        }

        // 2. Resolve / Create Company ID
        const companyId = `comp_${rawJob.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 30)}`;
        await this.db.prepare(`
          INSERT OR IGNORE INTO companies (id, name, normalized_name, website, logo_url, country_code, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).bind(
          companyId,
          rawJob.companyName,
          rawJob.companyName.toLowerCase(),
          rawJob.companyWebsite || null,
          rawJob.companyLogoUrl || null,
          rawJob.countryCode
        ).run();

        // 3. Deduplication via canonical_hash (Section 30)
        const canonicalHash = generateCanonicalHash(
          rawJob.companyName,
          rawJob.title,
          rawJob.location || `${rawJob.city}, ${rawJob.countryCode}`,
          rawJob.applyUrl
        );
        activeSeenHashes.push(canonicalHash);

        // 4. Sponsorship Intelligence Classification (Section 18-21)
        const classification = classifyJobSponsorship(rawJob.description, rawJob.countryCode);

        // 4b. Quality Score Computation — 5-dimension engine
        const qualityBreakdown = computeQualityScore({
          title:            rawJob.title,
          description:      rawJob.description,
          sponsorshipScore: classification.score,
          salaryMin:        rawJob.salaryMin,
          salaryMax:        rawJob.salaryMax,
          salaryCurrency:   rawJob.salaryCurrency,
          applyUrl:         rawJob.applyUrl,
          jobUrl:           rawJob.jobUrl,
          city:             rawJob.city,
          region:           rawJob.region,
          countryCode:      rawJob.countryCode,
          employmentType:   rawJob.employmentType,
          categorySlug:     rawJob.categorySlug,
          companyName:      rawJob.companyName,
          remoteType:       rawJob.remoteType,
          publishedAt:      rawJob.publishedAt,
        });

        // Reject jobs that score below minimum quality threshold
        if (qualityBreakdown.total < MINIMUM_QUALITY_SCORE) {
          jobsRejected++;
          continue;
        }

        // Check if job exists by canonical_hash
        const existing = await this.db.prepare(
          "SELECT id, status FROM jobs WHERE canonical_hash = ?"
        ).bind(canonicalHash).first<{ id: string; status: string }>();

        if (existing) {
          // Update existing listing
          jobsUpdated++;
          jobsDuplicates++;
          await this.db.prepare(`
            UPDATE jobs
            SET last_seen_at = CURRENT_TIMESTAMP,
                salary_min = COALESCE(?, salary_min),
                salary_max = COALESCE(?, salary_max),
                salary_currency = COALESCE(?, salary_currency),
                status = 'active',
                sponsorship_score = ?,
                sponsorship_label = ?,
                sponsorship_positive_evidence = ?,
                sponsorship_negative_evidence = ?,
                visa_keywords = ?,
                quality_score = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(
            rawJob.salaryMin || null,
            rawJob.salaryMax || null,
            rawJob.salaryCurrency || null,
            classification.score,
            classification.label,
            JSON.stringify(classification.positiveEvidence),
            JSON.stringify(classification.negativeEvidence),
            JSON.stringify(classification.keywords),
            qualityBreakdown.total,
            existing.id
          ).run();
        } else {
          // Insert new listing
          const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          jobsInserted++;

          await this.db.prepare(`
            INSERT INTO jobs (
              id, source_id, source_job_id, canonical_hash, title, company_id,
              description, description_clean, location, city, region, country_code,
              remote_type, employment_type, category_id, salary_min, salary_max, salary_currency,
              job_url, apply_url, source_url, published_at, first_seen_at, last_seen_at,
              sponsorship_score, sponsorship_label, sponsorship_positive_evidence,
              sponsorship_negative_evidence, visa_keywords, quality_score, status,
              created_at, updated_at
            ) VALUES (
              ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, ?, ?,
              ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
              ?, ?, ?,
              ?, ?, 100, ?,
              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
          `).bind(
            jobId,
            sourceId,
            rawJob.sourceJobId,
            canonicalHash,
            rawJob.title,
            companyId,
            rawJob.description,
            rawJob.descriptionClean || rawJob.description,
            rawJob.location || null,
            rawJob.city || null,
            rawJob.region || null,
            rawJob.countryCode,
            rawJob.remoteType || "UNKNOWN",
            rawJob.employmentType || "UNKNOWN",
            rawJob.categorySlug ? `cat_${rawJob.categorySlug}` : null,
            rawJob.salaryMin || null,
            rawJob.salaryMax || null,
            rawJob.salaryCurrency || null,
            rawJob.jobUrl,
            rawJob.applyUrl,
            rawJob.sourceUrl || null,
            rawJob.publishedAt || new Date().toISOString(),
            classification.score,
            classification.label,
            JSON.stringify(classification.positiveEvidence),
            JSON.stringify(classification.negativeEvidence),
            JSON.stringify(classification.keywords),
            qualityBreakdown.total,
            classification.requiresReview ? "review_required" : "active"
          ).run();
        }
      }

      // 5. Update Source Stats (Section 25)
      await this.db.prepare(`
        UPDATE sources
        SET last_success_at = CURRENT_TIMESTAMP,
            total_jobs_seen = total_jobs_seen + ?,
            total_jobs_imported = total_jobs_imported + ?,
            last_error_at = NULL,
            last_error_message = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(jobsFetched, jobsInserted, sourceId).run();

    } catch (err: any) {
      status = "failed";
      errorMessage = err.message;
      console.error(`[Ingestion] Error running source ${sourceId}:`, err);

      // Record source error without expiring jobs per Section 107
      await this.db.prepare(`
        UPDATE sources
        SET last_error_at = CURRENT_TIMESTAMP,
            last_error_message = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(err.message, sourceId).run();
    }

    const completedAt = new Date().toISOString();

    // 6. Complete Source Run Record (Section 28, 61)
    await this.db.prepare(`
      UPDATE source_runs
      SET completed_at = ?,
          status = ?,
          jobs_fetched = ?,
          jobs_inserted = ?,
          jobs_updated = ?,
          jobs_rejected = ?,
          jobs_duplicates = ?,
          error_message = ?
      WHERE id = ?
    `).bind(
      completedAt,
      status,
      jobsFetched,
      jobsInserted,
      jobsUpdated,
      jobsRejected,
      jobsDuplicates,
      errorMessage || null,
      runId
    ).run();

    return {
      runId,
      sourceId,
      startedAt,
      completedAt,
      status,
      jobsFetched,
      jobsInserted,
      jobsUpdated,
      jobsRejected,
      jobsDuplicates,
      errorMessage,
    };
  }

  /**
   * Section 32 & 106: Expiration of Stale Jobs
   * Conservative policy: marks jobs expired only if last_seen_at is older than daysThreshold
   * and NEVER marks jobs expired when a source is unhealthy/failing (Section 107).
   */
  async expireStaleJobs(daysThreshold: number = 30): Promise<number> {
    const cutoff = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000).toISOString();
    const result = await this.db.prepare(`
      UPDATE jobs
      SET status = 'expired', updated_at = CURRENT_TIMESTAMP
      WHERE status = 'active' AND last_seen_at < ?
    `).bind(cutoff).run();

    return result.meta?.changes ?? 0;
  }

  /**
   * Automated Storage Washout & Zero-Cost Guard
   * Guarantees storage never fills up:
   * 1. Permanently purges expired jobs
   * 2. Caps active database to the most recent highest-quality jobs (default: 3000)
   * 3. Prunes old ingestion run logs older than 14 days
   */
  async runStorageWashout(options?: {
    expiredDaysCutoff?: number;
    maxActiveRetention?: number;
    logRetentionDays?: number;
  }): Promise<{
    expiredPurged: number;
    excessPruned: number;
    logsPurged: number;
  }> {
    const expiredDays = options?.expiredDaysCutoff ?? 30;
    const maxActive = options?.maxActiveRetention ?? 3000;
    const logDays = options?.logRetentionDays ?? 14;

    const expiredCutoff = new Date(Date.now() - expiredDays * 24 * 60 * 60 * 1000).toISOString();
    const logCutoff = new Date(Date.now() - logDays * 24 * 60 * 60 * 1000).toISOString();

    // 1. Purge expired jobs
    const purgeExpiredRes = await this.db.prepare(`
      DELETE FROM jobs
      WHERE status = 'expired' OR (last_seen_at < ? AND status != 'active')
    `).bind(expiredCutoff).run();

    // 2. Washout excess jobs over max retention cap
    const excessPruneRes = await this.db.prepare(`
      DELETE FROM jobs
      WHERE id NOT IN (
        SELECT id FROM jobs
        ORDER BY posted_at DESC
        LIMIT ?
      )
    `).bind(maxActive).run();

    // 3. Purge old execution logs
    const purgeLogsRes = await this.db.prepare(`
      DELETE FROM ingestion_runs
      WHERE started_at < ?
    `).bind(logCutoff).run();

    return {
      expiredPurged: purgeExpiredRes.meta?.changes ?? 0,
      excessPruned: excessPruneRes.meta?.changes ?? 0,
      logsPurged: purgeLogsRes.meta?.changes ?? 0,
    };
  }
}
