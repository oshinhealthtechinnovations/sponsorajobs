"use client";

import React from "react";
import Link from "next/link";
import { Globe2, ArrowRight, Building2, TrendingUp, CheckCircle2 } from "lucide-react";

// Cross-platform SVG Flag Icons (renders flawlessly on Windows, Mac, iOS, Android)
const CountryFlags: Record<string, React.ReactNode> = {
  gb: (
    <svg viewBox="0 0 60 30" className="w-9 h-6 rounded-md shadow-xs shrink-0 overflow-hidden">
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z"/>
      </clipPath>
      <clipPath id="t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
      </clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  ),
  us: (
    <svg viewBox="0 0 60 30" className="w-9 h-6 rounded-md shadow-xs shrink-0 overflow-hidden">
      <rect width="60" height="30" fill="#B22234" />
      <path d="M0,2.3h60M0,6.9h60M0,11.5h60M0,16.1h60M0,20.7h60M0,25.3h60" stroke="#fff" strokeWidth="2.3" />
      <rect width="24" height="16.1" fill="#3C3B6E" />
      <circle cx="12" cy="8" r="4" fill="#fff" opacity="0.9" />
    </svg>
  ),
  au: (
    <svg viewBox="0 0 60 30" className="w-9 h-6 rounded-md shadow-xs shrink-0 overflow-hidden">
      <rect width="60" height="30" fill="#00008B" />
      <g transform="scale(0.5)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
      <circle cx="45" cy="8" r="2" fill="#fff" />
      <circle cx="50" cy="14" r="1.5" fill="#fff" />
      <circle cx="42" cy="18" r="2" fill="#fff" />
      <circle cx="48" cy="24" r="2" fill="#fff" />
    </svg>
  ),
  ca: (
    <svg viewBox="0 0 60 30" className="w-9 h-6 rounded-md shadow-xs shrink-0 overflow-hidden">
      <rect width="15" height="30" fill="#D80027" />
      <rect x="15" width="30" height="30" fill="#fff" />
      <rect x="45" width="15" height="30" fill="#D80027" />
      <path d="M30,7 L32,13 L38,12 L34,16 L37,21 L31,19 L30,23 L29,19 L23,21 L26,16 L22,12 L28,13 Z" fill="#D80027" />
    </svg>
  ),
  nz: (
    <svg viewBox="0 0 60 30" className="w-9 h-6 rounded-md shadow-xs shrink-0 overflow-hidden">
      <rect width="60" height="30" fill="#00247D" />
      <g transform="scale(0.5)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
      <circle cx="45" cy="7" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="50" cy="13" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="42" cy="18" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="47" cy="24" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
    </svg>
  ),
};

const MARKET_DATA = [
  {
    code: "gb",
    slug: "uk",
    name: "United Kingdom",
    jobCount: 214,
    visaRoute: "Skilled Worker Visa (CoS)",
    minSalary: "£38,700 / yr",
    popular: ["Software", "Healthcare", "Civil Eng"],
    trend: "High Demand",
    hiringRate: "94% Active",
  },
  {
    code: "us",
    slug: "usa",
    name: "United States",
    jobCount: 183,
    visaRoute: "H-1B / O-1 / Specialty",
    minSalary: "$85,000 / yr",
    popular: ["Tech & Cloud", "Finance", "AI / ML"],
    trend: "Active Hiring",
    hiringRate: "91% Active",
  },
  {
    code: "au",
    slug: "australia",
    name: "Australia",
    jobCount: 127,
    visaRoute: "TSS 482 / Core Skills",
    minSalary: "AUD $73,150 / yr",
    popular: ["Construction", "Mining", "Health"],
    trend: "Fast Track",
    hiringRate: "96% Active",
  },
  {
    code: "ca",
    slug: "canada",
    name: "Canada",
    jobCount: 96,
    visaRoute: "Global Talent Stream (LMIA)",
    minSalary: "CAD $65,000 / yr",
    popular: ["Software", "Engineering", "Data"],
    trend: "Active Hiring",
    hiringRate: "89% Active",
  },
  {
    code: "nz",
    slug: "new-zealand",
    name: "New Zealand",
    jobCount: 38,
    visaRoute: "AEWV / Green List Tier 1",
    minSalary: "NZD $61,690 / yr",
    popular: ["Engineering", "Health", "Telecom"],
    trend: "Growing",
    hiringRate: "92% Active",
  },
];

export const SponsorshipRadarMap: React.FC = () => {
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#19CBE0]/10 border border-[#19CBE0]/30 text-[#087F8C] text-xs font-bold uppercase tracking-wider">
            <Globe2 className="w-3.5 h-3.5 text-[#19CBE0]" />
            <span>International Markets</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Explore International Job Markets
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Live verified opportunities with official sponsorship signals across leading global destinations.
          </p>
        </div>

        <Link
          href="/countries"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#071522] transition-colors shrink-0"
        >
          <span>All Country Hubs</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#19CBE0]" />
        </Link>
      </div>

      {/* Country Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        {MARKET_DATA.map((market) => (
          <Link
            key={market.code}
            href={`/jobs/${market.slug}`}
            className="group relative p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-[#19CBE0] hover:shadow-[0_15px_35px_rgba(15,23,42,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* Top Hover Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#19CBE0] to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="space-y-4">
              {/* Header: Flag + Trend */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {CountryFlags[market.code]}
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {market.code.toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {market.trend}
                </span>
              </div>

              {/* Country Name & Job Count */}
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#071522] tracking-tight">
                  {market.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black text-[#071522]">
                    {market.jobCount}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    verified vacancies
                  </span>
                </div>
              </div>

              {/* Key Indicators */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Route:</span>
                  <span className="font-semibold truncate max-w-[130px]">{market.visaRoute.split(" (")[0]}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Benchmark:</span>
                  <span className="font-bold text-emerald-700">{market.minSalary}</span>
                </div>
              </div>

              {/* In-Demand Sectors */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Top Sectors
                </span>
                <div className="flex flex-wrap gap-1">
                  {market.popular.map((role) => (
                    <span
                      key={role}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium group-hover:bg-slate-200/70 transition-colors"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Clean Action Pill */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 group-hover:text-[#087F8C] transition-colors">
              <span>View {market.name}</span>
              <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-[#19CBE0]/10 flex items-center justify-center transition-colors">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 text-slate-600 group-hover:text-[#087F8C] transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
