import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { Search, Globe, ShieldCheck, ArrowRight, CheckCircle2, Zap, Award } from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const jobRepo = new JobRepository();
  const latestJobs = await jobRepo.getLatestJobs(8);
  const totalCount = await jobRepo.getTotalActiveJobCount();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 flex flex-col items-center">
        {/* Section 1: Hero Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-brand-50/60 via-slate-50 to-slate-50 flex flex-col items-center text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/80 text-brand-800 text-xs font-semibold mb-6 border border-brand-200/60">
            <Globe className="w-3.5 h-3.5" />
            <span>Sponsorship Intelligence Engine for Global Talent</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-tight">
            Find Jobs With <span className="text-brand-600">Visa Sponsorship</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-2xl">
            Search verified opportunities across the UK, USA, Australia, Canada, and New Zealand with algorithmic sponsorship signal detection.
          </p>

          {/* Search Box Component */}
          <form
            action="/jobs"
            method="GET"
            className="w-full max-w-3xl mt-8 p-2.5 bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200 flex flex-col md:flex-row gap-2 text-left"
          >
            <div className="flex-1 flex items-center px-3 gap-2 border-b md:border-b-0 md:border-r border-slate-100 py-2 md:py-0">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Job title, skill or keyword (e.g. Civil Engineer)"
                className="w-full outline-none text-slate-800 placeholder:text-slate-400 text-sm bg-transparent"
              />
            </div>
            <div className="flex-1 flex items-center px-3 gap-2 py-2 md:py-0">
              <Globe className="w-5 h-5 text-slate-400 shrink-0" />
              <select
                name="country"
                className="w-full outline-none text-slate-700 bg-transparent text-sm cursor-pointer"
                defaultValue="ALL"
              >
                <option value="ALL">All Target Countries (5)</option>
                {INITIAL_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code.toLowerCase()}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Search Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-2xl">
            <span className="text-xs font-medium text-slate-400">Quick searches:</span>
            {["Civil Engineer", "Software Engineer", "Nurse", "Data Analyst", "Project Manager", "Accountant", "Warehouse", "Construction"].map((chip) => (
              <Link
                key={chip}
                href={`/jobs?q=${encodeURIComponent(chip)}`}
                className="px-3 py-1 rounded-full bg-white hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs transition-colors"
              >
                {chip}
              </Link>
            ))}
          </div>
        </section>

        {/* Section 2: Country Discovery Cards */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Target Countries</h2>
              <p className="text-sm text-slate-500">Explore visa routes and verified opportunities by jurisdiction</p>
            </div>
            <Link href="/countries" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <span>All Countries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {INITIAL_COUNTRIES.map((c) => (
              <Link
                key={c.code}
                href={`/jobs/${c.slug}`}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-brand-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-3">{c.flag}</div>
                  <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{c.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">Currency: {c.currency}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-semibold">
                  <span>Explore Jobs</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 3: Latest Jobs */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 bg-white/50 rounded-3xl border border-slate-200/60 my-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Latest Opportunities</h2>
              <p className="text-sm text-slate-500">Recent vacancies with parsed sponsorship intelligence</p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold transition-colors"
            >
              <span>View All ({totalCount > 0 ? totalCount : "Browse"})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
              No jobs loaded yet. Run <code className="bg-slate-100 px-2 py-1 rounded">npm run db:seed</code> to populate demo data.
            </div>
          )}
        </section>

        {/* Section 4: Popular Categories */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Popular Categories</h2>
              <p className="text-sm text-slate-500">High-demand industries actively hiring international talent</p>
            </div>
            <Link href="/categories" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <span>All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {INITIAL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/jobs?category=${cat.slug}`}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-brand-500 hover:bg-brand-50/30 transition-all text-left group"
              >
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Explore roles →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Section 5: How It Works */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How SponsorAJobs Works</h2>
            <p className="text-sm text-slate-500 mt-2">A transparent discovery process built for international job seekers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Search Jobs",
                desc: "Explore aggregated job vacancies from verified external ATS feeds and official public portals.",
              },
              {
                step: "02",
                title: "Filter for Sponsorship Signals",
                desc: "Our deterministic engine analyzes job descriptions for visa, CoS, LMIA, H-1B, and TSS 482 keywords.",
              },
              {
                step: "03",
                title: "Review Evidence & Terms",
                desc: "Inspect parsed positive/negative snippets so you know the exact context before spending time applying.",
              },
              {
                step: "04",
                title: "Apply on Original Source",
                desc: "We redirect you directly to the verified employer application form without intermediary fees.",
              },
            ].map((item) => (
              <div key={item.step} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
                <span className="text-xs font-black text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md mb-3 inline-block">
                  STEP {item.step}
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6 & 7: Sponsorship Explanation & SEO Trust Notice */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 mb-12">
          <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-brand-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Transparent Immigration Intelligence</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Our Commitment to Accurate Sponsorship Data
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                SponsorAJobs uses deterministic natural language rules to flag sponsorship indicators. We never guarantee employment, visa issuance, or legal representation. Always verify visa criteria directly with the employer and official government immigration authorities.
              </p>
            </div>
            <Link
              href="/visa-sponsorship"
              className="shrink-0 px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
            >
              Read Visa Guides
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
