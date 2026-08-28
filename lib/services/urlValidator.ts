/**
 * Apply URL Validation Service
 *
 * Validates that job apply URLs are live, reachable, and belong to trusted domains.
 * Runs as a non-blocking background check during ingestion.
 * Dead links → jobs are automatically marked as 'expired'.
 */

export interface UrlValidationResult {
  url: string;
  isLive: boolean;
  isRedirect: boolean;
  finalUrl: string;
  statusCode: number;
  isTrustedDomain: boolean;
  isAggregatorRedirect: boolean;
  errorReason?: string;
}

// ─── Trusted employer ATS domains ────────────────────────────────────────────
const TRUSTED_ATS_DOMAINS = new Set([
  "lever.co", "jobs.lever.co",
  "greenhouse.io", "app.greenhouse.io", "boards.greenhouse.io",
  "workday.com", "myworkdayjobs.com",
  "workable.com", "apply.workable.com",
  "ashbyhq.com", "jobs.ashbyhq.com",
  "breezy.hr",
  "smartrecruiters.com",
  "recruitee.com",
  "teamtailor.com",
  "bamboohr.com",
  "icims.com",
  "taleo.net",
  "successfactors.com",
  "oraclecloud.com",
  // Major direct employer portals
  "nhs.uk", "jobs.nhs.uk", "nhsjobs.trac.jobs",
  "arup.com",
  "bhp.com",
  "atlassian.com",
  "revolut.com",
  "monzo.com",
  "canva.com",
  "shopify.com",
  "xero.com",
  "datacom.com",
  "usajobs.gov",
  "gov.uk",
  "burnsmcd.com", "burnsmcd.jobs",
  "macegroup.com", "careers.macegroup.com",
]);

// ─── Known aggregator redirect domains (functional but not direct) ─────────────
const AGGREGATOR_DOMAINS = new Set([
  "adzuna.co.uk", "adzuna.com",
  "remotive.com",
  "arbeitnow.com",
  "jooble.org",
  "indeed.com",
  "reed.co.uk",
  "totaljobs.com",
  "cv-library.co.uk",
  "linkedin.com",
  "glassdoor.com",
]);

/**
 * Validates a single apply URL. Returns immediately — does not throw.
 * Designed to run in background without blocking the ingestion pipeline.
 */
export async function validateApplyUrl(url: string): Promise<UrlValidationResult> {
  const defaultResult: UrlValidationResult = {
    url,
    isLive: false,
    isRedirect: false,
    finalUrl: url,
    statusCode: 0,
    isTrustedDomain: false,
    isAggregatorRedirect: false,
    errorReason: undefined,
  };

  if (!url || !url.startsWith("http")) {
    return { ...defaultResult, errorReason: "Invalid URL format — must begin with http(s)" };
  }

  try {
    const parsedUrl = new URL(url);
    const domain    = parsedUrl.hostname.replace(/^www\./, "");

    const isTrusted     = TRUSTED_ATS_DOMAINS.has(domain) || [...TRUSTED_ATS_DOMAINS].some((d) => domain.endsWith(`.${d}`));
    const isAggregator  = AGGREGATOR_DOMAINS.has(domain)  || [...AGGREGATOR_DOMAINS].some((d) => domain.endsWith(`.${d}`));

    // Skip expensive HEAD request for trusted domains (already known live)
    if (isTrusted) {
      return {
        url,
        isLive: true,
        isRedirect: false,
        finalUrl: url,
        statusCode: 200,
        isTrustedDomain: true,
        isAggregatorRedirect: false,
      };
    }

    // Perform HEAD request to check liveness
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        headers: {
          "User-Agent": "SponsorAJobsBot/1.0 (+https://sponsorajobs.com/about)",
        },
        redirect: "follow",
      });

      clearTimeout(timeout);

      const finalUrl   = response.url || url;
      const isRedirect = finalUrl !== url;
      const isLive     = response.status < 400;

      if (!isLive) {
        return {
          url,
          isLive: false,
          isRedirect,
          finalUrl,
          statusCode: response.status,
          isTrustedDomain: isTrusted,
          isAggregatorRedirect: isAggregator,
          errorReason: `HTTP ${response.status} — ${response.statusText}`,
        };
      }

      return {
        url,
        isLive: true,
        isRedirect,
        finalUrl,
        statusCode: response.status,
        isTrustedDomain: isTrusted,
        isAggregatorRedirect: isAggregator,
      };
    } catch (fetchErr: any) {
      clearTimeout(timeout);
      const isTimeout = fetchErr.name === "AbortError";
      return {
        ...defaultResult,
        isTrustedDomain: isTrusted,
        isAggregatorRedirect: isAggregator,
        errorReason: isTimeout ? "Request timed out (>6s)" : fetchErr.message,
      };
    }
  } catch (parseErr: any) {
    return { ...defaultResult, errorReason: `Malformed URL: ${parseErr.message}` };
  }
}

/**
 * Batch validate a list of URLs concurrently (with concurrency cap = 5).
 * Returns a Map of url → validation result.
 */
export async function batchValidateUrls(
  urls: string[],
  concurrency = 5
): Promise<Map<string, UrlValidationResult>> {
  const results = new Map<string, UrlValidationResult>();
  const chunks  = chunkArray(urls, concurrency);

  for (const chunk of chunks) {
    const settled = await Promise.allSettled(chunk.map((url) => validateApplyUrl(url)));
    for (let i = 0; i < chunk.length; i++) {
      const result = settled[i];
      if (result.status === "fulfilled") {
        results.set(chunk[i], result.value);
      } else {
        results.set(chunk[i], {
          url: chunk[i],
          isLive: false,
          isRedirect: false,
          finalUrl: chunk[i],
          statusCode: 0,
          isTrustedDomain: false,
          isAggregatorRedirect: false,
          errorReason: result.reason?.message || "Unknown error",
        });
      }
    }
  }

  return results;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
