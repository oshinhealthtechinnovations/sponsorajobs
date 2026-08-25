"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Banknote, TrendingUp, Globe, ArrowRight, ShieldCheck } from "lucide-react";

interface SalaryData {
  role: string;
  category: string;
  uk: string;
  us: string;
  au: string;
  ca: string;
  nz: string;
  sponsorshipRate: string;
}

const SALARY_BENCHMARKS: SalaryData[] = [
  {
    role: "Senior Civil Engineer",
    category: "civil-engineering",
    uk: "£48,000 - £65,000",
    us: "$95,000 - $130,000",
    au: "A$110,000 - A$145,000",
    ca: "C$90,000 - C$120,000",
    nz: "NZ$95,000 - NZ$125,000",
    sponsorshipRate: "High (Shortage Occupation)",
  },
  {
    role: "Full Stack / Backend Engineer",
    category: "technology",
    uk: "£55,000 - £85,000",
    us: "$120,000 - $175,000",
    au: "A$125,000 - A$165,000",
    ca: "C$105,000 - C$145,000",
    nz: "NZ$110,000 - NZ$140,000",
    sponsorshipRate: "Very High (Global Talent)",
  },
  {
    role: "Registered Nurse (Acute/ICU)",
    category: "healthcare",
    uk: "£34,000 - £44,000",
    us: "$80,000 - $115,000",
    au: "A$85,000 - A$110,000",
    ca: "C$78,000 - C$98,000",
    nz: "NZ$82,000 - NZ$102,000",
    sponsorshipRate: "Immediate (CoS / Green List)",
  },
  {
    role: "Structural Engineering Specialist",
    category: "civil-engineering",
    uk: "£50,000 - £70,000",
    us: "$100,000 - $140,000",
    au: "A$115,000 - A$150,000",
    ca: "C$95,000 - C$128,000",
    nz: "NZ$98,000 - NZ$130,000",
    sponsorshipRate: "High (Infrastructure Deficit)",
  },
  {
    role: "Data Analyst / BI Engineer",
    category: "technology",
    uk: "£42,000 - £62,000",
    us: "$90,000 - $125,000",
    au: "A$98,000 - A$130,000",
    ca: "C$85,000 - C$115,000",
    nz: "NZ$88,000 - NZ$118,000",
    sponsorshipRate: "Moderate to High",
  },
];

export const SalaryInsightsWidget: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<"uk" | "us" | "au" | "ca" | "nz">("uk");

  const countryLabels = {
    uk: "🇬🇧 United Kingdom",
    us: "🇺🇸 United States",
    au: "🇦🇺 Australia",
    ca: "🇨🇦 Canada",
    nz: "🇳🇿 New Zealand",
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-200/60">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>2025 Global Sponsorship Salary Benchmarks</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Expected Salaries with Visa Sponsorship
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official wage thresholds required for employer work permits across major sectors.
          </p>
        </div>

        {/* Country Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
          {(["uk", "us", "au", "ca", "nz"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedCountry(code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCountry === code
                  ? "bg-white text-brand-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {countryLabels[code].split(" ")[0]} {code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Role Title</th>
              <th className="py-3 px-4">Estimated Range ({selectedCountry.toUpperCase()})</th>
              <th className="py-3 px-4">Sponsorship Feasibility</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {SALARY_BENCHMARKS.map((row) => (
              <tr key={row.role} className="hover:bg-slate-50/80 transition-colors group">
                <td className="py-4 px-4 font-semibold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span>{row.role}</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-bold text-emerald-700 font-mono text-xs sm:text-sm">
                  {row[selectedCountry]}
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                    <span>{row.sponsorshipRate}</span>
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <Link
                    href={`/jobs?q=${encodeURIComponent(row.role)}&country=${selectedCountry}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Browse Openings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <span>*Based on Home Office (UK), DOL (US), Home Affairs (AU), IRCC (CA), and INZ (NZ) guidelines.</span>
        <Link
          href="/visa-sponsorship"
          className="font-semibold text-brand-600 hover:underline inline-flex items-center gap-1"
        >
          <span>Read complete legal salary minimums guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
