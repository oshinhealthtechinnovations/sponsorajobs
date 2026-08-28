"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

const VERIFICATION_STAGES = [
  {
    step: "01",
    title: "Original Source",
    description: "Job comes from an identifiable employer or approved posting source.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    step: "02",
    title: "Employer Verified",
    description: "Employer information is checked against available official and authorized records.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  {
    step: "03",
    title: "Application Link",
    description: "The original employer application endpoint is checked and confirmed active.",
    color: "text-[#19CBE0]",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
  {
    step: "04",
    title: "Sponsorship Signals",
    description: "Job content is analyzed for relevant sponsorship indicators and visa keywords.",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  {
    step: "05",
    title: "Freshness Check",
    description: "Expired or stale opportunities are removed or flagged so you only see active roles.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    step: "06",
    title: "Verified",
    description: "Only qualifying opportunities are published. Verification complete.",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    highlight: true,
  },
];

export const VerificationTimeline: React.FC = () => {
  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verification Process</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Every Job Is Checked Before You Apply
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          We verify the source, employer, application route, sponsorship signals and posting freshness before presenting an opportunity.
        </p>
      </div>

      {/* Verification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {VERIFICATION_STAGES.map((stage) => (
          <div
            key={stage.step}
            className={`p-5 rounded-2xl border ${stage.border} ${stage.bg} space-y-2 ${
              stage.highlight ? "ring-1 ring-emerald-300 ring-offset-1" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black uppercase tracking-widest ${stage.color}`}>
                {stage.step}
              </span>
              <CheckCircle2 className={`w-4 h-4 ${stage.color}`} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">{stage.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{stage.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
