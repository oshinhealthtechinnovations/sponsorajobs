import { JobRecord, JobStatusHistoryRecord } from "../types/database";
import { SourcePolicyService } from "./sourcePolicyService";

export interface PublishGateResult {
  canPublish: boolean;
  blockers: string[];
  recommendedStatus: JobRecord["status"];
  isPublished: 0 | 1;
}

export class PublishGateService {
  /**
   * Enforces the 12-Point Master Publication Formula
   */
  static evaluate(job: Partial<JobRecord>, sourceApproved: boolean = true): PublishGateResult {
    const blockers: string[] = [];

    // Condition 1: Source Approved
    if (!sourceApproved) {
      blockers.push("Source is not approved for data acquisition");
    }

    // Condition 2: Title presence
    if (!job.title || job.title.trim().length < 3) {
      blockers.push("Job title is missing or insufficient length");
    }

    // Condition 3: Employer presence
    if (!job.company_id || job.company_id.trim().length < 2) {
      blockers.push("Employer identification is missing");
    }

    // Condition 4: Country & Location validity
    if (!job.country_code || (job.location_confidence !== undefined && job.location_confidence !== null && job.location_confidence < 30)) {
      blockers.push("Geographic location conflict or unresolvable country code");
    }

    // Condition 5: Requisition URL live
    if (!job.job_url || !job.job_url.startsWith("http")) {
      blockers.push("Invalid or missing job URL protocol");
    }

    // Condition 6: Application URL live
    if (!job.apply_url || !job.apply_url.startsWith("http")) {
      blockers.push("Invalid or missing application URL protocol");
    }

    // Condition 7: Verification Status
    if (job.verification_status !== "VERIFIED" && job.verification_status !== "VERIFIED_WARNING") {
      blockers.push(`Verification status '${job.verification_status || "UNVERIFIED"}' is not approved for publication`);
    }

    // Condition 8: Freshness of Verification
    if (job.verification_expires_at) {
      const expiry = new Date(job.verification_expires_at).getTime();
      if (Date.now() > expiry) {
        blockers.push("Job verification has expired (stale verification)");
      }
    }

    // Condition 9: Explicit Rejection or Closed Status
    if (job.status === "expired" || job.status === "rejected") {
      blockers.push(`Job is explicitly marked as ${job.status}`);
    }

    // Condition 10: Quality Score Threshold
    if (job.quality_score !== undefined && job.quality_score < 60) {
      blockers.push(`Quality score (${job.quality_score}) below acceptable minimum (60)`);
    }

    const canPublish = blockers.length === 0;

    let recommendedStatus: JobRecord["status"] = "quarantined";
    if (canPublish) {
      recommendedStatus = "active";
    } else if (job.status === "expired" || job.verification_status === "EXPIRED" || blockers.some((b) => b.includes("expired"))) {
      recommendedStatus = "expired";
    } else if (job.status === "rejected" || job.verification_status === "REJECTED" || blockers.some((b) => b.includes("rejected"))) {
      recommendedStatus = "rejected";
    } else if (blockers.some((b) => b.includes("Geographic") || b.includes("Quality") || b.includes("Verification") || b.includes("unreachable"))) {
      recommendedStatus = "review_required";
    }

    return {
      canPublish,
      blockers,
      recommendedStatus,
      isPublished: canPublish ? 1 : 0,
    };
  }

  /**
   * Generates a status history audit entry when a job changes state
   */
  static createStatusHistoryRecord(
    jobId: string,
    oldStatus: string | null,
    newStatus: string,
    reason: string,
    triggeredBy: string = "system_publish_gate"
  ): JobStatusHistoryRecord {
    return {
      id: `sh_${jobId}_${Date.now()}`,
      job_id: jobId,
      old_status: oldStatus,
      new_status: newStatus,
      reason,
      triggered_by: triggeredBy,
      created_at: new Date().toISOString(),
    };
  }
}
