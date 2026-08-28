import https from "https";
import http from "http";
import { VerificationStatus, JobVerificationRecord, JobApplicationCheckRecord } from "../types/database";

export interface UrlCheckResult {
  isLive: boolean;
  httpStatus: number;
  finalUrl: string;
  redirectCount: number;
  isHomepageRedirect: boolean;
  isLoginWall: boolean;
  isCaptcha: boolean;
  isClosedMessage: boolean;
  contentEvidence: string[];
}

// Patterns indicating closed/expired jobs despite HTTP 200 (Soft-404)
const CLOSED_PATTERNS = [
  /job no longer available/i,
  /position has been filled/i,
  /position is closed/i,
  /job has been closed/i,
  /applications are closed/i,
  /no longer accepting applications/i,
  /position unavailable/i,
  /this job is no longer active/i,
  /this posting has expired/i,
  /requisition closed/i,
  /role has expired/i,
];

// Patterns indicating generic careers or homepage redirects
const HOMEPAGE_PATTERNS = [
  /^https?:\/\/[^\/]+\/?$/,
  /^https?:\/\/[^\/]+\/careers\/?$/i,
  /^https?:\/\/[^\/]+\/jobs\/?$/i,
  /^https?:\/\/[^\/]+\/en\/?$/i,
  /^https?:\/\/[^\/]+\/home\/?$/i,
];

export class JobVerificationEngine {
  /**
   * Analyzes page content body for soft-404 and closed-job phrases
   */
  static detectClosedSignals(htmlOrText: string): { isClosed: boolean; matchedPhrase?: string } {
    if (!htmlOrText) return { isClosed: false };

    for (const pattern of CLOSED_PATTERNS) {
      const match = htmlOrText.match(pattern);
      if (match) {
        return { isClosed: true, matchedPhrase: match[0] };
      }
    }

    return { isClosed: false };
  }

  /**
   * Checks if the final resolved URL is a generic homepage redirect
   */
  static isHomepageRedirect(originalUrl: string, finalUrl: string): boolean {
    if (!finalUrl) return false;
    const finalClean = finalUrl.split("?")[0].toLowerCase();

    return HOMEPAGE_PATTERNS.some((p) => p.test(finalClean));
  }

