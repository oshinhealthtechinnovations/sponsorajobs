import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { JobSearchBar } from "@/components/JobSearchBar";
import { SponsorshipRadarMap } from "@/components/SponsorshipRadarMap";
import { CareerRoutesNavigator } from "@/components/CareerRoutesNavigator";
import { VerificationTimeline } from "@/components/VerificationTimeline";
import { ApplicationReadinessCalculator } from "@/components/ApplicationReadinessCalculator";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import { CreateAccountCTA } from "@/components/CreateAccountCTA";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { blogRepository } from "@/lib/repositories/blogRepository";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Search,
  Globe2,
  Building2,
  Clock,
  Briefcase,
  Bell,
  Sparkles,
} from "lucide-react";

export const revalidate = 900;

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
            SECTION 01: HERO — Ultra-Modern Light Luxury Authentic Experience
           ========================================================================= */}
        <section className="w-full relative pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-sky-50/70 via-white to-slate-50/50 text-slate-900 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-200/80">
          {/* Subtle geometric dot grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.035] pointer-events-none" />
          {/* Ambient soft luminous radial glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[360px] bg-gradient-to-b from-sky-200/25 via-cyan-100/20 to-transparent blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
            {/* Live Trust & Verification Beacon Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-sky-200/80 shadow-[0_2px_12px_rgba(14,165,233,0.08)] text-xs font-bold text-slate-700 backdrop-blur-md">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="tracking-tight text-slate-800">
                1,850+ Live Verified Roles <span className="text-slate-300 mx-1">•</span> Direct ATS Applications <span className="text-slate-300 mx-1">•</span> Zero Middlemen
              </span>
            </div>

            {/* MAIN HERO HEADLINE — High Impact Typography */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 max-w-4xl leading-[1.1]">
              Find International Jobs{" "}
              <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                With Real Visa Sponsorship.
              </span>
            </h1>

            <p className="mt-5 text-sm sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Search verified global vacancies with algorithmic sponsorship signal detection (UK Tier 2 / CoS, USA H-1B, Australia TSS 482, Canada LMIA). 100% direct official ATS application links.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-4xl mt-10">
              <JobSearchBar variant="hero" />
            </div>

            {/* Verified Sponsor Logos Row */}
            <div className="mt-8 w-full max-w-4xl pt-5 border-t border-slate-200/80 flex flex-col items-center">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Licensed Sponsor Employers</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                {[
                  { name: "Google", tag: "Tech" },
                  { name: "Balfour Beatty", tag: "Engineering" },
                  { name: "Amazon", tag: "Tech" },
                  { name: "NHS England", tag: "Healthcare" },
                  { name: "Mace Group", tag: "Construction" },
                  { name: "Atlassian", tag: "Tech" },
                  { name: "Microsoft", tag: "Tech" },
                  { name: "Deloitte", tag: "Finance" },
                  { name: "Monzo Bank", tag: "Fintech" },
                  { name: "Siemens", tag: "Engineering" },
                ].map((comp) => (
                  <span
                    key={comp.name}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:shadow-xs transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{comp.name}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Elevated Light Luxury Trust Metrics Cards */}
            <div className="mt-8 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 text-center">
              {/* Metric 1 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_20px_rgba(14,165,233,0.06)] hover:shadow-md transition-all flex flex-col items-center justify-between space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Live Vacancies</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                  {totalCount > 0 ? `${totalCount.toLocaleString()}+` : "7,800+"}
                </div>
                <div className="text-xs text-slate-600 font-bold">Verified Active Roles</div>
              </div>

              {/* Metric 2 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-md transition-all flex flex-col items-center justify-between space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-indigo-600" />
                  <span>Verified Sponsors</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  472+
                </div>
                <div className="text-xs text-slate-600 font-bold">Licensed Employers</div>
              </div>

              {/* Metric 3 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-md transition-all flex flex-col items-center justify-between space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Globe2 className="w-3 h-3 text-sky-600" />
                  <span>Destinations</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  5 Hubs
                </div>
                <div className="text-xs text-slate-600 font-bold">UK · US · AU · CA · NZ</div>
              </div>

              {/* Metric 4 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_4px_20px_rgba(16,185,129,0.06)] hover:shadow-md transition-all flex flex-col items-center justify-between space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Zero Middlemen</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                  100%
                </div>
                <div className="text-xs text-slate-600 font-bold">Direct Official ATS</div>
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
                  <span>Verified Opportunities Today</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  Featured Visa Sponsored Opportunities
                </h2>
                <p className="text-sm text-slate-600 max-w-xl">
                  Browse verified international opportunities with explicit Certificate of Sponsorship (CoS), H-1B, and TSS 482 eligibility.
                </p>
              </div>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-all shadow-sm hover:shadow-md shrink-0"
              >
                <span>View All 1,850+ Jobs</span>
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </Link>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {["All Sectors", "Engineering & Construction", "Software & Tech", "Healthcare & Nursing", "Finance & Banking", "Data & AI"].map((cat, i) => (
                <Link
                  key={cat}
                  href={`/jobs?category=${encodeURIComponent(cat.toLowerCase().replace(/ & /g, '-'))}`}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-2xs ${
                    i === 0
                      ? "bg-slate-900 text-white"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-sky-300"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </div>

            {/* Country Filter Chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { label: "🌍 All Destinations", code: "" },
                { label: "🇬🇧 United Kingdom (Skilled Worker)", code: "uk" },
                { label: "🇺🇸 United States (H-1B)", code: "usa" },
                { label: "🇦🇺 Australia (TSS 482)", code: "australia" },
                { label: "🇨🇦 Canada (LMIA / GTS)", code: "canada" },
                { label: "🇳🇿 New Zealand (AEWV)", code: "new-zealand" },
              ].map((country, i) => (
                <Link
                  key={country.code || "all"}
                  href={country.code ? `/jobs/${country.code}` : "/jobs"}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    i === 0
                      ? "bg-sky-100 text-sky-900 border border-sky-200"
                      : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
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
            SECTION 08: ELIGIBILITY TOOL
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
            SECTION 08: HOW IT WORKS — 3-step visual
           ========================================================================= */}
        <section className="w-full bg-white border-b border-slate-100 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#19CBE0]" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">How SponsorAJobs Works</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto mb-12">
              From search to successful application in three simple steps.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute top-10 left-[calc(16.7%+32px)] right-[calc(16.7%+32px)] h-[2px] bg-gradient-to-r from-[#19CBE0]/30 via-[#19CBE0] to-[#19CBE0]/30 pointer-events-none" />
              {[
                {
                  step: "01",
                  icon: <Search className="w-6 h-6 text-[#19CBE0]" />,
                  title: "Search Verified Jobs",
                  desc: "Browse 1,400+ verified international openings filtered by country, salary, sponsorship signal, and sector.",
                  color: "bg-[#19CBE0]/10 border-[#19CBE0]/30",
                },
                {
                  step: "02",
                  icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
                  title: "Create Your Free Account",
                  desc: "Save jobs, track applications, get alerts, and unlock your personalised candidate dashboard — completely free.",
                  color: "bg-emerald-50 border-emerald-200",
                },
                {
                  step: "03",
                  icon: <ArrowRight className="w-6 h-6 text-violet-500" />,
                  title: "Apply Directly to Employers",
                  desc: "No recruiters, no middlemen. Every application link goes straight to the official employer careers page.",
                  color: "bg-violet-50 border-violet-200",
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:shadow-md transition-all duration-200 relative">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-black text-slate-300 tracking-widest mb-1">STEP {item.step}</span>
                  <h3 className="text-base font-extrabold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 09: WHY CREATE A FREE ACCOUNT — conversion nudge
           ========================================================================= */}
        <section className="w-full bg-[#F7F9FC] border-b border-slate-200 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Always Free</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Why Create a Free Account?</h2>
              <p className="text-sm text-slate-500 mt-3 max-w-xl mx-auto">
                An account unlocks your full candidate toolkit. No credit card, no commitment.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: "📁", title: "Save Jobs", desc: "Bookmark any job instantly and revisit your shortlist anytime — across all devices." },
                { icon: "📊", title: "Application Tracker", desc: "Log every application with status, notes, and employer contacts. Know exactly where you stand." },
                { icon: "🔔", title: "Job Alerts", desc: "Get notified the moment new verified jobs matching your profile are posted." },
                { icon: "🎯", title: "Personalised Recommendations", desc: "Smart job suggestions based on your profession and application history." },
                { icon: "🛂", title: "Sponsorship Score", desc: "See a visa sponsorship probability score for every job you track." },
                { icon: "📈", title: "Career Insights", desc: "Understand salary ranges, in-demand skills, and hiring trends in your target market." },
              ].map((b) => (
                <div key={b.title} className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-brand-200 hover:shadow-sm transition-all duration-200">
                  <div className="text-2xl mb-3">{b.icon}</div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-1.5">{b.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
            <CreateAccountCTA />

          </div>
        </section>

        {/* =========================================================================
            SECTION 10: JOB ALERTS + FINAL CTA (Modern Balanced Bento Grid)
           ========================================================================= */}
        <section className="w-full bg-gradient-to-b from-slate-50 via-white to-sky-50/40 text-slate-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Bento Card 1: Job Alerts Hub (7 cols) */}
            <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_40px_rgba(15,23,42,0.05)] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  <span>Instant Job Alerts</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Never Miss a Verified Opportunity
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                  Receive curated notifications when newly verified international vacancies matching your target destination and profession are published.
                </p>
              </div>

              {/* Clean Inline Form */}
              <div className="pt-2">
                <JobAlertSignup />
              </div>
            </div>

            {/* Bento Card 2: Quick Search & CV Hub (5 cols) */}
            <div className="lg:col-span-5 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-sky-50/80 via-white to-cyan-50/50 text-slate-900 border border-sky-200/90 shadow-[0_15px_40px_rgba(15,23,42,0.05)] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Direct Application Platform</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                  Stop Guessing.{" "}
                  <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                    Start Applying.
                  </span>
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Search hundreds of active vacancies with verified sponsorship signals and apply directly to the official ATS.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/jobs"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-sky-700 hover:from-sky-700 hover:to-cyan-700 text-white font-black text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Search International Jobs</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/tools/ats-checker"
                  className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-2xs"
                >
                  <span>Scan Resume Against Live Jobs (ATS Free)</span>
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
