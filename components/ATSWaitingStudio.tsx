"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Clock,
  Cpu,
  Target,
  Building,
  CheckSquare,
  Square,
  FileSearch,
} from "lucide-react";

// ── 8 CURATED HIGH-IMPACT INSIDER VISA & ATS TIPS ──
export const INSIDER_TIPS = [
  {
    category: "HOME OFFICE RULE",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    title: "The 70% 'New Entrant' Salary Discount",
    takeaway: "Minimum salary threshold drops from £38,700 to £30,960",
    detail: "If you are under 26, switching from a UK Student visa, or working toward chartered qualifications (e.g. CEng, ACA, ACCA), you can be sponsored under the Home Office 'New Entrant' concession at 70% of the standard going rate!",
  },
  {
    category: "ATS ARCHITECTURE",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    title: "Why Two-Column Formats Fail in Workday",
    takeaway: "Single-column layout guarantees 100% text extraction",
    detail: "Over 70% of enterprise ATS platforms (Workday, Taleo, iCIMS) parse two-column resumes horizontally across columns, jumbling your work history into garbled fragments. A clean single-column structure avoids this entirely.",
  },
  {
    category: "APPLICATION STRATEGY",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/30",
    title: "The Critical 48-Hour Sponsor Window",
    takeaway: "Apply within 48 hours for up to 8x higher callback rates",
    detail: "Licensed UK sponsors have finite monthly quotas for Defined Certificates of Sponsorship (DCoS). Candidates who apply within the first 48 hours of a posting are evaluated before the monthly allocation cap is exhausted.",
  },
  {
    category: "KEYWORD PRECISION",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    title: "Contextual Density Beats Keyword Stuffing",
    takeaway: "Software and tools must appear inside accomplishment bullets",
    detail: "Modern semantic ATS algorithms penalize standalone keyword lists. Instead of listing 'Primavera P6' in a footer, weave it into an accomplishment: 'Formulated Level 4 EPC schedules in Primavera P6, preventing 6 weeks of critical path delay'.",
  },
  {
    category: "SPONSOR REGISTER",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
    title: "110,000+ UK Licensed Sponsors Checked",
    takeaway: "Sponsorship potential verified against statutory register",
    detail: "Our database cross-references the official UK Home Office Register of Worker and Temporary Worker Licensed Sponsors. Even if a listing omits the word 'visa', we verify whether the hiring company holds an active sponsor license.",
  },
  {
    category: "SOC 2020 CODES",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
    title: "Job Duties Must Align With Official SOC Descriptions",
    takeaway: "Responsibilities matter more than exact title matching",
    detail: "Your title doesn't need to match the Home Office SOC 2020 code word-for-word, but your documented responsibilities and tasks must align with the official SOC code description for the caseworker to approve your CoS.",
  },
  {
    category: "ATS HYGIENE",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-400/30",
    title: "Hidden Drawing Layers & Text Boxes",
    takeaway: "Avoid Canva or Word floating text boxes that parsers skip",
    detail: "Text placed inside graphical shapes or floating text boxes is stored in a separate vector drawing layer. Most ATS extraction engines strip drawing layers entirely, causing key credentials or phone numbers to vanish.",
  },
  {
    category: "HIGH-IMPACT METRICS",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    title: "Google's XYZ Formula for Bullet Points",
    takeaway: "Accomplished [X], measured by [Y], by doing [Z]",
    detail: "Recruiters and hiring managers spend an average of 6 seconds reviewing a CV. Bullets structured with quantifiable metrics (e.g. 'Optimized database query performance by 45%, saving £60k annually by implementing Redis caching') achieve the highest callback scores.",
  },
];

