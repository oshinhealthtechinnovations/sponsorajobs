"use client";

import React from "react";
import { Sparkles, ShieldCheck } from "lucide-react";

interface ApplicationWorthinessGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showBreakdown?: boolean;
  breakdown?: {
    sponsorshipLikelihood: number;
    employerVerification: number;
    roleMatch: number;
    salaryCompatibility: number;
    freshness: number;
  };
}

export const ApplicationWorthinessGauge: React.FC<ApplicationWorthinessGaugeProps> = ({
  score,
  size = "md",
  showBreakdown = false,
  breakdown,
}) => {
  const radius = size === "sm" ? 18 : size === "md" ? 28 : 42;
  const strokeWidth = size === "sm" ? 3.5 : size === "md" ? 5 : 7;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const dimension = radius * 2;

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3">
        {/* SVG Circular Progress Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg height={dimension} width={dimension} className="transform -rotate-90">
            {/* Background Track */}
            <circle
              stroke="#E2E8F0"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Gradient Arc */}
            <circle
              stroke="url(#worthinessGradient)"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="worthinessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#18D6E5" />
                <stop offset="100%" stopColor="#7567F8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Score Number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-black tracking-tight text-slate-950 font-display ${
                size === "sm" ? "text-xs" : size === "md" ? "text-base" : "text-2xl"
              }`}
            >
              {score}
            </span>
          </div>
        </div>

        {/* Label & Context */}
        <div>
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <span>Job Match</span>
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
            {score >= 90 ? "Strong Match" : score >= 80 ? "Good Match" : "Fair Match"}
          </div>
        </div>
      </div>

      {/* Optional Analytical Breakdown */}
      {showBreakdown && breakdown && (
        <div className="w-full mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Role Match</span>
            <span className="font-bold text-slate-900">{breakdown.roleMatch}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Sponsorship Signal</span>
            <span className="font-bold text-emerald-600">Strong</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Employer Verification</span>
            <span className="font-bold text-emerald-600">Verified</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Salary Fit</span>
            <span className="font-bold text-slate-900">{breakdown.salaryCompatibility}%</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>Freshness</span>
            <span className="font-bold text-slate-900">{breakdown.freshness}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
