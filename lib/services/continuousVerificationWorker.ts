import { JobRecord } from "../types/database";
import { JobVerificationEngine } from "./jobVerificationEngine";
import { PublishGateService } from "./publishGateService";

export interface VerificationCycleReport {
  totalChecked: number;
  stillActive: number;
  expiredCount: number;
  warningsCount: number;
  unverifiableCount: number;
  auditLogs: any[];
}

export class ContinuousVerificationWorker {
  /**
   * Executes a scheduled re-verification cycle on active published jobs
   */
  static async runVerificationCycle(
    activeJobs: JobRecord[],
    checkUrlFn: (url: string) => Promise<{
      isLive: boolean;
      httpStatus: number;
      isClosedMessage: boolean;
      isHomepageRedirect: boolean;
    }> = JobVerificationEngine.checkUrl
  ): Promise<{ updatedJobs: JobRecord[]; report: VerificationCycleReport }> {
    const report: VerificationCycleReport = {
      totalChecked: 0,
      stillActive: 0,
      expiredCount: 0,
      warningsCount: 0,
      unverifiableCount: 0,
      auditLogs: [],
    };

    const updatedJobs: JobRecord[] = [];

    for (const job of activeJobs) {
      report.totalChecked++;

      const jobUrlCheck = await checkUrlFn(job.job_url);
      const applyUrlCheck = job.apply_url === job.job_url ? jobUrlCheck : await checkUrlFn(job.apply_url);

      const is404or410 = jobUrlCheck.httpStatus === 404 || jobUrlCheck.httpStatus === 410;
      const isClosed = jobUrlCheck.isClosedMessage || applyUrlCheck.isClosedMessage;
      const isHomepageRedirect = jobUrlCheck.isHomepageRedirect || applyUrlCheck.isHomepageRedirect;

      const evalResult = JobVerificationEngine.computeVerificationScore({
        sourceApproved: true,
        jobUrlLive: jobUrlCheck.isLive,
        applicationUrlLive: applyUrlCheck.isLive,
        isHttps: job.job_url.startsWith("https://"),
        isDnsValid: true,
        employerDetected: true,
        titleDetected: true,
        isHomepageRedirect,
        isClosedSignal: isClosed,
        is404or410,
      });

      const updatedJob = { ...job };
      updatedJob.last_verified_at = new Date().toISOString();
      updatedJob.verification_status = evalResult.status;
      updatedJob.verification_score = evalResult.score;

      if (evalResult.status === "EXPIRED" || is404or410 || isClosed || isHomepageRedirect) {
        updatedJob.status = "expired";
        updatedJob.is_published = 0;
        updatedJob.expires_at = new Date().toISOString();
        report.expiredCount++;

        report.auditLogs.push(
          PublishGateService.createStatusHistoryRecord(
            job.id,
            job.status,
            "expired",
            evalResult.failureReasons.join("; ") || "Requisition closed during continuous verification",
            "continuous_verification_worker"
          )
        );
      } else if (evalResult.status === "UNVERIFIABLE") {
        updatedJob.status = "warning";
        report.unverifiableCount++;
      } else {
        updatedJob.status = "active";
        updatedJob.is_published = 1;
        // Schedule next check in 24 hours
        updatedJob.next_verification_at = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
        updatedJob.verification_expires_at = new Date(Date.now() + 30 * 3600 * 1000).toISOString();
        report.stillActive++;
      }

      updatedJobs.push(updatedJob);
    }

    return { updatedJobs, report };
  }
}
