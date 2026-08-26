import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { HeroCounterAnimation } from "@/components/HeroCounterAnimation";
import { LiveActivityTicker } from "@/components/LiveActivityTicker";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { blogRepository } from "@/lib/repositories/blogRepository";
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
  FileCheck2,
  Users2,
  Lock,
  ArrowUpRight,
  BookOpen,
  HelpCircle,
  Clock,
  Award,
  Zap,
  MapPin,
  ChevronRight,
} from "lucide-react";

export const revalidate = 60;

// High-profile verified global sponsors to display in trust marquee
const TOP_SPONSORS = [
  { name: "Google", country: "Global", badge: "Tier-1 Sponsor", logo: "G" },
  { name: "Microsoft", country: "Global", badge: "Verified Sponsor", logo: "M" },
  { name: "Amazon", country: "UK / USA", badge: "High Volume", logo: "A" },
  { name: "NHS Trusts", country: "UK", badge: "Health & Care", logo: "NHS" },
  { name: "Atlassian", country: "Australia / US", badge: "TSS 482 Sponsor", logo: "AT" },
  { name: "Monzo Bank", country: "UK", badge: "FinTech Sponsor", logo: "MZ" },
  { name: "Revolut", country: "UK / Global", badge: "Tech CoS", logo: "R" },
  { name: "Deloitte", country: "Global", badge: "Consulting", logo: "D" },
];

