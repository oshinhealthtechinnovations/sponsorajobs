"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, Banknote, Users, Briefcase } from "lucide-react";

interface RouteDefinition {
  occupation: string;
  country: string;
  countryCode: string;
  visaRoute: string;
  targetRole: string;
  liveCount: number;
  employersCount: number;
  salaryBand: string;
  sponsorshipAvailability: string;
  qualificationCriteria: string;
}

const CAREER_ROUTES: RouteDefinition[] = [
  {
    occupation: "Software Engineer",
    country: "United Kingdom",
    countryCode: "uk",
    visaRoute: "Skilled Worker Visa",
    targetRole: "Senior / Lead Full Stack Engineer",
    liveCount: 47,
    employersCount: 23,
    salaryBand: "£65,000 – £95,000",
    sponsorshipAvailability: "Strong availability",
    qualificationCriteria: "3+ years production experience, bachelor's or equivalent, eligible for SOC 2136",
  },
  {
    occupation: "Civil / Structural Engineer",
    country: "Australia",
    countryCode: "australia",
    visaRoute: "TSS 482 / Core Skills",
    targetRole: "Infrastructure & Structural Design Lead",
    liveCount: 42,
    employersCount: 18,
    salaryBand: "AUD $95,000 – $135,000",
    sponsorshipAvailability: "Strong availability",
    qualificationCriteria: "Engineers Australia skills assessment, 3+ years design consulting experience",
  },
  {
    occupation: "Civil / Structural Engineer",
    country: "United Kingdom",
    countryCode: "uk",
    visaRoute: "Skilled Worker Visa",
    targetRole: "Senior Project / Bridge Engineer",
    liveCount: 48,
    employersCount: 21,
    salaryBand: "£48,000 – £75,000",
    sponsorshipAvailability: "Available",
    qualificationCriteria: "ICE / IStructE chartership track, infrastructure experience, SOC 2121",
  },
  {
    occupation: "Data Analyst & ML",
    country: "Canada",
    countryCode: "canada",
    visaRoute: "Global Talent Stream",
    targetRole: "Senior Data & Analytics Engineer",
    liveCount: 38,
    employersCount: 19,
    salaryBand: "CAD $95,000 – $130,000",
    sponsorshipAvailability: "Strong availability",
    qualificationCriteria: "2-week expedited processing under Category B high-skill list",
  },
  {
    occupation: "Healthcare Professional",
    country: "United Kingdom",
    countryCode: "uk",
    visaRoute: "Health and Care Worker Visa",
    targetRole: "Registered Specialist Nurse / Allied Health",
    liveCount: 56,
    employersCount: 28,
    salaryBand: "£32,000 – £48,000 (NHS Band 5–7)",
    sponsorshipAvailability: "Very strong availability",
    qualificationCriteria: "NMC registration pin, exempt from Immigration Health Surcharge",
  },
];

export const CareerRoutesNavigator: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const activeRoute = CAREER_ROUTES[selectedIndex];

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>International Career Pathways</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Explore Your International Career Path
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          See where your occupation is in demand, which employers are hiring and what salary ranges you can expect.
        </p>
      </div>

      {/* Occupation Selector Chips */}
      <div className="flex flex-wrap gap-2">
        {CAREER_ROUTES.map((route, idx) => (
          <button
            key={`${route.occupation}-${route.country}`}
            onClick={() => setSelectedIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedIndex === idx
                ? "bg-[#071522] text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>{route.occupation}</span>
            <span className="text-slate-400">→</span>
            <span className={selectedIndex === idx ? "text-[#19CBE0]" : "text-slate-500"}>
              {route.country}
            </span>
          </button>
        ))}
      </div>

      {/* Active Route Details */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Target Role */}
          <div className="space-y-1 col-span-2 md:col-span-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Role</div>
            <div className="text-sm font-extrabold text-slate-900 leading-snug">{activeRoute.targetRole}</div>
            <div className="text-xs text-slate-500">{activeRoute.occupation}</div>
          </div>

          {/* Job Market */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Job Market</div>
            <div className="text-xl font-black text-slate-900">
              {activeRoute.liveCount}
              <span className="text-sm font-semibold text-slate-500 ml-1">live jobs</span>
            </div>
          </div>

          {/* Verified Employers */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Verified Employers</div>
            <div className="text-xl font-black text-slate-900">
              {activeRoute.employersCount}
              <span className="text-sm font-semibold text-slate-500 ml-1">hiring</span>
            </div>
          </div>

          {/* Typical Salary */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Typical Salary</div>
            <div className="text-sm font-extrabold text-emerald-700">{activeRoute.salaryBand}</div>
          </div>
        </div>

        {/* Sponsorship + Visa + Eligibility row */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="font-semibold text-slate-700">Visa Route:</span>
              <span className="text-slate-600">{activeRoute.visaRoute} · {activeRoute.country}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Briefcase className="w-4 h-4 text-[#19CBE0] shrink-0" />
              <span className="font-semibold text-slate-700">Sponsorship:</span>
              <span className="text-emerald-600 font-bold">{activeRoute.sponsorshipAvailability}</span>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Eligibility: </strong>
              {activeRoute.qualificationCriteria}
            </div>
          </div>

          <div className="flex sm:justify-end items-end">
            <Link
              href={`/jobs/${activeRoute.countryCode}?q=${encodeURIComponent(activeRoute.occupation)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#071522] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
            >
              <span>Explore Matching Jobs</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#19CBE0]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
