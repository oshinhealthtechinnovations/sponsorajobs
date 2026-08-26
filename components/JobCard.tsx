"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicJobDTO } from "@/lib/types/job";
import { SponsorshipBadge } from "./SponsorshipBadge";
import {
  MapPin,
  Banknote,
  Clock,
  ArrowUpRight,
  Bookmark,
  Flame,
  CheckCircle2,
  ExternalLink,
  Building2,
} from "lucide-react";

interface JobCardProps {
  job: PublicJobDTO;
}

/**
 * Detects if a URL is likely a generic careers page rather than a specific job listing.
 * A specific job URL typically contains a job ID, hash, or job-specific path segment.
 */
function isDirectJobUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    // Generic careers pages end at /careers, /jobs, /openings, /opportunities
    const genericPatterns = [
      /^\/careers\/?$/,
      /^\/jobs\/?$/,
      /^\/job-openings\/?$/,
      /^\/openings\/?$/,
      /^\/opportunities\/?$/,
      /^\/work-with-us\/?$/,
      /^\/join-us\/?$/,
    ];
    if (genericPatterns.some((p) => p.test(path))) return false;
    // If path has 2+ segments or contains digits/hash it's likely specific
    const segments = path.split("/").filter(Boolean);
    if (segments.length >= 2) return true;
    // Jooble redirect links are always specific
    if (u.hostname.includes("jooble")) return true;
    // Arbeitnow links are always specific
    if (u.hostname.includes("arbeitnow")) return true;
    return true;
  } catch {
    return true;
  }
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
      const user = localStorage.getItem("sa_user");
      if (!user) {
        window.dispatchEvent(
          new CustomEvent("open-auth-gate", {
            detail: { defaultTab: "register" },
          })
        );
        return;
      }

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

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const stored = localStorage.getItem("sa_user");
      let hasAccess = false;
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.id && (u.has_active_trial || u.hasActiveTrial || u.promoCodeUsed || u.promo_code_used)) {
          hasAccess = true;
        }
      }

      if (!hasAccess) {
        window.dispatchEvent(
          new CustomEvent("open-auth-gate", {
            detail: { redirectUrl: job.applyUrl, defaultTab: "register" },
          })
        );
        return;
      }

      window.open(job.applyUrl, "_blank", "noopener,noreferrer");
    } catch {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: { redirectUrl: job.applyUrl, defaultTab: "register" },
        })
      );
    }
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
    if (!dateStr) return "Recently posted";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 14) return "1 week ago";
    return `${Math.floor(diffDays / 7)}w ago`;
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

  const isDirect = isDirectJobUrl(job.applyUrl);
  const salary = formatSalary();

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 hover:border-brand-400/70 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group relative overflow-hidden">
      {/* Top hover accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-400 via-sky-500 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Header Row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Company Avatar */}
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient(
              job.company.name
            )} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}
          >
            {job.company.name.slice(0, 2).toUpperCase()}
          </div>

          {/* Company + Location */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  href={`/company/${job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors truncate block"
                >
                  {job.company.name}
                </Link>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {job.location.formatted || `${job.location.city || ""}, ${job.location.country}`}
                  </span>
                  {job.remoteType !== "UNKNOWN" && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="capitalize text-slate-500 font-medium">
                        {job.remoteType.toLowerCase()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={toggleSave}
                type="button"
                aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
                className={`p-2 rounded-xl transition-all shrink-0 touch-manipulation ${
                  isSaved
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "text-slate-300 hover:text-slate-600 hover:bg-slate-100 border border-transparent"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Job Title — clickable to internal detail page */}
        <Link href={`/job/${job.slug}`} className="block mb-3">
          <h3 className="text-base sm:text-[17px] font-bold text-slate-900 group-hover:text-brand-700 transition-colors leading-snug">
            {job.title}
          </h3>
        </Link>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
          <SponsorshipBadge label={job.sponsorship.label} size="sm" />
          {salary && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/60">
              <Banknote className="w-3 h-3 text-emerald-600" />
              {salary}
            </span>
          )}
          {job.employmentType !== "UNKNOWN" && (
            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-medium">
              {job.employmentType.replace("_", " ")}
            </span>
          )}
          {job.category && (
            <span className="px-2 py-0.5 rounded-lg bg-brand-50 text-brand-700 font-medium border border-brand-100/60">
              {job.category.name}
            </span>
          )}
        </div>

        {/* Sponsorship Evidence Snippet */}
        {job.sponsorship.positiveEvidence.length > 0 && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/60 text-xs text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="italic leading-relaxed line-clamp-2">
              &ldquo;{job.sponsorship.positiveEvidence[0]}&rdquo;
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatFreshness(job.postedAt)}
            </span>
            <span className="hidden sm:flex items-center gap-1 text-rose-500 font-semibold">
              <Flame className="w-3 h-3" />
              Hot
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Internal detail view */}
            <Link
              href={`/job/${job.slug}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all touch-manipulation"
            >
              Details
            </Link>

            {/* DIRECT APPLY — gated by auth */}
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleApplyClick}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm shadow-brand-600/20 touch-manipulation group/apply"
            >
              <span>Apply</span>
              <ExternalLink className="w-3 h-3 transition-transform group-hover/apply:translate-x-0.5 group-hover/apply:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Link quality indicator */}
        {!isDirect && (
          <p className="mt-2 text-[10px] text-amber-600 flex items-center gap-1">
            <Building2 className="w-3 h-3 shrink-0" />
            Opens employer careers page — search for &ldquo;{job.title}&rdquo; once there
          </p>
        )}
      </div>
    </div>
  );
};
