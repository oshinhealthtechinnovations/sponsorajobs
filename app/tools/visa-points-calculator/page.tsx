"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VisaPointsCalculator } from "@/lib/services/visaPointsCalculator";
import {
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

export default function VisaPointsCalculatorPage() {
  const [mode, setMode] = useState<"UK" | "AU">("UK");

  // UK State
  const [ukHasOffer, setUkHasOffer] = useState(true);
  const [ukSkillLevel, setUkSkillLevel] = useState(true);
  const [ukEnglish, setUkEnglish] = useState(true);
  const [ukSalary, setUkSalary] = useState<number>(42000);
  const [ukShortage, setUkShortage] = useState(false);
  const [ukNewEntrant, setUkNewEntrant] = useState(false);

  // Australia State
  const [auAge, setAuAge] = useState<number>(28);
  const [auEnglish, setAuEnglish] = useState<"Competent" | "Proficient" | "Superior">("Proficient");
  const [auExperience, setAuExperience] = useState<number>(4);
  const [auEducation, setAuEducation] = useState<"Doctorate" | "BachelorMaster" | "TradeDiploma" | "None">("BachelorMaster");
  const [auSponsor, setAuSponsor] = useState(true);
  const [auPartner, setAuPartner] = useState(false);

  const ukResult = VisaPointsCalculator.calculateUkSkilledWorkerPoints({
    hasJobOffer: ukHasOffer,
    jobAtAppropriateSkillLevel: ukSkillLevel,
    speaksEnglishB1: ukEnglish,
    salaryGbp: ukSalary,
    isShortageOccupationOrStemPhd: ukShortage,
    isNewEntrant: ukNewEntrant,
  });

  const auResult = VisaPointsCalculator.calculateAustraliaPoints({
    ageYears: auAge,
    englishLevel: auEnglish,
    overseasExperienceYears: auExperience,
    educationLevel: auEducation,
    hasStateNominationOrSponsor: auSponsor,
    partnerSkills: auPartner,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Official Immigration Criteria Self-Assessment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Visa Points & Eligibility Calculator
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Check whether you meet the official points threshold to secure a visa sponsorship job in the UK (70 points) or Australia (65 points).
          </p>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setMode("UK")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "UK"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🇬🇧 UK Skilled Worker (70 pts)
            </button>
            <button
              type="button"
              onClick={() => setMode("AU")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === "AU"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🇦🇺 Australia Subclass 482 / PR (65 pts)
            </button>
          </div>
        </div>

        {/* ── UK Calculator ── */}
        {mode === "UK" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                1. Mandatory Criteria (50 Points Required)
              </h2>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={ukHasOffer}
                  onChange={(e) => setUkHasOffer(e.target.checked)}
                  className="w-5 h-5 text-brand-600 rounded-md focus:ring-brand-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Offer of Job from a Licensed UK Sponsor (+20 pts)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Employer must hold a valid UK Home Office Worker sponsor license.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={ukSkillLevel}
                  onChange={(e) => setUkSkillLevel(e.target.checked)}
                  className="w-5 h-5 text-brand-600 rounded-md focus:ring-brand-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Job is at Appropriate Skill Level RQF 3+ (+20 pts)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    A-level / graduate degree equivalent role.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={ukEnglish}
                  onChange={(e) => setUkEnglish(e.target.checked)}
                  className="w-5 h-5 text-brand-600 rounded-md focus:ring-brand-500"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    English Language Proficiency B1 Level (+10 pts)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    IELTS / SELT test or degree taught in English.
                  </div>
                </div>
              </label>

              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 pt-4">
                2. Salary & Tradeable Criteria (20 Points Required)
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Expected / Offered Annual Salary (£ GBP)
                </label>
                <input
                  type="number"
                  value={ukSalary}
                  onChange={(e) => setUkSalary(Number(e.target.value))}
                  className="w-full text-base font-bold px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                />
                <div className="text-[11px] text-slate-500">
                  Standard threshold: <strong>£38,700+</strong> earns 20 points automatically.
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ukShortage}
                    onChange={(e) => setUkShortage(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded-sm"
                  />
                  <span>Job is on UK Immigration Salary List (ISL) or STEM PhD role</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ukNewEntrant}
                    onChange={(e) => setUkNewEntrant(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded-sm"
                  />
                  <span>New Entrant concession (under age 26 or recent graduate)</span>
                </label>
              </div>
            </div>

            {/* Verdict Column */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  UK Skilled Worker Score
                </div>
                <div className={`text-5xl font-black ${ukResult.isEligible ? "text-emerald-600" : "text-amber-600"}`}>
                  {ukResult.totalPoints} / 70
                </div>
                <div className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                  ukResult.isEligible
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {ukResult.isEligible ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Eligible for CoS & Visa</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Criteria Incomplete</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed text-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {ukResult.verdict}
              </p>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Passed Points:
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {ukResult.passedCriteria.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {ukResult.missingCriteria.length > 0 && (
                  <>
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider pt-2">
                      Missing Requirements:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-500">
                      {ukResult.missingCriteria.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-amber-700">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <Link
                href="/jobs/uk"
                className="block w-full py-3 text-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Find Licensed UK Sponsor Jobs
              </Link>
            </div>
          </div>
        )}

        {/* ── Australia Calculator ── */}
        {mode === "AU" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Australia Points Criteria
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Your Age</label>
                <select
                  value={auAge}
                  onChange={(e) => setAuAge(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value={22}>18 to 24 years (25 pts)</option>
                  <option value={28}>25 to 32 years (30 pts - Maximum)</option>
                  <option value={35}>33 to 39 years (25 pts)</option>
                  <option value={42}>40 to 44 years (15 pts)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">English Language Level</label>
                <select
                  value={auEnglish}
                  onChange={(e) => setAuEnglish(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Superior">Superior (IELTS 8+ or PTE 79+) (+20 pts)</option>
                  <option value="Proficient">Proficient (IELTS 7+ or PTE 65+) (+10 pts)</option>
                  <option value="Competent">Competent (IELTS 6+ baseline) (0 pts)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Overseas Skilled Employment</label>
                <select
                  value={auExperience}
                  onChange={(e) => setAuExperience(Number(e.target.value))}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value={8}>8+ years in nominated occupation (+15 pts)</option>
                  <option value={5}>5 to 7 years (+10 pts)</option>
                  <option value={3}>3 to 4 years (+5 pts)</option>
                  <option value={1}>Less than 3 years (0 pts)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Educational Qualifications</label>
                <select
                  value={auEducation}
                  onChange={(e) => setAuEducation(e.target.value as any)}
                  className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Doctorate">Doctorate / PhD (+20 pts)</option>
                  <option value="BachelorMaster">Bachelor or Master Degree (+15 pts)</option>
                  <option value="TradeDiploma">Diploma or Trade Qualification (+10 pts)</option>
                  <option value="None">None of the above (0 pts)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auSponsor}
                    onChange={(e) => setAuSponsor(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded-sm"
                  />
                  <span>State Government Nomination or Employer Visa Sponsorship (+5 pts)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auPartner}
                    onChange={(e) => setAuPartner(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded-sm"
                  />
                  <span>Single applicant or spouse with skilled English (+10 pts)</span>
                </label>
              </div>
            </div>

            {/* Verdict Column */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Australia Immigration Points
                </div>
                <div className={`text-5xl font-black ${auResult.isEligible ? "text-emerald-600" : "text-amber-600"}`}>
                  {auResult.totalPoints} / 65
                </div>
                <div className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                  auResult.isEligible
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {auResult.isEligible ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready for EOI Submission</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Below 65 Pass Mark</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed text-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {auResult.verdict}
              </p>

              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Points Breakdown:
                </div>
                <div className="space-y-1 text-xs">
                  {Object.entries(auResult.breakdown).map(([label, pts]) => (
                    <div key={label} className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                      <span>{label}</span>
                      <strong className="text-slate-900">+{pts} pts</strong>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/jobs/australia"
                className="block w-full py-3 text-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Find Sponsoring Jobs in Australia
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
