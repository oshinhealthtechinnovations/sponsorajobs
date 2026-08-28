import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { JobSearchBar } from "@/components/JobSearchBar";
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
  Shield,
  Layers,
  FileSearch,
  Compass,
} from "lucide-react";

export const revalidate = 60;

// High-profile verified global sponsors
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
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex flex-col items-center overflow-x-hidden">
        {/* =========================================================================
            BLOCK 1: HERO (Find the jobs that can actually take you abroad)
           ========================================================================= */}
        <section className="w-full relative pt-12 pb-16 sm:pt-20 sm:pb-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
          {/* Subtle Ambient Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[320px] bg-gradient-to-tr from-brand-600/20 via-sky-500/15 to-indigo-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* Trust Badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-slate-200 shadow-inner">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>
              <strong className="text-white">{totalCount > 0 ? totalCount : "760+"}</strong> Verified Global Opportunities Live
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-medium">Updated Daily</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl font-display leading-[1.12]">
            Find the jobs that can <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-brand-400 to-indigo-300 bg-clip-text text-transparent">
              actually take you abroad.
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
            Search international jobs, understand sponsorship signals, and apply directly to verified employer career systems across the UK, US, Canada, Australia & New Zealand.
          </p>

          {/* Search Interface */}
          <div className="w-full max-w-3xl mt-8">
            <JobSearchBar variant="hero" />
          </div>

          {/* Popular Quick Searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Popular:
            </span>
            {[
              { label: "Civil Engineer", q: "Civil Engineer" },
              { label: "Software Engineer", q: "Software Engineer" },
              { label: "Registered Nurse", q: "Registered Nurse" },
              { label: "Data Analyst", q: "Data Analyst" },
              { label: "DevOps", q: "DevOps" },
              { label: "Accountant", q: "Accountant" },
              { label: "Project Manager", q: "Project Manager" },
            ].map((item) => (
              <Link
                key={item.q}
                href={`/jobs?q=${encodeURIComponent(item.q)}`}
                className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">{totalCount > 0 ? totalCount : "760"}+</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Verified Opportunities</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">5 Markets</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">UK, US, CA, AU, NZ</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">100% Direct</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Employer ATS Links</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">Continuous</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">Hourly Re-Verification</div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOCK 2: TRUST BAR (Verified Sponsor Employers Marquee)
           ========================================================================= */}
        <section className="w-full bg-slate-50 border-b border-slate-200 py-6 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
              Verified Sponsor Employers:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-semibold text-slate-700">
              {TOP_SPONSORS.map((sponsor) => (
                <Link
                  key={sponsor.name}
                  href={`/company/${sponsor.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="flex items-center gap-1.5 hover:text-brand-600 transition-colors"
                >
                  <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-800 shadow-xs">
                    {sponsor.logo}
                  </span>
                  <span>{sponsor.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOCK 3: HOW IT WORKS (01 Discover → 02 Verify → 03 Apply)
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
              How SponsorAJobs Works
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 font-display">
              Discover. Verify. Apply.
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              We eliminate the guesswork in international career mobility through transparent data provenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-brand-600/20">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900">Discover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Find international career opportunities filtered precisely by destination country, target occupation, and minimum salary threshold.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/20">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900">Verify</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every listing is cross-referenced with government sponsor registries and scanned for explicit visa sponsorship statements and live apply links.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/20">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900">Apply</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apply directly to the employer’s official ATS (Greenhouse, Lever, Workday) with 100% transparent provenance and zero middleman fees.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOCK 4: FEATURED VERIFIED OPPORTUNITIES
           ========================================================================= */}
        <section className="w-full bg-slate-50/60 border-y border-slate-200/80 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Live Verified Vacancies
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2 font-display">
                  Featured Opportunities
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Active roles with verified employer sponsorship signals and direct apply paths.
                </p>
              </div>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <span>Browse all {totalCount > 0 ? totalCount : "760"}+ jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOCK 5: BROWSE BY DESTINATION (Country Hubs)
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
              Destination Markets
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2 font-display">
              Browse by Country
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Explore visa routes, minimum salary thresholds, and active sponsor employers per market.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INITIAL_COUNTRIES.map((c) => {
              const meta = {
                GB: { visa: "Skilled Worker Visa", threshold: "£38,700 / year" },
                US: { visa: "H-1B / O-1 / Green Card", threshold: "Prevailing Wage" },
                AU: { visa: "TSS 482 / Core Skills", threshold: "AUD $73,150 / yr" },
                CA: { visa: "GTS / LMIA Expedited", threshold: "Provincial Median" },
                NZ: { visa: "AEWV Green List", threshold: "NZD $29.66 / hr" },
              }[c.code] || { visa: "Work Permit", threshold: "Statutory Rate" };

              return (
                <Link
                  key={c.code}
                  href={`/jobs/${c.code.toLowerCase()}`}
                  className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-brand-300 hover:shadow-lg transition-all group block"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {c.name}
                        </h3>
                        <p className="text-[11px] text-slate-500">{meta.visa}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Min Threshold:</span>
                    <span className="font-bold text-slate-900">{meta.threshold}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            BLOCK 6: BROWSE BY CAREER DISCIPLINE
           ========================================================================= */}
        <section className="w-full bg-slate-50/60 border-y border-slate-200/80 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                In-Demand Occupations
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2 font-display">
                Browse by Career
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Explore shortage occupations and skilled roles with highest sponsorship velocity.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {[
                { name: "Software Engineering", slug: "software-engineering", icon: Cpu, count: "210+" },
                { name: "Civil & Structural", slug: "engineering", icon: HardHat, count: "120+" },
                { name: "Healthcare & Care", slug: "healthcare", icon: Stethoscope, count: "140+" },
                { name: "Finance & Banking", slug: "finance", icon: Briefcase, count: "90+" },
                { name: "Construction & Trades", slug: "construction", icon: Building2, count: "85+" },
                { name: "Education & Research", slug: "education", icon: BookOpen, count: "45+" },
              ].map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.slug}
                    href={`/jobs?category=${cat.slug}`}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-300 hover:shadow-md transition-all text-center group flex flex-col items-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {cat.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 mt-0.5">{cat.count} jobs</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOCK 7: SPONSORSHIP INTELLIGENCE & VERIFICATION ENGINE
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Zero-Guesswork Standards
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
                What does &ldquo;Verified Sponsorship&rdquo; mean?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We believe candidates should never waste time applying to jobs that do not support work visas. Our verification engine scores each opportunity through a deterministic 12-point publishing gate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>Verified Sponsorship</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Job posting explicitly states visa sponsorship support, Certificate of Sponsorship (CoS), or relocation assistance.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Sponsorship Signal Detected</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Corporate mobility policies and past immigration sponsorship filings confirmed for this employer.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span>Sponsor-Licensed Employer</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Company appears on official government sponsor registries (UK Home Office, US USCIS, Australia Home Affairs).
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <Link href="/trust" className="text-brand-400 hover:underline font-bold flex items-center gap-1">
                <span>Read our complete Verification Methodology & Trust Policy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOCK 8: IMMIGRATION INTELLIGENCE (Statutory Salary Benchmarks)
           ========================================================================= */}
        <section className="w-full bg-slate-50/60 border-y border-slate-200/80 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                Legal & Statutory Benchmarks
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2 font-display">
                Immigration Salary Thresholds
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Official minimum earnings required for work visa authorization by destination market.
              </p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-slate-200/90 bg-white shadow-xs">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-5">Country</th>
                    <th className="py-3.5 px-5">Primary Visa Subclass</th>
                    <th className="py-3.5 px-5">General Salary Threshold</th>
                    <th className="py-3.5 px-5">Shortage Occupation / STEM</th>
                    <th className="py-3.5 px-5">Official Registry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                      <span>🇬🇧</span> United Kingdom
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-brand-700">Skilled Worker Visa</td>
                    <td className="py-3.5 px-5 font-bold">£38,700 / year</td>
                    <td className="py-3.5 px-5 text-emerald-700 font-semibold">£30,960 (ISL rate)</td>
                    <td className="py-3.5 px-5 text-slate-500">UK Home Office Sponsor Register</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                      <span>🇺🇸</span> United States
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-brand-700">H-1B Specialty Occupation</td>
                    <td className="py-3.5 px-5 font-bold">Prevailing Wage ($60,000+)</td>
                    <td className="py-3.5 px-5 text-emerald-700 font-semibold">OES Level II–IV</td>
                    <td className="py-3.5 px-5 text-slate-500">USCIS H-1B Employer Hub</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                      <span>🇦🇺</span> Australia
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-brand-700">Skills in Demand / TSS 482</td>
                    <td className="py-3.5 px-5 font-bold">AUD $73,150 (TSMIT)</td>
                    <td className="py-3.5 px-5 text-emerald-700 font-semibold">Core Skills Pathway</td>
                    <td className="py-3.5 px-5 text-slate-500">Department of Home Affairs</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                      <span>🇨🇦</span> Canada
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-brand-700">Global Talent Stream / LMIA</td>
                    <td className="py-3.5 px-5 font-bold">Provincial Median Wage</td>
                    <td className="py-3.5 px-5 text-emerald-700 font-semibold">2-Week Expedited Processing</td>
                    <td className="py-3.5 px-5 text-slate-500">IRCC Positive LMIA Register</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                      <span>🇳🇿</span> New Zealand
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-brand-700">Accredited Employer Work Visa (AEWV)</td>
                    <td className="py-3.5 px-5 font-bold">NZD $29.66 / hour</td>
                    <td className="py-3.5 px-5 text-emerald-700 font-semibold">Green List Tier 1 & 2</td>
                    <td className="py-3.5 px-5 text-slate-500">Immigration New Zealand Register</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =========================================================================
            BLOCK 9 & 10: CAREER GUIDES & EDITORIAL INSIGHTS
           ========================================================================= */}
        <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                Editorial Guides
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2 font-display">
                Career & Visa Intelligence
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Data-driven immigration guides, salary analysis, and employer sponsorship tactics.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <span>View all guides</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredGuides.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-brand-300 hover:shadow-lg transition-all group flex flex-col justify-between"
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
        </section>

        {/* =========================================================================
            BLOCK 11: JOB ALERTS CTA
           ========================================================================= */}
        <section className="w-full bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Never Miss a Verified Role
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display">
              Don&rsquo;t search every day. Let SponsorAJobs alert you.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Get notified the moment a licensed employer posts a new verified vacancy in your discipline.
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