  /**
   * Performs an end-to-end network check of a Job URL with redirect and content inspection
   */
  static async checkUrl(
    url: string,
    timeoutMs: number = 7000,
    maxRedirects: number = 5
  ): Promise<UrlCheckResult> {
    if (!url || !url.startsWith("http")) {
      return {
        isLive: false,
        httpStatus: 400,
        finalUrl: url,
        redirectCount: 0,
        isHomepageRedirect: false,
        isLoginWall: false,
        isCaptcha: false,
        isClosedMessage: false,
        contentEvidence: ["Malformed or missing URL protocol"],
      };
    }

    return new Promise((resolve) => {
      let currentUrl = url;
      let redirects = 0;

      const performRequest = (reqUrl: string) => {
        try {
          const parsed = new URL(reqUrl);
          const client = parsed.protocol === "https:" ? https : http;

          const req = client.request(
            reqUrl,
            {
              method: "GET",
              timeout: timeoutMs,
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              },
            },
            (res) => {
              const status = res.statusCode || 500;

              // Handle 3xx Redirects
              if (status >= 300 && status < 400 && res.headers.location && redirects < maxRedirects) {
                redirects++;
                let nextUrl = res.headers.location;
                if (!nextUrl.startsWith("http")) {
                  nextUrl = new URL(nextUrl, reqUrl).toString();
                }
                currentUrl = nextUrl;
                res.resume();
                performRequest(nextUrl);
                return;
              }

              let body = "";
              res.setEncoding("utf-8");
              res.on("data", (chunk) => {
                if (body.length < 50000) body += chunk; // Sample first 50KB for analysis
              });

              res.on("end", () => {
                const isHome = JobVerificationEngine.isHomepageRedirect(url, currentUrl);
                const closedCheck = JobVerificationEngine.detectClosedSignals(body);
                const isLogin = status === 401 || /login|sign[-_]?in|authenticate/i.test(currentUrl);
                const isCap = /cf-challenge|turnstile|captcha|perimeterx|datadome/i.test(body);

                const isSuccess = (status >= 200 && status < 400) && !isHome && !closedCheck.isClosed;

                resolve({
                  isLive: isSuccess,
                  httpStatus: status,
                  finalUrl: currentUrl,
                  redirectCount: redirects,
                  isHomepageRedirect: isHome,
                  isLoginWall: isLogin,
                  isCaptcha: isCap,
                  isClosedMessage: closedCheck.isClosed,
                  contentEvidence: closedCheck.matchedPhrase ? [`Closed signal: '${closedCheck.matchedPhrase}'`] : [],
                });
              });
            }
          );

          req.on("timeout", () => {
            req.destroy();
            resolve({
              isLive: false,
              httpStatus: 504,
              finalUrl: currentUrl,
              redirectCount: redirects,
              isHomepageRedirect: false,
              isLoginWall: false,
              isCaptcha: false,
              isClosedMessage: false,
              contentEvidence: ["Connection timed out"],
            });
          });

          req.on("error", (err) => {
            resolve({
              isLive: false,
              httpStatus: 500,
              finalUrl: currentUrl,
              redirectCount: redirects,
              isHomepageRedirect: false,
              isLoginWall: false,
              isCaptcha: false,
              isClosedMessage: false,
              contentEvidence: [`Network error: ${err.message}`],
            });
          });

          req.end();
        } catch (e: any) {
          resolve({
            isLive: false,
            httpStatus: 400,
            finalUrl: reqUrl,
            redirectCount: redirects,
            isHomepageRedirect: false,
            isLoginWall: false,
            isCaptcha: false,
            isClosedMessage: false,
            contentEvidence: [`URL parsing exception: ${e.message}`],
          });
        }
      };

      performRequest(url);
    });
  }

  /**
   * Computes the 100-point verification score with mandatory hard-failure overrides
   */
  static computeVerificationScore(checks: {
    sourceApproved: boolean;
    jobUrlLive: boolean;
    applicationUrlLive: boolean;
    isHttps: boolean;
    isDnsValid: boolean;
    employerDetected: boolean;
    titleDetected: boolean;
    isHomepageRedirect: boolean;
    isClosedSignal: boolean;
    is404or410: boolean;
  }): { score: number; status: VerificationStatus; failureReasons: string[] } {
    const failureReasons: string[] = [];

    // ── HARD FAILURES OVERRIDE ALL SCORES
    if (checks.is404or410) {
      failureReasons.push("Job URL returned HTTP 404/410 (Requisition Closed)");
      return { score: 0, status: "EXPIRED", failureReasons };
    }

    if (checks.isClosedSignal) {
      failureReasons.push("Page contains explicit 'position closed/filled' notice (Soft-404)");
      return { score: 0, status: "EXPIRED", failureReasons };
    }

    if (checks.isHomepageRedirect) {
      failureReasons.push("Job URL redirects to general company/careers homepage");
      return { score: 0, status: "REJECTED", failureReasons };
    }

    if (!checks.sourceApproved) {
      failureReasons.push("Source is not approved for data acquisition");
      return { score: 0, status: "REJECTED", failureReasons };
    }

    // ── POINT ACCUMULATION
    let score = 0;
    if (checks.sourceApproved) score += 15;
    if (checks.isHttps) score += 5;
    if (checks.isDnsValid) score += 5;
    if (checks.jobUrlLive) score += 20;
    if (checks.applicationUrlLive) score += 20;
    if (checks.employerDetected) score += 15;
    if (checks.titleDetected) score += 10;
    score += 10; // Freshness base

    let status: VerificationStatus = "VERIFIED";
    if (!checks.applicationUrlLive) {
      status = "UNVERIFIABLE";
      failureReasons.push("Application path unreachable or restricted");
    } else if (score < 80) {
      status = "VERIFIED_WARNING";
    }

    return { score, status, failureReasons };
  }
}
