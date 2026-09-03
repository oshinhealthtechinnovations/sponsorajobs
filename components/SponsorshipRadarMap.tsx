"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe2,
  ArrowRight,
  Building2,
  TrendingUp,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Award,
  Users,
  Clock,
  Coins,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  Briefcase
} from "lucide-react";

// Cross-platform HD SVG Flag Icons (crisp on every device)
const CountryFlags: Record<string, React.ReactNode> = {
  gb: (
    <svg viewBox="0 0 60 30" className="w-10 h-7 rounded-lg shadow-sm shrink-0 overflow-hidden border border-slate-200/80">
      <clipPath id="s_rm"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="t_rm"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#s_rm)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t_rm)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  ),
  us: (
    <svg viewBox="0 0 60 30" className="w-10 h-7 rounded-lg shadow-sm shrink-0 overflow-hidden border border-slate-200/80">
      <rect width="60" height="30" fill="#B22234" />
      <path d="M0,2.3h60M0,6.9h60M0,11.5h60M0,16.1h60M0,20.7h60M0,25.3h60" stroke="#fff" strokeWidth="2.3" />
      <rect width="24" height="16.1" fill="#3C3B6E" />
      <circle cx="12" cy="8" r="4" fill="#fff" opacity="0.95" />
    </svg>
  ),
  au: (
    <svg viewBox="0 0 60 30" className="w-10 h-7 rounded-lg shadow-sm shrink-0 overflow-hidden border border-slate-200/80">
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
    <svg viewBox="0 0 60 30" className="w-10 h-7 rounded-lg shadow-sm shrink-0 overflow-hidden border border-slate-200/80">
      <rect width="15" height="30" fill="#D80027" />
      <rect x="15" width="30" height="30" fill="#fff" />
      <rect x="45" width="15" height="30" fill="#D80027" />
      <path d="M30,7 L32,13 L38,12 L34,16 L37,21 L31,19 L30,23 L29,19 L23,21 L26,16 L22,12 L28,13 Z" fill="#D80027" />
    </svg>
  ),
  nz: (
    <svg viewBox="0 0 60 30" className="w-10 h-7 rounded-lg shadow-sm shrink-0 overflow-hidden border border-slate-200/80">
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

interface MarketInfo {
  code: "gb" | "us" | "au" | "ca" | "nz";
  slug: string;
  name: string;
  jobCount: number;
  visaRoute: string;
  visaTypeBadge: string;
  minSalary: string;
  avgSalary: string;
  salaryProgressPct: number;
  processingTime: string;
  prPathway: string;
  spousalRights: string;
  popular: string[];
  topSponsors: string[];
  trend: string;
  trendType: "fast-track" | "high-salary" | "direct-pr" | "in-demand";
  accentColor: {
    badge: string;
    borderHover: string;
    glow: string;
    pillBg: string;
    pillText: string;
    gradient: string;
    bar: string;
  };
}

const MARKET_DATA: MarketInfo[] = [
  {
    code: "gb",
    slug: "uk",
    name: "United Kingdom",
    jobCount: 2450,
    visaRoute: "Skilled Worker Visa (CoS)",
    visaTypeBadge: "Tier 2 CoS",
    minSalary: "£38,700 / yr",
    avgSalary: "£68,500 / yr",
    salaryProgressPct: 78,
    processingTime: "3 - 8 Weeks",
    prPathway: "5-Year ILR Route",
    spousalRights: "Full Work Rights",
    popular: ["Software", "Healthcare", "Civil Eng", "Finance"],
    topSponsors: ["NHS England", "Deloitte", "Mace Group", "Revolut"],
    trend: "Fast-Track CoS",
    trendType: "fast-track",
    accentColor: {
      badge: "bg-blue-600 text-white",
      borderHover: "hover:border-blue-400 hover:shadow-[0_20px_50px_rgba(37,99,235,0.12)]",
      glow: "from-blue-500/10 via-indigo-500/5 to-transparent",
      pillBg: "bg-blue-50 border-blue-200/80",
      pillText: "text-blue-800",
      gradient: "from-blue-600 to-indigo-700",
      bar: "bg-blue-600",
    },
  },
  {
    code: "us",
    slug: "usa",
    name: "United States",
    jobCount: 1850,
    visaRoute: "H-1B / O-1 / Cap-Exempt",
    visaTypeBadge: "H-1B & O-1",
    minSalary: "$85,000 / yr",
    avgSalary: "$145,000 / yr",
    salaryProgressPct: 95,
    processingTime: "15 Days (Prem.)",
    prPathway: "EB-2 / EB-3 Green Card",
    spousalRights: "H-4 EAD Eligible",
    popular: ["Tech & Cloud", "AI / ML", "Finance", "BioTech"],
    topSponsors: ["Google", "Microsoft", "Meta", "Amazon"],
    trend: "Highest Pay",
    trendType: "high-salary",
    accentColor: {
      badge: "bg-purple-600 text-white",
      borderHover: "hover:border-purple-400 hover:shadow-[0_20px_50px_rgba(147,51,234,0.12)]",
      glow: "from-purple-500/10 via-indigo-500/5 to-transparent",
      pillBg: "bg-purple-50 border-purple-200/80",
      pillText: "text-purple-800",
      gradient: "from-purple-600 to-indigo-800",
      bar: "bg-purple-600",
    },
  },
  {
    code: "au",
    slug: "australia",
    name: "Australia",
    jobCount: 1270,
    visaRoute: "TSS 482 / Core Skills",
    visaTypeBadge: "Subclass 482",
    minSalary: "AUD $73,150 / yr",
    avgSalary: "AUD $115,000 / yr",
    salaryProgressPct: 82,
    processingTime: "4 - 6 Weeks",
    prPathway: "Direct 2-Yr PR (186)",
    spousalRights: "Unrestricted Work",
    popular: ["Construction", "Mining", "Healthcare", "Tech"],
    topSponsors: ["Atlassian", "Rio Tinto", "Canva", "BHP"],
    trend: "Direct PR Route",
    trendType: "direct-pr",
    accentColor: {
      badge: "bg-teal-600 text-white",
      borderHover: "hover:border-teal-400 hover:shadow-[0_20px_50px_rgba(13,148,136,0.12)]",
      glow: "from-teal-500/10 via-emerald-500/5 to-transparent",
      pillBg: "bg-teal-50 border-teal-200/80",
      pillText: "text-teal-800",
      gradient: "from-teal-600 to-emerald-700",
      bar: "bg-teal-600",
    },
  },
  {
    code: "ca",
    slug: "canada",
    name: "Canada",
    jobCount: 980,
    visaRoute: "Global Talent Stream (LMIA)",
    visaTypeBadge: "2-Wk LMIA",
    minSalary: "CAD $65,000 / yr",
    avgSalary: "CAD $98,000 / yr",
    salaryProgressPct: 75,
    processingTime: "2 - 4 Weeks",
    prPathway: "Express Entry (+50 Pts)",
    spousalRights: "Open Spousal Permit",
    popular: ["Software", "Engineering", "Data & AI", "CleanTech"],
    topSponsors: ["Shopify", "RBC", "Scotiabank", "CGI"],
    trend: "Fast LMIA",
    trendType: "fast-track",
    accentColor: {
      badge: "bg-rose-600 text-white",
      borderHover: "hover:border-rose-400 hover:shadow-[0_20px_50px_rgba(225,29,72,0.12)]",
      glow: "from-rose-500/10 via-red-500/5 to-transparent",
      pillBg: "bg-rose-50 border-rose-200/80",
      pillText: "text-rose-800",
      gradient: "from-rose-600 to-red-700",
      bar: "bg-rose-600",
    },
  },
  {
    code: "nz",
    slug: "new-zealand",
    name: "New Zealand",
    jobCount: 420,
    visaRoute: "AEWV / Green List Tier 1",
    visaTypeBadge: "Green List Tier 1",
    minSalary: "NZD $61,690 / yr",
    avgSalary: "NZD $92,000 / yr",
    salaryProgressPct: 70,
    processingTime: "4 - 8 Weeks",
    prPathway: "Straight to Residence",
    spousalRights: "Full Partner Rights",
    popular: ["Civil Eng", "Healthcare", "Telecom", "Cloud"],
    topSponsors: ["Fonterra", "Xero", "Spark NZ", "Fulton Hogan"],
    trend: "Straight to PR",
    trendType: "direct-pr",
    accentColor: {
      badge: "bg-emerald-600 text-white",
      borderHover: "hover:border-emerald-400 hover:shadow-[0_20px_50px_rgba(5,150,105,0.12)]",
      glow: "from-emerald-500/10 via-teal-500/5 to-transparent",
      pillBg: "bg-emerald-50 border-emerald-200/80",
      pillText: "text-emerald-800",
      gradient: "from-emerald-600 to-teal-700",
      bar: "bg-emerald-600",
    },
  },
];

export const SponsorshipRadarMap: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "fast-track" | "high-salary" | "direct-pr">("all");
  const [viewMode, setViewMode] = useState<"cards" | "matrix">("cards");

  const filteredMarkets = useMemo(() => {
    if (activeFilter === "all") return MARKET_DATA;
    return MARKET_DATA.filter((m) => m.trendType === activeFilter);
  }, [activeFilter]);

  return (
    <div className="w-full relative">
      {/* Background Decorative Ambient Radial Glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full max-w-5xl h-64 bg-gradient-to-r from-sky-400/10 via-indigo-400/10 to-emerald-400/10 blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Main Container */}
      <div className="w-full space-y-8">
        {/* =========================================================================
            HEADER: Heroic Live Radar & Interactive View Controls
           ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div className="max-w-2xl space-y-3">
            {/* Live Radar Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-sky-200 shadow-xs text-sky-900 text-xs font-black tracking-wide">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <Globe2 className="w-3.5 h-3.5 text-sky-600" />
              <span>GLOBAL VISA SPONSORSHIP RADAR</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <span className="hidden sm:inline font-bold text-slate-600">6,900+ Verified Vacancies</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.1]">
              Explore Top Global <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Visa Sponsorship Hubs
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Real-time intelligence on statutory salary thresholds, fast-track processing times, and accredited employers hiring international talent right now.
            </p>
          </div>

          {/* Right Controls: Filter Pills + View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Pills */}
            <div className="p-1 rounded-2xl bg-slate-100/90 border border-slate-200/80 flex items-center gap-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeFilter === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Markets
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("fast-track")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === "fast-track"
                    ? "bg-white text-sky-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Fast-Track</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("high-salary")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === "high-salary"
                    ? "bg-white text-purple-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Coins className="w-3 h-3 text-purple-500" />
                <span>Top Salary</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("direct-pr")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === "direct-pr"
                    ? "bg-white text-emerald-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>PR Route</span>
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="p-1 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "cards"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "matrix"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Matrix</span>
              </button>
            </div>

            {/* All Country Hubs CTA */}
            <Link
              href="/countries"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-black shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer"
            >
              <span>Explore All Hubs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* =========================================================================
            VIEW 1: ULTRA-PREMIUM CARDS GRID
           ========================================================================= */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6">
            {filteredMarkets.map((market) => (
              <Link
                key={market.code}
                href={`/jobs/${market.slug}`}
                className={`group relative rounded-3xl bg-white border border-slate-200/90 ${market.accentColor.borderHover} hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl`}
              >
                {/* Top Ambient Glow Gradient */}
                <div
                  className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${market.accentColor.glow} pointer-events-none`}
                />

                {/* Top Accent Strip */}
                <div
                  className={`h-1.5 w-full bg-gradient-to-r ${market.accentColor.gradient}`}
                />

                <div className="p-5 sm:p-6 space-y-4 relative z-10 flex-1 flex flex-col justify-between">
                  {/* Row 1: Flag, Country Code, Fast-Track Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-0.5 rounded-xl bg-white shadow-xs border border-slate-100">
                        {CountryFlags[market.code]}
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          {market.code.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${market.accentColor.pillBg} ${market.accentColor.pillText} shadow-2xs border flex items-center gap-1`}>
                        {market.trendType === "fast-track" && <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />}
                        {market.trendType === "high-salary" && <Sparkles className="w-2.5 h-2.5 text-purple-600" />}
                        {market.trendType === "direct-pr" && <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />}
                        <span>{market.trend}</span>
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Country Name & Live Vacancy Count */}
                  <div>
                    <h3 className="text-lg font-black text-slate-950 group-hover:text-sky-600 tracking-tight transition-colors">
                      {market.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-black">
                        <Briefcase className="w-3 h-3 text-sky-600" />
                        <span>{market.jobCount.toLocaleString()}+</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        active vacancies
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Statutory Visa & Processing Intelligence Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2.5">
                    {/* Visa Scheme */}
                    <div>
                      <div className="text-[9px] uppercase font-black tracking-wider text-slate-400 flex items-center justify-between">
                        <span>Visa Scheme</span>
                        <span className="text-slate-500 font-bold">{market.processingTime}</span>
                      </div>
                      <div className="font-black text-slate-900 text-xs mt-0.5 truncate">
                        {market.visaRoute}
                      </div>
                    </div>

                    {/* Salary Benchmark Progress Bar */}
                    <div className="pt-2 border-t border-slate-200/70 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-500">Min Benchmark:</span>
                        <span className="font-black text-slate-900">{market.minSalary}</span>
                      </div>
                      {/* Visual Bar Gauge */}
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${market.accentColor.bar}`}
                          style={{ width: `${market.salaryProgressPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold pt-0.5">
                        <span>Legally Mandated</span>
                        <span>Avg: {market.avgSalary}</span>
                      </div>
                    </div>

                    {/* PR & Family Rights Strip */}
                    <div className="pt-2 border-t border-slate-200/70 grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex items-center gap-1 text-slate-700 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{market.prPathway}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-700 font-bold justify-end">
                        <Users className="w-3 h-3 text-sky-500 shrink-0" />
                        <span className="truncate">{market.spousalRights}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Top Sponsoring Employers */}
                  <div className="space-y-1.5">
                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>Verified Sponsoring Employers</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {market.topSponsors.slice(0, 3).map((sponsor) => (
                        <span
                          key={sponsor}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200/90 text-slate-700 font-bold shadow-2xs"
                        >
                          {sponsor}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Row 5: High-Demand Sectors */}
                  <div className="space-y-1.5">
                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      Top Sectors
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {market.popular.map((role) => (
                        <span
                          key={role}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 text-slate-700 font-semibold group-hover:border-sky-300 transition-colors"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-800 group-hover:text-sky-600 transition-colors">
                  <span>Browse {market.name}</span>
                  <div className="w-7 h-7 rounded-full bg-white group-hover:bg-sky-600 group-hover:text-white border border-slate-200 group-hover:border-sky-600 flex items-center justify-center transition-all shadow-2xs">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* =========================================================================
            VIEW 2: STATUTORY POLICY & SALARY MATRIX
           ========================================================================= */}
        {viewMode === "matrix" && (
          <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
                  <ShieldCheck className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-base font-black">Statutory Immigration & Visa Matrix (2026 Rules)</h3>
                  <p className="text-xs text-slate-300">Compare minimum legal wages, processing speeds, and residency rights side-by-side.</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 w-fit">
                ● Live Policy Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4 sm:px-6">Country & Hub</th>
                    <th className="py-3.5 px-4">Primary Work Visa</th>
                    <th className="py-3.5 px-4">Min Legal Benchmark</th>
                    <th className="py-3.5 px-4">Processing Speed</th>
                    <th className="py-3.5 px-4">Permanent Residency Route</th>
                    <th className="py-3.5 px-4">Spouse Work Rights</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMarkets.map((market) => (
                    <tr key={market.code} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">{CountryFlags[market.code]}</div>
                          <div>
                            <div className="font-black text-slate-900 text-sm">{market.name}</div>
                            <div className="text-[11px] text-slate-500 font-semibold">{market.jobCount.toLocaleString()} verified jobs</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-[11px] inline-block font-black">
                          {market.visaRoute}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-black text-emerald-700 text-sm">{market.minSalary}</div>
                        <div className="text-[10px] text-slate-400">Avg: {market.avgSalary}</div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{market.processingTime}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{market.prPathway}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-sky-500" />
                          <span>{market.spousalRights}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          href={`/jobs/${market.slug}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-black text-xs transition-colors shadow-2xs"
                        >
                          <span>Explore</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            BOTTOM TRUST BANNER: Global Relocation Intelligence
           ========================================================================= */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black">
                100% Verified Sponsor Licenses Across UK, USA, Australia, Canada & New Zealand
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                Every listed role is matched against Home Office, USCIS, Australian Home Affairs, and IRCC official employer registers.
              </div>
            </div>
          </div>

          <Link
            href="/countries"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-sky-50 text-slate-900 text-xs font-black transition-all shrink-0 cursor-pointer shadow-sm"
          >
            <span>Compare Country Guides</span>
            <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
          </Link>
        </div>
      </div>
    </div>
  );
};
