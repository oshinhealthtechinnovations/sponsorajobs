import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { CountryRepository } from "@/lib/repositories/countryRepository";
import Link from "next/link";
import { Globe, ArrowRight, ShieldCheck, Banknote, Sparkles, Building2 } from "lucide-react";

// Cross-platform SVG flags
const CountryFlags: Record<string, React.ReactNode> = {
  gb: (
    <svg viewBox="0 0 60 30" className="w-12 h-8 rounded-xl shadow-2xs shrink-0 overflow-hidden border border-slate-200/60">
      <clipPath id="cd_gb"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="cd_gbt"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#cd_gb)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#cd_gbt)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  ),
  us: (
    <svg viewBox="0 0 60 30" className="w-12 h-8 rounded-xl shadow-2xs shrink-0 overflow-hidden border border-slate-200/60">
      <rect width="60" height="30" fill="#B22234" />
      <path d="M0,2.3h60M0,6.9h60M0,11.5h60M0,16.1h60M0,20.7h60M0,25.3h60" stroke="#fff" strokeWidth="2.3" />
      <rect width="24" height="16.1" fill="#3C3B6E" />
      <circle cx="12" cy="8" r="4" fill="#fff" opacity="0.9" />
    </svg>
  ),
  au: (
    <svg viewBox="0 0 60 30" className="w-12 h-8 rounded-xl shadow-2xs shrink-0 overflow-hidden border border-slate-200/60">
      <rect width="60" height="30" fill="#00008B" />
      <circle cx="45" cy="8" r="2" fill="#fff" />
      <circle cx="50" cy="14" r="1.5" fill="#fff" />
      <circle cx="42" cy="18" r="2" fill="#fff" />
      <circle cx="48" cy="24" r="2" fill="#fff" />
    </svg>
  ),
  ca: (
    <svg viewBox="0 0 60 30" className="w-12 h-8 rounded-xl shadow-2xs shrink-0 overflow-hidden border border-slate-200/60">
      <rect width="15" height="30" fill="#D80027" />
      <rect x="15" width="30" height="30" fill="#fff" />
      <rect x="45" width="15" height="30" fill="#D80027" />
      <path d="M30,7 L32,13 L38,12 L34,16 L37,21 L31,19 L30,23 L29,19 L23,21 L26,16 L22,12 L28,13 Z" fill="#D80027" />
    </svg>
  ),
  nz: (
    <svg viewBox="0 0 60 30" className="w-12 h-8 rounded-xl shadow-2xs shrink-0 overflow-hidden border border-slate-200/60">
      <rect width="60" height="30" fill="#00247D" />
      <circle cx="45" cy="7" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="50" cy="13" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="42" cy="18" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="47" cy="24" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
    </svg>
  ),
};

export default async function CountriesDirectoryPage() {
  const countryRepo = new CountryRepository();

  const countriesWithCounts = await Promise.all(
    INITIAL_COUNTRIES.map(async (c) => {
      const count = await countryRepo.getJobCountByCountry(c.code);
      return { ...c, count };
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>Target Jurisdictions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Target Visa Sponsorship Countries
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore verified work-permit, skilled worker, and immigration sponsorship pathways across our 5 primary jurisdictions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countriesWithCounts.map((c) => {
            const flagSvg = CountryFlags[c.code.toLowerCase()] || <span className="text-3xl">{c.flag}</span>;
            return (
              <div
                key={c.code}
                className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_40px_rgba(15,23,42,0.04)] hover:border-sky-300 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {flagSvg}
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{c.count > 0 ? `${c.count.toLocaleString()} Active Vacancies` : "Live Verification Feed"}</span>
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-900">{c.name}</h2>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{c.seoDescription}</p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 py-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Currency</span>
                      <span className="font-bold text-slate-800">{c.currency}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Top Hubs</span>
                      <span className="font-bold text-slate-800">{c.popularCities.slice(0, 3).join(", ")}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    href={`/visa-sponsorship/${c.slug}`}
                    className="text-xs font-bold text-slate-600 hover:text-sky-700 flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    <span>Visa Guide</span>
                  </Link>

                  <Link
                    href={`/jobs/${c.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white text-xs font-black shadow-xs hover:shadow-md transition-all group"
                  >
                    <span>Explore Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
