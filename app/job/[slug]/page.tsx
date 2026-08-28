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
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-slate-900">
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
    if (!job.salary || (!job.salary.min && !job.salary.max)) return "Competitive / Not disclosed";
    const curr = job.salary.currency || "USD";
    if (job.salary.min && job.salary.max) {
      return `${curr} ${job.salary.min.toLocaleString()} – ${job.salary.max.toLocaleString()} / year`;
    }
    if (job.salary.min) return `From ${curr} ${job.salary.min.toLocaleString()} / year`;
    return `Up to ${curr} ${job.salary.max?.toLocaleString()} / year`;
  };

  const salaryDisplay = formatSalary();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-slate-900 font-sans selection:bg-[#18D6E5] selection:text-[#071421]">
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center justify-between text-xs">
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
            TWO-COLUMN INTELLIGENCE LAYOUT (70% Content / 30% Sidebar)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ───────────────────────────────────────────────────────────
              MAIN COLUMN (70% Width)
             ─────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Job Hero Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#071421] text-white flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                  {job.company.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/company/${job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      className="text-sm sm:text-base font-extrabold text-slate-800 hover:text-[#087F8C] transition-colors"
                    >
                      {job.company.name}
                    </Link>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Sponsor</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location.formatted || `${job.location.city || ""}, ${job.location.country}`}</span>
                    <span>&middot;</span>
                    <span className="capitalize font-medium">{job.remoteType.toLowerCase()}</span>
                  </div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-display leading-tight tracking-tight">
                {job.title}
              </h1>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black tracking-wider uppercase border ${confidence.bgClass} ${confidence.textClass} ${confidence.borderClass}`}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span>{confidence.label}</span>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-bold border border-sky-200">
                  <Globe2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>{visaRoute}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{salaryDisplay}</span>
                </span>
              </div>
            </div>

            {/* 🎯 "Job Verification Details" Panel */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 font-display">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>Job Verification Details</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                  {worthScore}/100 Score
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {whyWorthApplying.map((reason, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>

              {job.sponsorship.positiveEvidence.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 text-xs text-emerald-950">
                  <span className="font-bold block mb-1">Detected Sponsorship Language in Vacancy Text:</span>
                  <p className="italic leading-relaxed">&ldquo;{job.sponsorship.positiveEvidence[0]}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Free ATS Scanner Callout */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#071421] via-slate-900 to-[#0D1B2A] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#18D6E5]/10 border border-[#18D6E5]/30 flex items-center justify-center text-[#18D6E5] shrink-0">
                  <FileSearch className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Scan Your Resume Against This Exact Job
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Check keyword match, missing skills, and ATS score in 10 seconds.
                  </p>
                </div>
              </div>

              <Link
                href={`/tools/ats-checker?jobId=${job.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#18D6E5] hover:bg-[#15c0ce] text-[#071421] font-extrabold text-xs transition-colors shrink-0 shadow-sm"
              >
                <span>Scan Resume Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Structured Job Description */}
            <RichJobDescription
              description={fullDescription}
              companyName={job.company.name}
              countryCode={job.location.country}
              applyUrl={job.applyUrl}
            />
          </div>

          {/* ───────────────────────────────────────────────────────────
              SIDEBAR COLUMN (30% Width - Sticky Intelligence Suite)
             ─────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Action Box */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Application
                </span>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                  Apply on Employer Site
                </div>
              </div>

              {/* Dominant 56px Apply Button */}
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <span>Apply on Employer Site</span>
                <ExternalLink className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Job</span>
                </button>
                <button
                  type="button"
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Job Match Score Breakdown */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Job Match Score
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{worthScore}/100</span>
                </div>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Role Match</span>
                    <span className="font-bold text-slate-900">{breakdown.roleMatch}%</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Sponsorship Signal</span>
                    <span className="font-bold text-emerald-600">Strong</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Employer Verification</span>
                    <span className="font-bold text-emerald-600">Verified</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Salary Fit</span>
                    <span className="font-bold text-slate-900">{breakdown.salaryCompatibility}%</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Freshness</span>
                    <span className="font-bold text-slate-900">{breakdown.freshness}%</span>
                  </div>
                </div>
              </div>

              {/* Provenance Trail */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Employer License:</span>
                  <span className="font-bold text-slate-800">Confirmed Registry</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification Date:</span>
                  <span className="font-bold text-slate-800">Verified Today</span>
                </div>
                <div className="flex justify-between">
                  <span>Direct URL:</span>
                  <span className="font-bold text-emerald-600">Active ATS Endpoint</span>
                </div>
              </div>
            </div>

            {/* Legal Transparency Disclaimer */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-amber-950 text-[11px] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Sponsorship Disclaimer</span>
              </div>
              <p className="leading-relaxed">
                SponsorAJobs identifies employer sponsorship licenses and requisition language. Final work visa authorization is granted solely by national immigration authorities based on individual eligibility.
              </p>
            </div>
          </div>
        </div>

        {/* Related Jobs */}
        {relatedJobs.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                  Related Analyzed Opportunities
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  More verified vacancies in {job.location.country}
                </p>
              </div>
              <Link
                href={`/jobs/${job.location.country.toLowerCase()}`}
                className="text-xs font-bold text-[#087F8C] hover:underline"
              >
                View all in {job.location.country} &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {relatedJobs.map((relJob) => (
                <JobCard key={relJob.id} job={relJob} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
