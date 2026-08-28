"use client";

import React from "react";
import {
  Briefcase,
  CheckCircle2,
  Award,
  Globe2,
  Gift,
  Send,
  Building2,
  FileCheck2,
  Check,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

import { cleanHtmlToMarkdown, decodeHtmlEntities } from "@/normalization";

interface RichJobDescriptionProps {
  description: string;
  companyName: string;
  countryCode: string;
  applyUrl: string;
}

// Invalid section titles that should never become top-level card headings
const INVALID_TITLES = new Set([
  "or",
  "and",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "1",
  "2",
  "3",
  "4",
  "gs-05",
  "gs-07",
  "gs-09",
  "gs-11",
  "gs-12",
  "gs-13",
  "gs-14",
  "gs-15",
  "note",
  "important",
  "part-time",
]);

// Helper to clean and validate section titles
function cleanSectionTitle(rawTitle: string): string {
  if (!rawTitle) return "Overview";
  const cleaned = rawTitle
    .replace(/^[\s*#_`:>⚠️🔴🟢✨🏢💼📍•\-–—\d.)]+|[\s*#_`:>]+$/g, "")
    .replace(/\*\*/g, "")
    .trim();

  if (!cleaned || INVALID_TITLES.has(cleaned.toLowerCase())) {
    return "Overview";
  }
  return cleaned;
}

// Helper to format inline markdown like **bold**, *italic*, and clean artifacts
function formatInlineText(text: string): React.ReactNode {
  if (!text) return null;
  let decoded = decodeHtmlEntities(text);

  decoded = decoded
    .replace(/^>\s*/, "")
    .replace(/\*{4,}/g, "**")
    .replace(/\*\*\s*\*\*/g, "")
    .replace(/\*?([a-zA-Z0-9\s]+)\*:\s*/g, "**$1:** ");

  const parts = decoded.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const inner = part.slice(2, -2).replace(/^\*+|\*+$/g, "").trim();
      return (
        <strong key={i} className="font-bold text-slate-900">
          {inner}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      const inner = part.slice(1, -1).replace(/^\*+|\*+$/g, "").trim();
      return (
        <strong key={i} className="font-semibold text-slate-800">
          {inner}
        </strong>
      );
    }
    const sanitized = part.replace(/\*/g, "");
    return sanitized;
  });
}

// Parse line into bullet, sub-heading, or paragraph
function parseContentLine(rawLine: string): { isBullet: boolean; isSubheading?: boolean; text: string } | null {
  if (!rawLine) return null;
  let trimmed = rawLine.trim().replace(/^>\s*/, "").trim();

  if (
    !trimmed ||
    /^[•\-\*]*\s*[-*_—–\s]{2,}$/.test(trimmed) ||
    trimmed === "•" ||
    trimmed === "-" ||
    trimmed === "--" ||
    trimmed === "---"
  ) {
    return null;
  }

  // Handle distinct pathway / grading markers like **GS-07:** or **Path A:**
  if (/^\*\*(?:GS-\d+|Option [A-D]|Path [A-D]|[A-D]\))\*\*/i.test(trimmed)) {
    return { isBullet: false, isSubheading: true, text: trimmed };
  }

  // Handle statements starting with bold label
  if (/^(?:\*\*[^*]+\*\*|\*?[a-zA-Z0-9\s]+\*:)/.test(trimmed)) {
    return { isBullet: false, text: trimmed };
  }

  // Standard bullet
  const bulletMatch = trimmed.match(/^(?:[•\-]\s+|\*(?!\*)\s+|\d+\.\s+)(.*)$/);
  if (bulletMatch) {
    let bulletContent = bulletMatch[1].trim().replace(/^\*+/, "").replace(/\*+$/, "");
    if (!bulletContent || /^[•\-\*]*\s*[-*_—–\s]{2,}$/.test(bulletContent)) return null;
    return { isBullet: true, text: bulletContent };
  }

  return { isBullet: false, text: trimmed };
}

