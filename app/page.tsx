import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { HeroCounterAnimation } from "@/components/HeroCounterAnimation";
import { LiveActivityTicker } from "@/components/LiveActivityTicker";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import { SalaryInsightsWidget } from "@/components/SalaryInsightsWidget";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { JobRepository } from "@/lib/repositories/jobRepository";
import {
  Search,
  Globe,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
  TrendingUp,
  Cpu,
  HardHat,
  Stethoscope,
  Briefcase,
  Layers,
  FileCheck2,
  Users2,
  Lock,
} from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const jobRepo = new JobRepository();
  const latestJobs = await jobRepo.getLatestJobs(8);
  const totalCount = await jobRepo.getTotalActiveJobCount();

  // Category Icon Mapping
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "technology":
      case "software":
        return Cpu;
      case "engineering":
      case "civil-engineering":
      case "construction":
        return HardHat;
      case "healthcare":
      case "nursing":
        return Stethoscope;
      case "finance":
      case "accounting":
        return TrendingUp;
      default:
        return Briefcase;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-100 selection:text-brand-900">
      <Navbar />

      {/* Live Activity Marquee Ticker */}
      <div className="w-full bg-slate-950 py-1.5 border-b border-slate-800">
        <LiveActivityTicker />
      </div>

      <main className="flex-1 flex flex-col items-center">
        {/* =========================================================
            SECTION 1: HERO SECTION
           ========================================================= */}
        <section className="w-full relative py-16 md:py-24 overflow-hidden hero-gradient flex flex-col items-center text-center px-4">
          {/* Subtle decorative blurred glow orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-sky-400/15 via-brand-500/10 to-indigo-500/15 blur-3xl rounded-full pointer-events-none -z-10" />

          {/* Top Live Stats Badge */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3 animate-fadeInDown">
            <HeroCounterAnimation target={totalCount > 0 ? totalCount : 12450} />
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-700 text-xs font-semibold shadow-xs">
              <Globe className="w-3.5 h-3.5 text-brand-600" />
              <span>5 Global Countries Indexed</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl font-display leading-[1.12] animate-fadeInUp">
            Find Jobs With Verified{" "}
            <span className="gradient-text-brand block sm:inline">
              Visa Sponsorship
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl font-normal leading-relaxed animate-fadeInUp delay-100">
            Search thousands of international opportunities across the{" "}
            <strong className="text-slate-800 font-semibold">UK, USA, Australia, Canada, & New Zealand</strong> with algorithmic visa signal verification.
          </p>

          {/* Search Box Component */}
          <form
            action="/jobs"
            method="GET"
            className="w-full max-w-3xl mt-8 p-2.5 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-300/40 border border-slate-200/90 flex flex-col md:flex-row gap-2 text-left animate-fadeInUp delay-200"
          >
            <div className="flex-1 flex items-center px-3.5 gap-2.5 border-b md:border-b-0 md:border-r border-slate-100 py-2.5 md:py-0">
              <Search className="w-5 h-5 text-brand-500 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Job title, skill, or keyword (e.g. Civil Engineer, React, Nurse)"
                className="w-full outline-none text-slate-800 placeholder:text-slate-400 text-sm bg-transparent font-medium"
              />
            </div>

            <div className="flex-1 flex items-center px-3.5 gap-2.5 py-2.5 md:py-0">
              <Globe className="w-5 h-5 text-slate-400 shrink-0" />
              <select
                name="country"
                className="w-full outline-none text-slate-700 bg-transparent text-sm font-medium cursor-pointer"
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
              className="px-7 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-600/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Search Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Search Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-2xl animate-fadeInUp delay-300">
            <span className="text-xs font-semibold text-slate-400">Popular Searches:</span>
            {[
              "Civil Engineer",
              "Software Engineer",
              "Registered Nurse",
              "Data Analyst",
              "Structural Engineer",
              "DevOps Engineer",
              "Accountant",
              "Project Manager",
            ].map((chip) => (
              <Link
                key={chip}
                href={`/jobs?q=${encodeURIComponent(chip)}`}
                className="px-3 py-1 rounded-full bg-white hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-semibold border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200"
              >
                {chip}
              </Link>
            ))}
          </div>

          {/* Quick Trust Highlights Bar */}
          <div className="mt-10 pt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>100% Free For Applicants</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>Verified CoS / LMIA / H-1B Signals</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Direct Verified ATS Links</span>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 2: COUNTRY HUBS
           ========================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Jurisdiction Hubs</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                Explore by Country
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Target verified visa routes, official sponsorship registries, and active openings.
              </p>
            </div>
            <Link
              href="/countries"
              className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 shrink-0"
            >
              <span>View All Country Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {INITIAL_COUNTRIES.map((c) => (
              <Link
                key={c.code}
                href={`/jobs/${c.slug}`}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-brand-500 hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-3">{c.flag}</div>
                  <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors font-display">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Currency: <span className="font-semibold text-slate-700">{c.currency}</span>
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-bold">
                  <span>Explore Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =========================================================
            SECTION 3: LATEST OPPORTUNITIES
           ========================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-14 bg-white/70 rounded-3xl border border-slate-200/80 my-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Fresh Openings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                Latest Verified Sponsorship Opportunities
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Recent vacancies with detected visa support and employer sponsorship evidence.
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-all shrink-0 border border-brand-200/60"
            >
              <span>Browse All Openings ({totalCount > 0 ? totalCount : "12,000+"})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
              No jobs loaded yet. Run <code className="bg-slate-100 px-2 py-1 rounded">npm run db:seed</code> to populate demo data.
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-sm font-bold transition-all shadow-md"
            >
              <span>View Full Directory with Advanced Filters</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* =========================================================
            SECTION 4: SALARY BENCHMARKS WIDGET
           ========================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <SalaryInsightsWidget />
        </section>

        {/* =========================================================
            SECTION 5: POPULAR CATEGORIES
           ========================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Sector Explorer</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                High-Demand Sponsorship Categories
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Industries actively sponsoring international talent to solve skilled labor deficits.
              </p>
            </div>
            <Link
              href="/categories"
              className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 shrink-0"
            >
              <span>All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {INITIAL_CATEGORIES.map((cat) => {
              const Icon = getCategoryIcon(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/jobs?category=${cat.slug}`}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-500 hover:shadow-card-hover transition-all duration-300 text-left group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors font-display">
                      {cat.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">Explore roles &rarr;</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* =========================================================
            SECTION 6: HOW IT WORKS (ROADMAP)
           ========================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/80 text-brand-800 text-xs font-semibold mb-3">
              <span>Transparent 4-Step Process</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-display">
              How SponsorAJobs Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              A straightforward discovery engine engineered specifically for international job candidates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Aggregate Public Vacancies",
                desc: "We continuously scan verified ATS portals (Workday, Greenhouse, Lever, USAJOBS) and official sponsor registers.",
              },
              {
                step: "02",
                title: "Parse Sponsorship Signals",
                desc: "Our deterministic engine checks descriptions for CoS, LMIA, H-1B, TSS 482, and visa assistance clauses.",
              },
              {
                step: "03",
                title: "Inspect Evidence Snippets",
                desc: "Review verbatim quote extracts confirming sponsorship willingness before spending hours applying.",
              },
              {
                step: "04",
                title: "Direct Verified Application",
                desc: "Apply directly on the employer's official recruitment portal with 100% direct links and zero intermediary fees.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-card transition-all relative group"
              >
                <span className="text-xs font-black text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md mb-4 inline-block font-display">
                  STEP {item.step}
                </span>
                <h3 className="text-base font-bold text-slate-900 mb-2 font-display">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            SECTION 7: JOB ALERT EMAIL CAPTURE
           ========================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <JobAlertSignup />
        </section>

        {/* =========================================================
            SECTION 8: TRUST & LEGAL COMMITMENT
           ========================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 mb-12">
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 shadow-xl">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-brand-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Ethical & Transparent Immigration Intelligence</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
                Our Commitment to Accurate Data & Applicant Protection
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                SponsorAJobs is an informational discovery engine. We do not charge job seekers, sell work permits, or guarantee visas. Always verify sponsorship criteria directly with prospective employers and official government immigration departments.
              </p>
            </div>
            <Link
              href="/visa-sponsorship"
              className="shrink-0 px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-600/30"
            >
              Read Visa Guidelines
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
