"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  ShieldCheck,
  Banknote,
  Users,
  Briefcase,
  Code2,
  HardHat,
  BarChart3,
  Stethoscope,
  Building2,
  CheckCircle2,
  Sparkles,
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
}

const CAREER_ROUTES: RouteDefinition[] = [
  {
    id: "swe-uk",
    occupation: "Software Engineer",
    categoryIcon: <Code2 className="w-4 h-4" />,
    country: "United Kingdom",
    countryCode: "uk",
    flagKey: "gb",
    visaRoute: "Skilled Worker Visa (CoS)",
    targetRole: "Senior / Lead Full Stack Engineer",
    socCode: "SOC 2136 / High Demand",
    liveCount: 47,
    employersCount: 23,
    sampleEmployers: ["Monzo Bank", "Mace", "Google", "Revolut"],
    salaryBand: "£65,000 – £95,000",
    monthlyBand: "£5,400 – £7,900 / mo",
    sponsorshipAvailability: "High (Licensed Employers)",
    qualificationCriteria: [
      "3+ years production software development experience",
      "Bachelor's degree in STEM or equivalent professional record",
      "Qualifies under UK standard salary threshold (£38,700)",
    ],
  },
  {
    id: "civil-au",
    occupation: "Civil & Infrastructure",
    categoryIcon: <HardHat className="w-4 h-4" />,
    country: "Australia",
    countryCode: "australia",
    flagKey: "au",
    visaRoute: "TSS 482 / Core Skills Visa",
    targetRole: "Infrastructure & Structural Design Lead",
    socCode: "ANZSCO 233211",
    liveCount: 42,
    employersCount: 18,
    sampleEmployers: ["Arup", "AECOM", "WSP Global", "GHD"],
    salaryBand: "AUD $95,000 – $135,000",
    monthlyBand: "AUD $7,900 – $11,250 / mo",
    sponsorshipAvailability: "Very Strong Demand",
    qualificationCriteria: [
      "Engineers Australia CDR / Washington Accord assessment",
      "3+ years infrastructure or structural consulting background",
      "Eligible for Core Skills Occupation Pathway",
    ],
  },
  {
    id: "structural-uk",
    occupation: "Civil / Structural Engineer",
    categoryIcon: <Building2 className="w-4 h-4" />,
    country: "United Kingdom",
    countryCode: "uk",
    flagKey: "gb",
    visaRoute: "Skilled Worker Visa (CoS)",
    targetRole: "Senior Project & Structural Engineer",
    socCode: "SOC 2121 / Shortage List",
    liveCount: 48,
    employersCount: 21,
    sampleEmployers: ["Mace Group", "Balfour Beatty", "AtkinsRéalis"],
    salaryBand: "£48,000 – £75,000",
    monthlyBand: "£4,000 – £6,250 / mo",
    sponsorshipAvailability: "Approved Sponsor Quotas",
    qualificationCriteria: [
      "ICE or IStructE chartership track or MEng equivalent",
      "Bridge, highway, or commercial structure project portfolio",
      "Exceeds minimum Home Office skilled worker benchmark",
    ],
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
    sponsorshipAvailability: "Expedited 2-Week Processing",
    qualificationCriteria: [
      "2-week work permit processing under Global Talent Stream",
      "Proficiency in SQL, Python, distributed ETL & cloud platforms",
      "LMIA expedited employer pathway eligibility",
    ],
  },
  {
    id: "health-uk",
    occupation: "Healthcare & Clinical",
    categoryIcon: <Stethoscope className="w-4 h-4" />,
    country: "United Kingdom",
    countryCode: "uk",
    flagKey: "gb",
    visaRoute: "Health & Care Worker Visa",
    targetRole: "Specialist Registered Nurse / Allied Health",
    socCode: "SOC 2231 / NHS Band 5–7",
    liveCount: 56,
    employersCount: 28,
    sampleEmployers: ["NHS Trusts", "Bupa Global", "Spire Healthcare"],
    salaryBand: "£32,000 – £48,000",
    monthlyBand: "NHS National Agenda for Change",
    sponsorshipAvailability: "Priority Fast-Track Visa",
    qualificationCriteria: [
      "NMC or HCPC professional registration / CBT completed",
      "Exempt from Immigration Health Surcharge (£1,035/yr savings)",
      "Dedicated fast-track processing within 3 weeks",
    ],
  },
];

export const CareerRoutesNavigator: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const activeRoute = CAREER_ROUTES[selectedIndex];

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Career Pathways</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Explore Your International Career Path
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Compare live employer demand, verified salary benchmarks, and visa requirements across top destinations.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500 hidden sm:block">
          Select an occupation below to inspect pathway metrics
        </div>
      </div>

      {/* Modern Occupation Selector Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        {CAREER_ROUTES.map((route, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={route.id}
              onClick={() => setSelectedIndex(idx)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2.5 ${
                isSelected
                  ? "bg-[#071522] text-white shadow-md scale-[1.02]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              <span className={isSelected ? "text-[#19CBE0]" : "text-slate-500"}>
                {route.categoryIcon}
              </span>
              <span>{route.occupation}</span>
              <span className="text-slate-400">·</span>
              <div className="flex items-center gap-1.5">
                {Flags[route.flagKey]}
                <span className={isSelected ? "text-slate-200" : "text-slate-600"}>
                  {route.country}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Rich Interactive Route Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-50 via-white to-slate-50/50 border border-slate-200/90 shadow-sm space-y-6">
        {/* Top 4 Key Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile 1: Role Profile */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Target Role
            </div>
            <div className="text-sm font-extrabold text-slate-900 leading-snug">
              {activeRoute.targetRole}
            </div>
            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
              {activeRoute.socCode}
            </span>
          </div>

          {/* Tile 2: Live Vacancies */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Live Job Demand
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{activeRoute.liveCount}</span>
              <span className="text-xs font-bold text-emerald-600">Active Roles</span>
            </div>
            <div className="text-[11px] text-slate-500">Verified direct employer posts</div>
          </div>

          {/* Tile 3: Hiring Sponsors */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              Verified Employers
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{activeRoute.employersCount}</span>
              <span className="text-xs font-bold text-slate-600">Hiring Sponsors</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              e.g. {activeRoute.sampleEmployers.slice(0, 2).join(", ")}
            </div>
          </div>

          {/* Tile 4: Typical Salary */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Indicative Salary
            </div>
            <div className="text-sm font-extrabold text-emerald-700">
              {activeRoute.salaryBand}
            </div>
            <div className="text-[10px] font-semibold text-slate-500">{activeRoute.monthlyBand}</div>
          </div>
        </div>

        {/* Bottom Detailed Info & Action Bar */}
        <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Eligibility Checklist */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-800">Visa Pathway:</span>
              <span className="text-slate-700 font-medium">
                {activeRoute.visaRoute} · {activeRoute.country}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                {activeRoute.sponsorshipAvailability}
              </span>
            </div>

            <div className="space-y-1.5">
              {activeRoute.qualificationCriteria.map((crit, cIdx) => (
                <div key={cIdx} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#19CBE0] shrink-0 mt-0.5" />
                  <span>{crit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="lg:col-span-4 flex lg:justify-end">
            <Link
              href={`/jobs/${activeRoute.countryCode}?q=${encodeURIComponent(activeRoute.occupation)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#071522] hover:bg-slate-800 text-white font-bold text-xs sm:text-sm tracking-tight transition-all duration-200 shadow-md hover:shadow-lg group"
            >
              <span>Explore {activeRoute.liveCount} Matching Jobs</span>
              <ArrowRight className="w-4 h-4 text-[#19CBE0] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
