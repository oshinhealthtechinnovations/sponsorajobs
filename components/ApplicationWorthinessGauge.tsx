"use client";

import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface BreakdownData {
  sponsorshipLikelihood: number;
  employerVerification: number;
  roleMatch: number;
  salaryCompatibility: number;
  freshness: number;
}

interface ApplicationWorthinessGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showBreakdown?: boolean;
  breakdown?: BreakdownData;
}

// Application Fit classification per spec §10
const getFitInfo = (score: number) => {
  if (score >= 90) return { label: "Excellent Match", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500" };
  if (score >= 75) return { label: "Strong Match",   color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500" };
  if (score >= 60) return { label: "Possible Match", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   bar: "bg-amber-500" };
  if (score >= 40) return { label: "Low Match",      color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200",   bar: "bg-slate-400" };
  return             { label: "Unlikely Match",  color: "text-slate-500",   bg: "bg-slate-50",   border: "border-slate-200",   bar: "bg-slate-300" };
};

const BREAKDOWN_LABELS: Record<keyof BreakdownData, string> = {
  sponsorshipLikelihood: "Sponsorship Signal",
  employerVerification:  "Employer Verification",
  roleMatch:             "Role Match",
  salaryCompatibility:   "Salary Alignment",
  freshness:             "Job Freshness",
};

export const ApplicationWorthinessGauge: React.FC<ApplicationWorthinessGaugeProps> = ({
  score,
  size = "md",
  showBreakdown = false,
  breakdown,
}) => {
  const fit = getFitInfo(score);

  return (
    <div className="space-y-3">
      {/* Score display */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-black ${fit.color}`}>{score}</span>
            <span className="text-slate-400 text-sm font-medium">/ 100</span>
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-bold mt-1 ${fit.bg} ${fit.border} ${fit.color}`}>
            <CheckCircle2 className="w-3 h-3" />
            {fit.label}
          </div>
        </div>

        {/* Progress arc (simple bar) */}
        <div className="w-16 h-16 relative flex items-center justify-center">
          <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
            <circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="8"
            />
            <circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke={score >= 75 ? "#10b981" : score >= 60 ? "#f59e0b" : "#94a3b8"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 163.4} 163.4`}
              className="transition-all duration-700"
            />
          </svg>
          <span className="absolute text-xs font-black text-slate-700">{score}</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-500 leading-relaxed">
        Based on job requirements, employer verification, sponsorship signals, salary alignment and posting freshness.
      </p>

      {/* Breakdown */}
      {showBreakdown && breakdown && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {(Object.entries(breakdown) as [keyof BreakdownData, number][]).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 w-36 shrink-0">{BREAKDOWN_LABELS[key]}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${fit.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="font-bold text-slate-700 w-8 text-right">{val}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
