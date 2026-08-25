import React from "react";
import Link from "next/link";
import { PublicJobDTO } from "@/lib/types/job";
import { SponsorshipBadge } from "./SponsorshipBadge";
import { MapPin, Building2, Banknote, Clock, ArrowUpRight, Globe } from "lucide-react";

interface JobCardProps {
  job: PublicJobDTO;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  // Format salary
  const formatSalary = () => {
    if (!job.salary || (!job.salary.min && !job.salary.max)) return null;
    const curr = job.salary.currency || "USD";
    if (job.salary.min && job.salary.max) {
      return `${curr} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`;
    }
    if (job.salary.min) return `From ${curr} ${job.salary.min.toLocaleString()}`;
    return `Up to ${curr} ${job.salary.max?.toLocaleString()}`;
  };

  // Freshness helper (Section 128)
  const formatFreshness = (dateStr: string | null) => {
    if (!dateStr) return "Recently posted";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 0) return "Posted today";
    if (diffDays === 1) return "Posted 1 day ago";
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 14) return "Posted 1 week ago";
    return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Company + Sponsorship Badge */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
              {job.company.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <Link
                href={`/company/${job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
              >
                {job.company.name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{job.location.formatted || `${job.location.city}, ${job.location.country}`}</span>
                </span>
                {job.remoteType !== "UNKNOWN" && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{job.remoteType.toLowerCase()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <SponsorshipBadge label={job.sponsorship.label} size="sm" />
        </div>

        {/* Title */}
        <Link href={`/job/${job.slug}`} className="block group-hover:text-brand-600 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 leading-snug">
            {job.title}
          </h3>
        </Link>

        {/* Key Attributes */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          {formatSalary() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-medium">
              <Banknote className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatSalary()}</span>
            </span>
          )}
          {job.employmentType !== "UNKNOWN" && (
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              {job.employmentType.replace("_", " ")}
            </span>
          )}
          {job.category && (
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              {job.category.name}
            </span>
          )}
        </div>

        {/* Sponsorship Evidence Snippet */}
        {job.sponsorship.positiveEvidence.length > 0 && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900">
            <span className="font-semibold text-emerald-800">Signal match: </span>
            <span className="italic">&ldquo;{job.sponsorship.positiveEvidence[0]}&rdquo;</span>
          </div>
        )}
      </div>

      {/* Bottom Footer: Freshness + CTA */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatFreshness(job.postedAt)}</span>
        </span>

        <div className="flex items-center gap-2">
          <Link
            href={`/job/${job.slug}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-semibold transition-all"
          >
            <span>View Job</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