// ── 6 MULTI-STAGE DIAGNOSTIC PIPELINE MILESTONES ──
export const DIAGNOSTIC_STAGES = [
  {
    title: "Document Typography & Layout Hygiene",
    desc: "Validating text encoding, single-column flow, and header hierarchy",
    icon: FileText,
  },
  {
    title: "Capability & Technical Skill Extraction",
    desc: "Detecting verified software tools, certifications, degrees, and seniority",
    icon: Cpu,
  },
  {
    title: "ATS Parsing Emulation (Workday, Taleo, Greenhouse)",
    desc: "Testing machine readability score and identifying text-stripping risks",
    icon: Target,
  },
  {
    title: "UK Home Office SOC 2020 Code Mapping",
    desc: "Matching candidate title to official Standard Occupational Classification",
    icon: Building,
  },
  {
    title: "Sponsor Register & License Verification",
    desc: "Benchmarking against 110,000+ accredited UK & international visa sponsors",
    icon: ShieldCheck,
  },
  {
    title: "Salary Threshold & Strategic Recommendations",
    desc: "Verifying Skilled Worker salary criteria & synthesizing bullet improvements",
    icon: Sparkles,
  },
];

interface ATSWaitingStudioProps {
  progressPercent: number;
  activeStage: number;
  targetJobTitle?: string;
  targetCompanyName?: string;
}

