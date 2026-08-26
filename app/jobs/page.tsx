import React, { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { JobFilterSidebar } from "@/components/JobFilterSidebar";
import { EmptyState } from "@/components/EmptyState";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { normalizeSearchQuery } from "@/lib/utils/searchNormalizer";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, X, Sparkles, SlidersHorizontal } from "lucide-react";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";

interface JobsPageProps {
  searchParams: {
    q?: string;
    country?: string;
    category?: string;
    city?: string;
    remoteType?: string;
    employmentType?: string;
    sponsorship?: string;
    minSalary?: string;
    maxSalary?: string;
    datePosted?: string;
    sort?: "newest" | "relevance" | "sponsorship" | "salary";
    page?: string;
  };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const jobRepo = new JobRepository();
  const searchResult = await jobRepo.search({
    q: searchParams.q,
    country: searchParams.country,
    category: searchParams.category,
    city: searchParams.city,
    remoteType: searchParams.remoteType,
    employmentType: searchParams.employmentType,
    sponsorship: searchParams.sponsorship,
    minSalary: searchParams.minSalary ? Number(searchParams.minSalary) : undefined,
    maxSalary: searchParams.maxSalary ? Number(searchParams.maxSalary) : undefined,
    datePosted: searchParams.datePosted,
    sort: searchParams.sort || (searchParams.q ? "relevance" : "newest"),
    page: Number(searchParams.page) || 1,
    limit: 20,
  });

  const { jobs, total, page, totalPages, fallbackJobs } = searchResult;

  const buildPaginationUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.set("page", newPage.toString());
    return `/jobs?${params.toString()}`;
  };

  const removeFilterUrl = (key: string) => {
    const params = new URLSearchParams(searchParams as Record<string, string>);
    params.delete(key);
    params.delete("page");
    return `/jobs?${params.toString()}`;
  };

  const activeFilters = [
    searchParams.q ? { label: `"${searchParams.q}"`, key: "q" } : null,
    searchParams.country && searchParams.country !== "ALL"
      ? { label: `Country: ${searchParams.country.toUpperCase()}`, key: "country" }
      : null,
    searchParams.category ? { label: `Category: ${searchParams.category}`, key: "category" } : null,
    searchParams.city ? { label: `City: ${searchParams.city}`, key: "city" } : null,
    searchParams.remoteType ? { label: `Workplace: ${searchParams.remoteType}`, key: "remoteType" } : null,
    searchParams.sponsorship ? { label: `Sponsorship: ${searchParams.sponsorship}`, key: "sponsorship" } : null,
    searchParams.minSalary ? { label: `Min Salary: ${searchParams.minSalary}`, key: "minSalary" } : null,
    searchParams.maxSalary ? { label: `Max Salary: ${searchParams.maxSalary}`, key: "maxSalary" } : null,
    searchParams.datePosted && searchParams.datePosted !== "all"
      ? { label: `Freshness: ${searchParams.datePosted}`, key: "datePosted" }
      : null,
  ].filter(Boolean) as { label: string; key: string }[];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── Search Header ── */}
        <div className="mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 truncate">
                {searchParams.q ? `Results for "${searchParams.q}"` : "Visa Sponsorship Jobs"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {total.toLocaleString()} opportunities with sponsorship intelligence
              </p>
              {searchParams.q && normalizeSearchQuery(searchParams.q).isCorrected && (
                <div className="mt-2 text-xs text-brand-900 bg-sky-50 border border-sky-200 rounded-xl px-3 py-1.5 inline-flex flex-wrap items-center gap-2 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span>
                    Showing results for{" "}
                    <Link
                      href={`/jobs?q=${encodeURIComponent(normalizeSearchQuery(searchParams.q).normalized)}`}
                      className="font-bold text-brand-700 underline hover:text-brand-900"
                    >
                      {normalizeSearchQuery(searchParams.q).normalized}
                    </Link>
                  </span>
                  <span className="text-slate-300 hidden sm:inline">·</span>
                  <span className="text-slate-500">Auto-corrected from &ldquo;{searchParams.q}&rdquo;</span>
                </div>
              )}
            </div>

            {/* Keyword Search Form */}
            <form action="/jobs" method="GET" className="flex items-center gap-2 w-full sm:max-w-sm">
              {searchParams.country && (
                <input type="hidden" name="country" value={searchParams.country} />
              )}
              {searchParams.category && (
                <input type="hidden" name="category" value={searchParams.category} />
              )}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={searchParams.q || ""}
                  placeholder="Role, skill, keyword..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 shadow-2xs"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0 touch-manipulation"
              >
                Search
              </button>
            </form>
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Filters:</span>
              {activeFilters.map((f) => (
                <Link
                  key={f.key}
                  href={removeFilterUrl(f.key)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-medium hover:bg-brand-100 transition-colors touch-manipulation"
                >
                  <span>{f.label}</span>
                  <X className="w-3 h-3 text-brand-600" />
                </Link>
              ))}
              <Link
                href="/jobs"
                className="text-xs font-semibold text-slate-500 hover:text-brand-600"
              >
                Clear all
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Filter Trigger Bar ── */}
        <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
          <Suspense fallback={null}>
            <MobileFilterDrawer activeFilterCount={activeFilters.length} />
          </Suspense>
          <p className="text-xs text-slate-500">{total.toLocaleString()} results</p>
        </div>

        {/* ── Main Layout: Sidebar + Results ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20">
              <Suspense fallback={<div className="p-4 bg-white rounded-2xl border border-slate-200 text-sm text-slate-400">Loading filters...</div>}>
                <JobFilterSidebar />
              </Suspense>
            </div>
          </div>

          {/* Job Results */}
          <div className="lg:col-span-3">
            {jobs.length > 0 ? (
              <>
                {/* Results count on mobile */}
                <div className="hidden sm:flex lg:hidden items-center justify-between mb-4">
                  <span className="text-xs text-slate-500">
                    Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total.toLocaleString()}
                  </span>
                </div>

                {/* Job Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
                    <span className="text-xs text-slate-500">
                      Page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      {page > 1 ? (
                        <Link
                          href={buildPaginationUrl(page - 1)}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors touch-manipulation"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Prev</span>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 text-xs font-medium text-slate-300 cursor-not-allowed">
                          <ChevronLeft className="w-4 h-4" />
                          <span>Prev</span>
                        </span>
                      )}

                      {/* Page numbers (compact) */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                          if (p < 1 || p > totalPages) return null;
                          return (
                            <Link
                              key={p}
                              href={buildPaginationUrl(p)}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors touch-manipulation ${
                                p === page
                                  ? "bg-brand-600 text-white"
                                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {p}
                            </Link>
                          );
                        })}
                      </div>

                      {page < totalPages ? (
                        <Link
                          href={buildPaginationUrl(page + 1)}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors touch-manipulation"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 text-xs font-medium text-slate-300 cursor-not-allowed">
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <EmptyState
                  query={searchParams.q}
                  country={searchParams.country}
                  category={searchParams.category}
                />

                {fallbackJobs && fallbackJobs.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-brand-600" />
                          <span>Curated Visa Sponsorship Opportunities for You</span>
                        </h2>
                        <p className="text-xs text-slate-500">
                          Highest rated verified sponsorship positions across our network
                        </p>
                      </div>
                      <Link
                        href="/jobs"
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 hidden sm:inline"
                      >
                        Browse all jobs &rarr;
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                      {fallbackJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
