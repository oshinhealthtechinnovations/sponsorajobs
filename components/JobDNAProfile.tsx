"use client";

import React from "react";
import { Dna, Sparkles } from "lucide-react";

interface JobDNAProps {
  dna: {
    sponsorship: number;
    employerConfidence: number;
    freshness: number;
    salaryAttractiveness: number;
    candidateMatch: number;
  };
  compact?: boolean;
}

export const JobDNAProfile: React.FC<JobDNAProps> = ({ dna, compact = false }) => {
  const metrics = [
    { label: "Sponsorship", value: dna.sponsorship, color: "bg-[#18D6E5]" },
    { label: "Employer", value: dna.employerConfidence, color: "bg-[#7567F8]" },
    { label: "Freshness", value: dna.freshness, color: "bg-[#20C997]" },
    { label: "Salary", value: dna.salaryAttractiveness, color: "bg-[#071421]" },
    { label: "Role Match", value: dna.candidateMatch, color: "bg-[#087F8C]" },
  ];

  if (compact) {
    return (
      <div className="space-y-1.5 py-1">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#18D6E5]" />
            <span>Job Match Breakdown</span>
          </span>
          <span className="font-mono text-slate-700">{dna.sponsorship}% Sponsor Signal</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          {metrics.map((m) => (
            <div key={m.label} className="h-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${m.color} rounded-full transition-all duration-500`}
                style={{ width: `${m.value}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900 font-display">
          <Sparkles className="w-4 h-4 text-[#18D6E5]" />
          <span>Job Match Details</span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Smart Job Matching
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-medium text-slate-600">{m.label}</span>
              <span className="font-bold font-mono text-slate-900">{m.value}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${m.color} rounded-full transition-all duration-700`}
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
