import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SponsorshipBadge } from "@/components/SponsorshipBadge";
import { JobCard } from "@/components/JobCard";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { generateJobPostingSchema, generateBreadcrumbSchema } from "@/lib/seo/schema";
import { constructMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Banknote,
  Clock,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

interface JobDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const jobRepo = new JobRepository();
  const res = await jobRepo.getBySlug(params.slug);

  if (!res) {
    return { title: "Job Not Found | SponsorAJobs" };
  }

  const { job } = res;
  return constructMetadata({
    title: `${job.title} at ${job.company.name} (Visa Sponsorship: ${job.sponsorship.label})`,
    description: `Apply for ${job.title} at ${job.company.name} in ${job.location.formatted}. Visa sponsorship status: ${job.sponsorship.label}.`,
    path: `/job/${job.id}`,
  });
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const jobRepo = new JobRepository();
  const res = await jobRepo.getBySlug(params.slug);

  if (!res) {
    notFound();
  }

  const { job, fullDescription } = res;
  const relatedJobs = await jobRepo.getRelatedJobs(job.id, job.location.country, job.category?.id);

  // Generate Schemas (Section 46)
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
    { name: job.title, url: `/job/${job.id}` },
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all jobs</span>
          </Link>
        </div>

        {/* Header Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-bold text-brand-700 text-lg">
                  {job.company.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <Link
                    href={`/company/${job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="text-base font-bold text-slate-700 hover:text-brand-600 transition-colors"
                  >
                    {job.company.name}
                  </Link>
                  <p className="text-xs text-slate-500">{job.location.formatted}</p>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <SponsorshipBadge label={job.sponsorship.label} size="lg" />
                {job.remoteType !== "UNKNOWN" && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium capitalize">
                    {job.remoteType.toLowerCase()}
                  </span>
                )}
                {job.employmentType !== "UNKNOWN" && (
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                    {job.employmentType.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>

            {/* Apply Action CTA */}
            <div className="flex flex-col gap-3 sm:w-56 shrink-0">
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all text-center"
              >
                <span>Apply on Source</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-[11px] text-center text-slate-400">
                Direct redirect to employer / job board
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Salary Range</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Banknote className="w-3.5 h-3.5 text-slate-400" />
                {formatSalary()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Location</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location.city || "Various"}, {job.location.country}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Category</span>
              <span className="font-semibold text-slate-800">
                {job.category?.name || "General"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Source / Freshness</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Sponsorship Intelligence Analysis Box (Section 17, 20) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900">
              Sponsorship Signal Intelligence
            </h2>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-3">
            <p className="text-slate-700 font-medium">
              Classification: <strong className="text-slate-900">{job.sponsorship.label}</strong> ({job.sponsorship.evidenceMessage})
            </p>

            {job.sponsorship.positiveEvidence.length > 0 && (
              <div>
                <span className="font-semibold text-emerald-800 block mb-1">
                  Detected Positive Phrasing:
                </span>
                <ul className="list-disc list-inside space-y-1 text-emerald-900">
                  {job.sponsorship.positiveEvidence.map((phrase, idx) => (
                    <li key={idx} className="italic">&ldquo;{phrase}&rdquo;</li>
                  ))}
                </ul>
              </div>
            )}

            {job.sponsorship.negativeEvidence.length > 0 && (
              <div>
                <span className="font-semibold text-rose-800 block mb-1">
                  Detected Negative / Restriction Phrasing:
                </span>
                <ul className="list-disc list-inside space-y-1 text-rose-900">
                  {job.sponsorship.negativeEvidence.map((phrase, idx) => (
                    <li key={idx} className="italic">&ldquo;{phrase}&rdquo;</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              <strong>Notice:</strong> SponsorAJobs parses text from the job description. Criteria for visas (e.g. UK Skilled Worker, US H-1B, AU Subclass 482, CA LMIA) depend on candidate eligibility, salary thresholds, and employer sponsorship licences.
            </div>
          </div>
        </div>

        {/* Full Job Description */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
            Job Description
          </h2>
          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {fullDescription}
          </div>

          {/* Bottom Apply CTA */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Ready to apply? You will be redirected to the original application portal.
            </p>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition-all"
            >
              <span>Apply on Original Source</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Related Jobs Section (Section 85) */}
        {relatedJobs.length > 0 && (
          <div className="my-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Related Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
