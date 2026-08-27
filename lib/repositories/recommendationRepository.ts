import { getDatabase, DatabaseClient } from "../db/client";
import { JobRecommendationRecord, RecommendationFeedbackRecord } from "../types/database";
import crypto from "crypto";

export class RecommendationRepository {
  private db: DatabaseClient;

  constructor(db?: DatabaseClient) {
    this.db = db || getDatabase();
  }

  /**
   * Records candidate feedback on a recommendation (e.g. HELPFUL or NOT_RELEVANT)
   */
  async logFeedback(
    candidateId: string,
    jobId: string,
    feedbackType: "HELPFUL" | "NOT_RELEVANT",
    reason?: RecommendationFeedbackRecord["reason"]
  ): Promise<RecommendationFeedbackRecord> {
    const id = `rcf_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const now = new Date().toISOString();

    const record: RecommendationFeedbackRecord = {
      id,
      candidate_id: candidateId,
      job_id: jobId,
      feedback_type: feedbackType,
      reason,
      created_at: now,
    };

    const sql = `
      INSERT INTO recommendation_feedback (
        id, candidate_id, job_id, feedback_type, reason, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
      await this.db.prepare(sql).bind(
        record.id,
        record.candidate_id,
        record.job_id,
        record.feedback_type,
        record.reason || null,
        record.created_at
      ).run();
    } catch (err) {
      console.warn("[Recommendation Repo] Log feedback failed:", err);
    }

    return record;
  }
}
