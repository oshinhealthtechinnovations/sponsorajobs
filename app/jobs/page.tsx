import React, { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { JobFilterSidebar } from "@/components/JobFilterSidebar";
import { EmptyState } from "@/components/EmptyState";
import { JobRepository } from "@/lib/repositories/jobRepository";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";

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
    sort: searchParams.sort || "newest",
    page: Number(searchParams.page) || 1,
    limit: 20,
  });

  const { jobs, total, page, totalPages } = searchResult;

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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header Bar */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {searchParams.q ? `Jobs for "${searchParams.q}"` : "Visa Sponsorship Job Search"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Showing {total} matching opportunities with sponsorship signal intelligence
              </p>
            </div>

            {/* Keyword Search Form */}
            <form action="/jobs" method="GET" className="flex items-center gap-2 max-w-md w-full">
              {searchParams.country && (
                <input type="hidden" name="country" value={searchParams.country} />
              )}
              {searchParams.category && (
                <input type="hidden" name="category" value={searchParams.category} />
              )}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="q"
                  defaultValue={searchParams.q || ""}
                  placeholder="Keyword, role, or title..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-500 shadow-2xs"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Active Filters:</span>
              {activeFilters.map((f) => (
                <Link
                  key={f.key}
                  href={removeFilterUrl(f.key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-medium hover:bg-brand-100 transition-colors"
                >
                  <span>{f.label}</span>
                  <X className="w-3 h-3 text-brand-600" />
                </Link>
              ))}
              <Link
                href="/jobs"
                className="text-xs font-semibold text-slate-500 hover:text-brand-600 ml-2"
              >
                Clear all
              </Link>
            </div>
          )}
        </div>

        {/* Main Grid: Filters Sidebar + Job Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left: Filters Sidebar */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="p-4 bg-white rounded-2xl">Loading filters...</div>}>
              <JobFilterSidebar />
            </Suspense>
          </div>

          {/* Right: Job Listings & Pagination */}
          <div className="lg:col-span-3 space-y-4">
            {jobs.length > 0 ? (
              <>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pt-8 flex items-center justify-between border-t border-slate-200">
                    <span className="text-xs text-slate-500">
                      Page {page} of {totalPages} ({total} total results)
                    </span>
                    <div className="flex items-center gap-2">
                      {page > 1 ? (
                        <Link
                          href={buildPaginationUrl(page - 1)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-100 text-xs font-medium text-slate-400 cursor-not-allowed">
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </span>
                      )}

                      {page < totalPages ? (
                        <Link
                          href={buildPaginationUrl(page + 1)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-100 bg-slate-100 text-xs font-medium text-slate-400 cursor-not-allowed">
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState query={searchParams.q} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
