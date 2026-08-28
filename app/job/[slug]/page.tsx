import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SponsorshipBadge } from "@/components/SponsorshipBadge";
import { JobCard } from "@/components/JobCard";
import { RichJobDescription } from "@/components/RichJobDescription";
import { JobDetailActions } from "@/components/JobDetailActions";
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
  TrendingUp,
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

  // ── Handle Expired / Not Found Jobs Gracefully (SEO & User Recovery) ──────────
  if (!res) {
    const fallbackSearch = await jobRepo.search({ limit: 4, sort: "sponsorship" });
    const fallbackJobs = fallbackSearch.jobs;

    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-amber-200 shadow-sm space-y-4 mb-8">
            <div className="flex items-center gap-3 text-amber-700">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                This Job Opportunity Has Closed or Expired
              </h1>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              The employer has concluded applications for this specific role. However, our database is updated daily with verified international visa sponsorship vacancies.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/jobs"
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
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
              <h2 className="text-lg font-bold text-slate-800">
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
      return `${curr} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} / year`;
    }
    if (job.salary.min) return `From ${curr} ${job.salary.min.toLocaleString()} / year`;
    return `Up to ${curr} ${job.salary.max?.toLocaleString()} / year`;
  };

  const salaryDisplay = formatSalary();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Google Rich Results JSON-LD Schemas */}
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-32 sm:pb-16">
        {/* Breadcrumb Navigation */}
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all live vacancies</span>
          </Link>
          <div className="text-xs text-slate-400 hidden sm:block">
            <Link href="/jobs" className="hover:text-brand-600 transition-colors font-medium">Jobs</Link> &middot;{" "}
            <Link href={`/jobs/${job.location.country.toLowerCase()}`} className="hover:text-brand-600 transition-colors font-medium">
              {getCountryDisplayName(job.location.country)}
            </Link>{" "}
            &middot;{" "}
            <span className="font-semibold text-slate-600">{job.category?.name || "General"}</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            HERO JOB DETAILS CARD (World-Class Tier 1 Layout)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="p-6 sm:p-9 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow mb-6 sm:mb-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-brand-500/20">
                  {job.company.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <Link
                    href={`/company/${job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="text-base sm:text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors flex items-center gap-1.5"
                  >
                    <span>{job.company.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  </Link>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location.formatted}</span>
                    <span>&middot;</span>
                    <span className="capitalize">{job.employmentType}</span>
                  </p>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight font-display">
                {job.title}
              </h1>

              {/* Meta Pill Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <SponsorshipBadge label={job.sponsorship.label} />
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 text-xs font-semibold border border-slate-200/60">
                  <Banknote className="w-3.5 h-3.5 text-slate-500" />
                  {salaryDisplay}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 text-xs font-semibold capitalize border border-slate-200/60">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {job.employmentType}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100/90 text-slate-800 text-xs font-semibold capitalize border border-slate-200/60">
                  {job.remoteType}
                </span>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:block">
              <JobDetailActions
                jobId={job.id}
                jobTitle={job.title}
                companyName={job.company.name}
                countryCode={job.location.country}
                categorySlug={job.category?.slug}
                applyUrl={job.applyUrl}
              />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            🎯 FREE INTERACTIVE ATS SCAN CTA (High Foot-Fall Conversion)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-600 text-white shadow-lg shadow-brand-600/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
              <FileSearch className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider mb-0.5">
                <Sparkles className="w-2.5 h-2.5" />
                100% Free Candidate Tool
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Scan Your Resume Against This Exact Job Description
              </h3>
              <p className="text-xs text-white/80">
                Check keyword density, skills match percentage, and ATS pass probability in 10 seconds.
              </p>
            </div>
          </div>

          <Link
            href={`/tools/ats-checker?jobId=${job.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 active:scale-[0.98] font-bold text-xs sm:text-sm shadow-md transition-all shrink-0 cursor-pointer"
          >
            <span>Scan Resume Free</span>
            <ArrowRight className="w-4 h-4 text-brand-600" />
          </Link>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            VISA SPONSORSHIP INTELLIGENCE AUDIT PANEL
        ═══════════════════════════════════════════════════════════════ */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900">
              <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Visa Sponsorship Intelligence Audit</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80">
              {job.sponsorship.label}
            </span>
          </div>

          <div className="text-xs space-y-3 pt-1">
            <p className="text-slate-700 font-medium leading-relaxed">
              Assessment Summary: <strong className="text-slate-900">{job.sponsorship.evidenceMessage}</strong>
            </p>

            {job.sponsorship.positiveEvidence.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="font-bold text-emerald-900 block mb-1">
                  Detected Verified Mobility Phrasing:
                </span>
                <ul className="list-disc list-inside space-y-1 text-emerald-800">
                  {job.sponsorship.positiveEvidence.map((phrase, idx) => (
                    <li key={idx} className="italic">&ldquo;{phrase}&rdquo;</li>
                  ))}
                </ul>
              </div>
            )}

            {job.sponsorship.negativeEvidence.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100">
                <span className="font-bold text-rose-900 block mb-1">
                  Detected Statutory Restrictions:
                </span>
                <ul className="list-disc list-inside space-y-1 text-rose-800">
                  {job.sponsorship.negativeEvidence.map((phrase, idx) => (
                    <li key={idx} className="italic">&ldquo;{phrase}&rdquo;</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              SponsorAJobs continuously verifies listings directly against official government register datasets and live employer application endpoints.
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            STRUCTURED RICH JOB DESCRIPTION
        ═══════════════════════════════════════════════════════════════ */}
        <RichJobDescription
          description={fullDescription}
          companyName={job.company.name}
          countryCode={job.location.country}
          applyUrl={job.applyUrl}
        />

        {/* ── Deep SEO Internal Linking Web ── */}
        <div className="my-10 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-brand-600" />
            <span>Explore Related Sponsorship Resources & Jurisdictions</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <Link
              href={`/visa-sponsorship/${job.location.country.toLowerCase()}`}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-brand-50/50 text-slate-700 hover:text-brand-700 border border-slate-200/80 hover:border-brand-200 transition-all block group"
            >
              <span className="font-bold block uppercase mb-1 text-slate-900 group-hover:text-brand-700">{job.location.country} Visa Guide</span>
              <span className="text-slate-500 text-[11px]">Explore Skilled Worker & work authorization pathways</span>
            </Link>

            <Link
              href={`/jobs/${job.location.country.toLowerCase()}${job.category?.slug ? `/${job.category.slug}` : ""}`}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-brand-50/50 text-slate-700 hover:text-brand-700 border border-slate-200/80 hover:border-brand-200 transition-all block group"
            >
              <span className="font-bold block mb-1 text-slate-900 group-hover:text-brand-700">{job.category?.name || "All"} in {job.location.country}</span>
              <span className="text-slate-500 text-[11px]">Browse more sector-specific vacancies</span>
            </Link>

            <Link
              href={`/company/${job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-brand-50/50 text-slate-700 hover:text-brand-700 border border-slate-200/80 hover:border-brand-200 transition-all block group"
            >
              <span className="font-bold block mb-1 text-slate-900 group-hover:text-brand-700">{job.company.name} Profile</span>
              <span className="text-slate-500 text-[11px]">View all jobs and sponsor license tier</span>
            </Link>
          </div>
        </div>

        {/* Related Jobs Section */}
        {relatedJobs.length > 0 && (
          <div className="my-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Related Sponsor Opportunities</h2>
                <p className="text-xs text-slate-500 mt-0.5">More verified vacancies in {job.location.country} and {job.category?.name || "similar fields"}</p>
              </div>
              <Link
                href={`/jobs/${job.location.country.toLowerCase()}`}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
              >
                View all in {job.location.country} &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedJobs.map((relJob) => (
                <JobCard key={relJob.id} job={relJob} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Apply Bar */}
      <div className="sm:hidden mobile-sticky-apply">
        <JobDetailActions
          jobId={job.id}
          jobTitle={job.title}
          companyName={job.company.name}
          countryCode={job.location.country}
          categorySlug={job.category?.slug}
          applyUrl={job.applyUrl}
          isMobileSticky={true}
        />
      </div>

      <Footer />
    </div>
  );
}

