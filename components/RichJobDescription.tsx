"use client";

import React, { useMemo } from "react";
import {
  Briefcase,
  CheckCircle2,
  Award,
  Globe2,
  Gift,
  Send,
  FileCheck2,
  Sparkles,
  Info,
  GraduationCap,
  ShieldCheck,
  Check,
} from "lucide-react";
import { cleanHtmlToMarkdown, decodeHtmlEntities } from "@/normalization";

interface RichJobDescriptionProps {
  description: string;
  companyName: string;
  countryCode: string;
  applyUrl: string;
}

export interface FormattedSection {
  id: string;
  title: string;
  type: "overview" | "responsibilities" | "requirements" | "education" | "visa" | "benefits" | "apply" | "general";
  paragraphs: string[];
  bulletPoints?: string[];
}

/**
 * Aggressively scrubs scraper artifacts, crawler buttons, and boilerplate noise
 */
function sanitizeJobDescription(raw: string): string {
  if (!raw) return "";

  let text = decodeHtmlEntities(raw);

  // 1. Scrub crawler / feed specific action button boilerplate
  text = text
    .replace(/Click\s+on\s+["“']?Learn\s+more\s+about\s+this\s+agency["”']?\s+button\s+below[^\n.]*\.?/gi, "")
    .replace(/to\s+view\s+Eligibilities\s+being\s+considered\s+and\s+other\s+IMPORTANT\s+information\.?/gi, "")
    .replace(/##\s*How to Apply\s*\n+Click\s+["“]Apply for this Job["”][^\n]*/gi, "")
    .replace(/Click\s+["“]Apply for this Job["”]\s+to visit the original job posting[^\n]*/gi, "")
    .replace(/This listing has been identified as containing visa sponsorship language\.?/gi, "")
    .replace(/•\s*\*+How to Apply\*+:\s*Click\s+["“]Apply for this Job["”][^\n]*/gi, "");

  // 2. Remove duplicate header meta fields
  text = text
    .replace(/##\s*Role Overview\s*\n+(?:\*\*|\*|•)*\s*(?:Company|Location|Salary):[^\n]*\n+/gi, "")
    .replace(/^[•\-\*]*\s*\*+(?:Company|Location|Salary)\*+:[^\n]*$/gim, "")
    .replace(/^(?:\*\*|\*)*(?:Company|Location|Salary):[^\n]*$/gim, "");

  // 3. Clean broken leading/trailing artifacts
  text = text
    .replace(/^\s*\.{2,}[^\n]*will not be considered\.?\s*/gim, "")
    .replace(/^\s*\.{2,}[^\n]*career portal\.?\s*/gim, "")
    .replace(/^\s*\.{2,}[^\n]*MY DOCUMENTS[^\n]*\s*/gim, "")
    .replace(/\bPART-TIME\s*$/gi, "")
    .replace(/\bFULL-TIME\s*$/gi, "");

  // 4. Normalize line breaks and formatting
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\*{4,}/g, "**")
    .trim();

  return text;
}

/**
 * Inline text formatter for bolding, italics, and key phrases
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
 * Preprocesses unformatted text into clean sections
 */
function preprocessTextToSections(rawText: string): FormattedSection[] {
  let text = sanitizeJobDescription(rawText);

  // Mark natural section breaks
  text = text
    .replace(/(?:^|\n+)(The\s+primary\s+purpose\s+of\s+this\s+position\s+is:?)/gi, "\n\n## Role Purpose & Overview\n$1")
    .replace(/(?:^|\n+)(In\s+order\s+to\s+qualify[,\s]+you\s+must\s+meet[^\n:]*:?)/gi, "\n\n## Qualifications & Requirements\n$1")
    .replace(/(?:,\s*|\.\s*|\n+)?(0800\s+Basic\s+Requirements?:?|Basic\s+Requirements?:?)/gi, "\n\n## Basic Requirements & Qualifications\n")
    .replace(/(?:^|\n+)(Major\s+Duties|Duties\s+and\s+Responsibilities|Key\s+Responsibilities):?/gi, "\n\n## Key Responsibilities\n")
    .replace(/(?:^|\n+)(Conditions\s+of\s+Employment|Eligibilities\s+being\s+considered):?/gi, "\n\n## Conditions of Employment\n")
    .replace(/(?:^|\n+)(How\s+You\s+Will\s+Be\s+Evaluated|How\s+to\s+Apply):?/gi, "\n\n## Evaluation & Application Process\n")
    .replace(/(?:^|\n+)(Benefits\s+and\s+Other\s+Info|Benefits):?/gi, "\n\n## Compensation & Benefits\n")
    .replace(/(?:^|\n+)(Visa\s+Sponsorship|Work\s+Authorization|Immigration\s+Support):?/gi, "\n\n## Visa Sponsorship & Work Authorization\n");

  const cleanMarkdown = cleanHtmlToMarkdown(text);
  const rawLines = cleanMarkdown.split("\n");

  const sections: FormattedSection[] = [];
  let currentTitle = "Role Overview";
  let currentType: FormattedSection["type"] = "overview";
  let currentParagraphs: string[] = [];
  let currentBullets: string[] = [];

  const flushSection = () => {
    const validParagraphs = currentParagraphs.filter((p) => p.trim().length > 0);
    const validBullets = currentBullets.filter((b) => b.trim().length > 0);

    if (validParagraphs.length > 0 || validBullets.length > 0) {
      sections.push({
        id: `sec_${sections.length}_${currentType}`,
        title: currentTitle,
        type: currentType,
        paragraphs: validParagraphs,
        bulletPoints: validBullets.length > 0 ? validBullets : undefined,
      });
    }
    currentParagraphs = [];
    currentBullets = [];
  };

  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Check for Markdown Headings
    if (line.startsWith("## ") || line.startsWith("### ")) {
      flushSection();
      currentTitle = line.replace(/^#+\s+/, "").replace(/[*_#`:]+/g, " ").trim();
      const lower = currentTitle.toLowerCase();
      if (lower.includes("responsibilit") || lower.includes("duties")) currentType = "responsibilities";
      else if (lower.includes("qualif") || lower.includes("require") || lower.includes("eligib")) currentType = "requirements";
      else if (lower.includes("education") || lower.includes("degree")) currentType = "education";
      else if (lower.includes("visa") || lower.includes("sponsor") || lower.includes("immigration")) currentType = "visa";
      else if (lower.includes("benefit") || lower.includes("compensation")) currentType = "benefits";
      else if (lower.includes("evaluat") || lower.includes("apply")) currentType = "apply";
      else currentType = "overview";
      continue;
    }

    // Check for list items
    if (/^[•\-\*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const cleanBullet = line.replace(/^[•\-\*]\s+/, "").replace(/^\d+\.\s+/, "").trim();
      if (cleanBullet) currentBullets.push(cleanBullet);
      continue;
    }

    // Check for inline sub-lists like "(a) ...; (b) ...; (c) ..." within a long paragraph
    if (/\([a-e]\)\s+[^;]+;\s+\([b-f]\)/i.test(line)) {
      // Split the lead-in from the sub-clauses
      const matchIdx = line.search(/\([a-z]\)\s+/i);
      if (matchIdx > 0) {
        currentParagraphs.push(line.slice(0, matchIdx).trim());
      }
      const clauses = line.slice(matchIdx).split(/;\s*(?:and\s+)?(?=\([a-z]\))/i);
      clauses.forEach((cl) => {
        const cleanClause = cl.replace(/^[;\s]+/, "").replace(/[;\s]+$/, "").trim();
        if (cleanClause) currentBullets.push(cleanClause);
      });
      continue;
    }

    currentParagraphs.push(line);
  }

  flushSection();

  // If no sections were created or empty
  if (sections.length === 0 && rawText) {
    sections.push({
      id: "sec_overview",
      title: "Role Overview",
      type: "overview",
      paragraphs: [sanitizeJobDescription(rawText)],
    });
  }

  return sections;
}

/**
 * Extracts high-signal, non-duplicate technical and domain keywords
 */
function extractDistinctCompetencies(description: string): string[] {
  const dictionary = [
    "Civil Engineer",
    "Mechanical Engineer",
    "Electrical Engineer",
    "Software Engineer",
    "Full Stack",
    "Frontend",
    "Backend",
    "ABET",
    "AutoCAD",
    "Civil 3D",
    "Revit",
    "Python",
    "TypeScript",
    "JavaScript",
    "React",
    "Node.js",
    "AWS",
    "Docker",
    "Kubernetes",
    "Calculus",
    "Thermodynamics",
    "Fluid Mechanics",
    "Statics",
    "Project Management",
    "Security Clearance",
    "H-1B Sponsor",
    "Skilled Worker CoS",
  ];

  const found: string[] = [];
  const lowerDesc = description.toLowerCase();

  for (const item of dictionary) {
    const lowerItem = item.toLowerCase();
    if (lowerDesc.includes(lowerItem)) {
      // Prevent redundant substrings (e.g. don't add "Engineering" if "Civil Engineer" is already added)
      const isDuplicate = found.some((existing) => existing.toLowerCase().includes(lowerItem) || lowerItem.includes(existing.toLowerCase()));
      if (!isDuplicate) {
        found.push(item);
      }
    }
  }

  return found.slice(0, 6);
}

import { useSession } from "@/hooks/useSession";
import { Crown, Lock, ArrowRight } from "lucide-react";
import { RazorpayCheckoutButton } from "@/components/RazorpayCheckoutButton";

const VIP_PLANS = [
  { code: "SA_MONTH_199",  label: "1 Month",  amount: 199, perDay: "₹6.6/day" },
  { code: "SA_3MONTH_499", label: "3 Months", amount: 499, perDay: "₹5.5/day", badge: "Best Value" },
  { code: "SA_6MONTH_799", label: "6 Months", amount: 799, perDay: "₹4.4/day" },
  { code: "SA_YEAR_999",   label: "12 Months", amount: 999, perDay: "₹2.7/day", badge: "Popular", highlight: true },
];

export const RichJobDescription: React.FC<RichJobDescriptionProps> = ({
  description,
  companyName,
  countryCode,
  applyUrl,
}) => {
  const { isPro, isLoggedIn } = useSession();
  const [selectedPlanCode, setSelectedPlanCode] = React.useState("SA_3MONTH_499");

  const cleanedDescription = useMemo(() => sanitizeJobDescription(description), [description]);
  const sections = useMemo(() => preprocessTextToSections(cleanedDescription || ""), [cleanedDescription]);
  const competencies = useMemo(() => extractDistinctCompetencies(cleanedDescription || ""), [cleanedDescription]);

  const selectedPlan = VIP_PLANS.find((p) => p.code === selectedPlanCode) || VIP_PLANS[1];

  const getSectionIcon = (type: FormattedSection["type"]) => {
    switch (type) {
      case "overview":
        return <Briefcase className="w-4 h-4 text-brand-600" />;
      case "responsibilities":
        return <Award className="w-4 h-4 text-purple-600" />;
      case "requirements":
        return <FileCheck2 className="w-4 h-4 text-sky-600" />;
      case "education":
        return <GraduationCap className="w-4 h-4 text-indigo-600" />;
      case "visa":
        return <Globe2 className="w-4 h-4 text-emerald-600" />;
      case "benefits":
        return <Gift className="w-4 h-4 text-amber-600" />;
      case "apply":
        return <Send className="w-4 h-4 text-teal-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };


  return (
    <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100 relative">
      {/* ── Section Header & Competency Tags ── */}
      <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/80 to-white space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#071421] text-[#18D6E5] flex items-center justify-center shadow-sm shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-display">
              Job Description &amp; Specifications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official role breakdown, eligibility standards, and core responsibilities
            </p>
          </div>
        </div>

        {/* Clean Competency Tags */}
        {competencies.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-500" />
              <span>Key Requirements:</span>
            </span>
            {competencies.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Description Content Area with VIP Paywall Overlay ── */}
      <div className="relative p-6 sm:p-8 min-h-[480px]">
        {/* Blurred Description Content (when not Pro) */}
        <div className={`space-y-8 ${!isPro ? "blur-[6px] select-none opacity-30 pointer-events-none filter" : ""}`}>
          {sections.map((section) => {
            // Special High-Trust Visa Section Styling
            if (section.type === "visa") {
              return (
                <div
                  key={section.id}
                  className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-3 shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <h3 className="text-base font-bold text-emerald-950 tracking-tight">
                      {section.title}
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm text-emerald-900 leading-relaxed font-medium">
                    {section.paragraphs.map((p, idx) => (
                      <p key={idx}>{formatInline(p)}</p>
                    ))}
                  </div>

                  {section.bulletPoints && section.bulletPoints.length > 0 && (
                    <ul className="space-y-2 pt-2 border-t border-emerald-200/60">
                      {section.bulletPoints.map((bp, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-emerald-900">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{formatInline(bp)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            }

            return (
              <div key={section.id} className="space-y-3.5">
                {/* Section Header */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {getSectionIcon(section.type)}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {section.title}
                  </h3>
                </div>

                {/* Lead Paragraphs */}
                {section.paragraphs.length > 0 && (
                  <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed">
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="leading-relaxed">
                        {formatInline(p)}
                      </p>
                    ))}
                  </div>
                )}

                {/* Clean Styled Bullet List */}
                {section.bulletPoints && section.bulletPoints.length > 0 && (
                  <ul className="space-y-2.5 pt-1 pl-1">
                    {section.bulletPoints.map((bp, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-3 text-sm text-slate-800">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#18D6E5]" />
                        <span className="leading-relaxed font-medium">{formatInline(bp)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            VIP PRO PAYWALL OVERLAY CARD (Matching ukvisasponsorships.co.uk)
        ═══════════════════════════════════════════════════════════════ */}
        {!isPro && (
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-white/70 via-white/95 to-white backdrop-blur-[2px]">
            <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-50/95 to-amber-100/70 border-2 border-amber-300 shadow-2xl space-y-6 text-slate-900">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-950 font-display">
                    Verified Sponsor Job — VIP Only
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
                    This role is on the verified Official Register of Licensed Sponsors. Unlock the full description, salary package, and direct application link.
                  </p>
                </div>
              </div>

              {/* Value Checklist */}
              <div className="space-y-2 text-xs sm:text-sm font-semibold text-slate-800">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Full job description, salary scale &amp; specific requirements</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Direct apply link to the verified licensed employer</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>7,800+ verified sponsor roles + unlimited AI CV match &amp; cover letters</span>
                </div>
              </div>

              {/* Plan Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {VIP_PLANS.map((plan) => (
                  <button
                    key={plan.code}
                    type="button"
                    onClick={() => setSelectedPlanCode(plan.code)}
                    className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer relative ${
                      selectedPlanCode === plan.code
                        ? "bg-slate-950 text-white border-amber-400 shadow-md ring-2 ring-amber-400/50"
                        : "bg-white/80 hover:bg-white text-slate-800 border-amber-200/80"
                    }`}
                  >
                    {plan.badge && (
                      <span className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black px-2 py-0.2 rounded-full uppercase shadow-xs ${
                        selectedPlanCode === plan.code ? "bg-amber-400 text-slate-950" : "bg-slate-900 text-amber-300"
                      }`}>
                        {plan.badge}
                      </span>
                    )}
                    <div className="text-xs font-black">{plan.label}</div>
                    <div className="text-sm sm:text-base font-black text-amber-400">₹{plan.amount}</div>
                    <div className="text-[10px] opacity-70">{plan.perDay}</div>
                  </button>
                ))}
              </div>

              {/* Razorpay Checkout Trigger */}
              <div className="pt-2">
                <RazorpayCheckoutButton
                  planCode={selectedPlan.code}
                  planLabel={`SponsorAJobs VIP Pass (${selectedPlan.label})`}
                  amount={selectedPlan.amount}
                  className="w-full py-4 text-sm sm:text-base font-black shadow-lg shadow-amber-500/25 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-2xl flex items-center justify-center gap-2"
                />
                <p className="text-center text-[11px] text-slate-600 mt-2">
                  🔒 One-time payment via Razorpay. No auto-renewals. Instant unlock.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

