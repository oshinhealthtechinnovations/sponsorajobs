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

/**
 * Robust HTML entity decoder (handles multiple nested escaping passes)
 */
export function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  let decoded = str;
  for (let pass = 0; pass < 3; pass++) {
    const prev = decoded;
    decoded = decoded
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, "/")
      .replace(/&nbsp;/g, " ")
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/&ndash;/g, "–")
      .replace(/&mdash;/g, "—")
      .replace(/&bull;/g, "•")
      .replace(/&hellip;/g, "…")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    if (prev === decoded) break;
  }
  return decoded;
}

/**
 * Converts raw HTML or entity-encoded HTML job descriptions into clean, structured Markdown
 */
export function cleanHtmlToMarkdown(raw: string): string {
  if (!raw) return "";

  // 1. Decode entities (multiple passes)
  let text = decodeHtmlEntities(raw);

  // 2. Convert structural HTML elements
  text = text
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gis, (_, content) => {
      const cleanHeader = content.replace(/<[^>]+>/g, "").replace(/[*_#`:]+/g, " ").trim();
      return `\n\n## ${cleanHeader}\n\n`;
    })
    .replace(/<li[^>]*>(.*?)<\/li>/gis, (_, content) => `\n• ${content.trim()}`)
    .replace(/<li[^>]*>/gi, "\n• ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<div[^>]*>/gi, "\n")
    .replace(/<\/section>/gi, "\n")
    .replace(/<section[^>]*>/gi, "\n")
    .replace(/<\/ul>|<\/ol>/gi, "\n\n")
    .replace(/<ul[^>]*>|<ol[^>]*>/gi, "\n")
    .replace(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gis, (_, content) => `**${content.trim()}**`)
    .replace(/<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gis, (_, content) => `*${content.trim()}*`)
    .replace(/<[^>]+>/g, "");

  // 3. Decode remaining entities
  text = decodeHtmlEntities(text);

  // 4. Clean any existing ## headers of asterisks, hashes, backticks, or colons
  text = text.replace(/^##\s*[*_#`\s]+(.*?)[*_#`:\s]*$/gm, "## $1");

  // 5. Normalize lines & bullets
  const rawLines = text.split("\n");
  const cleanedLines: string[] = [];

  const headingKeywords = [
    "overview",
    "an overview of this role",
    "about the role",
    "about the job",
    "about us",
    "about the company",
    "about the team",
    "who we are",
    "what you'll do",
    "what you will do",
    "responsibilities",
    "key responsibilities",
    "your responsibilities",
    "role responsibilities",
    "duties",
    "what you'll bring",
    "what you will bring",
    "requirements",
    "qualifications",
    "minimum qualifications",
    "preferred qualifications",
    "what we're looking for",
    "what we are looking for",
    "who you are",
    "we'd love to hear from you",
    "we’d love to hear from you",
    "you’ll play a",
    "you'll play a",
    "skills & experience",
    "skills and experience",
    "experience & qualifications",
    "benefits",
    "compensation & benefits",
    "perks & benefits",
    "what we offer",
    "how we support",
    "visa sponsorship",
    "visa & relocation",
    "relocation & sponsorship",
    "how to apply",
    "application process",
    "hiring process",
    "equal opportunity",
    "country hiring guidelines"
  ];

  for (let i = 0; i < rawLines.length; i++) {
    let l = rawLines[i].trim();
    if (!l) {
      cleanedLines.push("");
      continue;
    }

    // Wipe useless separator lines like "• --" or "---" or "--"
    if (/^[•\-\*]*\s*[-*_—–\s]{2,}$/.test(l) || l === "•" || l === "-") {
      continue;
    }

    // Clean up unbalanced bold/italic artifact chains
    l = l.replace(/\*{4,}/g, "").replace(/\*\*\*/g, "**");
    l = l.replace(/\*\*\s*\*\*/g, "");

    // Strip leading bullet if it's an intro paragraph with emoji or bolding
    if (/^[•\-\*]\s*(?:\*\*|🚀|🔥|✨|💡|⭐|❤️|👋|🎯)/.test(l)) {
      l = l.replace(/^[•\-\*]\s*/, "");
    }

    // Strip markdown chars for header check
    const stripped = l.replace(/^[\s*#_:]+|[\s*#_:]+$/g, "").trim();
    const strippedLower = stripped.toLowerCase();

    // Check if line is already a heading
    if (l.startsWith("## ")) {
      cleanedLines.push(`## ${stripped}`);
      continue;
    }

    // Check if this line is an implicit heading
    if (!l.startsWith("• ") && !l.startsWith("> ") && stripped.length < 80) {
      if (
        headingKeywords.some((kw) => strippedLower === kw || strippedLower.startsWith(kw)) ||
        (l.startsWith("**") && l.endsWith("**") && stripped.length < 65 && !stripped.includes("."))
      ) {
        cleanedLines.push(`\n## ${stripped}\n`);
        continue;
      }
    }

    cleanedLines.push(l);
  }

  return cleanedLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

