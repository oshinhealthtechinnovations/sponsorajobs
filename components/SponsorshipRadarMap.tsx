"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Globe2, ArrowRight, TrendingUp, Briefcase } from "lucide-react";
import { INITIAL_COUNTRIES } from "@/config/countries";

const MARKET_DATA = [
  {
    code: "gb",
    slug: "uk",
    name: "United Kingdom",
    flag: "🇬🇧",
    jobCount: 214,
    visaRoute: "Skilled Worker Visa",
    minSalary: "£26,200",
    popular: ["Software Engineering", "Healthcare", "Civil Engineering"],
    trend: "High Demand",
  },
  {
    code: "us",
    slug: "usa",
    name: "United States",
    flag: "🇺🇸",
    jobCount: 183,
    visaRoute: "H-1B / Specialty Occupation",
    minSalary: "Market Rate",
    popular: ["Technology", "Finance", "Engineering"],
    trend: "Active Hiring",
  },
  {
    code: "au",
    slug: "australia",
    name: "Australia",
    flag: "🇦🇺",
    jobCount: 127,
    visaRoute: "TSS 482 / Core Skills",
    minSalary: "AUD $70,000",
    popular: ["Construction", "Mining", "Healthcare"],
    trend: "Growing",
  },
  {
    code: "ca",
    slug: "canada",
    name: "Canada",
    flag: "🇨🇦",
    jobCount: 96,
    visaRoute: "LMIA / Global Talent Stream",
    minSalary: "CAD $60,000",
    popular: ["Technology", "Engineering", "Finance"],
    trend: "Active Hiring",
  },
  {
    code: "nz",
    slug: "new-zealand",
    name: "New Zealand",
    flag: "🇳🇿",
    jobCount: 38,
    visaRoute: "AEWV / Green List",
    minSalary: "NZD $55,000",
    popular: ["Engineering", "Healthcare", "IT"],
    trend: "Growing",
  },
];

export const SponsorshipRadarMap: React.FC = () => {
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          <Globe2 className="w-3.5 h-3.5" />
          <span>International Markets</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
          Explore International Job Markets
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Discover where verified employers are actively hiring across major international destinations.
        </p>
      </div>

      {/* Country Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {MARKET_DATA.map((market) => (
          <Link
            key={market.code}
            href={`/jobs/${market.slug}`}
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#19CBE0] hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              {/* Flag + Country */}
              <div className="flex items-center justify-between">
                <span className="text-3xl">{market.flag}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {market.trend}
                </span>
              </div>

              {/* Country name + Job count (PRIMARY) */}
              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#071522]">
                  {market.name}
                </h3>
                <div className="text-2xl font-black text-[#071522] mt-1">
                  {market.jobCount}
                  <span className="text-sm font-semibold text-slate-500 ml-1">verified jobs</span>
                </div>
              </div>

              {/* Popular roles */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Popular</span>
                <div className="flex flex-wrap gap-1">
                  {market.popular.slice(0, 2).map((role) => (
                    <span key={role} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Visa route — secondary */}
              <div className="text-xs text-slate-500 border-t border-slate-100 pt-2">
                <span className="font-medium">{market.visaRoute}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between text-xs font-bold text-[#19CBE0] group-hover:text-[#071522] transition-colors">
              <span>Explore {market.name} Jobs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
