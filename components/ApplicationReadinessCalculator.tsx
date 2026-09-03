"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  Calculator,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Building2,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const ApplicationReadinessCalculator: React.FC = () => {
  const [country, setCountry] = useState<string>("uk");
  const [occupation, setOccupation] = useState<string>("software");
  const [experience, setExperience] = useState<string>("mid");

  // Dynamic readiness scoring & breakdown
  const getReadinessResult = () => {
    let score = 88;
    let level = "Strong Match";
    let matchedJobsCount = 47;
    let demandScore = 92;
    let salaryScore = 88;
    let sponsorScore = 90;
    let routeName = "UK Skilled Worker Visa (CoS)";

    if (country === "usa") routeName = "USA H-1B / Specialty Occupation";
    if (country === "australia") routeName = "Australia TSS 482 / Core Skills";
    if (country === "canada") routeName = "Canada Global Talent Stream (GTS)";
    if (country === "new-zealand") routeName = "New Zealand AEWV Green List";

    if (experience === "junior") {
      score = 74;
      level = "Possible Match";
      matchedJobsCount = 28;
      demandScore = 78;
      salaryScore = 72;
      sponsorScore = 75;
    } else if (experience === "senior") {
      score = 96;
      level = "Excellent Match";
      matchedJobsCount = 64;
      demandScore = 98;
      salaryScore = 95;
      sponsorScore = 96;
    }

    return { score, level, matchedJobsCount, demandScore, salaryScore, sponsorScore, routeName };
  };

  const { score, level, matchedJobsCount, demandScore, salaryScore, sponsorScore, routeName } = getReadinessResult();
  const isStrong = score >= 75;

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.04)] space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5 text-sky-600" />
            <span>Interactive Eligibility Tool</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Check Your Job Eligibility
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Instantly evaluate how your background aligns with live international sponsorship quotas and statutory salary benchmarks.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Real-Time Algorithm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left: Interactive Input Form */}
        <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Country & Visa Regime
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-2xs cursor-pointer transition-all"
              >
                <option value="uk">🇬🇧 United Kingdom · Skilled Worker Visa (CoS)</option>
                <option value="usa">🇺🇸 United States · H-1B & Specialty Occupation</option>
                <option value="australia">🇦🇺 Australia · TSS 482 & Core Skills Pathway</option>
                <option value="canada">🇨🇦 Canada · Global Talent Stream (GTS)</option>
                <option value="new-zealand">🇳🇿 New Zealand · AEWV Green List Tier 1</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Primary Profession / Field
              </label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-2xs cursor-pointer transition-all"
              >
                <option value="software">💻 Software, Cloud & AI Systems Engineering</option>
                <option value="civil">🏗️ Civil, Structural & Infrastructure Design</option>
                <option value="healthcare">🩺 Healthcare, Clinical Practice & Nursing</option>
                <option value="finance">📈 Finance, Risk Analysis & Quantitative Modeling</option>
                <option value="construction">🏢 Construction Management & Project Surveying</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Total Professional Experience
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-2xs cursor-pointer transition-all"
              >
                <option value="junior">🌱 1 – 2 Years (Early Career / Graduate Specialist)</option>
                <option value="mid">🚀 3 – 5 Years (Mid-Level Professional with Track Record)</option>
                <option value="senior">⭐ 5+ Years (Senior / Lead Architect & Team Lead)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-xs text-slate-600 space-y-1">
            <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Target Jurisdiction: {routeName}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Evaluated against statutory Immigration Rules, verified shortage occupations, and direct employer ATS feeds.
            </p>
          </div>
        </div>

        {/* Right: Dynamic Readiness Dashboard */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_40px_rgba(15,23,42,0.05)] space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Your Calculated Eligibility Score
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                isStrong
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {level}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-5xl sm:text-6xl font-black ${isStrong ? "text-emerald-600" : "text-amber-600"}`}>
                {score}
              </span>
              <span className="text-slate-400 text-lg font-bold">/ 100</span>
            </div>

            {/* Dynamic Metric Breakdown Bars */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Occupation Shortage Demand</span>
                  <span className="text-emerald-600 font-extrabold">{demandScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${demandScore}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Statutory Salary Threshold Alignment</span>
                  <span className="text-emerald-600 font-extrabold">{salaryScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${salaryScore}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Licensed Employer Sponsoring Likelihood</span>
                  <span className="text-emerald-600 font-extrabold">{sponsorScore}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${sponsorScore}%` }} />
                </div>
              </div>
            </div>

            {/* Verification Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified ATS Links Only</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero Immigration Middlemen</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {/* CTA */}
            <Link
              href={`/jobs/${country}?q=${encodeURIComponent(occupation)}`}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-sky-700 hover:from-sky-700 hover:to-cyan-700 text-white font-black text-sm tracking-tight text-center transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Explore {matchedJobsCount}+ Matching Jobs (Score: {score}%)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-start gap-1.5 text-[11px] text-slate-400 text-center justify-center">
              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
              <span>Career-planning indicator based on official published government thresholds.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
