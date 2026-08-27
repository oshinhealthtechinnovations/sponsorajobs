"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, ShieldCheck, Landmark } from "lucide-react";

interface SalaryData {
  role: string;
  category: string;
  uk: string;
  us: string;
  au: string;
  ca: string;
  de: string;
  sponsorshipRate: string;
}

const SALARY_BENCHMARKS: SalaryData[] = [
  {
    role: "Project Planning & Controls Specialist",
    category: "engineering",
    uk: "£48,000 - £68,000",
    us: "$95,000 - $135,000",
    au: "A$115,000 - A$155,000",
    ca: "C$95,000 - C$130,000",
    de: "€58,000 - €78,000",
    sponsorshipRate: "High (SOC 2421 / Infrastructure Deficit)",
  },
  {
    role: "Senior Civil & Structural Engineer",
    category: "engineering",
    uk: "£46,000 - £65,000",
    us: "$92,000 - $130,000",
    au: "A$110,000 - A$148,000",
    ca: "C$90,000 - C$125,000",
    de: "€56,000 - €75,000",
    sponsorshipRate: "Very High (Shortage List / SOC 2121)",
  },
  {
    role: "Full Stack & Backend Software Engineer",
    category: "technology",
    uk: "£55,000 - £88,000",
    us: "$120,000 - $185,000",
    au: "A$125,000 - A$170,000",
    ca: "C$105,000 - C$150,000",
    de: "€65,000 - €92,000",
    sponsorshipRate: "Very High (Global Talent / EU Blue Card)",
  },
  {
    role: "Cloud & DevOps Architect (AWS / K8s)",
    category: "technology",
    uk: "£65,000 - £95,000",
    us: "$135,000 - $195,000",
    au: "A$135,000 - A$185,000",
    ca: "C$115,000 - C$160,000",
    de: "€72,000 - €105,000",
    sponsorshipRate: "Critical Shortage (Fast-Track GTS)",
  },
  {
    role: "Data Scientist & Machine Learning Lead",
    category: "technology",
    uk: "£60,000 - £92,000",
    us: "$130,000 - $190,000",
    au: "A$130,000 - A$175,000",
    ca: "C$110,000 - C$155,000",
    de: "€68,000 - €98,000",
    sponsorshipRate: "High (STEM Specialty Occupation)",
  },
  {
    role: "Credit & Financial Risk Analyst",
    category: "finance",
    uk: "£45,000 - £70,000",
    us: "$90,000 - $130,000",
    au: "A$100,000 - A$140,000",
    ca: "C$85,000 - C$120,000",
    de: "€55,000 - €76,000",
    sponsorshipRate: "Moderate to High (SOC 3534 / Fintech)",
  },
  {
    role: "Registered Nurse (ICU / Acute Care)",
    category: "healthcare",
    uk: "£34,500 - £46,000",
    us: "$82,000 - $118,000",
    au: "A$88,000 - A$115,000",
    ca: "C$80,000 - C$102,000",
    de: "€42,000 - €55,000",
    sponsorshipRate: "Immediate (Health & Care Worker / NMC)",
  },
];

export const SalaryInsightsWidget: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<"uk" | "us" | "au" | "ca" | "de">("uk");

  const countryLabels = {
    uk: "🇬🇧 UK (£38.7k Threshold)",
    us: "🇺🇸 USA (H-1B Prevailing)",
    au: "🇦🇺 AU (TSMIT A$73.1k)",
    ca: "🇨🇦 Canada (Global Talent)",
    de: "🇩🇪 Germany (EU Blue Card)",
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-200/60">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>2026 Statutory Visa Salary Standards</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
            Expected Going Rates &amp; Sponsorship Minimums
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official government baseline thresholds required for work permit approval across key jurisdictions.
          </p>
        </div>

        {/* Country Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
          {(["uk", "us", "au", "ca", "de"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedCountry(code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCountry === code
                  ? "bg-white text-brand-600 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {countryLabels[code]}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Role Title &amp; Discipline</th>
              <th className="py-3.5 px-4">Statutory Benchmark ({selectedCountry.toUpperCase()})</th>
              <th className="py-3.5 px-4">Sponsorship Feasibility &amp; SOC Alignment</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {SALARY_BENCHMARKS.map((row) => (
              <tr key={row.role} className="hover:bg-slate-50/80 transition-colors group">
                <td className="py-4 px-4 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span>{row.role}</span>
                  </div>
                </td>
                <td className="py-4 px-4 font-bold text-emerald-700 font-mono text-xs sm:text-sm">
                  {row[selectedCountry]}
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>{row.sponsorshipRate}</span>
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <Link
                    href={`/jobs?q=${encodeURIComponent(row.role)}&country=${selectedCountry.toUpperCase() === "UK" ? "GB" : selectedCountry.toUpperCase()}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                  >
                    <span>Browse Live Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5 text-slate-400" />
          <span>Calibrated against Home Office (UK), DOL / USCIS (US), Home Affairs (AU), IRCC (CA), and BAMF (DE).</span>
        </span>
        <Link
          href="/tools/cv-job-match"
          className="font-bold text-brand-600 hover:underline inline-flex items-center gap-1"
        >
          <span>Audit Your CV Against These Thresholds</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

