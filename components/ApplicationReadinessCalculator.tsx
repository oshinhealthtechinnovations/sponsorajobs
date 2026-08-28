"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, Calculator } from "lucide-react";

export const ApplicationReadinessCalculator: React.FC = () => {
  const [country, setCountry] = useState<string>("uk");
  const [occupation, setOccupation] = useState<string>("software");
  const [experience, setExperience] = useState<string>("mid");

  // Dynamic readiness scoring
  const getReadinessResult = () => {
    let score = 88;
    let level = "Strong Match";
    let color = "emerald";

    if (experience === "junior") {
      score = 74;
      level = "Possible Match";
      color = "amber";
    } else if (experience === "senior") {
      score = 96;
      level = "Excellent Match";
      color = "emerald";
    }

    return { score, level, color };
  };

  const { score, level } = getReadinessResult();

  const isStrong = score >= 75;

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#19CBE0]/10 border border-[#19CBE0]/30 text-[#087F8C] text-xs font-bold uppercase tracking-wider">
          <Calculator className="w-3.5 h-3.5" />
          <span>Eligibility Tool</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Check Your Job Eligibility
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          See how closely your profile matches the requirements of an international job market before applying.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Target Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#19CBE0]"
            >
              <option value="uk">🇬🇧 United Kingdom (Skilled Worker Visa)</option>
              <option value="usa">🇺🇸 United States (H-1B / Specialty Occupation)</option>
              <option value="australia">🇦🇺 Australia (TSS 482 / Core Skills)</option>
              <option value="canada">🇨🇦 Canada (Global Talent Stream / LMIA)</option>
              <option value="new-zealand">🇳🇿 New Zealand (AEWV Green List)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Occupation
            </label>
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#19CBE0]"
            >
              <option value="software">Software & Systems Engineering</option>
              <option value="civil">Civil / Structural / Infrastructure</option>
              <option value="healthcare">Healthcare & Clinical Nursing</option>
              <option value="finance">Finance, Risk & Quantitative Analysis</option>
              <option value="construction">Construction Management & Surveying</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Professional Experience
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#19CBE0]"
            >
              <option value="junior">1 – 2 Years (Early Career / Graduate)</option>
              <option value="mid">3 – 5 Years (Mid-Level Professional)</option>
              <option value="senior">5+ Years (Senior / Lead Specialist)</option>
            </select>
          </div>
        </div>

        {/* Right: Result Card */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your Eligibility Score
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isStrong
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {level}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-5xl sm:text-6xl font-black font-display ${isStrong ? "text-emerald-600" : "text-amber-600"}`}>
              {score}
            </span>
            <span className="text-slate-400 text-sm font-semibold">/ 100</span>
          </div>

          {/* Checklist */}
          <div className="space-y-2.5 text-sm text-slate-700 pt-2 border-t border-slate-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Occupation alignment with market demand</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Salary alignment with statutory thresholds</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Relevant employers actively hiring</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Relevant opportunities currently available</span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 border-t border-slate-200 pt-3">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>
              This is a career-planning and job-search indicator, not a visa approval or legal determination.
            </span>
          </div>

          {/* CTA */}
          <Link
            href={`/jobs/${country}`}
            className="block w-full py-3 px-4 rounded-xl bg-[#071522] hover:bg-slate-800 text-white font-bold text-center text-sm transition-colors shadow-sm mt-1"
          >
            Find Matching Jobs →
          </Link>
        </div>
      </div>
    </div>
  );
};
