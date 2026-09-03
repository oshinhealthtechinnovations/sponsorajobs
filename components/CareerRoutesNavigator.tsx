"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  ShieldCheck,
  Code2,
  HardHat,
  BarChart3,
  Stethoscope,
  Building2,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  DollarSign,
  Briefcase,
} from "lucide-react";

// Cross-platform SVG Flags
const Flags: Record<string, React.ReactNode> = {
  gb: (
    <svg viewBox="0 0 60 30" className="w-5 h-3.5 rounded-xs shrink-0 overflow-hidden shadow-2xs">
      <clipPath id="f_gb"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="f_gbt"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#f_gb)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#f_gbt)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  ),
  au: (
    <svg viewBox="0 0 60 30" className="w-5 h-3.5 rounded-xs shrink-0 overflow-hidden shadow-2xs">
      <rect width="60" height="30" fill="#00008B" />
      <circle cx="45" cy="8" r="2" fill="#fff" />
      <circle cx="50" cy="14" r="1.5" fill="#fff" />
      <circle cx="42" cy="18" r="2" fill="#fff" />
      <circle cx="48" cy="24" r="2" fill="#fff" />
    </svg>
  ),
  ca: (
    <svg viewBox="0 0 60 30" className="w-5 h-3.5 rounded-xs shrink-0 overflow-hidden shadow-2xs">
      <rect width="15" height="30" fill="#D80027" />
      <rect x="15" width="30" height="30" fill="#fff" />
      <rect x="45" width="15" height="30" fill="#D80027" />
      <path d="M30,7 L32,13 L38,12 L34,16 L37,21 L31,19 L30,23 L29,19 L23,21 L26,16 L22,12 L28,13 Z" fill="#D80027" />
    </svg>
  ),
  us: (
    <svg viewBox="0 0 60 30" className="w-5 h-3.5 rounded-xs shrink-0 overflow-hidden shadow-2xs">
      <rect width="60" height="30" fill="#B22234" />
      <path d="M0,4.6h60 M0,9.2h60 M0,13.8h60 M0,18.4h60 M0,23h60 M0,27.6h60" stroke="#fff" strokeWidth="2.3" />
      <rect width="24" height="16.1" fill="#3C3B6E" />
    </svg>
  ),
};

interface RouteDefinition {
  id: string;
  occupation: string;
  categoryIcon: React.ReactNode;
  country: string;
  countryCode: string;
  flagKey: string;
  visaRoute: string;
  targetRole: string;
  socCode: string;
  liveCount: number;
  employersCount: number;
  sampleEmployers: string[];
  salaryBand: string;
  monthlyBand: string;
  sponsorshipAvailability: string;
  qualificationCriteria: string[];
  tag: string;
}

const CAREER_ROUTES: RouteDefinition[] = [
  {
    id: "swe-uk",
    occupation: "Software & Cloud Engineer",
    categoryIcon: <Code2 className="w-4 h-4" />,
    country: "United Kingdom",
    countryCode: "uk",
    flagKey: "gb",
    visaRoute: "Skilled Worker Visa (CoS)",
    targetRole: "Senior / Lead Full Stack Engineer",
    socCode: "SOC 2136 · High Demand",
    liveCount: 47,
    employersCount: 23,
    sampleEmployers: ["Monzo Bank", "Mace", "Google", "Revolut"],
    salaryBand: "£65,000 – £95,000",
    monthlyBand: "£5,400 – £7,900 / mo",
    sponsorshipAvailability: "Home Office Licensed Employers",
    qualificationCriteria: [
      "3+ years verified production software development experience",
      "Bachelor's degree in STEM or equivalent professional portfolio",
      "Qualifies under UK standard skilled worker salary threshold (£38,700)",
    ],
    tag: "High Sponsor Quota",
  },
  {
    id: "civil-au",
    occupation: "Civil & Structural Engineer",
    categoryIcon: <HardHat className="w-4 h-4" />,
    country: "Australia",
    countryCode: "australia",
    flagKey: "au",
    visaRoute: "TSS 482 / Core Skills Pathway",
    targetRole: "Infrastructure & Structural Design Lead",
    socCode: "ANZSCO 233211 · Priority MLTSSL",
    liveCount: 42,
    employersCount: 18,
    sampleEmployers: ["Arup", "AECOM", "WSP Global", "GHD"],
    salaryBand: "AUD $95,000 – $135,000",
    monthlyBand: "AUD $7,900 – $11,250 / mo",
    sponsorshipAvailability: "Priority Processing Available",
    qualificationCriteria: [
      "Engineers Australia CDR / Washington Accord accreditation",
      "3+ years infrastructure or structural engineering consulting background",
      "Eligible for PR transition via Subclass 186 Employer Nomination",
    ],
    tag: "Priority Skills List",
  },
  {
    id: "structural-uk",
    occupation: "Civil & Infrastructure",
    categoryIcon: <Building2 className="w-4 h-4" />,
    country: "United Kingdom",
    countryCode: "uk",
    flagKey: "gb",
    visaRoute: "Skilled Worker Visa (CoS)",
    targetRole: "Senior Project & Structural Engineer",
    socCode: "SOC 2121 · Shortage Occupation",
    liveCount: 48,
    employersCount: 21,
    sampleEmployers: ["Mace Group", "Balfour Beatty", "AtkinsRéalis"],
    salaryBand: "£48,000 – £75,000",
    monthlyBand: "£4,000 – £6,250 / mo",
    sponsorshipAvailability: "Direct Tier 2 CoS Allocation",
    qualificationCriteria: [
      "ICE / IStructE chartership track or MEng equivalent qualification",
      "Infrastructure, bridge, or major commercial construction portfolio",
      "Exceeds Home Office Skilled Worker minimum salary benchmark",
    ],
    tag: "Verified Tier 2 Sponsors",
  },
  {
    id: "data-ca",
    occupation: "Data & Machine Learning",
    categoryIcon: <BarChart3 className="w-4 h-4" />,
    country: "Canada",
    countryCode: "canada",
    flagKey: "ca",
    visaRoute: "Global Talent Stream (GTS)",
    targetRole: "Senior Data & Analytics Engineer",
    socCode: "NOC 21211 (Category B)",
    liveCount: 38,
    employersCount: 19,
    sampleEmployers: ["Shopify", "RBC", "Kinaxis", "OpenText"],
    salaryBand: "CAD $95,000 – $130,000",
    monthlyBand: "CAD $7,900 – $10,800 / mo",
    sponsorshipAvailability: "Expedited 2-Week Permit Processing",
    qualificationCriteria: [
      "2-week work permit processing under Global Talent Stream",
      "Proficiency in SQL, Python, distributed ETL & cloud platforms",
      "LMIA expedited employer pathway eligibility",
    ],
    tag: "2-Week Fast Track",
  },
  {
    id: "health-uk",
    occupation: "Healthcare & Nursing",
    categoryIcon: <Stethoscope className="w-4 h-4" />,
    country: "United Kingdom",
    countryCode: "uk",
    flagKey: "gb",
    visaRoute: "Health & Care Worker Visa",
    targetRole: "Specialist Registered Nurse / Clinical Lead",
    socCode: "SOC 2231 · NHS Band 5–7",
    liveCount: 56,
    employersCount: 28,
    sampleEmployers: ["NHS Trusts", "Bupa Global", "Spire Healthcare"],
    salaryBand: "£34,000 – £52,000",
    monthlyBand: "NHS National Agenda for Change",
    sponsorshipAvailability: "Dedicated Priority Fast-Track",
    qualificationCriteria: [
      "NMC or HCPC professional registration / CBT verification completed",
      "100% Exempt from Immigration Health Surcharge (£1,035/yr savings)",
      "Dedicated Home Office visa decision turnaround within 3 weeks",
    ],
    tag: "No IHS Surcharge",
  },
];

export const CareerRoutesNavigator: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const activeRoute = CAREER_ROUTES[selectedIndex];

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.04)] space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>Global Career Pathways</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Explore Your International Career Path
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Compare live employer demand, verified salary benchmarks, and visa requirements across top international destinations.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Interactive Pathway Explorer</span>
        </div>
      </div>

      {/* Interactive Pathway Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {CAREER_ROUTES.map((route, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={route.id}
              onClick={() => setSelectedIndex(idx)}
              className={`p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 border ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-sky-400/30 scale-[1.02]"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-2xs hover:border-sky-200"
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className={`p-1.5 rounded-lg ${isSelected ? "bg-white/15 text-sky-300" : "bg-sky-50 text-sky-700"}`}>
                  {route.categoryIcon}
                </div>
                <div className="flex items-center gap-1.5">
                  {Flags[route.flagKey]}
                  <span className={`text-[11px] font-bold ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    {route.country}
                  </span>
                </div>
              </div>

              <div>
                <div className={`text-xs font-black leading-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                  {route.occupation}
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className={isSelected ? "text-sky-300 font-bold" : "text-emerald-700 font-bold"}>
                    {route.liveCount} live roles
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                    {route.tag}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Route Deep-Dive Dashboard */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-50/80 via-white to-sky-50/20 border border-slate-200/90 shadow-2xs space-y-6">
        
        {/* Visa Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              {Flags[activeRoute.flagKey]}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">
                Official Visa Category · {activeRoute.country}
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>{activeRoute.visaRoute}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  {activeRoute.sponsorshipAvailability}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{activeRoute.socCode}</span>
          </div>
        </div>

        {/* 4 Key Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Tile 1: Role Profile */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 text-sky-600" />
              <span>Target Role</span>
            </div>
            <div className="text-sm font-black text-slate-900 leading-snug">
              {activeRoute.targetRole}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Verified Sponsor Quota Approved
            </div>
          </div>

          {/* Tile 2: Live Vacancies */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3" />
              <span>Live Job Demand</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">{activeRoute.liveCount}</span>
              <span className="text-xs font-bold text-emerald-600">Active Openings</span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Direct employer applications</div>
          </div>

          {/* Tile 3: Hiring Sponsors */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <Building2 className="w-3 h-3" />
              <span>Hiring Employers</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-slate-900">{activeRoute.employersCount}</span>
              <span className="text-xs font-bold text-slate-600">Licensed Sponsors</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {activeRoute.sampleEmployers.slice(0, 3).map((emp) => (
                <span key={emp} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                  {emp}
                </span>
              ))}
            </div>
          </div>

          {/* Tile 4: Typical Salary */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <DollarSign className="w-3 h-3" />
              <span>Indicative Salary</span>
            </div>
            <div className="text-base font-black text-emerald-700 leading-snug">
              {activeRoute.salaryBand}
            </div>
            <div className="text-[11px] font-semibold text-slate-500">{activeRoute.monthlyBand}</div>
          </div>
        </div>

        {/* Bottom Detailed Info & Action Bar */}
        <div className="pt-5 border-t border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Eligibility Checklist */}
          <div className="lg:col-span-8 space-y-2.5">
            <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Standard Visa Eligibility Criteria</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeRoute.qualificationCriteria.map((crit, cIdx) => (
                <div key={cIdx} className="flex items-start gap-2 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{crit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <Link
              href={`/jobs/${activeRoute.countryCode}?q=${encodeURIComponent(activeRoute.occupation.split('&')[0].trim())}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-sky-700 hover:from-sky-700 hover:to-cyan-700 text-white font-black text-sm tracking-tight transition-all duration-200 shadow-md hover:shadow-lg group cursor-pointer"
            >
              <span>Explore {activeRoute.liveCount} Matching Jobs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/tools/ats-checker"
              className="text-center text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
            >
              Check your CV match against this pathway →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
