"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicJobDTO } from "@/lib/types/job";
import { SponsorshipBadge } from "./SponsorshipBadge";
import { JobShareModal } from "./JobShareModal";
import {
  MapPin,
  Banknote,
  Clock,
  ArrowUpRight,
  Bookmark,
  Share2,
  CheckCircle2,
  ExternalLink,
  Building2,
  ShieldCheck,
  Globe2,
} from "lucide-react";

interface JobCardProps {
  job: PublicJobDTO;
}

// Map country to standard primary statutory visa route
function getPrimaryVisaRoute(countryCode: string): string {
  switch (countryCode?.toUpperCase()) {
    case "GB":
    case "UK":
      return "UK Skilled Worker";
    case "US":
    case "USA":
      return "US H-1B / O-1";
    case "CA":
      return "Canada GTS / LMIA";
    case "AU":
      return "Australia TSS 482";
    case "NZ":
      return "NZ AEWV Green List";
    default:
      return "Work Visa Sponsorship";
  }
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      setIsSaved(saved.includes(job.id));
    } catch {
      // safe fallback
    }
  }, [job.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      let updated: string[];
      if (saved.includes(job.id)) {
        updated = saved.filter((id) => id !== job.id);
        setIsSaved(false);
      } else {
        updated = [...saved, job.id];
        setIsSaved(true);
      }
      localStorage.setItem("sa_saved_jobs", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(job.applyUrl, "_blank", "noopener,noreferrer");
  };

  // Format salary
  const formatSalary = () => {
    if (!job.salary || (!job.salary.min && !job.salary.max)) return null;
    const curr = job.salary.currency || "USD";
    if (job.salary.min && job.salary.max) {
      return `${curr} ${job.salary.min.toLocaleString()} – ${job.salary.max.toLocaleString()}`;
    }
    if (job.salary.min) return `From ${curr} ${job.salary.min.toLocaleString()}`;
    return `Up to ${curr} ${job.salary.max?.toLocaleString()}`;
  };

  // Freshness helper
  const formatFreshness = (dateStr: string | null) => {
    if (!dateStr) return "Recently verified";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 0) return "Verified today";
    if (diffDays === 1) return "Verified 1d ago";
    if (diffDays < 7) return `Verified ${diffDays}d ago`;
    if (diffDays < 14) return "Verified 1w ago";
    return `Verified ${Math.floor(diffDays / 7)}w ago`;
  };

  // Deterministic company color gradient
  const getGradient = (name: string) => {
    const gradients = [
      "from-blue-600 to-indigo-700",
      "from-sky-500 to-blue-600",
      "from-emerald-600 to-teal-700",
      "from-violet-600 to-purple-700",
      "from-amber-500 to-orange-600",
      "from-rose-500 to-red-600",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const salary = formatSalary();
  const visaRoute = getPrimaryVisaRoute(job.location.country);

  return (
    <>
      <div className="rounded-3xl bg-white border border-slate-200/90 hover:border-brand-400 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group relative overflow-hidden">
        {/* Top hover subtle accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div className="p-5 sm:p-6 flex flex-col flex-1">
          {/* Header Row: Company Avatar + Title + Actions */}
          <div className="flex items-start gap-3.5 mb-3.5">
            {/* Company Avatar */}
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getGradient(
                job.company.name
              )} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm`}
            >
              {job.company.name.slice(0, 2).toUpperCase()}
            </div>

            {/* Company Name & Location */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/company/${job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="text-sm font-bold text-slate-800 hover:text-brand-600 transition-colors truncate block"
                  >
                    {job.company.name}
                  </Link>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {job.location.formatted || `${job.location.city || ""}, ${job.location.country}`}
                    </span>
                    {job.remoteType !== "UNKNOWN" && (
                      <>
                        <span className="text-slate-300">&middot;</span>
                        <span className="capitalize text-slate-600 font-medium">
                          {job.remoteType.toLowerCase()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Top Action Icons (Share + Save) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShareModalOpen(true);
                    }}
                    type="button"
                    aria-label="Share job"
                    title="Share this job"
                    className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleSave}
                    type="button"
                    aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
                    className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                      isSaved
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "text-slate-300 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? "fill-rose-500" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Job Title */}
          <Link href={`/job/${job.slug}`} className="block mb-3">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-brand-700 transition-colors leading-snug font-display">
              {job.title}
            </h3>
          </Link>

          {/* Metadata Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3.5 text-xs">
            <SponsorshipBadge label={job.sponsorship.label} size="sm" />
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-semibold border border-sky-200/60">
              <Globe2 className="w-3 h-3 text-sky-600" />
              {visaRoute}
            </span>
            {salary && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
                <Banknote className="w-3 h-3 text-emerald-600" />
                {salary}
              </span>
            )}
            {job.category && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                {job.category.name}
              </span>
            )}
          </div>

          {/* Sponsorship Evidence Snippet */}
          {job.sponsorship.positiveEvidence.length > 0 && (
            <div className="mb-4 px-3.5 py-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-950 flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="italic leading-relaxed line-clamp-1">
                &ldquo;{job.sponsorship.positiveEvidence[0]}&rdquo;
              </span>
            </div>
          )}

          {/* Footer Row */}
          <div className="mt-auto pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatFreshness(job.postedAt)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Link
                href={`/job/${job.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                Details
              </Link>

              <button
                type="button"
                onClick={handleApplyClick}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/20 cursor-pointer group/apply"
              >
                <span>Apply</span>
                <ExternalLink className="w-3 h-3 transition-transform group-hover/apply:translate-x-0.5 group-hover/apply:-translate-y-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <JobShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        jobTitle={job.title}
        companyName={job.company.name}
        countryCode={job.location.country}
        slug={job.slug}
      />
    </>
  );
};
