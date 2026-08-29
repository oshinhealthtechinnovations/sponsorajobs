"use client";

import React, { useMemo, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Award,
  Globe2,
  Gift,
  Send,
  Building2,
  GraduationCap,
  Sparkles,
  Info,
  Check,
  MapPin,
  Banknote,
  ShieldAlert,
  Layers,
  ChevronRight,
  Code2,
  FileCheck2,
  HelpCircle,
} from "lucide-react";
import { cleanHtmlToMarkdown, decodeHtmlEntities } from "@/normalization";

interface RichJobDescriptionProps {
  description: string;
  companyName: string;
  countryCode: string;
  applyUrl: string;
}

export interface ParsedSection {
  id: string;
  title: string;
  type: "overview" | "responsibilities" | "requirements" | "education" | "visa" | "benefits" | "apply" | "general";
  lines: string[];
  bulletItems?: string[];
  subClauses?: { prefix: string; text: string }[];
}

/**
 * Strips artificial crawler artifacts, broken fragments, and duplicate headers
 */
function sanitizeJobDescription(raw: string): string {
  if (!raw) return "";

  let text = decodeHtmlEntities(raw);

  // 1. Remove artificial crawler metadata injections
  text = text
    .replace(/##\s*How to Apply\s*\n+Click\s+["“]Apply for this Job["”][^\n]*/gi, "")
    .replace(/Click\s+["“]Apply for this Job["”]\s+to visit the original job posting[^\n]*/gi, "")
    .replace(/This listing has been identified as containing visa sponsorship language\.?/gi, "")
    .replace(/•\s*\*+How to Apply\*+:\s*Click\s+["“]Apply for this Job["”][^\n]*/gi, "");

  // 2. Remove duplicate raw header meta fields that mirror top header
  text = text
    .replace(/##\s*Role Overview\s*\n+(?:\*\*|\*|•)*\s*(?:Company|Location|Salary):[^\n]*\n+/gi, "")
    .replace(/^[•\-\*]*\s*\*+(?:Company|Location|Salary)\*+:[^\n]*$/gim, "")
    .replace(/^(?:\*\*|\*)*(?:Company|Location|Salary):[^\n]*$/gim, "");

  // 3. Clean broken leading truncation fragments
  text = text
    .replace(/^\s*\.{2,}[^\n]*will not be considered\.?\s*/gim, "")
    .replace(/^\s*\.{2,}[^\n]*career portal\.?\s*/gim, "")
    .replace(/^\s*\.{2,}[^\n]*MY DOCUMENTS[^\n]*\s*/gim, "");

  // 4. Normalize line breaks and separators
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\*{4,}/g, "**");

  return text.trim();
}

/**
 * Inline text formatter for bold/italic/highlights
 */
function formatInline(text: string): React.ReactNode {
  if (!text) return null;
  const decoded = decodeHtmlEntities(text);

  const clean = decoded
    .replace(/^>\s*/, "")
    .replace(/\*{4,}/g, "**")
    .trim();

  const parts = clean.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const inner = part.slice(2, -2).trim();
      return (
        <strong key={i} className="font-bold text-slate-900">
          {inner}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      const inner = part.slice(1, -1).trim();
      return (
        <em key={i} className="font-semibold text-slate-800 not-italic">
          {inner}
        </em>
      );
    }
    return part;
  });
}

/**
 * Intelligent section identifier from natural plain text lines
 */