export default async function HomePage() {
  const jobRepo = new JobRepository();
  const latestJobs = await jobRepo.getLatestJobs(8);
  const totalCount = await jobRepo.getTotalActiveJobCount();
  const { posts: featuredGuides } = await blogRepository.getAllPosts({ limit: 3 });

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      {/* ── Top Header Navigation ── */}
      <Navbar />

      {/* ── Live Activity Ticker Bar ── */}
      <div className="w-full bg-slate-950 py-1.5 border-b border-slate-800/80">
        <LiveActivityTicker />
      </div>

      <main className="flex-1 flex flex-col items-center overflow-x-hidden">
        {/* =========================================================
            SECTION 1: HERO WITH GLOW AND SEARCH
           ========================================================= */}
        <section className="w-full relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-sky-500/20 via-brand-600/15 to-indigo-600/20 blur-[130px] rounded-full pointer-events-none -z-10" />
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

          {/* Top Live Stats Badge */}
          <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 backdrop-blur-xl shadow-lg animate-fadeInDown">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-300">
              <strong className="text-white font-bold">{totalCount > 0 ? totalCount : "640+"}</strong> Active Sponsored Jobs Live
            </span>
            <span className="text-slate-500 text-xs hidden sm:inline">•</span>
            <span className="text-xs text-brand-400 font-medium hidden sm:inline">
              Updated Hourly
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl font-display leading-[1.12]">
            Jobs With Verified <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-brand-400 to-indigo-300 bg-clip-text text-transparent">
              Visa Sponsorship
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-lg md:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
            Direct job opportunities from licensed employers across the{" "}
            <strong className="text-white font-semibold">UK, USA, Canada, Australia & New Zealand</strong> with algorithmic visa signal verification.
          </p>

          {/* ── Omni Search Form (Ultra Responsive) ── */}
          <form
            action="/jobs"
            method="GET"
            className="w-full max-w-3xl mt-8 p-2 sm:p-2.5 bg-slate-800/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/50 border border-slate-700/80 flex flex-col md:flex-row gap-2 text-left"
          >
            <div className="flex-1 flex items-center px-4 gap-3 border-b md:border-b-0 md:border-r border-slate-700/70 py-3 md:py-0">
              <Search className="w-5 h-5 text-brand-400 shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Job title, skill, or company (e.g. Civil Engineer, React, Nurse)"
                className="w-full outline-none text-white placeholder:text-slate-400 text-sm bg-transparent font-medium"
              />
            </div>

            <div className="flex items-center px-4 gap-3 py-3 md:py-0 md:w-56">
              <Globe className="w-5 h-5 text-slate-400 shrink-0" />
              <select
                name="country"
                className="w-full outline-none text-slate-200 bg-transparent text-sm font-medium cursor-pointer"
                defaultValue="ALL"
              >
                <option value="ALL" className="bg-slate-900 text-white">All Countries (5)</option>
                {INITIAL_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code.toLowerCase()} className="bg-slate-900 text-white">
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white rounded-xl sm:rounded-2xl font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Search Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* ── Popular Quick Search Badges ── */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Trending:
            </span>
            {[
              { label: "Civil Engineer", q: "Civil Engineer" },
              { label: "Software Engineer", q: "Software Engineer" },
              { label: "Registered Nurse", q: "Nurse" },
              { label: "Data Analyst", q: "Data Analyst" },
              { label: "DevOps", q: "DevOps" },
              { label: "Accountant", q: "Accountant" },
              { label: "Project Manager", q: "Project Manager" },
            ].map((chip) => (
              <Link
                key={chip.label}
                href={`/jobs?q=${encodeURIComponent(chip.q)}`}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-brand-600/30 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 hover:border-brand-500/50 transition-all duration-200 shadow-2xs"
              >
                {chip.label}
              </Link>
            ))}
          </div>

          {/* ── Key Trust Badges ── */}
          <div className="mt-12 pt-8 border-t border-slate-800/70 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">100% Free for Applicants</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span className="text-slate-300">Deterministic CoS / LMIA / H-1B Signals</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">Direct ATS Endpoints (Zero Middlemen)</span>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 2: VERIFIED SPONSOR LOGO MARQUEE
           ========================================================= */}
        <section className="w-full bg-slate-950 py-8 border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs uppercase tracking-widest font-bold text-slate-400 mb-6">
              Verified Visa Sponsors Hiring International Talent
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {TOP_SPONSORS.map((s, i) => (
                <Link
                  key={i}
                  href={`/jobs?q=${encodeURIComponent(s.name)}`}
                  className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-brand-500/40 hover:bg-slate-850 transition-all text-center group flex flex-col items-center justify-center"
                >
                  <span className="text-sm font-bold text-white group-hover:text-brand-400 transition-colors">
                    {s.name}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {s.badge}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 3: DESTINATION HUBS (5 COUNTRIES)
           ========================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
                <Globe className="w-4 h-4" />
                <span>Global Visa Hubs</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
                Browse Jobs by Country
              </h2>
              <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
                Select your target destination to explore verified license registries, salary rules, and active sponsor vacancies.
              </p>
            </div>

            <Link
              href="/countries"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shrink-0"
            >
              <span>View All Country Hubs</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {INITIAL_COUNTRIES.map((c) => (
              <Link
                key={c.code}
                href={`/jobs/${c.slug}`}
                className="group p-6 rounded-3xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-brand-500/60 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-brand-500/5"
              >
                <div>
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300 inline-block">
                    {c.flag}
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors font-display">
                    {c.name}
                  </h3>
                  <div className="mt-2 space-y-1 text-xs text-slate-400">
                    <p className="flex items-center justify-between">
                      <span>Visa Scheme:</span>
                      <span className="font-semibold text-slate-200">
                        {c.code === "GB" ? "Skilled Worker (CoS)" : c.code === "US" ? "H-1B / Cap-Exempt" : c.code === "CA" ? "LMIA / GTS" : c.code === "AU" ? "TSS 482" : "AEWV"}
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Currency:</span>
                      <span className="font-semibold text-slate-200">{c.currency}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-brand-400 font-bold group-hover:text-brand-300">
                  <span>Explore Jobs</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =========================================================
            SECTION 4: LATEST VERIFIED JOBS (High Contrast Light Feed)
           ========================================================= */}
        <section className="w-full bg-slate-100 text-slate-900 py-16 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Real-Time Feed</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">
                  Latest Verified Sponsorship Jobs
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Vacancies updated daily with detected visa sponsorship signals and employer eligibility.
                </p>
              </div>

              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-600/20 transition-all shrink-0"
              >
                <span>Browse All {totalCount > 0 ? totalCount : "640+"} Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 text-sm font-bold border border-slate-300 shadow-sm transition-all hover:shadow-md"
              >
                <span>Load More Verified Positions</span>
                <ArrowRight className="w-4 h-4 text-brand-600" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 5: SALARY & VISA BENCHMARKS MATRIX
           ========================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              <span>Immigration Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              {new Date().getFullYear()} Minimum Salary & Visa Thresholds
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Official wage floors required by immigration authorities for employer visa sponsorship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🇬🇧</span>
                <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
                  UK Skilled Worker
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">General Salary Threshold</p>
                <h4 className="text-2xl font-bold text-white font-display mt-0.5">£38,700 / year</h4>
                <p className="text-xs text-emerald-400 mt-1">Health & Care roles: £29,000 / year</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-700/60 pt-3">
                Requires a Certificate of Sponsorship (CoS) from a Home Office licensed sponsor and eligible SOC code.
              </p>
              <Link href="/blog/uk-skilled-worker-visa-sponsorship-guide-2026" className="inline-flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300">
                <span>Read Full UK Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🇺🇸</span>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                  US H-1B & Cap-Exempt
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Prevailing Wage Requirement</p>
                <h4 className="text-2xl font-bold text-white font-display mt-0.5">Role Specific</h4>
                <p className="text-xs text-indigo-300 mt-1">Cap-Exempt: Zero lottery required</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-700/60 pt-3">
                Universities, non-profit research institutes, and hospital systems can sponsor H-1B visas year-round.
              </p>
              <Link href="/blog/usa-h1b-cap-exempt-jobs-guide-2026" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300">
                <span>Read Full US Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl">🇦🇺</span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  Australia TSS 482
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400">TSMIT Minimum Income</p>
                <h4 className="text-2xl font-bold text-white font-display mt-0.5">$73,150 AUD</h4>
                <p className="text-xs text-emerald-400 mt-1">PR Pathway: Subclass 186</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-700/60 pt-3">
                Employers must be approved standard business sponsors and meet the Temporary Skilled Migration Income Threshold.
              </p>
              <Link href="/blog/australia-tss-482-visa-sponsorship-occupations-guide" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300">
                <span>Read Full Australia Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 6: FEATURED CAREER & VISA GUIDES
           ========================================================= */}
        {featuredGuides.length > 0 && (
          <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Authority Guides</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
                  Featured Visa & Relocation Guides
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  In-depth blueprints on salary rules, shortage occupation lists, and sponsor employer directories.
                </p>
              </div>

              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shrink-0"
              >
                <span>Read All Guides</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredGuides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/blog/${guide.slug}`}
                  className="group p-6 rounded-3xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-brand-500/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
                        {guide.category.name}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {guide.readTimeMinutes} min
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-400 transition-colors font-display line-clamp-2">
                      {guide.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                      {guide.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-brand-400 group-hover:text-brand-300">
                    <span>Read Full Guide</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================
            SECTION 7: HOW SPONSORAJOBS VERIFIES SIGNALS
           ========================================================= */}
        <section className="w-full bg-slate-950 py-16 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Fake Jobs Guarantee</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
                How Our Verification Engine Works
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                We ingest hundreds of direct ATS feeds and evaluate them against official immigration registries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                  01
                </div>
                <h4 className="text-base font-bold text-white font-display">ATS Direct Ingestion</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We connect directly to official corporate Greenhouse, Lever, Workday, and government job APIs.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                  02
                </div>
                <h4 className="text-base font-bold text-white font-display">Deterministic Parsing</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extracts explicit signals: "Visa Sponsorship Provided", "CoS Available", "LMIA Approved", or "Cap-Exempt".
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold">
                  03
                </div>
                <h4 className="text-base font-bold text-white font-display">License Cross-Check</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Matches employer names against official Home Office, USCIS, and ESDC sponsor license registries.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                  04
                </div>
                <h4 className="text-base font-bold text-white font-display">Direct Applicant Link</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You apply directly on the verified employer portal. No recruiters, no fees, no scam intermediaries.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 8: JOB ALERTS CALL TO ACTION
           ========================================================= */}
        <section className="w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
          <JobAlertSignup />
        </section>
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
