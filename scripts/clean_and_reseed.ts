import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  let decoded = str;
  // Multiple passes to handle nested encoding like &amp;lt;
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

export function cleanHtmlToMarkdown(raw: string): string {
  if (!raw) return "";

  // Step 1: Decode HTML entities completely
  let text = decodeHtmlEntities(raw);

  // Step 2: Convert structural HTML elements to markdown equivalents
  text = text
    // Convert headings <h1>...</h1> to <h6>...</h6> to ## Headings
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gis, (_, content) => `\n\n## ${content.trim()}\n\n`)
    // Convert list items
    .replace(/<li[^>]*>(.*?)<\/li>/gis, (_, content) => `\n• ${content.trim()}`)
    .replace(/<li[^>]*>/gi, "\n• ")
    // Convert line breaks and hr
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n\n---\n\n")
    // Convert paragraphs & divs to linebreaks
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p[^>]*>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<div[^>]*>/gi, "\n")
    .replace(/<\/section>/gi, "\n")
    .replace(/<section[^>]*>/gi, "\n")
    .replace(/<\/ul>|<\/ol>/gi, "\n\n")
    .replace(/<ul[^>]*>|<ol[^>]*>/gi, "\n")
    // Convert strong / bold
    .replace(/<(?:strong|b)[^>]*>(.*?)<\/(?:strong|b)>/gis, (_, content) => `**${content.trim()}**`)
    // Convert em / italic
    .replace(/<(?:em|i)[^>]*>(.*?)<\/(?:em|i)>/gis, (_, content) => `*${content.trim()}*`)
    // Strip remaining tags
    .replace(/<[^>]+>/g, "");

  // Step 3: Decode entities again in case tag contents had remaining entities
  text = decodeHtmlEntities(text);

  // Step 4: Normalize lines and bullet points
  const lines = text.split("\n").map((line) => {
    let l = line.trim();
    // Normalize bullet points
    l = l.replace(/^[•\-\*]\s*/, "• ");
    // Remove isolated single asterisks or empty bolding
    l = l.replace(/\*\*\s*\*\*/g, "");
    return l;
  });

  // Step 5: Detect implicit section titles if not already formatted with ##
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) {
      cleanedLines.push("");
      continue;
    }

    const stripped = line.replace(/^\*\*|\*\*$/g, "").replace(/:$/, "").trim();
    const strippedLower = stripped.toLowerCase();

    if (!line.startsWith("## ") && !line.startsWith("• ") && !line.startsWith("> ") && stripped.length < 80) {
      if (
        headingKeywords.some((kw) => strippedLower === kw || strippedLower.startsWith(kw + " -") || strippedLower.startsWith(kw + ":")) ||
        (line.startsWith("**") && line.endsWith("**") && stripped.length < 50 && !stripped.includes("."))
      ) {
        cleanedLines.push(`\n## ${stripped}\n`);
        continue;
      }
    }

    cleanedLines.push(line);
  }

  // Step 6: Join and collapse excessive blank lines
  const result = cleanedLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return result;
}

const realJobsPath = path.resolve(__dirname, "../lib/db/realJobsData.json");
const realData = JSON.parse(fs.readFileSync(realJobsPath, "utf-8"));

let cleanedCount = 0;
for (const job of realData.jobs) {
  if (job.description) {
    const cleaned = cleanHtmlToMarkdown(job.description);
    if (cleaned !== job.description) {
      job.description = cleaned;
      job.description_clean = cleaned;
      cleanedCount++;
    }
  }
}

fs.writeFileSync(realJobsPath, JSON.stringify(realData, null, 2), "utf-8");
console.log(`[Clean] Successfully sanitized and cleaned ${cleanedCount} jobs in realJobsData.json!`);
