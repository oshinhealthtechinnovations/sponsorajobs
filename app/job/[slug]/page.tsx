import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SponsorshipBadge } from "@/components/SponsorshipBadge";
import { JobCard } from "@/components/JobCard";
import { RichJobDescription } from "@/components/RichJobDescription";
import { JobDetailActions } from "@/components/JobDetailActions";
import { ApplicationWorthinessGauge } from "@/components/ApplicationWorthinessGauge";
import { calculateJobIntelligence } from "@/lib/utils/intelligenceScorer";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { generateJobPostingSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import { constructMetadata } from "@/lib/seo/metadata";
import { generateJobSlug } from "@/lib/seo/slugs";
import { getCountryDisplayName } from "@/config/countries";
import Link from "next/link";
import { StickyJobApplyBar } from "@/components/StickyJobApplyBar";
import { JobApplyButton } from "@/components/JobApplyButton";
import { JobDetailSidebarActions } from "@/components/JobDetailSidebarActions";
import { SalaryCurrencyConverter } from "@/components/SalaryCurrencyConverter";
import { CountryRelocationCard } from "@/components/CountryRelocationCard";
import {
  MapPin,
  Building2,
  Banknote,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Compass,
  FileText,
  ExternalLink,
  Zap,
  FileSearch,
  ArrowRight,
  Globe2,
  Bookmark,
  Share2,
  Briefcase,
  Layers,
  Award,
  Lock,
} from "lucide-react";

export const revalidate = 3600;

interface JobDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const jobRepo = new JobRepository();
  const slug = decodeURIComponent(params.slug || "");
  const res = await jobRepo.getBySlug(slug);

  if (!res) {
    return {
      title: "Job Opening Closed or Not Found | SponsorAJobs",
      description: "This job opportunity has expired or closed. Search hundreds of verified visa sponsorship jobs worldwide.",
      robots: { index: false, follow: true },
    };
  }

  const { job } = res;
  const canonicalSlug = generateJobSlug(job);

  return constructMetadata({
    title: `${job.title} at ${job.company.name} (Visa Sponsorship: ${job.sponsorship.label})`,
    description: `Apply for ${job.title} at ${job.company.name} in ${job.location.formatted}. Visa sponsorship status: ${job.sponsorship.label}.`,
    path: `/job/${canonicalSlug}`,
  });
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const jobRepo = new JobRepository();
  const slug = decodeURIComponent(params.slug || "");
  const res = await jobRepo.getBySlug(slug);

  // ── Handle Expired / Not Found Jobs Gracefully ───────────────────────────
  if (!res) {
    const fallbackSearch = await jobRepo.search({ limit: 4, sort: "sponsorship" });
    const fallbackJobs = fallbackSearch.jobs;

    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-amber-200 shadow-sm space-y-4 mb-8">
            <div className="flex items-center gap-3 text-amber-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                This Job Opportunity Has Closed or Expired
              </h1>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              The employer has concluded applications for this specific role. However, our database is updated daily with verified international visa sponsorship vacancies.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/jobs"
                className="px-4 py-2.5 rounded-xl bg-[#071421] hover:bg-[#0D1B2A] text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>Search All Live Sponsor Jobs</span>
              </Link>
              <Link
                href="/countries"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <span>Browse by Country</span>
              </Link>
            </div>
          </div>

          {fallbackJobs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 font-display">
                Explore Active Visa Sponsorship Opportunities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fallbackJobs.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  const { job, fullDescription } = res;
  const relatedJobs = await jobRepo.getRelatedJobs(job.id, job.location.country, job.category?.id);
  const canonicalSlug = generateJobSlug(job);

  // Compute Full Intelligence Profile
  const intelligence = calculateJobIntelligence(job);
  const { worthScore, breakdown, jobDNA, confidence, whyWorthApplying, visaRoute } = intelligence;

  // Generate Schemas
  const jobPostingSchema = generateJobPostingSchema({
    id: job.id,
    title: job.title,
    company_name: job.company.name,
    description: fullDescription,
    description_clean: fullDescription,
    city: job.location.city,
    country_code: job.location.country,
    remote_type: job.remoteType,
    employment_type: job.employmentType,
    salary_min: job.salary?.min,
    salary_max: job.salary?.max,
    salary_currency: job.salary?.currency,
    published_at: job.postedAt,
    sponsorship_label: job.sponsorship.label,
    status: "active",
  });

  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Jobs", url: "/jobs" },
    { name: job.location.country, url: `/jobs/${job.location.country.toLowerCase()}` },
    { name: job.title, url: `/job/${canonicalSlug}` },
  ]);

  // Format salary
  const formatSalary = () => {
    if (!job.salary || (!job.salary.min && !job.salary.max)) return "Competitive / Disclosed in Interview";
    const curr = job.salary.currency || "USD";
    if (job.salary.min && job.salary.max) {
      return `${curr} ${job.salary.min.toLocaleString()} – ${job.salary.max.toLocaleString()} / yr`;
    }
    if (job.salary.min) return `From ${curr} ${job.salary.min.toLocaleString()} / yr`;
    return `Up to ${curr} ${job.salary.max?.toLocaleString()} / yr`;
  };

  const salaryDisplay = formatSalary();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#18D6E5] selection:text-[#071421]">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />

      <Navbar />

      {/* Floating On-Scroll Quick Apply Bar */}
      <StickyJobApplyBar
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company.name}
        locationFormatted={job.location?.formatted || "Global"}
        applyUrl={job.applyUrl}
        salaryFormatted={salaryDisplay}
        sponsorshipLabel={job.sponsorship.label}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* ── Breadcrumb Navigation ── */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 font-bold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all live vacancies</span>
          </Link>
          <div className="text-slate-400 hidden sm:block">
            <Link href="/jobs" className="hover:text-brand-600 transition-colors font-medium">Jobs</Link> &middot;{" "}
            <Link href={`/jobs/${job.location.country.toLowerCase()}`} className="hover:text-brand-600 transition-colors font-medium">
              {getCountryDisplayName(job.location.country)}
            </Link>{" "}
            &middot;{" "}
            <span className="font-semibold text-slate-700">{job.category?.name || "General"}</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            EXECUTIVE HERO CARD (High-Contrast Modern SaaS Design)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#071421] via-slate-900 to-[#0B1E32] text-white p-6 sm:p-10 border border-slate-800 shadow-xl overflow-hidden">
          {/* Ambient Lighting Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#18D6E5]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-brand-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Top Row: Company Info & Verification Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-black text-2xl shadow-inner shrink-0 text-[#18D6E5]">
                  {job.company.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/company/${job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="text-base sm:text-lg font-extrabold text-white hover:text-[#18D6E5] transition-colors"
                    >
                      {job.company.name}
                    </Link>
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Verified Direct Sponsor</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#18D6E5]" />
                      <span>{job.location.formatted || `${job.location.city || ""}, ${job.location.country}`}</span>
                    </span>
                    <span>&middot;</span>
                    <span className="capitalize font-semibold text-slate-200">{job.remoteType.toLowerCase()}</span>
                    <span>&middot;</span>
                    <span className="capitalize text-slate-300">{job.employmentType?.replace("_", " ").toLowerCase() || "Full-Time"}</span>
                  </div>
                </div>
              </div>

              {/* Freshness Badge */}
              <div className="flex items-center gap-2 text-xs text-slate-400 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-emerald-300">Live Vacancy</span>
                <span>&middot;</span>
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {job.postedAt
                    ? `Posted ${Math.floor((new Date().getTime() - new Date(job.postedAt).getTime()) / (1000 * 3600 * 24))}d ago`
                    : "Recently posted"}
                </span>
              </div>
            </div>

            {/* Main Job Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight">
              {job.title}
            </h1>

            {/* High-Impact Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40 shadow-xs">
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>{salaryDisplay}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#18D6E5]/20 text-[#18D6E5] text-xs font-black border border-[#18D6E5]/40 shadow-xs">
                <Globe2 className="w-4 h-4 text-[#18D6E5]" />
                <span>{visaRoute}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500/20 text-sky-200 text-xs font-black border border-sky-500/30">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>{confidence.label} Sponsorship</span>
              </div>
            </div>

            {/* Quick Action Buttons Row in Hero */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-slate-800/80">
              <JobApplyButton
                jobId={job.id}
                jobTitle={job.title}
                companyName={job.company.name}
                locationFormatted={job.location.formatted || `${job.location.city || ""}, ${job.location.country}`}
                salaryFormatted={salaryDisplay}
                applyUrl={job.applyUrl}
                variant="hero"
              />

              <Link
                href={`/tools/ats-checker?jobId=${encodeURIComponent(job.id)}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer backdrop-blur-md"
              >
                <FileSearch className="w-4 h-4 text-[#18D6E5]" />
                <span>Scan Resume Free</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            4-CARD QUICK FACTS MATRIX
        ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Salary Package</span>
              <Banknote className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-sm font-black text-slate-900">{salaryDisplay}</div>
            <p className="text-[11px] text-slate-500 font-medium">Standard baseline compensation</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Visa Route</span>
              <Globe2 className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-sm font-black text-slate-900 truncate">{visaRoute}</div>
            <p className="text-[11px] text-slate-500 font-medium">Verified employer route</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Workplace Policy</span>
              <MapPin className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-sm font-black text-slate-900 capitalize">{job.remoteType.toLowerCase()} &middot; {job.location.country}</div>
            <p className="text-[11px] text-slate-500 font-medium">{job.location.city || "Multi-location"}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-wider">Application Type</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-sm font-black text-slate-900">Direct Employer</div>
            <p className="text-[11px] text-slate-500 font-medium">100% direct official career link</p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            TWO-COLUMN MAIN CONTENT (70% Content / 30% Sticky Sidebar)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ───────────────────────────────────────────────────────────
              MAIN COLUMN (70% Width)
             ─────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Immigration & Sponsorship Intelligence Callout */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 text-base font-black text-slate-900 font-display">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Sponsorship & Immigration Assessment</span>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {worthScore}/100 Fit Score
                </span>
              </div>

              {/* Reasons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {whyWorthApplying.slice(0, 4).map((reason, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/70 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-semibold leading-relaxed">
                      {reason
                        .replace("Sponsorship likelihood is extremely high", "Strong sponsorship signal detected")
                        .replace("Verified licensed employer", "Employer verified")
                        .replace("Deterministic", "Verified")
                      }
                    </span>
                  </div>
                ))}
              </div>

              {/* Evidence Callout */}
              {job.sponsorship.negativeEvidence && job.sponsorship.negativeEvidence.length > 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Sponsorship Status Note</span>
                  </div>
                  <p className="italic leading-relaxed text-amber-900/90">&ldquo;{job.sponsorship.negativeEvidence[0]}&rdquo;</p>
                </div>
              ) : job.sponsorship.positiveEvidence && job.sponsorship.positiveEvidence.length > 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Sponsorship Signal Extract</span>
                  </div>
                  <p className="italic leading-relaxed text-emerald-900/90">&ldquo;{job.sponsorship.positiveEvidence[0]}&rdquo;</p>
                </div>
              ) : null}
            </div>

            {/* Free ATS Scanner Callout Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071421] via-slate-900 to-[#0D1B2A] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-5 border border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#18D6E5]/10 border border-[#18D6E5]/30 flex items-center justify-center text-[#18D6E5] shrink-0">
                  <FileSearch className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-display">
                    Scan Your Resume Against This Exact Vacancy
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Check keyword match, missing engineering skills, and ATS score in 10 seconds.
                  </p>
                </div>
              </div>

              <Link
                href={`/tools/ats-checker?jobId=${encodeURIComponent(job.id)}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#18D6E5] hover:bg-[#15c0ce] text-[#071421] font-black text-xs transition-colors shrink-0 shadow-sm"
              >
                <span>Scan Resume Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* ── Structured Rich Job Description ── */}
            <RichJobDescription
              description={fullDescription}
              companyName={job.company.name}
              countryCode={job.location.country}
              applyUrl={job.applyUrl}
            />
          </div>

          {/* ───────────────────────────────────────────────────────────
              SIDEBAR COLUMN (30% Width - Sticky Action & Intelligence)
             ─────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Sticky Action Box */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-600">
                  Ready to apply?
                </span>
                <h4 className="text-base font-black text-slate-900 font-display">
                  Start Your Application
                </h4>
              </div>

              {/* Primary & Secondary Apply/Save Actions */}
              <JobDetailSidebarActions
                jobId={job.id}
                jobTitle={job.title}
                companyName={job.company.name}
                locationFormatted={job.location.formatted || `${job.location.city || ""}, ${job.location.country}`}
                salaryFormatted={salaryDisplay}
                applyUrl={job.applyUrl}
                countryCode={job.location.country}
              />
            </div>

            {/* Quick Job Summary Box */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Job Overview
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Employer</span>
                  <Link
                    href={`/company/${job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="font-bold text-slate-800 hover:text-brand-600 truncate max-w-[160px]"
                  >
                    {job.company.name}
                  </Link>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Location</span>
                  <span className="font-bold text-slate-800 truncate max-w-[160px]">
                    {job.location.formatted || `${job.location.city || ""}, ${job.location.country}`}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Workplace</span>
                  <span className="font-bold text-slate-800 capitalize">
                    {job.remoteType.toLowerCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Compensation</span>
                  <span className="font-bold text-emerald-700">
                    {salaryDisplay}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Posted</span>
                  <span className="font-bold text-slate-800">
                    {job.postedAt
                      ? `${Math.floor((new Date().getTime() - new Date(job.postedAt).getTime()) / (1000 * 3600 * 24))} days ago`
                      : "Recently"}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Global Salary Currency Converter (Free ECB API) */}
            <SalaryCurrencyConverter
              salaryAmount={job.salary?.max || job.salary?.min || (job.location.country === "US" ? 85000 : job.location.country === "AU" ? 95000 : 52000)}
              baseCurrency={job.salary?.currency || (job.location.country === "US" ? "USD" : job.location.country === "AU" ? "AUD" : job.location.country === "CA" ? "CAD" : job.location.country === "NZ" ? "NZD" : "GBP")}
            />

            {/* Country Relocation & Immigration Intelligence Card (Free RestCountries API) */}
            <CountryRelocationCard countryCode={job.location.country} />

            {/* Free ATS Checker Promo Card in Sidebar */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-[#071421] text-white space-y-3 border border-slate-800 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-[#18D6E5]/10 border border-[#18D6E5]/30 flex items-center justify-center text-[#18D6E5]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-white font-display">
                Tailor Resume for this Position
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scan your resume against this job posting to see keyword matches and ATS compatibility score.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href={`/tools/ats-checker?jobId=${encodeURIComponent(job.id)}`}
                  className="block w-full py-2.5 px-4 rounded-xl bg-[#18D6E5] hover:bg-[#15c0ce] text-[#071421] font-black text-xs text-center transition-colors shadow-xs"
                >
                  Scan Resume for ATS Free
                </Link>
                <Link
                  href={`/tools/cv-cover-letter`}
                  className="block w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs text-center transition-colors border border-slate-700"
                >
                  ✍️ Generate Visa Cover Letter
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            RELATED VERIFIED SPONSOR JOBS
        ═══════════════════════════════════════════════════════════════ */}
        {relatedJobs.length > 0 && (
          <div className="pt-8 border-t border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                  Similar Verified Sponsor Vacancies
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explore other roles offering visa sponsorship in {getCountryDisplayName(job.location.country)}
                </p>
              </div>
              <Link
                href={`/jobs/${job.location.country.toLowerCase()}`}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <span>View all in {job.location.country}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedJobs.slice(0, 3).map((rJob) => (
                <JobCard key={rJob.id} job={rJob} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
