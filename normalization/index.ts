import { EmploymentType, RemoteType } from "@/lib/types/database";

/**
 * Country Code Normalization (Section 108)
 * Maps variants like "United Kingdom", "UK", "Great Britain" to "GB"
 */
export function normalizeCountryCode(rawCountry: string): string {
  if (!rawCountry) return "UNKNOWN";
  const clean = rawCountry.trim().toLowerCase();

  if (["gb", "uk", "united kingdom", "great britain", "england", "scotland", "wales"].includes(clean)) {
    return "GB";
  }
  if (["us", "usa", "united states", "united states of america", "america"].includes(clean)) {
    return "US";
  }
  if (["au", "aus", "australia"].includes(clean)) {
    return "AU";
  }
  if (["ca", "can", "canada"].includes(clean)) {
    return "CA";
  }
  if (["nz", "nzl", "new zealand"].includes(clean)) {
    return "NZ";
  }

  return clean.toUpperCase().slice(0, 2);
}

/**
 * Remote Status Normalization (Section 111)
 */
export function normalizeRemoteType(raw: string): RemoteType {
  if (!raw) return "UNKNOWN";
  const clean = raw.trim().toLowerCase();
  if (clean.includes("remote") || clean.includes("work from home") || clean.includes("wfh")) {
    return "REMOTE";
  }
  if (clean.includes("hybrid") || clean.includes("flexible")) {
    return "HYBRID";
  }
  if (clean.includes("onsite") || clean.includes("on-site") || clean.includes("in-office")) {
    return "ONSITE";
  }
  return "UNKNOWN";
}

/**
 * Employment Type Normalization (Section 112)
 */
export function normalizeEmploymentType(raw: string): EmploymentType {
  if (!raw) return "UNKNOWN";
  const clean = raw.trim().toLowerCase();
  if (clean.includes("full") || clean.includes("perm") || clean.includes("direct hire")) {
    return "FULL_TIME";
  }
  if (clean.includes("part")) {
    return "PART_TIME";
  }
  if (clean.includes("contract") || clean.includes("freelance")) {
    return "CONTRACT";
  }
  if (clean.includes("temp") || clean.includes("locum")) {
    return "TEMPORARY";
  }
  if (clean.includes("intern")) {
    return "INTERNSHIP";
  }
  if (clean.includes("apprentice")) {
    return "APPRENTICESHIP";
  }
  return "OTHER";
}

/**
 * Canonical Job Hash Generation for Deduplication (Section 30)
 * Uses company name, job title, location, and apply URL
 */
export function generateCanonicalHash(
  company: string,
  title: string,
  location: string,
  applyUrl: string
): string {
  const normCompany = (company || "").trim().toLowerCase().replace(/[^\w]/g, "");
  const normTitle = (title || "").trim().toLowerCase().replace(/[^\w]/g, "");
  const normLocation = (location || "").trim().toLowerCase().replace(/[^\w]/g, "");
  const normUrl = (applyUrl || "").trim().toLowerCase().split("?")[0]; // remove query params

  const rawKey = `${normCompany}|${normTitle}|${normLocation}|${normUrl}`;
  // Simple deterministic string hashing for deduplication
  let hash = 0;
  for (let i = 0; i < rawKey.length; i++) {
    const char = rawKey.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `job_${Math.abs(hash).toString(16)}_${normUrl.slice(-12).replace(/[^\w]/g, "")}`;
}