// Pre-processor to detect genuine section boundaries and normalize chaotic feeds
function preprocessDescriptionText(raw: string): string {
  if (!raw) return "";

  let text = raw;

  // 1. Convert prominent section labels to standard Markdown headers
  const headerReplacements: [RegExp, string][] = [
    [/(?:^|\n)\s*(?:[-*•]\s*)?(?:Summary|Overview|About the (?:Role|Position|Job|Company|Agency)|Primary Purpose|Position Overview):?\s*(?=\n|[A-Z])/gi, "\n\n## About the Role\n"],
    [/(?:^|\n)\s*(?:[-*•]\s*)?(?:Key Responsibilities|Responsibilities|Duties|What You(?:'ll| will) Do|Major Duties|Job Duties):?\s*(?=\n|[A-Z])/gi, "\n\n## Key Responsibilities\n"],
    [/(?:^|\n)\s*(?:[-*•]\s*)?(?:Basic Requirements|Requirements|Qualifications|Minimum Qualifications|In order to qualify|Eligibility|Who You Are|What You(?:'ll| will) Bring|Skills & Experience):?\s*(?=\n|[A-Z])/gi, "\n\n## Qualifications & Requirements\n"],
    [/(?:^|\n)\s*(?:[-*•]\s*)?(?:Visa Sponsorship|Immigration Support|Relocation Assistance|Certificate of Sponsorship):?\s*(?=\n|[A-Z])/gi, "\n\n## Visa Sponsorship & Relocation\n"],
    [/(?:^|\n)\s*(?:[-*•]\s*)?(?:Benefits|What We Offer|Compensation & Perks|Salary & Benefits|Perks):?\s*(?=\n|[A-Z])/gi, "\n\n## Benefits & Compensation\n"],
    [/(?:^|\n)\s*(?:[-*•]\s*)?(?:How to Apply|Application (?:Process|Instructions)|Next Steps):?\s*(?=\n|[A-Z])/gi, "\n\n## How to Apply\n"],
  ];

  for (const [pattern, replacement] of headerReplacements) {
    text = text.replace(pattern, replacement);
  }

  // 2. Clean internal list connectors so they become neat bullet items, NOT standalone header cards
  text = text
    .replace(/;\s+and\s+\((?:[a-g]|\d+)\)\s+/gi, ";\n• ")
    .replace(/;\s+\((?:[a-g]|\d+)\)\s+/gi, ";\n• ")
    .replace(/\s+\(([a-g])\)\s+/g, "\n• ")
    .replace(/\s+(OR\s+(?:Leading|Include|Training|You have|education|Specialized|a combination))/gi, "\n\n**Alternative Qualifying Pathway:**\n• $1")
    .replace(/\s+([A-D]\))\s+/g, "\n• **Option $1** ")
    .replace(/\s+(GS-\d+:)\s+/g, "\n\n**$1** ")
    .replace(/\s+(In addition to meeting the basic requirement[^:]*:)\s+/gi, "\n\n$1\n\n")
    .replace(/\s+(You may qualify if you meet one of the following:)\s+/gi, "\n\n$1\n\n");

  return text;
}

export const RichJobDescription: React.FC<RichJobDescriptionProps> = ({
  description,
  companyName,
  countryCode,
  applyUrl,
}) => {
  const sections = React.useMemo(() => {
    const preprocessed = preprocessDescriptionText(description || "");
    const cleanMarkdown = cleanHtmlToMarkdown(preprocessed);
    const rawLines = cleanMarkdown.split("\n");
    const parsedSections: { title: string; type: string; content: string[] }[] = [];
    let currentTitle = "About the Role";
    let currentType = "about";
    let currentLines: string[] = [];

    const getSectionType = (title: string) => {
      const t = title.toLowerCase();
      if (
        t.includes("responsibilit") ||
        t.includes("what you'll do") ||
        t.includes("what you will do") ||
        t.includes("duties") ||
        t.includes("the role") ||
        t.includes("play a key role")
      ) {
        return "responsibilities";
      }
      if (
        t.includes("requirement") ||
        t.includes("qualification") ||
        t.includes("what you'll bring") ||
        t.includes("what you will bring") ||
        t.includes("looking for") ||
        t.includes("who you are") ||
        t.includes("skills") ||
        t.includes("love to hear from you") ||
        t.includes("experience") ||
        t.includes("eligib")
      ) {
        return "requirements";
      }
      if (
        t.includes("visa") ||
        t.includes("sponsor") ||
        t.includes("international") ||
        t.includes("immigration") ||
        t.includes("relocation") ||
        t.includes("transparency") ||
        t.includes("guidance")
      ) {
        return "visa";
      }
      if (
        t.includes("benefit") ||
        t.includes("compensation") ||
        t.includes("salary") ||
        t.includes("perks") ||
        t.includes("offer") ||
        t.includes("support full-time")
      ) {
        return "benefits";
      }
      if (t.includes("apply") || t.includes("how to") || t.includes("process") || t.includes("guidelines")) {
        return "apply";
      }
      if (
        t.includes("about") ||
        t.includes("overview") ||
        t.includes("who we are") ||
        t.includes("team") ||
        t.includes("summary")
      ) {
        return "about";
      }
      return "general";
    };

    for (const line of rawLines) {
      let trimmed = line.trim();
      if (trimmed.startsWith("# ") || trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
        const candidateTitle = cleanSectionTitle(trimmed.replace(/^#+\s+/, ""));

        // If title is valid and not a rejected connector word
        if (candidateTitle && !INVALID_TITLES.has(candidateTitle.toLowerCase())) {
          if (currentLines.length > 0) {
            parsedSections.push({
              title: currentTitle,
              type: currentType,
              content: currentLines,
            });
          }
          currentTitle = candidateTitle;
          currentType = getSectionType(currentTitle);
          currentLines = [];
        } else {
          // If candidate title was "OR" or invalid, treat as content line
          currentLines.push(trimmed.replace(/^#+\s+/, ""));
        }
      } else if (trimmed) {
        // Split extra-long monolithic sentences into readable paragraph segments
        if (trimmed.length > 280 && !trimmed.startsWith("•") && !trimmed.startsWith("-") && !trimmed.startsWith("*")) {
          const sentences = trimmed.split(/(?<=[.!?])\s+(?=[A-Z0-9])/);
          let chunk = "";
          for (const s of sentences) {
            if ((chunk + " " + s).length > 220) {
              if (chunk) currentLines.push(chunk.trim());
              chunk = s;
            } else {
              chunk = chunk ? chunk + " " + s : s;
            }
          }
          if (chunk) currentLines.push(chunk.trim());
        } else {
          currentLines.push(trimmed);
        }
      }
    }

    if (currentLines.length > 0) {
      parsedSections.push({
        title: currentTitle,
        type: currentType,
        content: currentLines,
      });
    }

    return parsedSections;
  }, [description]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {sections.map((section, sIdx) => {
        const titleText = section.title;

        // ═════════════════════════════════════════════════════════════════════
        // 1. RESPONSIBILITIES SECTION
        // ═════════════════════════════════════════════════════════════════════
        if (section.type === "responsibilities") {
          return (
            <div
              key={sIdx}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{titleText}</h2>
                  <p className="text-xs text-slate-500">Core duties and day-to-day expectations</p>
                </div>
              </div>
              <div className="space-y-3.5">
                {section.content.map((line, lIdx) => {
                  const parsed = parseContentLine(line);
                  if (!parsed) return null;

                  return parsed.isBullet ? (
                    <div
                      key={lIdx}
                      className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-50/80 transition-colors text-sm text-slate-700 leading-relaxed"
                    >
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100/70 text-brand-700 font-bold">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{formatInlineText(parsed.text)}</span>
                    </div>
                  ) : (
                    <p key={lIdx} className="text-sm text-slate-700 leading-relaxed pl-1">
                      {formatInlineText(parsed.text)}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        }

        // ═════════════════════════════════════════════════════════════════════
        // 2. REQUIREMENTS & QUALIFICATIONS SECTION
        // ═════════════════════════════════════════════════════════════════════
        if (section.type === "requirements") {
          return (
            <div
              key={sIdx}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{titleText}</h2>
                  <p className="text-xs text-slate-500">Required background, technical criteria, & education</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm text-slate-700">
                {section.content.map((line, lIdx) => {
                  const parsed = parseContentLine(line);
                  if (!parsed) return null;

                  if (parsed.isSubheading) {
                    return (
                      <div
                        key={lIdx}
                        className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700"
                      >
                        <GraduationCap className="w-4 h-4 text-indigo-500" />
                        <span>{formatInlineText(parsed.text)}</span>
                      </div>
                    );
                  }

                  return parsed.isBullet ? (
                    <div
                      key={lIdx}
                      className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-slate-50/80 transition-colors"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-500 shadow-xs" />
                      <span className="leading-relaxed">{formatInlineText(parsed.text)}</span>
                    </div>
                  ) : (
                    <p key={lIdx} className="leading-relaxed pl-1">
                      {formatInlineText(parsed.text)}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        }

        // ═════════════════════════════════════════════════════════════════════
        // 3. VISA SPONSORSHIP SECTION (HERO HIGHLIGHT BOX)
        // ═════════════════════════════════════════════════════════════════════
        if (section.type === "visa") {
          return (
            <div
              key={sIdx}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-white border border-emerald-500/30 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-sm">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wider uppercase border border-emerald-400/30 mb-1">
                    Verified Global Mobility
                  </span>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">{titleText}</h2>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-200 leading-relaxed">
                {section.content.map((line, lIdx) => {
                  const parsed = parseContentLine(line);
                  if (!parsed) return null;
                  return (
                    <p key={lIdx} className="whitespace-pre-line">
                      {formatInlineText(parsed.text)}
                    </p>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-300/90">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Eligible for Work Authorization / CoS</span>
                </div>
                <div className="font-semibold text-white">
                  Employer Status: <span className="text-emerald-400">Licensed Visa Sponsor</span>
                </div>
              </div>
            </div>
          );
        }

        // ═════════════════════════════════════════════════════════════════════
        // 4. COMPENSATION & BENEFITS SECTION
        // ═════════════════════════════════════════════════════════════════════
        if (section.type === "benefits") {
          return (
            <div
              key={sIdx}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{titleText}</h2>
                  <p className="text-xs text-slate-500">Perks, wellness, compensation, & growth</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.content.map((line, lIdx) => {
                  const parsed = parseContentLine(line);
                  if (!parsed) return null;
                  return (
                    <div
                      key={lIdx}
                      className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start gap-3 text-sm text-slate-700 hover:bg-amber-50/30 transition-colors"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      <span>{formatInlineText(parsed.text)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }

        // ═════════════════════════════════════════════════════════════════════
        // 5. ABOUT THE ROLE & OVERVIEW SECTION
        // ═════════════════════════════════════════════════════════════════════
        return (
          <div
            key={sIdx}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs">
                {section.type === "apply" ? <Send className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{titleText}</h2>
                <p className="text-xs text-slate-500">Role context & organizational scope</p>
              </div>
            </div>
            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              {section.content.map((line, lIdx) => {
                const parsed = parseContentLine(line);
                if (!parsed) return null;

                return parsed.isBullet ? (
                  <div key={lIdx} className="flex items-start gap-3 pl-1">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    <span className="leading-relaxed">{formatInlineText(parsed.text)}</span>
                  </div>
                ) : (
                  <p key={lIdx} className="whitespace-pre-line leading-relaxed">
                    {formatInlineText(parsed.text)}
                  </p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
