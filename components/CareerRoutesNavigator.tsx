"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Building2,
  Banknote,
  Briefcase,
  Layers,
  ChevronRight,
} from "lucide-react";

interface RouteDefinition {
  occupation: string;
  country: string;
  countryCode: string;
  visaRoute: string;
  targetRole: string;
  liveCount: number;
  employersCount: number;
  salaryBand: string;
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
    qualificationCriteria: "3+ years production experience, bachelor's or equivalent, eligible for SOC 2136",
  },
  {
    occupation: "Civil / Structural Engineer",
    country: "Australia",
    countryCode: "australia",
    visaRoute: "Subclass 482 / Core Skills",
    targetRole: "Infrastructure & Structural Design Lead",
    liveCount: 42,
    employersCount: 18,
    salaryBand: "AUD $95,000 – $135,000",
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
    qualificationCriteria: "ICE / IStructE chartership track, infrastructure experience, SOC 2121",
  },
  {
    occupation: "Data Analyst & ML",
    country: "Canada",
    countryCode: "canada",
    visaRoute: "Global Talent Stream (LMIA-exempt)",
    targetRole: "Senior Data & Analytics Engineer",
    liveCount: 38,
    employersCount: 19,
    salaryBand: "CAD $95,000 – $130,000",
    qualificationCriteria: "2-week expedited work permit processing under Category B high-skill list",
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
    qualificationCriteria: "NMC registration pin, exempt from Immigration Health Surcharge",
  },
];

export const CareerRoutesNavigator: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const activeRoute = CAREER_ROUTES[selectedIndex];

  return (
    <div className="w-full rounded-3xl bg-slate-50 border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>International Career Pathways</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Explore Your International Career Path
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Select an occupation to see common visa routes and salary expectations.
        </p>
      </div>

      {/* Occupation Pathway Selector Chips */}
      <div className="flex flex-wrap gap-2">
        {CAREER_ROUTES.map((route, idx) => (
          <button
            key={`${route.occupation}-${route.country}`}
            onClick={() => setSelectedIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              selectedIndex === idx
                ? "bg-[#071421] text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>{route.occupation}</span>
            <span className="text-slate-400">&rarr;</span>
            <span className={selectedIndex === idx ? "text-[#18D6E5]" : "text-slate-500"}>
              {route.country}
            </span>
          </button>
        ))}
      </div>

      {/* Visual Journey Stepper (Desktop Horizontal, Mobile Vertical) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1: Target Profile & Role */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">01 Target Role</div>
            <div className="text-base font-extrabold text-slate-900">{activeRoute.targetRole}</div>
            <div className="text-xs text-slate-500">{activeRoute.occupation}</div>
          </div>

          {/* Step 2: Statutory Visa Route */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-brand-600">02 Visa Route</div>
            <div className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{activeRoute.visaRoute}</span>
            </div>
            <div className="text-xs text-slate-500">{activeRoute.country}</div>
          </div>

          {/* Step 3: Verified Market Depth */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">03 Market Depth</div>
            <div className="text-base font-extrabold text-slate-900">
              <strong className="text-brand-600 font-black">{activeRoute.liveCount}</strong> Live Vacancies
            </div>
            <div className="text-xs text-slate-500">{activeRoute.employersCount} verified sponsor employers</div>
          </div>

          {/* Step 4: Indicative Salary Band */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">04 Salary Benchmark</div>
            <div className="text-base font-extrabold text-emerald-700">{activeRoute.salaryBand}</div>
            <div className="text-xs text-slate-500">Above statutory requirement</div>
          </div>
        </div>

        {/* Qualification Criteria Callout */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-600 max-w-xl">
            <strong className="text-slate-900 font-bold">Eligibility Profile: </strong>
            {activeRoute.qualificationCriteria}
          </div>
          <Link
            href={`/jobs/${activeRoute.countryCode}?q=${encodeURIComponent(activeRoute.occupation)}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#071421] hover:bg-[#0D1B2A] text-white text-xs font-bold transition-all shadow-sm shrink-0"
          >
            <span>Explore This Route</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#18D6E5]" />
          </Link>
        </div>
      </div>
    </div>
  );
};