function identifySectionHeader(line: string): { isHeader: boolean; title: string; type: ParsedSection["type"] } | null {
  const trimmed = line.trim().replace(/^#+\s*/, "").replace(/^[*_•\-]+\s*/, "").trim();
  const lower = trimmed.toLowerCase();

  // Explicit Markdown Headings
  if (line.startsWith("## ") || line.startsWith("### ") || line.startsWith("#### ")) {
    const title = line.replace(/^#+\s+/, "").replace(/[*_#`:]+/g, " ").trim();
    return { isHeader: true, title, type: classifySectionType(title) };
  }

  // Common Header Patterns without Markdown #
  const patterns: { regex: RegExp; title: string; type: ParsedSection["type"] }[] = [
    { regex: /^(the\s+)?primary\s+purpose\s+of\s+this\s+position\s+is:?$/i, title: "Role Purpose & Overview", type: "overview" },
    { regex: /^(about\s+the\s+role|role\s+overview|job\s+summary|position\s+summary|overview|who\s+we\s+are):?$/i, title: "Role Overview", type: "overview" },
    { regex: /^(duties|responsibilities|key\s+responsibilities|what\s+you('ll|\s+will)\s+do|your\s+role|day-to-day):?$/i, title: "Key Responsibilities", type: "responsibilities" },
    { regex: /^(requirements|qualifications|basic\s+requirements|what\s+you\s+bring|skills\s+required|minimum\s+qualifications|specialized\s+experience):?$/i, title: "Qualifications & Requirements", type: "requirements" },
    { regex: /^(in\s+order\s+to\s+qualify[,\s].*)/i, title: "Eligibility & Qualification Standards", type: "requirements" },
    { regex: /^(education\s+requirements?|degree\s+requirements?|academic\s+background):?$/i, title: "Education & Academic Criteria", type: "education" },
    { regex: /^(visa\s+sponsorship|work\s+authorization|immigration\s+support|right\s+to\s+work|relocation):?$/i, title: "Visa Sponsorship & Work Authorization", type: "visa" },
    { regex: /^(benefits|compensation|what\s+we\s+offer|perks\s+(&|and)\s+benefits|salary\s+(&|and)\s+benefits):?$/i, title: "Compensation & Benefits", type: "benefits" },
    { regex: /^(how\s+to\s+apply|how\s+you\s+will\s+be\s+evaluated|application\s+process):?$/i, title: "How You Will Be Evaluated", type: "apply" },
    { regex: /^(conditions\s+of\s+employment|additional\s+information|other\s+information):?$/i, title: "Conditions of Employment", type: "general" },
  ];

  for (const p of patterns) {
    if (p.regex.test(trimmed) || (trimmed.endsWith(":") && p.regex.test(trimmed.slice(0, -1)))) {
      return { isHeader: true, title: p.title, type: p.type };
    }
  }

  // Short all-caps headings like "BASIC REQUIREMENTS:" or "QUALIFICATIONS:"
  if (/^[A-Z\s&/–—]{3,30}:?$/.test(trimmed) && trimmed.length >= 4 && !trimmed.includes(".")) {
    const formattedTitle = trimmed.replace(/:$/, "").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    return { isHeader: true, title: formattedTitle, type: classifySectionType(trimmed) };
  }

  return null;
}

function classifySectionType(title: string): ParsedSection["type"] {
  const t = title.toLowerCase();
  if (t.includes("responsibilit") || t.includes("what you'll do") || t.includes("duties") || t.includes("day-to-day")) return "responsibilities";
  if (t.includes("requirement") || t.includes("qualification") || t.includes("what you bring") || t.includes("skills") || t.includes("eligib") || t.includes("experience")) return "requirements";
  if (t.includes("education") || t.includes("degree") || t.includes("academic") || t.includes("abet")) return "education";
  if (t.includes("visa") || t.includes("sponsor") || t.includes("immigration") || t.includes("relocation") || t.includes("work authorization")) return "visa";
  if (t.includes("benefit") || t.includes("compensation") || t.includes("perks") || t.includes("offer") || t.includes("salary")) return "benefits";
  if (t.includes("apply") || t.includes("how to") || t.includes("evaluated") || t.includes("process")) return "apply";
  if (t.includes("about") || t.includes("overview") || t.includes("purpose") || t.includes("summary") || t.includes("who we are")) return "overview";
  return "general";
}

/**
 * Formats dense text paragraphs into structured sentences, subclauses (a, b, c), and checklists
 */
function processSectionText(rawText: string): { paragraphs: string[]; subClauses: { prefix: string; text: string }[] } {
  const paragraphs: string[] = [];
  const subClauses: { prefix: string; text: string }[] = [];

  // Check for inline sublists like (a) statics... (b) strength... OR 1. ... 2. ...
  const clauseMatches = rawText.match(/(?:\(([a-z0-9])\)|\b(\d+)\.)\s+([^;(]+(?:;|\.(?=\s+(?:\([a-z0-9]\)|\d+\.))|$))/gi);

  if (clauseMatches && clauseMatches.length >= 2) {
    // Extract base lead-in text before the clauses
    const firstClauseIdx = rawText.search(/(?:\([a-z0-9]\)|\b\d+\.)\s+/i);
    if (firstClauseIdx > 0) {
      paragraphs.push(rawText.slice(0, firstClauseIdx).trim());
    }

    clauseMatches.forEach((m) => {
      const clean = m.replace(/^;\s*/, "").replace(/;\s*$/, "").trim();
      const prefixMatch = clean.match(/^(\([a-z0-9]\)|\d+\.)/i);
      const prefix = prefixMatch ? prefixMatch[1] : "•";
      const content = clean.replace(/^(\([a-z0-9]\)|\d+\.)\s*/i, "").replace(/^(and|or)\s+/i, "");
      if (content.trim()) {
        subClauses.push({ prefix, text: content.trim() });
      }
    });
  } else {
    // Break on explicit OR branches or major sentence boundaries if very long
    const orSegments = rawText.split(/\s+(?:OR\s+|--\s+OR\s+)\b/);
    if (orSegments.length > 1) {
      paragraphs.push(orSegments[0].trim());
      for (let i = 1; i < orSegments.length; i++) {
        subClauses.push({ prefix: `Option ${i + 1}`, text: orSegments[i].trim() });
      }
    } else {
      paragraphs.push(rawText.trim());
    }
  }

  return { paragraphs, subClauses };
}

/**
 * Preprocesses unformatted continuous text blocks by injecting section breaks at natural linguistic boundaries
 */
function preprocessRawDescription(raw: string): string {
  let text = sanitizeJobDescription(raw || "");

  // Insert markdown headers before common inline federal / scraped section lead-ins
  text = text
    .replace(/(?:^|\.\s+|\n+)(The\s+primary\s+purpose\s+of\s+this\s+position\s+is:?)/gi, "\n\n## Role Purpose & Overview\n$1")
    .replace(/(?:^|\.\s+|\n+)(In\s+order\s+to\s+qualify[,\s]+you\s+must\s+meet[^\n:]*:?)/gi, "\n\n## Eligibility & Qualification Standards\n$1")
    .replace(/(?:,\s*|\.\s*|\n+)?(0800\s+Basic\s+Requirements?:?|Basic\s+Requirements?:?)/gi, "\n\n## Basic Requirements & Qualifications\n")
    .replace(/(?:^|\.\s+|\n+)(Major\s+Duties|Duties\s+and\s+Responsibilities|Key\s+Responsibilities):?/gi, "\n\n## Key Responsibilities\n")
    .replace(/(?:^|\.\s+|\n+)(Conditions\s+of\s+Employment|Eligibilities\s+being\s+considered):?/gi, "\n\n## Conditions of Employment\n")
    .replace(/(?:^|\.\s+|\n+)(How\s+You\s+Will\s+Be\s+Evaluated|How\s+to\s+Apply):?/gi, "\n\n## How You Will Be Evaluated\n")
    .replace(/(?:^|\.\s+|\n+)(Benefits\s+and\s+Other\s+Info|Benefits):?/gi, "\n\n## Compensation & Benefits\n");

  return text;
}

export const RichJobDescription: React.FC<RichJobDescriptionProps> = ({
  description,
  companyName,
  countryCode,
  applyUrl,
}) => {
  const [activeTab, setActiveTab] = useState<string>("all");

  const { sections, detectedSkills } = useMemo(() => {
    const preprocessed = preprocessRawDescription(description || "");
    const cleanMarkdown = cleanHtmlToMarkdown(preprocessed);
    const rawLines = cleanMarkdown.split("\n");

    const parsed: ParsedSection[] = [];
    let currentTitle = "About the Role";
    let currentType: ParsedSection["type"] = "overview";
    let currentLines: string[] = [];

    const flushSection = () => {
      const validLines = currentLines.filter((l) => l.trim().length > 0);
      if (validLines.length > 0) {
        const fullBlock = validLines.join("\n");
        const { paragraphs, subClauses } = processSectionText(fullBlock);
        parsed.push({
          id: `sec_${parsed.length}_${currentType}`,
          title: currentTitle,
          type: currentType,
          lines: paragraphs,
          subClauses: subClauses.length > 0 ? subClauses : undefined,
        });
      }
      currentLines = [];
    };

    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      if (!line) continue;

      const headerInfo = identifySectionHeader(line);
      if (headerInfo) {
        flushSection();
        currentTitle = headerInfo.title;
        currentType = headerInfo.type;
        continue;
      }

      // Check for inline split triggers like "In order to qualify..." or "Basic Requirements:"
      if (/In order to qualify,\s+you must meet/i.test(line) && currentLines.length > 0) {
        const parts = line.split(/(?=In order to qualify,\s+you must meet)/i);
        currentLines.push(parts[0].trim());
        flushSection();
        currentTitle = "Eligibility & Qualifications";
        currentType = "requirements";
        if (parts[1]) currentLines.push(parts[1].trim());
        continue;
      }

      currentLines.push(line);
    }

    flushSection();

    // Fallback if empty
    if (parsed.length === 0 && description) {
      const { paragraphs, subClauses } = processSectionText(description);
      parsed.push({
        id: "sec_fallback",
        title: "About the Role",
        type: "overview",
        lines: paragraphs,
        subClauses,
      });
    }

    // Extract key skills & tech tags
    const skillList = [
      "Civil Engineer", "Civil Engineering", "Mechanical Engineer", "Electrical Engineer", "Engineering", "ABET", "CAD", "AutoCAD", "Civil 3D",
      "Python", "TypeScript", "JavaScript", "React", "Node.js", "AWS", "Docker", "Kubernetes", "SQL",
      "Calculus", "Physics", "Thermodynamics", "Statics", "Fluid Mechanics", "Project Management",
      "Security Clearance", "H-1B", "Skilled Worker", "Direct Hire"
    ];
    const detected = skillList.filter((s) => new RegExp(`\\b${s}\\b`, "i").test(description));

    return { sections: parsed, detectedSkills: detected };
  }, [description]);

  const visibleSections = activeTab === "all" ? sections : sections.filter((s) => s.id === activeTab || s.type === activeTab);

  const getSectionIcon = (type: ParsedSection["type"]) => {
    switch (type) {
      case "overview":
        return <Briefcase className="w-4 h-4 text-sky-600" />;
      case "responsibilities":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "requirements":
        return <Award className="w-4 h-4 text-indigo-600" />;
      case "education":
        return <GraduationCap className="w-4 h-4 text-amber-600" />;
      case "visa":
        return <Globe2 className="w-4 h-4 text-emerald-600" />;
      case "benefits":
        return <Gift className="w-4 h-4 text-purple-600" />;
      case "apply":
        return <Send className="w-4 h-4 text-rose-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
      {/* ── Top Header Banner with Skills Tag Cloud ── */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/90 to-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#071421] text-[#18D6E5] flex items-center justify-center shadow-sm shrink-0 border border-slate-800">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
                Structured Job Specification
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official role breakdown, eligibility criteria, and core responsibilities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Listing</span>
            </span>
          </div>
        </div>

        {/* Extracted Key Competencies Tags */}
        {detectedSkills.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-500" />
              <span>Key Competencies:</span>
            </span>
            {detectedSkills.slice(0, 8).map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200/80 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Section Jump Quick Filter Bar */}
        {sections.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#071421] text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              All Sections ({sections.length})
            </button>
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === sec.id
                    ? "bg-[#071421] text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {getSectionIcon(sec.type)}
                <span>{sec.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Structured Sections Content ── */}
      <div className="p-6 sm:p-8 space-y-8">
        {visibleSections.map((section, sIdx) => {
          // Special Visa Section Styling
          if (section.type === "visa") {
            return (
              <div
                key={section.id}
                className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white border border-emerald-200/90 text-emerald-950 space-y-4 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                    <Globe2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-emerald-950 tracking-tight">
                      {section.title}
                    </h3>
                    <span className="text-xs font-semibold text-emerald-700">
                      Work authorization and international sponsorship policy
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-emerald-950 leading-relaxed">
                  {section.lines.map((line, lIdx) => (
                    <p key={lIdx} className="leading-relaxed font-medium">
                      {formatInline(line)}
                    </p>
                  ))}
                </div>

                {section.subClauses && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {section.subClauses.map((clause, cIdx) => (
                      <div key={cIdx} className="p-3 rounded-xl bg-white/90 border border-emerald-200/80 flex items-start gap-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase shrink-0">
                          {clause.prefix}
                        </span>
                        <span className="text-xs text-emerald-900 font-semibold leading-relaxed">
                          {formatInline(clause.text)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={section.id} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {getSectionIcon(section.type)}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight font-display">
                    {section.title}
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/60">
                  {section.type}
                </span>
              </div>

              {/* Lead-in Paragraphs */}
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                {section.lines.map((line, lIdx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;

                  const isBullet = /^(?:[•\-\*]\s+|\d+\.\s+)/.test(trimmed);
                  const cleanText = trimmed.replace(/^(?:[•\-\*]\s+|\d+\.\s+)/, "");

                  if (isBullet) {
                    return (
                      <div key={lIdx} className="flex items-start gap-3 pl-1 py-0.5">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#18D6E5]" />
                        <span className="leading-relaxed font-medium text-slate-800">{formatInline(cleanText)}</span>
                      </div>
                    );
                  }

                  return (
                    <p key={lIdx} className="leading-relaxed text-slate-700">
                      {formatInline(trimmed)}
                    </p>
                  );
                })}
              </div>

              {/* Sub-clauses / Alphanumeric Criteria Cards (a, b, c, 1, 2, 3) */}
              {section.subClauses && section.subClauses.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Specified Requirements & Criteria:
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {section.subClauses.map((clause, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3.5 rounded-2xl bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200/80 flex items-start gap-3 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-800 flex items-center justify-center font-black text-xs shrink-0 shadow-xs mt-0.5">
                          {clause.prefix.replace(/[()]/g, "")}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed flex-1">
                          {formatInline(clause.text)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
