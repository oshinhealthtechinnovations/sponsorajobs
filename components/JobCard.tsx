"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicJobDTO } from "@/lib/types/job";
import { SponsorshipBadge } from "./SponsorshipBadge";
import {
  MapPin,
  Building2,
  Banknote,
  Clock,
  ArrowUpRight,
  Bookmark,
  Sparkles,
  Flame,
  CheckCircle2,
} from "lucide-react";

interface JobCardProps {
  job: PublicJobDTO;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [isSaved, setIsSaved] = useState(false);

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
    } catch {
      setIsSaved(!isSaved);
    }
  };

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

  // Freshness helper
  const formatFreshness = (dateStr: string | null) => {
    if (!dateStr) return "Recently posted";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 0) return "Posted today";
    if (diffDays === 1) return "Posted 1 day ago";
    if (diffDays < 7) return `Posted ${diffDays}d ago`;
    if (diffDays < 14) return "Posted 1w ago";
    return `Posted ${Math.floor(diffDays / 7)}w ago`;
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

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-brand-500/80 shadow-xs hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
      {/* Top subtle highlight gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500/0 group-hover:via-brand-500 to-transparent transition-all duration-500" />

      <div>
        {/* Header: Company Avatar + Company Name + Action Buttons */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getGradient(
                job.company.name
              )} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}
            >
              {job.company.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <Link
                href={`/company/${job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="text-sm font-semibold text-slate-800 hover:text-brand-600 transition-colors inline-block"
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
                    <span className="capitalize font-medium text-slate-600">
                      {job.remoteType.toLowerCase()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <SponsorshipBadge label={job.sponsorship.label} size="sm" />
            <button
              onClick={toggleSave}
              type="button"
              aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
              className={`p-2 rounded-xl transition-all ${
                isSaved
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <Link href={`/job/${job.slug}`} className="block group-hover:text-brand-600 transition-colors mt-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display leading-snug">
            {job.title}
          </h3>
        </Link>

        {/* Key Attributes Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {formatSalary() && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60">
              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
              <span>{formatSalary()}</span>
            </span>
          )}
          {job.employmentType !== "UNKNOWN" && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
              {job.employmentType.replace("_", " ")}
            </span>
          )}
          {job.category && (
            <span className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-medium border border-brand-100/70">
              {job.category.name}
            </span>
          )}
        </div>

        {/* Sponsorship Evidence Snippet */}
        {job.sponsorship.positiveEvidence.length > 0 && (
          <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-emerald-50/90 to-teal-50/50 border border-emerald-200/70 text-xs text-emerald-950 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-emerald-800">Sponsorship Signal: </span>
              <span className="italic text-emerald-900">&ldquo;{job.sponsorship.positiveEvidence[0]}&rdquo;</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Freshness + High Demand Tag + Action CTA */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatFreshness(job.postedAt)}</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100">
            <Flame className="w-3 h-3 text-rose-500" />
            <span>High Demand</span>
          </span>
        </div>

        <Link
          href={`/job/${job.slug}`}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-100 group-hover:bg-brand-600 text-slate-700 group-hover:text-white text-xs font-semibold transition-all duration-200 shadow-2xs group-hover:shadow-brand-sm"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
