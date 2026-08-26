/**
 * Direct Employer ATS Link Unroller & Resolver
 * Detects and extracts underlying direct company application links (Greenhouse, Lever, Ashby, Workday, etc.)
 * from aggregator payloads so applicants are directed straight to the employer's free application form.
 */

const ATS_PATTERNS = [
  /https?:\/\/boards\.greenhouse\.io\/[^\s"'<>]+/i,
  /https?:\/\/jobs\.lever\.co\/[^\s"'<>]+/i,
  /https?:\/\/jobs\.ashbyhq\.com\/[^\s"'<>]+/i,
  /https?:\/\/[a-zA-Z0-9-]+\.workable\.com\/[^\s"'<>]+/i,
  /https?:\/\/[a-zA-Z0-9-]+\.wd\d+\.myworkdayjobs\.com\/[^\s"'<>]+/i,
  /https?:\/\/careers\.smartrecruiters\.com\/[^\s"'<>]+/i,
  /https?:\/\/[a-zA-Z0-9-]+\.bamboohr\.com\/careers\/[^\s"'<>]+/i,
  /https?:\/\/[a-zA-Z0-9-]+\.taleo\.net\/[^\s"'<>]+/i,
  /https?:\/\/[a-zA-Z0-9-]+\.icims\.com\/[^\s"'<>]+/i,
];

export function resolveDirectApplyUrl(job: {
  applyUrl: string;
  description?: string;
  companyName?: string;
}): string {
  if (!job.applyUrl) return job.applyUrl;

  // 1. If already a direct ATS or official gov link, return as-is
  if (
    job.applyUrl.includes("greenhouse.io") ||
    job.applyUrl.includes("lever.co") ||
    job.applyUrl.includes("ashbyhq.com") ||
    job.applyUrl.includes("myworkdayjobs.com") ||
    job.applyUrl.includes("workable.com") ||
    job.applyUrl.includes("usajobs.gov")
  ) {
    return job.applyUrl;
  }

  // 2. Scan the description text for embedded direct ATS application links
  if (job.description) {
    for (const pattern of ATS_PATTERNS) {
      const match = job.description.match(pattern);
      if (match && match[0]) {
        // Strip any trailing punctuation
        const cleanUrl = match[0].replace(/[.,;)\]]+$/, "");
        return cleanUrl;
      }
    }
  }

  // 3. Fallback to existing verified URL
  return job.applyUrl;
}
