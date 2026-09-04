"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  Zap,
  Search,
  Globe,
  ExternalLink,
  Crown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { CompanyRecord } from "@/lib/types/database";
import { useSession } from "@/hooks/useSession";

interface CompaniesDirectoryListProps {
  allCompanies: CompanyRecord[];
}

const COUNTRIES = [
  { code: "ALL", label: "All Countries" },
  { code: "GB", label: "🇬🇧 UK" },
  { code: "US", label: "🇺🇸 USA" },
  { code: "AU", label: "🇦🇺 Australia" },
  { code: "CA", label: "🇨🇦 Canada" },
  { code: "NZ", label: "🇳🇿 New Zealand" },
];

export function CompaniesDirectoryList({ allCompanies }: CompaniesDirectoryListProps) {
  const { isPro, isLoggedIn } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  // Filter companies based on search and country filter
  const filteredCompanies = useMemo(() => {
    return allCompanies.filter((comp) => {
      const matchesCountry =
        selectedCountry === "ALL" ||
        (comp.country_code && comp.country_code.toUpperCase() === selectedCountry);

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (comp.name && comp.name.toLowerCase().includes(q)) ||
        (comp.industry && comp.industry.toLowerCase().includes(q)) ||
        (comp.country_code && comp.country_code.toLowerCase().includes(q));

      return matchesCountry && matchesSearch;
    });
  }, [allCompanies, selectedCountry, searchQuery]);

  const totalPages = Math.ceil(filteredCompanies.length / pageSize) || 1;
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, currentPage, pageSize]);

  // Reset to page 1 on search / country change
  const handleCountryChange = (c: string) => {
    setSelectedCountry(c);
    setCurrentPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  // ═════════════════════════════════════════════════════════════════════════
  // 1. VIP / PRO UNLOCKED VIEW (For Paid VIP Subscribers)
  // ═════════════════════════════════════════════════════════════════════════
  if (isPro) {
    return (
      <div className="space-y-8">
        {/* VIP Access Welcome Ribbon */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-sky-500/15 border border-amber-300/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-slate-900">
                  VIP Sponsor Directory Unlocked
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ACTIVE VIP
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Unlimited access to all {allCompanies.length.toLocaleString()}+ licensed employers with verified sponsorship status and career portals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/dashboard"
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
            >
              My VIP Dashboard &rarr;
            </Link>
          </div>
        </div>

        {/* Search & Country Filter Controls */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by company name, industry, or country..."
                className="w-full pl-9 pr-4 py-2.5 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            {/* Results Counter */}
            <div className="text-xs font-bold text-slate-500 self-end md:self-center">
              Showing {filteredCompanies.length.toLocaleString()} licensed sponsors
            </div>
          </div>

          {/* Country Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {COUNTRIES.map((c) => {
              const active = selectedCountry === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountryChange(c.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? "bg-slate-950 text-white shadow-xs"
                      : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Unlocked Companies Grid */}
        {paginatedCompanies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {paginatedCompanies.map((comp) => {
              const slug = comp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
              return (
                <div
                  key={comp.id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-50 to-blue-50 border border-brand-100/80 flex items-center justify-center font-black text-brand-700 text-base shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                        {comp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5 truncate">
                          <span className="truncate">{comp.name}</span>
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </h2>
                        <span className="text-xs text-slate-500 font-semibold truncate block">
                          {comp.industry || "Enterprise"} • {comp.country_code || "Global"}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {comp.description ||
                        "Verified employer with active visa sponsorship certificate quotas and official register standing."}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/company/${slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 group/btn"
                    >
                      <span>View Profile & Jobs</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>

                    {comp.website && (
                      <a
                        href={comp.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-brand-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Official Company Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No matching sponsors found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the country filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCountry("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-slate-700 px-3">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 2. FREE / PREVIEW VIEW (For Non-Subscribers with Paywall Card)
  // ═════════════════════════════════════════════════════════════════════════
  const visibleCompanies = allCompanies.slice(0, 6);
  const lockedSample = allCompanies.slice(6, 12);
  const totalLockedCount = Math.max(825, allCompanies.length);

  return (
    <div>
      {/* Top 2 Rows: 6 Visible Free Companies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {visibleCompanies.map((comp) => {
          const slug = comp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          return (
            <div
              key={comp.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100/80 flex items-center justify-center font-black text-sky-700 text-base shadow-2xs">
                    {comp.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{comp.name}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    </h2>
                    <span className="text-xs text-slate-500 font-semibold">
                      {comp.industry || "Enterprise"} • {comp.country_code || "Global"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  Verified employer listing international positions with confirmed statutory visa sponsorship signals.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/company/${slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 group"
                >
                  <span>View Company Profile & Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Locked Premium Employer Directory Section */}
      <div className="relative mt-10 rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-lg p-6 sm:p-12 text-center">
        {/* Blurred Background Preview of Locked Companies */}
        <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6 blur-[6px] opacity-25 pointer-events-none select-none">
          {lockedSample.map((comp) => (
            <div key={comp.id} className="p-6 rounded-3xl bg-slate-100 border border-slate-200 h-36">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-300" />
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-slate-300 rounded" />
                  <div className="w-16 h-2 bg-slate-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Paywall Card Overlay */}
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Premium Employer Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Unlock {totalLockedCount}+ Licensed Sponsors
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
              Free preview is limited to 2 rows. Upgrade to Candidate Pro to unlock complete directory access, licensed sponsor registry IDs, and direct HR application endpoints.
            </p>
          </div>

          {/* Feature Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left w-full max-w-lg py-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>825+ A-Rated Licensed Sponsors</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official Home Office / USCIS Registry IDs</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct Employer ATS Application Links</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Instant Daily Visa Opportunity Alerts</span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-2 w-full max-w-md">
            <Link
              href="/pricing"
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-sky-700 hover:from-sky-700 hover:to-cyan-700 text-white font-black text-base tracking-tight shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Zap className="w-5 h-5 text-amber-300" />
              <span>Unlock All Licensed Employers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-[11px] text-slate-400 mt-2">
              Instant candidate dashboard activation · 100% verified direct ATS applications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
