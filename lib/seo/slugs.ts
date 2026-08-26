/**
 * Semantic SEO URL Slug Generator & Parser for High Organic Google CTR
 * 
 * Transforms technical IDs into keyword-rich, Google-friendly URLs:
 * /job/stripe-senior-full-stack-engineer-london-gb-job_xyz
 */

export function generateJobSlug(job: {
  id: string;
  title: string;
  company?: { name: string } | string | null;
  location?: { city?: string | null; country?: string | null } | string | null;
  city?: string | null;
  country_code?: string | null;
}): string {
  const companyName = typeof job.company === "object" ? job.company?.name : job.company || "";
  const cityName = typeof job.location === "object" ? job.location?.city : job.city || "";
  const countryCode = typeof job.location === "object" ? job.location?.country : job.country_code || "";

  const sanitizeSegment = (text?: string | null) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const segments = [
    sanitizeSegment(companyName),
    sanitizeSegment(job.title),
    sanitizeSegment(cityName),
    sanitizeSegment(countryCode),
  ].filter(Boolean);

  const slugPrefix = segments.join("-").slice(0, 100); // Keep reasonable length
  return `${slugPrefix}-${job.id}`;
}

export function extractJobIdFromSlug(slug: string): string {
  if (!slug) return "";
  
  // If the slug is already a direct job ID (e.g. job_123, ashby_456, 12345)
  if (!slug.includes("-")) {
    return slug;
  }

  // Look for ID pattern at the end: e.g. "stripe-engineer-london-job_12345" or "monzo-dev-12345"
  const match = slug.match(/([a-zA-Z0-9_]+)$/);
  if (match) {
    return match[1];
  }

  return slug;
}
