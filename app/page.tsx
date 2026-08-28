import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { JobSearchBar } from "@/components/JobSearchBar";
import { ApplicationWorthinessGauge } from "@/components/ApplicationWorthinessGauge";
import { SponsorshipRadarMap } from "@/components/SponsorshipRadarMap";
import { CareerRoutesNavigator } from "@/components/CareerRoutesNavigator";
import { ApplicationReadinessCalculator } from "@/components/ApplicationReadinessCalculator";
import { VerificationTimeline } from "@/components/VerificationTimeline";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { blogRepository } from "@/lib/repositories/blogRepository";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Search,
  Globe2,
  Building2,
  TrendingUp,
  Clock,
  Briefcase,
  Bell,
} from "lucide-react";

export const revalidate = 60;

export default async function HomePage() {
  const jobRepo = new JobRepository();
  const latestJobs = await jobRepo.getLatestJobs(6);
  const totalCount = await jobRepo.getTotalActiveJobCount();
  const { posts: featuredGuides } = await blogRepository.getAllPosts({ limit: 3 });

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 flex flex-col items-center overflow-x-hidden">

        {/* =========================================================================
            SECTION 01: HERO — Jobs-first, clean and professional
           ========================================================================= */}
        <section className="w-full relative pt-12 pb-16 sm:pt-20 sm:pb-24 bg-[#071522] text-white flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#19CBE0_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.04] pointer-events-none" />
          {/* Atmospheric glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] bg-[#19CBE0]/8 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
            {/* Trust eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-slate-300 backdrop-blur-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#19CBE0] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#19CBE0]" />
              </span>
              <span>Verified International Jobs · Direct Employer Applications</span>
            </div>

            {/* MAIN HEADLINE — jobs-first per spec §6 */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]">
              Find International Jobs{" "}
              <span className="text-[#19CBE0]">
                You Can Actually Apply For.
              </span>
            </h1>

            <p className="mt-5 text-sm sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
              Search verified international jobs with sponsorship signals, employer verification, salary intelligence and direct application links.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-4xl mt-10">
              <JobSearchBar variant="hero" />
            </div>

            {/* Trust Metrics — simplified per spec §7 */}
            <div className="mt-10 pt-8 border-t border-white/10 w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-white">{totalCount > 0 ? `${totalCount}+` : "760+"}</div>
                <div className="text-xs text-slate-400 font-medium">Verified Jobs</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-white">287</div>
                <div className="text-xs text-slate-400 font-medium">Verified Employers</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-white">5</div>
                <div className="text-xs text-slate-400 font-medium">International Markets</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-[#19CBE0]">100%</div>
                <div className="text-xs text-slate-400 font-medium">Direct Employer Links</div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 02: LIVE VERIFIED JOBS — Primary product experience
           ========================================================================= */}
        <section className="w-full bg-white border-b border-slate-200/80 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Opportunities</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Find Jobs That Match Your Goals
                </h2>
                <p className="text-sm text-slate-600">
                  Browse verified international opportunities and quickly understand why each job is worth considering.
                </p>
              </div>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#071522] hover:bg-slate-800 text-white text-sm font-bold transition-colors shadow-sm shrink-0"
              >
                <span>View All Jobs</span>
                <ArrowRight className="w-4 h-4 text-[#19CBE0]" />
              </Link>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {["All Sectors", "Software & Tech", "Engineering", "Healthcare", "Finance", "Construction"].map((cat, i) => (
                <button
                  key={cat}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    i === 0
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Country Filter Chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { label: "All Countries", code: "" },
                { label: "🇬🇧 UK", code: "uk" },
                { label: "🇺🇸 USA", code: "usa" },
                { label: "🇦🇺 Australia", code: "australia" },
                { label: "🇨🇦 Canada", code: "canada" },
                { label: "🇳🇿 New Zealand", code: "new-zealand" },
              ].map((country, i) => (
                <Link
                  key={country.code || "all"}
                  href={country.code ? `/jobs/${country.code}` : "/jobs"}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    i === 0
                      ? "bg-slate-100 text-slate-800"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {country.label}
                </Link>
              ))}
            </div>

            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 03: WHY WE'RE DIFFERENT — The filtering funnel
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Headline */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Most Job Boards Show You Jobs.
                <br />
                <span className="text-[#19CBE0]">SponsorAJobs Shows You Which Ones Are Worth Applying To.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Every listing on SponsorAJobs passes through a multi-point verification process — so you spend time on applications that are actually relevant, not guessing games.
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#071522] hover:bg-slate-800 text-white font-bold text-sm transition-colors shadow-sm"
              >
                Start Searching →
              </Link>
            </div>

            {/* Right: Interactive Funnel */}
            <div className="flex flex-col items-center max-w-sm mx-auto lg:mx-0 space-y-2">
              {/* Stage 1: Total */}
              <div className="w-full p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
                <div className="text-4xl font-black text-slate-900">1,000</div>
                <div className="text-sm font-semibold text-slate-600 mt-1">Jobs Discovered</div>
              </div>

              <div className="text-slate-300 text-lg">↓</div>

              {/* Filter stages */}
              {[
                { removed: "612", reason: "No sponsorship signal detected", color: "text-red-400 bg-red-50 border-red-100" },
                { removed: "183", reason: "Employer verification issues", color: "text-orange-400 bg-orange-50 border-orange-100" },
                { removed: "78",  reason: "Expired or inactive postings", color: "text-amber-500 bg-amber-50 border-amber-100" },
              ].map((stage, i) => (
                <React.Fragment key={i}>
                  <div className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between px-5">
                    <div className={`text-base font-black ${stage.color.split(" ")[0]}`}>
                      −{stage.removed} removed
                    </div>
                    <div className="text-xs font-medium text-slate-500 text-right max-w-[55%]">
                      {stage.reason}
                    </div>
                  </div>
                  <div className="text-slate-300 text-lg">↓</div>
                </React.Fragment>
              ))}

              {/* Final result */}
              <div className="w-full p-8 rounded-2xl bg-[#071522] text-white border-2 border-[#19CBE0]/40 text-center shadow-xl">
                <div className="text-5xl font-black text-[#19CBE0]">127</div>
                <div className="text-lg font-extrabold text-white mt-1">Opportunities Worth Considering</div>
                <div className="flex items-center justify-center gap-3 text-xs text-emerald-400 font-semibold mt-3">
                  <span>✓ Verified</span>
                  <span>·</span>
                  <span>✓ Active</span>
                  <span>·</span>
                  <span>✓ Direct Apply</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 04: APPLICATION FIT — What the score means
           ========================================================================= */}
        <section className="w-full bg-[#071522] text-white border-y border-slate-800 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#19CBE0]/10 border border-[#19CBE0]/30 text-[#19CBE0] text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Application Fit</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Know Your Chances Before You Apply
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Every job on SponsorAJobs has an <strong className="text-white">Application Fit score</strong> — a clear 0–100 rating that evaluates sponsorship likelihood, employer verification, salary alignment, role relevance and posting freshness.
              </p>

              <div className="space-y-2 pt-2">
                {[
                  { range: "90–100", label: "Excellent Match", color: "bg-emerald-500" },
                  { range: "75–89",  label: "Strong Match",    color: "bg-emerald-400" },
                  { range: "60–74",  label: "Possible Match",  color: "bg-amber-400" },
                  { range: "40–59",  label: "Low Match",       color: "bg-slate-500" },
                  { range: "<40",    label: "Unlikely Match",  color: "bg-slate-600" },
                ].map(({ range, label, color }) => (
                  <div key={range} className="flex items-center gap-3 text-xs">
                    <div className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                    <span className="font-bold text-white w-14">{range}</span>
                    <span className="text-slate-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo Card */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500">Mace Group · London, UK</div>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5 leading-snug">
                    Senior Structural & Infrastructure Engineer
                  </h3>
                  <div className="text-xs font-bold text-emerald-700 mt-1">£68,000 – £82,000 / year</div>
                </div>
                <div className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                  VERIFIED
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <ApplicationWorthinessGauge
                  score={92}
                  size="md"
                  showBreakdown={true}
                  breakdown={{
                    sponsorshipLikelihood: 95,
                    employerVerification: 100,
                    roleMatch: 91,
                    salaryCompatibility: 88,
                    freshness: 97,
                  }}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Building2 className="w-3.5 h-3.5" />
                <span>Employer directly accepting international applications</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 05: INTERNATIONAL JOB MARKETS
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <SponsorshipRadarMap />
        </section>

        {/* =========================================================================
            SECTION 06: CAREER PATHS
           ========================================================================= */}
        <section className="w-full bg-slate-50 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto">
            <CareerRoutesNavigator />
          </div>
        </section>

        {/* =========================================================================
            SECTION 07: HOW VERIFICATION WORKS
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <VerificationTimeline />
        </section>

        {/* =========================================================================
            SECTION 08: ELIGIBILITY CHECKER
           ========================================================================= */}
        <section className="w-full bg-slate-50 border-y border-slate-200/80 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-7xl mx-auto">
            <ApplicationReadinessCalculator />
          </div>
        </section>

        {/* =========================================================================
            SECTION 09: CAREER GUIDES
           ========================================================================= */}
        {featuredGuides.length > 0 && (
          <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Career Guides</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  International Career Guides
                </h2>
                <p className="text-sm text-slate-600">
                  Practical guides on salary thresholds, shortage occupations and visa application strategies.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold transition-colors hover:bg-slate-50 shrink-0"
              >
                <span>All Guides</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredGuides.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                      {post.category?.name || "Career Guide"}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#071522] transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-4">
                    <span>{post.readTimeMinutes || 5} min read</span>
                    <span className="text-[#071522] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read guide →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION 10: JOB ALERTS + FINAL CTA
           ========================================================================= */}
        <section className="w-full bg-[#071522] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Job Alerts */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5B942]/10 border border-[#F5B942]/30 text-[#F5B942] text-xs font-bold uppercase tracking-wider">
                <Bell className="w-3.5 h-3.5" />
                <span>Job Alerts</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Never Miss a Relevant Opportunity
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Get notified when verified jobs matching your role, destination and sponsorship preferences are added. Free — no spam — unsubscribe anytime.
              </p>
              <div className="max-w-sm">
                <JobAlertSignup />
              </div>
            </div>

            {/* Final CTA */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6 text-center">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Stop Guessing.{" "}
                <span className="text-[#19CBE0]">Start Applying.</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Find verified international opportunities that match your career goals — with sponsorship intelligence built in.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/jobs"
                  className="px-8 py-4 rounded-xl bg-[#19CBE0] hover:bg-[#14b8ca] text-[#071522] font-extrabold text-sm transition-colors shadow-lg"
                >
                  Search International Jobs →
                </Link>
                <Link
                  href="/tools/ats-checker"
                  className="px-8 py-4 rounded-xl border border-white/20 hover:border-white/40 text-white font-bold text-sm transition-colors"
                >
                  Check Your CV
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