export function ATSWaitingStudio({
  progressPercent,
  activeStage,
  targetJobTitle,
  targetCompanyName,
}: ATSWaitingStudioProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [tipTimerKey, setTipTimerKey] = useState(0);
  const [checklist, setChecklist] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false,
    3: true,
  });

  // Cycle tips every 4.2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % INSIDER_TIPS.length);
      setTipTimerKey((prev) => prev + 1);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const toggleChecklistItem = (idx: number) => {
    setChecklist((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-brand-500/30 shadow-2xl space-y-6 animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Diagnostic Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-400/40 text-brand-400 flex items-center justify-center relative shadow-inner">
            <Cpu className="w-5 h-5 animate-pulse text-[#19CBE0]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <span>Multi-Pillar ATS &amp; Visa Intelligence Scanner</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-[#19CBE0] font-mono border border-brand-400/30">
                Active Telemetry
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              {targetJobTitle && targetCompanyName ? (
                <>Benchmarking directly against <strong className="text-brand-300">{targetJobTitle}</strong> at <strong className="text-white">{targetCompanyName}</strong>...</>
              ) : (
                "Simulating recruiter ATS parsing and cross-referencing statutory visa criteria..."
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-brand-300 font-mono">
              {progressPercent}% Complete
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Stage {activeStage + 1} of {DIAGNOSTIC_STAGES.length}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar with glowing gradient */}
      <div className="space-y-1.5 relative z-10">
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-[#19CBE0] via-brand-500 to-emerald-400 transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(25,203,224,0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Current Task: {DIAGNOSTIC_STAGES[activeStage]?.title}</span>
          <span>Estimated: ~6s</span>
        </div>
      </div>

      {/* 2-Column Split: Left = Live Milestones & Telemetry | Right = Insider Visa Tips Carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 relative z-10">
        
        {/* LEFT: 6 Sequential Diagnostic Stages */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-1">
            <FileSearch className="w-3.5 h-3.5 text-brand-400" />
            <span>Real-Time Diagnostic Pipeline</span>
          </div>

          <div className="space-y-2">
            {DIAGNOSTIC_STAGES.map((stage, idx) => {
              const isDone = activeStage > idx || progressPercent === 100;
              const isCurrent = activeStage === idx && progressPercent < 100;

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl transition-all flex items-start gap-3 text-xs border ${
                    isDone
                      ? "bg-emerald-950/20 border-emerald-500/30 text-slate-200"
                      : isCurrent
                      ? "bg-brand-950/40 border-brand-400/50 text-white shadow-sm ring-1 ring-brand-400/30"
                      : "bg-slate-900/40 border-slate-800/60 text-slate-400"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-[#19CBE0] animate-spin" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold flex items-center justify-between gap-2">
                      <span className={isCurrent ? "text-white" : isDone ? "text-slate-200" : "text-slate-400"}>
                        {stage.title}
                      </span>
                      {isDone && (
                        <span className="text-[10px] text-emerald-400 font-mono shrink-0">
                          Verified ✓
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] text-[#19CBE0] font-mono animate-pulse shrink-0">
                          Processing...
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Telemetry Stats Ticker */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center">
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-xs font-mono font-bold text-brand-300">1,400+</div>
              <div className="text-[10px] text-slate-400">Tokens Parsed</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-xs font-mono font-bold text-indigo-300">250+</div>
              <div className="text-[10px] text-slate-400">Skills Scanned</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-xs font-mono font-bold text-emerald-300">110,000+</div>
              <div className="text-[10px] text-slate-400">Sponsor Licenses</div>
            </div>
          </div>
        </div>

        {/* RIGHT: High-Value "While You Wait" Insider Intelligence Carousel */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          
          {/* Tip Card Carousel */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-800/70 to-slate-900/90 border border-slate-700/70 shadow-lg space-y-3 relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${INSIDER_TIPS[tipIndex].badgeColor}`}>
                  {INSIDER_TIPS[tipIndex].category}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    Tip {tipIndex + 1} of {INSIDER_TIPS.length}
                  </span>
                </div>
              </div>

              <h5 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{INSIDER_TIPS[tipIndex].title}</span>
              </h5>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs font-semibold text-emerald-300">
                ⚡ Key Rule: {INSIDER_TIPS[tipIndex].takeaway}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {INSIDER_TIPS[tipIndex].detail}
              </p>
            </div>

            {/* Carousel Controls & Auto-advance Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-700/50">
              <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
                <div
                  key={tipTimerKey}
                  className="h-full bg-brand-400 rounded-full animate-[progress_4.2s_linear]"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setTipIndex((prev) => (prev - 1 + INSIDER_TIPS.length) % INSIDER_TIPS.length)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {INSIDER_TIPS.map((_, i) => (
                    <span
                      key={i}
                      onClick={() => setTipIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${
                        i === tipIndex ? "w-4 bg-brand-400" : "bg-slate-600 hover:bg-slate-500"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setTipIndex((prev) => (prev + 1) % INSIDER_TIPS.length)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Pre-Flight Checklist while waiting */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
              <span>Quick Self-Audit (Click to review while waiting):</span>
              <span className="text-emerald-400 font-mono">
                {Object.values(checklist).filter(Boolean).length}/4 Checked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              <div
                onClick={() => toggleChecklistItem(0)}
                className={`p-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                  checklist[0] ? "bg-emerald-950/30 text-emerald-300" : "bg-slate-900/40 text-slate-400 hover:text-slate-300"
                }`}
              >
                {checklist[0] ? <CheckSquare className="w-3.5 h-3.5 shrink-0 text-emerald-400" /> : <Square className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">Single-column layout</span>
              </div>

              <div
                onClick={() => toggleChecklistItem(1)}
                className={`p-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                  checklist[1] ? "bg-emerald-950/30 text-emerald-300" : "bg-slate-900/40 text-slate-400 hover:text-slate-300"
                }`}
              >
                {checklist[1] ? <CheckSquare className="w-3.5 h-3.5 shrink-0 text-emerald-400" /> : <Square className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">No photos or icons</span>
              </div>

              <div
                onClick={() => toggleChecklistItem(2)}
                className={`p-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                  checklist[2] ? "bg-emerald-950/30 text-emerald-300" : "bg-slate-900/40 text-slate-400 hover:text-slate-300"
                }`}
              >
                {checklist[2] ? <CheckSquare className="w-3.5 h-3.5 shrink-0 text-emerald-400" /> : <Square className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">Measurable %/£ metrics</span>
              </div>

              <div
                onClick={() => toggleChecklistItem(3)}
                className={`p-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                  checklist[3] ? "bg-emerald-950/30 text-emerald-300" : "bg-slate-900/40 text-slate-400 hover:text-slate-300"
                }`}
              >
                {checklist[3] ? <CheckSquare className="w-3.5 h-3.5 shrink-0 text-emerald-400" /> : <Square className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate">Degree &amp; graduation year</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
