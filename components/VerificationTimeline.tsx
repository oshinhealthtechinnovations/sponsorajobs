"use client";

import React from "react";
import {
  CheckCircle2,
  ShieldCheck,
  Search,
  Globe2,
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const VerificationTimeline: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "SOURCE",
      desc: "Direct employer ATS endpoints & verified feeds harvested.",
      icon: Search,
      color: "border-[#18D6E5] text-[#18D6E5]",
    },
    {
      step: "02",
      title: "EMPLOYER REGISTRY",
      desc: "Cross-checked with national Home Office / USCIS sponsor registries.",
      icon: ShieldCheck,
      color: "border-[#7567F8] text-[#7567F8]",
    },
    {
      step: "03",
      title: "ORIGINAL ATS",
      desc: "Live HTTP validation confirms direct job application endpoint.",
      icon: Globe2,
      color: "border-[#18D6E5] text-[#18D6E5]",
    },
    {
      step: "04",
      title: "SPONSORSHIP SIGNALS",
      desc: "Deterministic text parsing detects explicit visa sponsorship terms.",
      icon: FileCheck2,
      color: "border-[#20C997] text-[#20C997]",
    },
    {
      step: "05",
      title: "FRESHNESS",
      desc: "Automated hourly re-checks discard expired requisitions.",
      icon: Clock,
      color: "border-[#F4B740] text-[#F4B740]",
    },
    {
      step: "06",
      title: "VERIFIED RESULT",
      desc: "Published with transparent Job Match Score.",
      icon: CheckCircle2,
      color: "border-[#20C997] text-[#20C997]",
    },
  ];

  return (
    <div className="w-full rounded-3xl bg-[#071421] text-white border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8">
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20C997]/10 border border-[#20C997]/30 text-[#20C997] text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>How We Verify Jobs</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
          Our Verification Process
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          A discovered job is never published until it clears our 6-stage verification pipeline.
        </p>
      </div>

      {/* 6-Stage Visual Step Grid with Connection Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 relative">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="p-5 rounded-2xl bg-[#0D1B2A] border border-slate-800 space-y-3 relative flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-500">{s.step}</span>
                  <div className={`p-1.5 rounded-lg border ${s.color} bg-slate-900/80`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-xs font-extrabold text-white tracking-wide">{s.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{s.desc}</p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
