import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { JobSearchBar } from "@/components/JobSearchBar";
import { ApplicationWorthinessGauge } from "@/components/ApplicationWorthinessGauge";
import { JobDNAProfile } from "@/components/JobDNAProfile";
import { SponsorshipRadarMap } from "@/components/SponsorshipRadarMap";
import { CareerRoutesNavigator } from "@/components/CareerRoutesNavigator";
import { ApplicationReadinessCalculator } from "@/components/ApplicationReadinessCalculator";
import { VerificationTimeline } from "@/components/VerificationTimeline";
import { JobAlertSignup } from "@/components/JobAlertSignup";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { blogRepository } from "@/lib/repositories/blogRepository";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Search,
  Globe2,
  Building2,
  TrendingUp,
  Cpu,
  HardHat,
  Stethoscope,
  Briefcase,
  Layers,
  Clock,
  Compass,
  AlertTriangle,
  FileCheck2,
  Filter,
  Check,
  XCircle,
} from "lucide-react";

export const revalidate = 60;

const TOP_EMPLOYER_PROFILES = [
  {
    name: "Mace Group",
    slug: "mace",
    countries: ["UK", "Australia", "Canada"],
    jobsCount: 10,
    signals: "High",
    momentum: "+24% Activity",
    disciplines: ["Civil / Structural", "Project Management", "Construction"],
  },
  {
    name: "Monzo Bank",
    slug: "monzo-bank",
    countries: ["UK", "USA"],
    jobsCount: 25,
    signals: "High",
    momentum: "+18% Activity",
    disciplines: ["Backend Go", "Distributed Systems", "Data Science"],
  },
  {
    name: "Google",
    slug: "google",
    countries: ["UK", "USA", "Australia"],
    jobsCount: 45,
    signals: "Tier-1 Sponsor",
    momentum: "+15% Activity",
    disciplines: ["Cloud Architecture", "AI / ML", "Software"],
  },
  {
    name: "Atlassian",
    slug: "atlassian",
    countries: ["Australia", "USA"],
    jobsCount: 18,
    signals: "TSS 482 Leader",
    momentum: "+12% Activity",
    disciplines: ["Product Management", "Full Stack", "DevOps"],
  },
];

