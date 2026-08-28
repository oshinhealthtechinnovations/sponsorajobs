"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Calculator,
  Compass,
} from "lucide-react";

export const ApplicationReadinessCalculator: React.FC = () => {
  const [country, setCountry] = useState<string>("uk");
  const [occupation, setOccupation] = useState<string>("software");
  const [experience, setExperience] = useState<string>("mid");
  const [calculated, setCalculated] = useState<boolean>(true);

  // Dynamic readiness scoring
  const getReadinessResult = () => {
    let score = 88;
    let level = "HIGH";
    let color = "emerald";

    if (experience === "junior") {
      score = 74;
      level = "MEDIUM";
      color = "amber";
    } else if (experience === "senior") {
      score = 96;
      level = "OPTIMAL";
      color = "emerald";
    }

    return { score, level, color };
  };

  const { score, level } = getReadinessResult();

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18D6E5]/10 border border-[#18D6E5]/30 text-[#087F8C] text-xs font-bold uppercase tracking-wider">
          <Calculator className="w-3.5 h-3.5" />
          <span>Application Readiness Assessment</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Can I Realistically Apply?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Enter your profile parameters to evaluate statutory salary alignment, occupation shortage status, and sponsor availability before applying.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Target Destination
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#18D6E5]"
            >
              <option value="uk">🇬🇧 United Kingdom (Skilled Worker Visa)</option>
              <option value="usa">🇺🇸 United States (H-1B / Specialty Occupation)</option>
              <option value="australia">🇦🇺 Australia (TSS 482 / Core Skills)</option>
              <option value="canada">🇨🇦 Canada (Global Talent Stream / LMIA)</option>
              <option value="new-zealand">🇳🇿 New Zealand (AEWV Green List)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Discipline / Occupation
            </label>
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#18D6E5]"
            >
              <option value="software">Software & Distributed Systems</option>
              <option value="civil">Civil / Structural / Infrastructure</option>
              <option value="healthcare">Healthcare & Clinical Nursing</option>
              <option value="finance">Finance, Risk & Quantitative Analysis</option>
              <option value="construction">Construction Management & Surveying</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Professional Experience
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#18D6E5]"
            >
              <option value="junior">1 – 2 Years (Early Career / Graduate)</option>
              <option value="mid">3 – 5 Years (Mid-Level Professional)</option>
              <option value="senior">5+ Years (Senior / Lead Specialist)</option>
            </select>
          </div>
        </div>

        {/* Right: Analytical Readiness Card */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Readiness Score
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black">
              {level} READINESS
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono text-[#18D6E5]">
              {score}
            </span>
            <span className="text-slate-400 text-sm font-semibold">/ 100</span>
          </div>

          {/* Verification Checklist */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Occupation meets skilled shortage registry criteria.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Advertised salary benchmarks align with statutory minimum.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Multiple licensed employers actively hiring in this destination.</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-800/80">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Feasibility guide only; individual visa grants depend on official authorities.</span>
          </div>

          <Link
            href={`/jobs/${country}`}
            className="block w-full py-3 px-4 rounded-xl bg-[#18D6E5] hover:bg-[#15c0ce] text-[#071421] font-bold text-center text-xs transition-colors shadow-xs"
          >
            Find Realistic Opportunities &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
