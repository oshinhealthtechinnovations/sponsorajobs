"use client";

import React, { useMemo } from "react";
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
} from "lucide-react";
import { cleanHtmlToMarkdown, decodeHtmlEntities } from "@/normalization";

interface RichJobDescriptionProps {
  description: string;
  companyName: string;
  countryCode: string;
  applyUrl: string;
}

interface ParsedSection {
  title: string;
  type: "overview" | "responsibilities" | "requirements" | "visa" | "benefits" | "apply" | "general";
  lines: string[];
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

  // 3. Clean broken leading truncation fragments like "...(mail, fax... will not be considered."
  text = text
    .replace(/^\s*\.{2,}[^\n]*will not be considered\.?\s*/gim, "")
    .replace(/^\s*\.{2,}[^\n]*career portal\.?\s*/gim, "")
    .replace(/^\s*\.{2,}[^\n]*MY DOCUMENTS[^\n]*\s*/gim, "");

  // 4. Clean stray asterisks, formatting artifacts, and carriage returns
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\*{4,}/g, "**")
    .replace(/•\s*\*+([a-zA-Z0-9\s/&–—]+)\*+:/g, "**$1:**");

  return text.trim();
}

/**
 * Inline text formatter for bold/italic/links
 */
function formatInline(text: string): React.ReactNode {
  if (!text) return null;
  const decoded = decodeHtmlEntities(text);

  // Clean trailing artifacts
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

export const RichJobDescription: React.FC<RichJobDescriptionProps> = ({
  description,
  companyName,
  countryCode,
  applyUrl,
}) => {
  const sections = useMemo(() => {
    const sanitized = sanitizeJobDescription(description || "");
    const cleanMarkdown = cleanHtmlToMarkdown(sanitized);
    const rawLines = cleanMarkdown.split("\n");

    const result: ParsedSection[] = [];
    let currentTitle = "About the Role";
    let currentType: ParsedSection["type"] = "overview";
    let currentLines: string[] = [];

    const detectSectionType = (title: string): ParsedSection["type"] => {
      const t = title.toLowerCase();
      if (t.includes("responsibilit") || t.includes("what you'll do") || t.includes("duties") || t.includes("day-to-day")) {
        return "responsibilities";
      }
      if (t.includes("requirement") || t.includes("qualification") || t.includes("what you bring") || t.includes("skills") || t.includes("eligib") || t.includes("experience")) {
        return "requirements";
      }
      if (t.includes("visa") || t.includes("sponsor") || t.includes("immigration") || t.includes("relocation")) {
        return "visa";
      }
      if (t.includes("benefit") || t.includes("compensation") || t.includes("perks") || t.includes("offer") || t.includes("salary")) {
        return "benefits";
      }
      if (t.includes("apply") || t.includes("how to") || t.includes("process")) {
        return "apply";
      }
      if (t.includes("about") || t.includes("overview") || t.includes("who we are") || t.includes("team") || t.includes("company")) {
        return "overview";
      }
      return "general";
    };

    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      if (!line) {
        if (currentLines.length > 0 && currentLines[currentLines.length - 1] !== "") {
          currentLines.push("");
        }
        continue;
      }

      // Check for markdown headers
      if (line.startsWith("## ") || line.startsWith("### ")) {
        const headerTitle = line.replace(/^#+\s+/, "").replace(/[*_#`:]+/g, " ").trim();
        if (headerTitle && headerTitle.length > 1) {
          if (currentLines.filter((l) => l.trim()).length > 0) {
            result.push({
              title: currentTitle,
              type: currentType,
              lines: currentLines,
            });
          }
          currentTitle = headerTitle;
          currentType = detectSectionType(currentTitle);
          currentLines = [];
          continue;
        }
      }

      // Filter out useless separators
      if (/^[•\-\*]*\s*[-*_—–\s]{2,}$/.test(line) || line === "•" || line === "-") {
        continue;
      }

      currentLines.push(line);
    }

    if (currentLines.filter((l) => l.trim()).length > 0) {
      result.push({
        title: currentTitle,
        type: currentType,
        lines: currentLines,
      });
    }

    // Fallback if no sections were parsed
    if (result.length === 0 && description) {
      result.push({
        title: "About the Role",
        type: "overview",
        lines: [description],
      });
    }

    return result;
  }, [description]);

  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
      {/* Primary Card Top Banner */}
      <div className="p-6 sm:p-8 bg-slate-50/70 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 text-slate-800 flex items-center justify-center shadow-xs shrink-0">
            <Briefcase className="w-5 h-5 text-[#071522]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Job Description</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official vacancy details, requirements, and responsibilities for this role
            </p>
          </div>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="p-6 sm:p-8 space-y-8">
        {sections.map((section, sIdx) => {
          // Special styling for Visa Sponsorship section
          if (section.type === "visa") {
            return (
              <div
                key={sIdx}
                className="p-5 sm:p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-emerald-900 tracking-tight">
                      {section.title}
                    </h3>
                    <span className="text-[11px] font-medium text-emerald-700">
                      Work authorization and international hiring policy
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-emerald-900 leading-relaxed pl-1">
                  {section.lines.map((line, lIdx) => {
                    if (!line.trim()) return null;
                    return (
                      <p key={lIdx} className="leading-relaxed">
                        {formatInline(line)}
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Icon selector based on section type
          const getSectionIcon = (type: ParsedSection["type"]) => {
            switch (type) {
              case "responsibilities":
                return <CheckCircle2 className="w-4 h-4 text-brand-600" />;
              case "requirements":
                return <Award className="w-4 h-4 text-indigo-600" />;
              case "benefits":
                return <Gift className="w-4 h-4 text-amber-600" />;
              case "apply":
                return <Send className="w-4 h-4 text-sky-600" />;
              default:
                return <Info className="w-4 h-4 text-slate-500" />;
            }
          };

          return (
            <div key={sIdx} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                {getSectionIcon(section.type)}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {section.title}
                </h3>
              </div>

              {/* Section Content */}
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                {section.lines.map((line, lIdx) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;

                  // Bullet check
                  const isBullet = /^(?:[•\-\*]\s+|\d+\.\s+)/.test(trimmed);
                  const cleanText = trimmed.replace(/^(?:[•\-\*]\s+|\d+\.\s+)/, "");

                  if (isBullet) {
                    return (
                      <div key={lIdx} className="flex items-start gap-3 pl-1">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#19CBE0]" />
                        <span className="leading-relaxed">{formatInline(cleanText)}</span>
                      </div>
                    );
                  }

                  return (
                    <p key={lIdx} className="leading-relaxed">
                      {formatInline(trimmed)}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
