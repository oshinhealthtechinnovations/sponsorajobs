import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { CountryRepository } from "@/lib/repositories/countryRepository";
import Link from "next/link";
import { Globe, ArrowRight, ShieldCheck, Banknote } from "lucide-react";

export default async function CountriesDirectoryPage() {
  const countryRepo = new CountryRepository();

  const countriesWithCounts = await Promise.all(
    INITIAL_COUNTRIES.map(async (c) => {
      const count = await countryRepo.getJobCountByCountry(c.code);
      return { ...c, count };
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-3">
            <Globe className="w-3.5 h-3.5" />
            <span>Target Jurisdictions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Target Visa Sponsorship Countries
          </h1>
          <p className="text-slate-600 text-base mt-2">
            Explore verified work-permit, skilled worker, and immigration sponsorship pathways across our 5 primary jurisdictions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countriesWithCounts.map((c) => (
            <div
              key={c.code}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{c.flag}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
                    {c.count > 0 ? `${c.count} Active Jobs` : "Browse Jobs"}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">{c.name}</h2>
                <p className="text-xs text-slate-500 mb-4">{c.seoDescription}</p>

                <div className="space-y-2 text-xs text-slate-600 py-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Currency</span>
                    <span className="font-semibold">{c.currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Key Cities</span>
                    <span className="font-semibold">{c.popularCities.slice(0, 3).join(", ")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/visa-sponsorship/${c.slug}`}
                  className="text-xs font-semibold text-slate-600 hover:text-brand-600 flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Visa Guide</span>
                </Link>

                <Link
                  href={`/jobs/${c.slug}`}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-2xs transition-all"
                >
                  <span>View Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
