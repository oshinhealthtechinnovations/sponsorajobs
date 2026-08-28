"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Globe2,
  TrendingUp,
  Building2,
  Briefcase,
  ArrowRight,
  Sparkles,
  MapPin,
  Compass,
} from "lucide-react";

interface CountryRadarData {
  code: string;
  name: string;
  flag: string;
  activeJobs: number;
  employersCount: number;
  momentum: string;
  topRole: string;
  threshold: string;
  visaRoute: string;
}

const OCCUPATION_DATA: Record<string, CountryRadarData[]> = {
  all: [
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", activeJobs: 214, employersCount: 83, momentum: "+18%", topRole: "Senior Software Engineer", threshold: "£38,700 / yr", visaRoute: "Skilled Worker" },
    { code: "US", name: "United States", flag: "🇺🇸", activeJobs: 183, employersCount: 62, momentum: "+14%", topRole: "DevOps & Cloud Architect", threshold: "Prevailing Wage", visaRoute: "H-1B / O-1" },
    { code: "AU", name: "Australia", flag: "🇦🇺", activeJobs: 127, employersCount: 49, momentum: "+12%", topRole: "Civil Infrastructure Lead", threshold: "AUD $73,150", visaRoute: "TSS 482" },
    { code: "CA", name: "Canada", flag: "🇨🇦", activeJobs: 96, employersCount: 38, momentum: "+9%", topRole: "Data & ML Engineer", threshold: "Provincial Median", visaRoute: "GTS / LMIA" },
    { code: "NZ", name: "New Zealand", flag: "🇳🇿", activeJobs: 38, employersCount: 18, momentum: "+8%", topRole: "Structural Design Engineer", threshold: "NZD $29.66 / hr", visaRoute: "AEWV Green List" },
  ],
  software: [
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", activeJobs: 94, employersCount: 42, momentum: "+22%", topRole: "Full Stack Engineer", threshold: "£38,700", visaRoute: "Skilled Worker" },
    { code: "US", name: "United States", flag: "🇺🇸", activeJobs: 86, employersCount: 34, momentum: "+17%", topRole: "Distributed Systems", threshold: "$120,000+", visaRoute: "H-1B / O-1" },
    { code: "AU", name: "Australia", flag: "🇦🇺", activeJobs: 48, employersCount: 22, momentum: "+15%", topRole: "Cloud Platform Lead", threshold: "AUD $95,000", visaRoute: "TSS 482" },
    { code: "CA", name: "Canada", flag: "🇨🇦", activeJobs: 41, employersCount: 19, momentum: "+11%", topRole: "Backend Engineer", threshold: "CAD $90,000", visaRoute: "Global Talent" },
    { code: "NZ", name: "New Zealand", flag: "🇳🇿", activeJobs: 16, employersCount: 9, momentum: "+7%", topRole: "Frontend React Engineer", threshold: "NZD $85,000", visaRoute: "AEWV Tier 1" },
  ],
  civil: [
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", activeJobs: 48, employersCount: 21, momentum: "+19%", topRole: "Senior Structural Engineer", threshold: "£38,700", visaRoute: "Skilled Worker" },
    { code: "AU", name: "Australia", flag: "🇦🇺", activeJobs: 42, employersCount: 18, momentum: "+16%", topRole: "Rail / Bridge Engineer", threshold: "AUD $88,000", visaRoute: "TSS 482" },
    { code: "US", name: "United States", flag: "🇺🇸", activeJobs: 38, employersCount: 15, momentum: "+10%", topRole: "Civil Project Manager", threshold: "Prevailing Wage", visaRoute: "H-1B / O-1" },
    { code: "CA", name: "Canada", flag: "🇨🇦", activeJobs: 24, employersCount: 12, momentum: "+8%", topRole: "Geotechnical Engineer", threshold: "CAD $82,000", visaRoute: "LMIA Route" },
    { code: "NZ", name: "New Zealand", flag: "🇳🇿", activeJobs: 12, employersCount: 7, momentum: "+9%", topRole: "Highway Engineer", threshold: "NZD $80,000", visaRoute: "Green List" },
  ],
  healthcare: [
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", activeJobs: 56, employersCount: 28, momentum: "+24%", topRole: "Registered Nurse / NHS", threshold: "£30,960 (ISL)", visaRoute: "Health & Care" },
    { code: "AU", name: "Australia", flag: "🇦🇺", activeJobs: 34, employersCount: 16, momentum: "+18%", topRole: "Clinical Specialist", threshold: "AUD $73,150", visaRoute: "Core Skills" },
    { code: "US", name: "United States", flag: "🇺🇸", activeJobs: 28, employersCount: 12, momentum: "+12%", topRole: "Medical Technologist", threshold: "Prevailing Wage", visaRoute: "H-1B / EB-3" },
    { code: "CA", name: "Canada", flag: "🇨🇦", activeJobs: 19, employersCount: 9, momentum: "+10%", topRole: "Nurse Practitioner", threshold: "Provincial Median", visaRoute: "Express Entry" },
    { code: "NZ", name: "New Zealand", flag: "🇳🇿", activeJobs: 8, employersCount: 4, momentum: "+6%", topRole: "Physiotherapist", threshold: "NZD $29.66 / hr", visaRoute: "Green List" },
  ],
};

export const SponsorshipRadarMap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const countries = OCCUPATION_DATA[activeTab] || OCCUPATION_DATA.all;

  return (
    <div className="w-full rounded-3xl bg-[#071421] text-white border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
      {/* Subtle Atmospheric Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#18D6E5_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

      {/* Header & Occupation Filter Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18D6E5]/10 border border-[#18D6E5]/20 text-[#18D6E5] text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Global Sponsorship Radar</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
            Where is international hiring heating up?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time hiring momentum and statutory thresholds across verified employer networks.
          </p>
        </div>

        {/* Discipline Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 self-start lg:self-auto">
          {[
            { id: "all", label: "All Disciplines" },
            { id: "software", label: "Software & Tech" },
            { id: "civil", label: "Civil & Engineering" },
            { id: "healthcare", label: "Healthcare" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#18D6E5] text-[#071421] shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Country Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 relative z-10">
        {countries.map((c) => (
          <Link
            key={c.code}
            href={`/jobs/${c.code.toLowerCase()}`}
            className="p-5 rounded-2xl bg-[#0D1B2A] border border-slate-800 hover:border-[#18D6E5]/60 hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
          >
            {/* Top Row: Flag + Name + Momentum */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{c.flag}</span>
                  <span className="font-bold text-sm text-white group-hover:text-[#18D6E5] transition-colors">
                    {c.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  {c.momentum}
                </span>
              </div>

              {/* Big Job Count */}
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {c.activeJobs}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Active Vacancies
                </div>
              </div>
            </div>

            {/* Middle: Key details */}
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Visa Route:</span>
                <span className="font-semibold text-slate-200">{c.visaRoute}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Min Salary:</span>
                <span className="font-bold text-[#18D6E5]">{c.threshold}</span>
              </div>
            </div>

            {/* Bottom action indicator */}
            <div className="pt-2 flex items-center justify-between text-xs text-[#18D6E5] font-bold group-hover:translate-x-0.5 transition-transform">
              <span>Explore Market</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