export default async function HomePage() {
  const jobRepo = new JobRepository();
  const latestJobs = await jobRepo.getLatestJobs(6);
  const totalCount = await jobRepo.getTotalActiveJobCount();
  const { posts: featuredGuides } = await blogRepository.getAllPosts({ limit: 3 });

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-slate-900 font-sans selection:bg-[#18D6E5] selection:text-[#071421]">
      <Navbar />

      <main className="flex-1 flex flex-col items-center overflow-x-hidden">
        {/* =========================================================================
            SECTION 1: HERO (Before You Apply, Know If They Can Sponsor You)
           ========================================================================= */}
        <section className="w-full relative pt-14 pb-20 sm:pt-24 sm:pb-28 bg-[#071421] text-white flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
          {/* Subtle Grid & Atmospheric Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(#18D6E5_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[380px] bg-gradient-to-tr from-[#18D6E5]/15 via-[#7567F8]/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-black uppercase tracking-widest text-[#18D6E5] shadow-inner">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#18D6E5] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#18D6E5]"></span>
            </span>
            <span>GLOBAL SPONSORSHIP INTELLIGENCE PLATFORM</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl font-display leading-[1.08]">
            Before You Apply, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#18D6E5] via-sky-300 to-[#7567F8] bg-clip-text text-transparent">
              Know If They Can Sponsor You.
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
            Find international jobs from verified employers &mdash; with sponsorship signals, salary checks and direct application links.
          </p>

          {/* ── Interactive Sponsorship Intelligence Search ── */}
          <div className="w-full max-w-4xl mt-10">
            <JobSearchBar variant="hero" />
          </div>

          {/* ── Live Telemetry Metrics Readout ── */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-4 text-center">
            <div className="flex flex-col gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">{totalCount > 0 ? totalCount : "760"}+</div>
              <div className="text-xs text-slate-400">Verified Opportunities</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">287</div>
              <div className="text-xs text-slate-400">Verified Employers</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">5</div>
              <div className="text-xs text-slate-400">International Markets</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-2xl sm:text-3xl font-bold text-white">Direct Application</div>
              <div className="text-xs text-slate-400">Employer Application Links</div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: VISUAL FILTERING JOURNEY ("Stop Applying to Jobs That Don't Fit")
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Stop Applying to Jobs That Don't Fit.
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              SponsorAJobs filters opportunities before you spend your time applying.
            </p>
          </div>

          {/* Qualification Funnel */}
          <div className="flex flex-col items-center max-w-lg mx-auto space-y-2">
            
            <div className="w-full p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-sm">
              <div className="text-3xl font-black text-slate-900">100</div>
              <div className="text-sm font-bold text-slate-600">Jobs discovered</div>
            </div>

            <div className="text-slate-300">↓</div>

            <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between px-6">
              <div className="text-xl font-bold text-slate-400">61 removed</div>
              <div className="text-sm font-medium text-slate-500 text-right">No credible sponsorship signal</div>
            </div>

            <div className="text-slate-300">↓</div>

            <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between px-6">
              <div className="text-xl font-bold text-slate-400">23 removed</div>
              <div className="text-sm font-medium text-slate-500 text-right">Employer verification issue</div>
            </div>

            <div className="text-slate-300">↓</div>

            <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between px-6">
              <div className="text-xl font-bold text-slate-400">9 removed</div>
              <div className="text-sm font-medium text-slate-500 text-right">Expired or inactive posting</div>
            </div>

            <div className="text-[#18D6E5] text-xl font-bold pt-2">↓</div>

            <div className="w-full p-8 rounded-3xl bg-[#071421] text-white border border-[#18D6E5] text-center shadow-2xl relative overflow-hidden mt-2">
              <div className="absolute inset-0 bg-[radial-gradient(#18D6E5_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
              <div className="relative z-10 space-y-2">
                <div className="text-6xl font-black text-[#18D6E5]">7</div>
                <div className="text-xl font-extrabold text-white">Worth pursuing</div>
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-400 font-semibold mt-4">
                  <span>✓ Verified</span>
                  <span>&middot;</span>
                  <span>✓ Relevant</span>
                  <span>&middot;</span>
                  <span>✓ Recently checked</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            SECTION 3: JOBS WORTH YOUR ATTENTION
           ========================================================================= */}
        <section className="w-full bg-slate-50 border-y border-slate-200/80 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Jobs Worth Your Attention
              </h2>
              <p className="text-base text-slate-600">
                Recently verified international opportunities with sponsorship signals.
              </p>
            </div>

            {/* UI Filters */}
            <div className="flex flex-col items-center gap-4 mb-10">
              <div className="flex flex-wrap justify-center gap-2">
                <button className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-sm font-bold">All Jobs</button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold">Software & Tech</button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold">Engineering</button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold">Healthcare</button>
                <button className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold">Finance</button>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button className="px-3 py-1 rounded-md bg-slate-200/50 text-slate-700 text-xs font-semibold hover:bg-slate-200">UK</button>
                <button className="px-3 py-1 rounded-md bg-transparent text-slate-500 hover:text-slate-700 text-xs font-semibold">USA</button>
                <button className="px-3 py-1 rounded-md bg-transparent text-slate-500 hover:text-slate-700 text-xs font-semibold">Australia</button>
                <button className="px-3 py-1 rounded-md bg-transparent text-slate-500 hover:text-slate-700 text-xs font-semibold">Canada</button>
                <button className="px-3 py-1 rounded-md bg-transparent text-slate-500 hover:text-slate-700 text-xs font-semibold">New Zealand</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <Link href="/jobs" className="inline-flex px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-50 transition-colors shadow-sm">
                View All Verified Jobs
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: JOB MATCH DETAILS (Formerly Worthiness & DNA)
           ========================================================================= */}
        <section className="w-full bg-[#0D1B2A] text-white border-y border-slate-800 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#18D6E5] bg-[#18D6E5]/10 px-3 py-1 rounded-full border border-[#18D6E5]/20">
                Smart Job Matching
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
                The Job Match Score
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Every opportunity on SponsorAJobs receives a deterministic 0&ndash;100 Job Match Score. We assess sponsor licensing, salary viability against statutory thresholds, vacancy freshness, and role demand so you never apply blindly.
              </p>
            </div>

            {/* Analyzed Card Demonstration */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-[#087F8C]">Mace Group &middot; London, UK</div>
                  <h3 className="text-lg font-black font-display text-slate-900 mt-0.5">
                    Senior Structural & Infrastructure Engineer
                  </h3>
                  <div className="text-xs font-bold text-emerald-700 mt-1">£68,000 – £82,000 / year</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-[#E8FFF7] text-[#138A68] border border-[#B7F0DE] text-[10px] font-black uppercase tracking-wider">
                  VERIFIED
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
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

              <div className="pt-1">
                <JobDNAProfile
                  dna={{
                    sponsorship: 95,
                    employerConfidence: 100,
                    freshness: 97,
                    salaryAttractiveness: 88,
                    candidateMatch: 91,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: HOW WE VERIFY JOBS
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <VerificationTimeline />
        </section>

        {/* =========================================================================
            SECTION 6: GLOBAL SPONSORSHIP RADAR
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <SponsorshipRadarMap />
        </section>

        {/* =========================================================================
            SECTION 7: EXPLORE YOUR INTERNATIONAL CAREER PATH
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <CareerRoutesNavigator />
        </section>

        {/* =========================================================================
            SECTION 8: YOUR APPLICATION READINESS
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <ApplicationReadinessCalculator />
        </section>



        {/* =========================================================================
            SECTION 9: EMPLOYER SPONSORSHIP PROFILES
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
              Hiring Activity Telemetry
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Employer Sponsorship Profiles
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Proprietary international hiring activity, sponsor licensing, and active vacancy counts by company.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TOP_EMPLOYER_PROFILES.map((emp) => (
              <Link
                key={emp.slug}
                href={`/company/${emp.slug}`}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#18D6E5] hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-2xl bg-[#071421] text-white flex items-center justify-center font-black text-xs">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      {emp.momentum}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#087F8C] transition-colors">
                    {emp.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hiring across: {emp.countries.join(", ")}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Roles:</span>
                    <span className="font-bold text-slate-900">{emp.jobsCount} open</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sponsor Status:</span>
                    <span className="font-semibold text-brand-700">{emp.signals}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-[#087F8C] font-bold">
                  <span>Explore opportunities</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 10: CAREER & VISA EDITORIAL INTELLIGENCE
           ========================================================================= */}
        <section className="w-full bg-slate-50/70 border-y border-slate-200/80 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                  Data-Driven Guides
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 font-display">
                  Immigration & Career Intelligence
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Official salary thresholds, shortage occupation lists, and verified visa application strategies.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <span>View all intelligence guides</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredGuides.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#18D6E5] hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                      {post.category?.name || "Immigration Guide"}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 mt-4">
                    <span>{post.readTimeMinutes || 5} min read</span>
                    <span className="text-brand-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read guide &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 11: SPONSORSHIP RADAR ALERTS & FINAL CTA
           ========================================================================= */}
        <section className="w-full bg-[#071421] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#18D6E5] bg-[#18D6E5]/10 px-3 py-1 rounded-full border border-[#18D6E5]/30">
              Personalized Radar
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
              Know when a real opportunity appears.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              We&rsquo;ll notify you the moment a verified employer posts a high-confidence sponsorship vacancy matching your discipline.
            </p>
            <div className="pt-4 max-w-md mx-auto">
              <JobAlertSignup />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
