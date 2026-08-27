import React from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { CountryRepository } from "@/lib/repositories/countryRepository";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { getCountryBySlug, INITIAL_COUNTRIES } from "@/config/countries";
import Link from "next/link";
import { Globe, ArrowRight, ShieldCheck, Search } from "lucide-react";

interface CountryJobsPageProps {
  params: {
    country: string;
  };
}

export default async function CountryJobsPage({ params }: CountryJobsPageProps) {
  const countryRepo = new CountryRepository();
  const country = await countryRepo.getBySlug(params.country);

  if (!country) {
    notFound();
  }

  const jobRepo = new JobRepository();
  const searchResult = await jobRepo.search({
    country: country.code.toLowerCase(),
    limit: 20,
  });

  const countryConfig = getCountryBySlug(params.country);
  const popularCities = countryConfig?.popularCities || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Country Hero */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{country.flag}</span>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Visa Sponsorship Jobs in {country.name}
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {searchResult.total} live opportunities with sponsorship signals
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                {country.seo_description || `Discover jobs with visa sponsorship pathways in ${country.name}.`}
              </p>
            </div>

            <Link
              href={`/visa-sponsorship/${country.slug}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs transition-colors shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{country.name} Visa Guide</span>
            </Link>
          </div>

          {/* Popular Cities in this country (Section 51) */}
          {popularCities.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Popular Cities:</span>
              {popularCities.map((city) => (
                <Link
                  key={city}
                  href={`/jobs?country=${country.code.toLowerCase()}&city=${encodeURIComponent(city)}`}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-medium transition-colors"
                >
                  {city}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Categories in this Country */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Browse by Category in {country.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {INITIAL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/jobs/${country.slug}/${cat.slug}`}
                className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-brand-500 text-xs font-semibold text-slate-800 hover:text-brand-600 transition-all shadow-2xs"
              >
                {cat.name} →
              </Link>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Current Opportunities</h2>
            <Link
              href={`/jobs?country=${country.code.toLowerCase()}`}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All & Filter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {searchResult.jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResult.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
              No active listings found in {country.name} at this time.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
