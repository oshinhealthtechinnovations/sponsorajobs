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
} from "lucide-react";

import { cleanHtmlToMarkdown, decodeHtmlEntities } from "@/normalization";

interface RichJobDescriptionProps {
  description: string;
  companyName: string;
  countryCode: string;
  applyUrl: string;
}

// Helper to clean section titles of any markdown noise like ** or ## or trailing colons
function cleanSectionTitle(rawTitle: string): string {
  if (!rawTitle) return "Overview";
  return rawTitle.replace(/^[\s*#_`:]+|[\s*#_`:]+$/g, "").trim() || "Overview";
}

// Helper to format inline markdown like **bold**, *italic*, and strip leftover markdown artifacts
function formatInlineText(text: string): React.ReactNode {
  if (!text) return null;
  const decoded = decodeHtmlEntities(text);
  // Clean up any remaining isolated markdown noise inside text
  const clean = decoded
    .replace(/\*{3,}/g, "**")
    .replace(/\*\*\s*\*\*/g, "");

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
        <em key={i} className="italic text-slate-800">
          {inner}
        </em>
      );
    }
    return part;
  });
}

// Helper to parse each line inside a section into either a bullet item or a paragraph
function parseContentLine(rawLine: string): { isBullet: boolean; text: string } | null {
  if (!rawLine) return null;
  const trimmed = rawLine.trim();
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

  // Bullet matches: "• ", "- ", "* " (with trailing space), or "1. "
  const bulletMatch = trimmed.match(/^(?:[•*]\s+|\-\s+|\d+\.\s+)(.*)$/);
  if (bulletMatch) {
    const bulletContent = bulletMatch[1].trim();
    if (!bulletContent || /^[•\-\*]*\s*[-*_—–\s]{2,}$/.test(bulletContent)) return null;
    return { isBullet: true, text: bulletContent };
  }

  return { isBullet: false, text: trimmed };
}

export const RichJobDescription: React.FC<RichJobDescriptionProps> = ({
  description,
  companyName,
  countryCode,
  applyUrl,
}) => {
  // Parse markdown-style sections (## Section Title) with robust HTML decoding & cleaning
  const sections = React.useMemo(() => {
    const cleanMarkdown = cleanHtmlToMarkdown(description || "");
    const rawLines = cleanMarkdown.split("\n");
    const parsedSections: { title: string; type: string; content: string[] }[] = [];
    let currentTitle = "Overview";
    let currentType = "overview";
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
        t.includes("experience")
      ) {
        return "requirements";
      }
      if (
        t.includes("visa") ||
        t.includes("sponsor") ||
        t.includes("international") ||
        t.includes("immigration") ||
        t.includes("relocation")
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
      if (t.includes("about") || t.includes("overview") || t.includes("who we are") || t.includes("team")) {
        return "about";
      }
      return "general";
    };

    for (const line of rawLines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        if (currentLines.length > 0) {
          parsedSections.push({
            title: cleanSectionTitle(currentTitle),
            type: currentType,
            content: currentLines,
          });
        }
        currentTitle = cleanSectionTitle(trimmed.replace(/^##\s+/, ""));
        currentType = getSectionType(currentTitle);
        currentLines = [];
      } else if (trimmed) {
        currentLines.push(trimmed);
      }
    }

    if (currentLines.length > 0) {
      parsedSections.push({
        title: cleanSectionTitle(currentTitle),
        type: currentType,
        content: currentLines,
      });
    }

    return parsedSections;
  }, [description]);

  return (
    <div className="space-y-8">
      {sections.map((section, sIdx) => {
        const titleText = cleanSectionTitle(section.title);

        // 1. RESPONSIBILITIES SECTION
        if (section.type === "responsibilities") {
          return (
            <div key={sIdx} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{titleText}</h2>
              </div>
              <div className="space-y-3">
                {section.content.map((line, lIdx) => {
                  const parsed = parseContentLine(line);
                  if (!parsed) return null;

                  return parsed.isBullet ? (
                    <div key={lIdx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{formatInlineText(parsed.text)}</span>
                    </div>
                  ) : (
                    <p key={lIdx} className="text-sm text-slate-700 leading-relaxed">
                      {formatInlineText(parsed.text)}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        }

        // 2. REQUIREMENTS SECTION
        if (section.type === "requirements") {
          return (
            <div key={sIdx} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{titleText}</h2>
              </div>
              <div className="space-y-4 text-sm text-slate-700">
                {section.content.map((line, lIdx) => {
                  const isEssential = line.toLowerCase().includes("**essential**") || line.toLowerCase() === "essential";
                  const isDesirable = line.toLowerCase().includes("**desirable**") || line.toLowerCase() === "desirable";

                  if (isEssential) {
                    return (
                      <div key={lIdx} className="inline-block px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold uppercase tracking-wider mt-2">
                        Essential Criteria
                      </div>
                    );
                  }

                  if (isDesirable) {
                    return (
                      <div key={lIdx} className="inline-block px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider mt-4">
                        Desirable / Advantageous
                      </div>
                    );
                  }

                  const parsed = parseContentLine(line);
                  if (!parsed) return null;

                  return parsed.isBullet ? (
                    <div key={lIdx} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                      <span className="leading-relaxed">{formatInlineText(parsed.text)}</span>
                    </div>
                  ) : (
                    <p key={lIdx} className="leading-relaxed">{formatInlineText(parsed.text)}</p>
                  );
                })}
              </div>
            </div>
          );
        }

        // 3. VISA SPONSORSHIP SECTION (HERO HIGHLIGHT BOX)
        if (section.type === "visa") {
          return (
            <div
              key={sIdx}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-brand-950 text-white border border-emerald-500/30 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold tracking-wider uppercase border border-emerald-400/30 mb-1">
                    Verified Relocation & Sponsorship
                  </span>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">{titleText}</h2>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-200 leading-relaxed">
                {section.content.map((line, lIdx) => {
                  const parsed = parseContentLine(line);
                  if (!parsed) return null;
                  return (
                    <p key={lIdx} className="whitespace-pre-line">{formatInlineText(parsed.text)}</p>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-300/90">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Eligible for Certificate of Sponsorship / Work Authorization</span>
                </div>
                <div className="font-semibold text-white">
                  Employer Sponsor Status: <span className="text-emerald-400">Accredited / Licensed</span>
                </div>
              </div>
            </div>
          );
        }

        // 4. COMPENSATION & BENEFITS SECTION
        if (section.type === "benefits") {
          return (
            <div key={sIdx} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
                  <Gift className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{titleText}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.content.map((line, lIdx) => {
                  const parsed = parseContentLine(line);
                  if (!parsed) return null;
                  return (
                    <div
                      key={lIdx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 text-sm text-slate-700"
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

        // 5. HOW TO APPLY & GENERAL / OVERVIEW SECTION
        return (
          <div key={sIdx} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                {section.type === "apply" ? <Send className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{titleText}</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
              {section.content.map((line, lIdx) => {
                const parsed = parseContentLine(line);
                if (!parsed) return null;

                return parsed.isBullet ? (
                  <div key={lIdx} className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
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
