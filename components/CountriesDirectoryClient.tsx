"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Filter,
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  HelpCircle,
  Calculator,
  FileCheck2,
  Coins,
  ChevronRight
} from "lucide-react";

// Cross-platform HD SVG Flags
export const CountryFlags: Record<string, React.ReactNode> = {
  gb: (
    <svg viewBox="0 0 60 30" className="w-12 h-8 rounded-xl shadow-md shrink-0 overflow-hidden border border-slate-200/80">
      <clipPath id="cd_gb_c"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="cd_gbt_c"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#cd_gb_c)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#cd_gbt_c)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  ),
  us: (
    <svg viewBox="0 0 60 30" className="w-12 h-8 rounded-xl shadow-md shrink-0 overflow-hidden border border-slate-200/80">
      <rect width="60" height="30" fill="#B22234" />
      <path d="M0,2.3h60M0,6.9h60M0,11.5h60M0,16.1h60M0,20.7h60M0,25.3h60" stroke="#fff" strokeWidth="2.3" />
      <rect width="24" height="16.1" fill="#3C3B6E" />
      <circle cx="12" cy="8" r="4" fill="#fff" opacity="0.95" />
    </svg>
  ),
  au: (
    <svg viewBox="0 0 60 30" className="w-12 h-8 rounded-xl shadow-md shrink-0 overflow-hidden border border-slate-200/80">
      <rect width="60" height="30" fill="#00008B" />
      <circle cx="45" cy="8" r="2" fill="#fff" />
      <circle cx="50" cy="14" r="1.5" fill="#fff" />
      <circle cx="42" cy="18" r="2" fill="#fff" />
      <circle cx="48" cy="24" r="2" fill="#fff" />
      <path d="M12,6 L14,12 L20,12 L15,16 L17,22 L12,18 L7,22 L9,16 L4,12 L10,12 Z" fill="#fff" />
    </svg>
  ),
  ca: (
    <svg viewBox="0 0 60 30" className="w-12 h-8 rounded-xl shadow-md shrink-0 overflow-hidden border border-slate-200/80">
      <rect width="15" height="30" fill="#D80027" />
      <rect x="15" width="30" height="30" fill="#fff" />
      <rect x="45" width="15" height="30" fill="#D80027" />
      <path d="M30,6 L32,12 L38,11 L34,16 L37,21 L31,19 L30,24 L29,19 L23,21 L26,16 L22,11 L28,12 Z" fill="#D80027" />
    </svg>
  ),
  nz: (
    <svg viewBox="0 0 60 30" className="w-12 h-8 rounded-xl shadow-md shrink-0 overflow-hidden border border-slate-200/80">
      <rect width="60" height="30" fill="#00247D" />
      <circle cx="45" cy="7" r="2" fill="#C8102E" stroke="#fff" strokeWidth="0.8" />
      <circle cx="50" cy="13" r="2" fill="#C8102E" stroke="#fff" strokeWidth="0.8" />
      <circle cx="42" cy="18" r="2" fill="#C8102E" stroke="#fff" strokeWidth="0.8" />
      <circle cx="47" cy="24" r="2" fill="#C8102E" stroke="#fff" strokeWidth="0.8" />
    </svg>
  ),
  remote: (
    <svg viewBox="0 0 60 30" className="w-12 h-8 rounded-xl shadow-md shrink-0 overflow-hidden border border-slate-200/80 bg-gradient-to-br from-indigo-900 to-sky-700">
      <circle cx="30" cy="15" r="10" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
      <path d="M20,15 H40 M30,5 V25" stroke="#38BDF8" strokeWidth="1.2" />
      <ellipse cx="30" cy="15" rx="5" ry="10" stroke="#38BDF8" strokeWidth="1" fill="none" />
    </svg>
  ),
};

export interface CountryItem {
  code: string;
  name: string;
  slug: string;
  flag: string;
  currency: string;
  count: number;
  seoDescription: string;
  popularCities: string[];
  region: "europe" | "north-america" | "apac" | "remote";
  primaryVisa: string;
  minSalary: string;
  processingTime: string;
  spousalRights: string;
  prPathway: string;
  topSectors: { label: string; slug: string }[];
  highlightTag: string;
}

const EXTENDED_COUNTRIES: CountryItem[] = [
  {
    code: "GB",
    name: "United Kingdom",
    slug: "uk",
    flag: "🇬🇧",
    currency: "GBP (£)",
    count: 2450,
    seoDescription: "Discover verified UK jobs offering Skilled Worker visa sponsorship and Certificate of Sponsorship (CoS) support across London, Manchester, and Birmingham.",
    popularCities: ["London", "Manchester", "Birmingham", "Edinburgh", "Leeds", "Bristol"],
    region: "europe",
    primaryVisa: "Skilled Worker Visa (Tier 2 CoS)",
    minSalary: "£38,700 / yr (or Going Rate)",
    processingTime: "3 - 8 Weeks (Fast-Track)",
    spousalRights: "Full Partner Work Rights",
    prPathway: "5 Years to ILR / Citizenship",
    topSectors: [
      { label: "Engineering", slug: "engineering" },
      { label: "Technology", slug: "information-technology" },
      { label: "Healthcare", slug: "healthcare" },
      { label: "Construction", slug: "construction" },
    ],
    highlightTag: "Home Office A-Rated Registry",
  },
  {
    code: "US",
    name: "United States",
    slug: "usa",
    flag: "🇺🇸",
    currency: "USD ($)",
    count: 1820,
    seoDescription: "Search employment opportunities with H-1B, Green Card, and O-1 visa sponsorship signals across New York, San Francisco, Texas, and Seattle.",
    popularCities: ["New York", "San Francisco", "Austin", "Seattle", "Chicago", "Boston"],
    region: "north-america",
    primaryVisa: "H-1B, O-1 & Cap-Exempt Visas",
    minSalary: "$65,000 - $130,000+ / yr",
    processingTime: "15 Days (Premium Processing)",
    spousalRights: "H-4 EAD (Post-I-140)",
    prPathway: "Direct Green Card (EB-2 / EB-3)",
    topSectors: [
      { label: "Technology & AI", slug: "information-technology" },
      { label: "Engineering", slug: "engineering" },
      { label: "Finance & Fintech", slug: "finance" },
      { label: "Healthcare", slug: "healthcare" },
    ],
    highlightTag: "Cap-Exempt & High-Growth Sponsors",
  },
  {
    code: "AU",
    name: "Australia",
    slug: "australia",
    flag: "🇦🇺",
    currency: "AUD (A$)",
    count: 1140,
    seoDescription: "Explore Australian jobs with Subclass 482 TSS, Skills in Demand, and 186 Employer Nomination visa support in Sydney, Melbourne, and Brisbane.",
    popularCities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"],
    region: "apac",
    primaryVisa: "Subclass 482 TSS / 186 PR",
    minSalary: "A$73,150 / yr (TSMIT Minimum)",
    processingTime: "4 - 10 Weeks Standard",
    spousalRights: "Unrestricted Spouse Work Rights",
    prPathway: "2 - 3 Years to Permanent Residency (PR)",
    topSectors: [
      { label: "Mining & Engineering", slug: "engineering" },
      { label: "Healthcare & Nursing", slug: "healthcare" },
      { label: "IT & Cloud", slug: "information-technology" },
      { label: "Construction", slug: "construction" },
    ],
    highlightTag: "Priority Skills List Approved",
  },
  {
    code: "CA",
    name: "Canada",
    slug: "canada",
    flag: "🇨🇦",
    currency: "CAD (C$)",
    count: 1290,
    seoDescription: "Find Canadian job listings featuring LMIA support, Work Permit support, and Provincial Nominee pathways across Toronto, Vancouver, and Montreal.",
    popularCities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton"],
    region: "north-america",
    primaryVisa: "Global Talent Stream & LMIA",
    minSalary: "C$70,000 - C$115,000 / yr",
    processingTime: "10 - 15 Business Days (GTS)",
    spousalRights: "Open Spousal Work Permit (SOWP)",
    prPathway: "Express Entry / PNP Fast-Track (1-2 Yrs)",
    topSectors: [
      { label: "Technology & Software", slug: "information-technology" },
      { label: "Civil & Infrastructure", slug: "construction" },
      { label: "Healthcare", slug: "healthcare" },
      { label: "Engineering", slug: "engineering" },
    ],
    highlightTag: "Global Talent Stream 2-Week Processing",
  },
  {
    code: "NZ",
    name: "New Zealand",
    slug: "new-zealand",
    flag: "🇳🇿",
    currency: "NZD (NZ$)",
    count: 680,
    seoDescription: "Find jobs with Accredited Employer Work Visa (AEWV) and Green List sponsorship opportunities in Auckland, Wellington, and Christchurch.",
    popularCities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin"],
    region: "apac",
    primaryVisa: "Accredited Employer (AEWV) & Green List",
    minSalary: "NZ$31.61 / hr (Median Wage)",
    processingTime: "3 - 6 Weeks Standard",
    spousalRights: "Partner of a Worker Work Visa",
    prPathway: "Straight to Residence (Green List Tier 1)",
    topSectors: [
      { label: "Healthcare & Doctors", slug: "healthcare" },
      { label: "Engineering Specialists", slug: "engineering" },
      { label: "Information Technology", slug: "information-technology" },
      { label: "Construction & Trades", slug: "construction" },
    ],
    highlightTag: "Green List Fast-Track Residence",
  },
  {
    code: "GLOBAL",
    name: "Global Remote & Nomad",
    slug: "uk", // Fallback to universal search
    flag: "🌐",
    currency: "USD / Multi-Currency",
    count: 420,
    seoDescription: "Worldwide cross-border employers offering Employer of Record (EOR) sponsorship, digital nomad visa reimbursement, and international relocation programs.",
    popularCities: ["Remote Worldwide", "London / Remote", "New York / Remote", "Sydney / Remote", "Toronto / Remote"],
    region: "remote",
    primaryVisa: "Cross-Border EOR & Relocation",
    minSalary: "$60,000 - $180,000 USD Equivalent",
    processingTime: "Instant / Direct Hire",
    spousalRights: "Location Independent Rights",
    prPathway: "Corporate Relocation to HQ",
    topSectors: [
      { label: "Remote Engineering", slug: "engineering" },
      { label: "AI & Data Science", slug: "information-technology" },
      { label: "Fintech & Product", slug: "finance" },
      { label: "Enterprise Sales", slug: "sales" },
    ],
    highlightTag: "Worldwide Relocation & EOR",
  },
];

export function CountriesDirectoryClient({ initialCounts }: { initialCounts: Record<string, number> }) {
  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const countries = useMemo(() => {
    return EXTENDED_COUNTRIES.map((c) => ({
      ...c,
      count: initialCounts[c.code] && initialCounts[c.code] > 0 ? initialCounts[c.code] : c.count,
    }));
  }, [initialCounts]);

  const filteredCountries = useMemo(() => {
    return countries.filter((c) => {
      const matchesRegion = activeRegion === "all" || c.region === activeRegion;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.popularCities.some((city) => city.toLowerCase().includes(q)) ||
        c.primaryVisa.toLowerCase().includes(q) ||
        c.topSectors.some((sec) => sec.label.toLowerCase().includes(q));

      return matchesRegion && matchesSearch;
    });
  }, [countries, activeRegion, searchQuery]);

  const totalVacancies = useMemo(() => {
    return countries.reduce((acc, c) => acc + c.count, 0);
  }, [countries]);

  return (
    <div className="space-y-12">
      {/* ── TOP HERO BANNER & STATS CAROUSEL ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Globe className="w-4 h-4 text-sky-300 animate-spin-slow" />
            <span>Global Migration & Visa Sponsorship Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Target Visa Sponsorship <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300">Countries</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Compare statutory minimum salaries, fast-track processing timelines, permanent residency pathways, and verified licensed employer registries across Tier-1 migration jurisdictions.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 text-left">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-xs text-slate-400 font-medium">Verified Jurisdictions</div>
              <div className="text-xl sm:text-2xl font-black text-sky-300 mt-0.5">5 Tier-1 Nations</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-xs text-slate-400 font-medium">Live Vacancies</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">{totalVacancies.toLocaleString()}+</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-xs text-slate-400 font-medium">Licensed Sponsors</div>
              <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-0.5">470+ A-Rated</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-xs text-slate-400 font-medium">Apply Link Integrity</div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">100% Direct ATS</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE CONTROLS BAR (SEARCH & REGION TABS) ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Jurisdictions", count: 6 },
            { id: "europe", label: "United Kingdom", count: 1 },
            { id: "north-america", label: "USA & Canada", count: 2 },
            { id: "apac", label: "Australia & NZ", count: 2 },
            { id: "remote", label: "Global Remote", count: 1 },
          ].map((tab) => {
            const active = activeRegion === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveRegion(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${active ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-600"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country, visa, city..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      {/* ── 6-CARD BALANCED SYMMETRICAL COUNTRY GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCountries.map((c) => {
          const flagKey = c.code === "GLOBAL" ? "remote" : c.code.toLowerCase();
          const flagSvg = CountryFlags[flagKey] || <span className="text-3xl">{c.flag}</span>;
          const targetJobsHref = c.code === "GLOBAL" ? "/jobs?category=engineering" : `/jobs/${c.slug}`;
          const targetVisaHref = c.code === "GLOBAL" ? "/tools/visa-points-calculator" : `/visa-sponsorship/${c.slug}`;

          return (
            <div
              key={c.code}
              className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-[0_10px_35px_rgba(15,23,42,0.03)] hover:border-sky-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Top gradient highlight strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-[#19CBE0] to-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-5">
                {/* Header: Flag + Active Beacon */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="transform group-hover:scale-105 transition-transform">
                      {flagSvg}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                        {c.name}
                      </h2>
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Coins className="w-3 h-3 text-amber-500" />
                        <span>Currency: {c.currency}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{c.count.toLocaleString()} Live</span>
                  </span>
                </div>

                {/* Visa Category Pill */}
                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100/90">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-sky-600" />
                    <span>Primary Work Route</span>
                  </div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">{c.primaryVisa}</div>
                </div>

                {/* 2x2 Statutory Immigration Intelligence Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Min Salary */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Statutory Min. Salary</div>
                    <div className="text-xs font-black text-slate-800 mt-0.5 leading-snug">{c.minSalary}</div>
                  </div>

                  {/* Processing Time */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Processing Time</div>
                    <div className="text-xs font-black text-slate-800 mt-0.5 leading-snug">{c.processingTime}</div>
                  </div>

                  {/* Spousal Rights */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Spousal Work Rights</div>
                    <div className="text-xs font-black text-slate-800 mt-0.5 leading-snug">{c.spousalRights}</div>
                  </div>

                  {/* PR / Settlement */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PR / Settlement</div>
                    <div className="text-xs font-black text-slate-800 mt-0.5 leading-snug">{c.prPathway}</div>
                  </div>
                </div>

                {/* Top Hiring Cities */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-sky-600" />
                    <span>Key Hiring Metros</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.popularCities.slice(0, 4).map((city) => (
                      <Link
                        key={city}
                        href={`/jobs?country=${c.slug}&q=${encodeURIComponent(city)}`}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-[11px] font-semibold text-slate-700 hover:text-sky-800 transition-colors border border-slate-200/60"
                      >
                        {city}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Top In-Demand Sectors */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-600" />
                    <span>Top In-Demand Sectors</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.topSectors.map((sector) => (
                      <Link
                        key={sector.slug}
                        href={c.code === "GLOBAL" ? `/jobs?category=${sector.slug}` : `/jobs/${c.slug}/${sector.slug}`}
                        className="px-2 py-0.5 rounded-lg bg-emerald-50/70 hover:bg-emerald-100 text-[11px] font-semibold text-emerald-800 transition-colors border border-emerald-200/60"
                      >
                        {sector.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <Link
                  href={targetVisaHref}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-700 bg-slate-50 hover:bg-sky-50 border border-slate-200 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  <span>Visa Guide</span>
                </Link>

                <Link
                  href={targetJobsHref}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white text-xs font-black shadow-xs hover:shadow-md transition-all group/btn"
                >
                  <span>Explore Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── GLOBAL VISA SPONSORSHIP COMPARISON MATRIX TABLE ── */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Statutory Intelligence Comparison
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Global Visa Sponsorship Comparison Matrix
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Compare immigration parameters side-by-side to determine your most optimal country migration route.
            </p>
          </div>

          <Link
            href="/tools/visa-points-calculator"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all shrink-0"
          >
            <Calculator className="w-4 h-4 text-sky-400" />
            <span>Calculate Visa Points</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 rounded-l-xl">Country / Route</th>
                <th className="py-3.5 px-4">Primary Visa</th>
                <th className="py-3.5 px-4">Statutory Min. Salary</th>
                <th className="py-3.5 px-4">Fast-Track Processing</th>
                <th className="py-3.5 px-4">Spouse Work Rights</th>
                <th className="py-3.5 px-4">Permanent Residency (PR)</th>
                <th className="py-3.5 px-4 rounded-r-xl text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {countries.map((c) => (
                <tr key={c.code} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="text-lg">{c.flag}</span>
                    <span>{c.name}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-800">{c.primaryVisa}</span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-800">{c.minSalary}</td>
                  <td className="py-4 px-4 text-emerald-700 font-bold">{c.processingTime}</td>
                  <td className="py-4 px-4">{c.spousalRights}</td>
                  <td className="py-4 px-4 font-bold text-sky-800">{c.prPathway}</td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      href={c.code === "GLOBAL" ? "/jobs" : `/jobs/${c.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800"
                    >
                      <span>Browse</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── VISA READINESS & TOOLS QUICK LAUNCHER ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-black">Visa Points Calculator</h4>
            <p className="text-xs text-sky-100 leading-relaxed">
              Calculate your statutory immigration score for UK Skilled Worker, Australian TSS 482, and Canada Express Entry in under 60 seconds.
            </p>
          </div>
          <Link
            href="/tools/visa-points-calculator"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sky-900 text-xs font-black hover:bg-sky-50 transition-all"
          >
            <span>Launch Points Tool</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-cyan-300" />
            </div>
            <h4 className="text-lg font-black">ATS CV Sponsorship Checker</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Check your resume against 5 country immigration algorithms to ensure your job titles and keywords match sponsor expectations.
            </p>
          </div>
          <Link
            href="/tools/ats-checker"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-xs font-black hover:opacity-90 transition-all"
          >
            <span>Run Free ATS Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-lg font-black">470+ Verified Sponsor Directory</h4>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Search verified UK Home Office, Australian Home Affairs, and US USCIS cap-exempt licensed corporate employers directly.
            </p>
          </div>
          <Link
            href="/companies"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 text-xs font-black hover:bg-emerald-50 transition-all"
          >
            <span>Browse Companies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
