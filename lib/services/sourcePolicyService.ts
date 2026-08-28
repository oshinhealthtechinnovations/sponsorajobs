import { SourceRecord, SourcePolicyRecord, SourcePermissionStatus } from "../types/database";

export interface SourceRateLimitState {
  requestsInCurrentMinute: number;
  currentMinuteTimestamp: number;
  activeRequests: number;
}

export class SourcePolicyService {
  private static rateLimitMap = new Map<string, SourceRateLimitState>();

  /**
   * Verifies if a source is legally and operationally approved for crawling & ingestion
   */
  static isSourceApproved(source: Partial<SourceRecord>): {
    allowed: boolean;
    reason?: string;
  } {
    if (!source || !source.id) {
      return { allowed: false, reason: "Source ID is required" };
    }

    if (source.permission_status !== "APPROVED") {
      return {
        allowed: false,
        reason: `Source permission status is '${source.permission_status || "REVIEW_REQUIRED"}'. Only 'APPROVED' sources may acquire data.`,
      };
    }

    if (!source.enabled) {
      return { allowed: false, reason: "Source is disabled" };
    }

    if (source.automated_access_allowed === 0) {
      return { allowed: false, reason: "Automated access is explicitly prohibited by source policy" };
    }

    if (source.republication_allowed === 0) {
      return { allowed: false, reason: "Content republication is not permitted for this source" };
    }

    return { allowed: true };
  }

  /**
   * Checks whether the current rate limit permits a new request for the source
   */
  static checkRateLimit(sourceId: string, maxPerMinute: number = 10, concurrencyLimit: number = 1): {
    canProceed: boolean;
    waitMs?: number;
  } {
    const now = Date.now();
    const currentMinute = Math.floor(now / 60000);

    let state = this.rateLimitMap.get(sourceId);
    if (!state || state.currentMinuteTimestamp !== currentMinute) {
      state = {
        requestsInCurrentMinute: 0,
        currentMinuteTimestamp: currentMinute,
        activeRequests: 0,
      };
      this.rateLimitMap.set(sourceId, state);
    }

    if (state.activeRequests >= concurrencyLimit) {
      return { canProceed: false, waitMs: 1000 };
    }

    if (state.requestsInCurrentMinute >= maxPerMinute) {
      const waitMs = (currentMinute + 1) * 60000 - now;
      return { canProceed: false, waitMs };
    }

    return { canProceed: true };
  }

  /**
   * Records request start for concurrency tracking
   */
  static recordRequestStart(sourceId: string): void {
    const state = this.rateLimitMap.get(sourceId);
    if (state) {
      state.requestsInCurrentMinute++;
      state.activeRequests++;
    }
  }

  /**
   * Records request completion for concurrency tracking
   */
  static recordRequestEnd(sourceId: string): void {
    const state = this.rateLimitMap.get(sourceId);
    if (state && state.activeRequests > 0) {
      state.activeRequests--;
    }
  }
}
