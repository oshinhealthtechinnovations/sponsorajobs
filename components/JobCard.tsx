"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicJobDTO } from "@/lib/types/job";
import { calculateJobIntelligence } from "@/lib/utils/intelligenceScorer";
import { JobShareModal } from "./JobShareModal";
import { useSession } from "@/hooks/useSession";
import { saveLocalApplication } from "@/lib/utils/clientApplicationTracker";
import {
  MapPin,
  Banknote,
  Clock,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Building2,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface JobCardProps {
  job: PublicJobDTO;
  compact?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, compact = false }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { isLoggedIn, user } = useSession();

  const intelligence = calculateJobIntelligence(job);
  const { worthScore, confidence } = intelligence;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      setIsSaved(saved.includes(job.id));
    } catch {
      // safe fallback
    }
  }, [job.id]);

  /** Open auth gate if not logged in; otherwise run the callback */
  const requireAuth = (
    e: React.MouseEvent,
    callback: () => void,
    redirectUrl?: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: {
            defaultTab: "register",
            redirectUrl,
          },
        })
      );
      return;
    }
    callback();
  };

  const toggleSave = (e: React.MouseEvent) => {
    requireAuth(e, () => {
      try {
        const saved: string[] = JSON.parse(
          localStorage.getItem("sa_saved_jobs") || "[]"
        );
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
    });
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    requireAuth(
      e,
      () => {
        // Save to local tracker immediately
        saveLocalApplication(
          {
            jobId: job.id,
            jobTitle: job.title,
            jobSlug: job.slug,
            companyName: job.company?.name || "Verified Employer",
            companyLogo: job.company?.logoUrl || null,
            location: job.location.formatted || job.location.country,
            salary: salary || null,
            applyUrl: job.applyUrl,
            status: "APPLIED",
          },
          user?.id
        );

        // Asynchronously log application to user tracker
        try {
          fetch("/api/user/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobId: job.id,
              jobTitle: job.title,
              jobSlug: job.slug,
              companyName: job.company?.name || "Verified Employer",
              companyLogo: job.company?.logoUrl || null,
              location: job.location.formatted || job.location.country,
              salary: salary || null,
              applyUrl: job.applyUrl,
              status: "APPLIED",
            }),
          }).catch(() => {});
        } catch {}

        // Open career portal in new tab
        window.open(job.applyUrl, "_blank", "noopener,noreferrer");

        // Trigger cross-verification prompt
        window.dispatchEvent(
          new CustomEvent("verify-job-application", {
            detail: {
              jobId: job.id,
              jobTitle: job.title,
              companyName: job.company?.name || "Verified Employer",
              location: job.location.formatted || job.location.country,
              salary: salary || null,
              applyUrl: job.applyUrl,
            },
          })
        );
      },
      job.applyUrl
    );
  };

  // Format salary
  const formatSalary = () => {
    if (!job.salary || (!job.salary.min && !job.salary.max)) return null;
    const curr = job.salary.currency || "USD";
    if (job.salary.min && job.salary.max) {
      return `${curr} ${job.salary.min.toLocaleString()} – ${job.salary.max.toLocaleString()} / yr`;
    }
    if (job.salary.min) return `From ${curr} ${job.salary.min.toLocaleString()}`;
    return `Up to ${curr} ${job.salary.max?.toLocaleString()}`;
  };

  const formatPostedDate = (dateStr: string | null) => {
    if (!dateStr) return "Recently posted";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 0) return "Posted today";
    if (diffDays === 1) return "Posted yesterday";
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
  };

  // Application Fit label per spec §10
  const getFitLabel = (score: number) => {
    if (score >= 90) return { label: "Excellent Match", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 75) return { label: "Strong Match", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 60) return { label: "Possible Match", color: "text-amber-700 bg-amber-50 border-amber-200" };
    if (score >= 40) return { label: "Low Match", color: "text-slate-600 bg-slate-50 border-slate-200" };
    return { label: "Unlikely Match", color: "text-slate-500 bg-slate-50 border-slate-200" };
  };

  const fitInfo = getFitLabel(worthScore);
  const salary = formatSalary();
  const hasNegative = job.sponsorship.label === "Explicitly Not Offered";
  const hasSponsorship =
    job.sponsorship.label === "Strong" ||
    job.sponsorship.label === "Likely" ||
    (!hasNegative && (confidence.label === "VERIFIED" || confidence.label === "HIGH CONFIDENCE" || confidence.label === "SIGNAL DETECTED"));

  return (
    <>
      <div className="rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col group relative overflow-hidden">
        {/* Top accent line on hover */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#19CBE0] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-2xl" />

        <div className="p-5 flex flex-col flex-1 gap-3">

          {/* Header: Company logo, name, location + Save */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {(job.company?.name || "Employer").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/company/${(job.company?.name || "employer").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-bold text-slate-700 hover:text-[#071522] transition-colors truncate block"
                >
                  {job.company?.name || "Verified Employer"}
                </Link>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {typeof job.location?.formatted === "string"
                      ? job.location.formatted
                      : typeof job.location?.formatted === "object"
                      ? ((job.location?.formatted as any)?.formatted || (job.location?.formatted as any)?.raw || "Global")
                      : `${job.location?.city || ""}, ${job.location?.country || ""}`}
                  </span>
                  {job.remoteType && job.remoteType !== "UNKNOWN" && job.remoteType !== "ONSITE" && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="capitalize text-[#19CBE0] font-medium">{(job.remoteType || "").toLowerCase()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Save button — gated behind auth */}
            <button
              onClick={toggleSave}
              type="button"
              aria-label={isLoggedIn ? (isSaved ? "Remove from saved" : "Save job") : "Sign in to save job"}
              title={!isLoggedIn ? "Create a free account to save jobs" : undefined}
              className={`p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-all cursor-pointer shrink-0 relative touch-manipulation ${
                isSaved
                  ? "bg-rose-50 text-rose-500 border border-rose-200"
                  : "text-slate-300 hover:text-slate-600 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-rose-400 text-rose-500" : ""}`} />
              {!isLoggedIn && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center shadow-xs">
                  <Lock className="w-2 h-2 text-slate-950 font-bold" />
                </span>
              )}
            </button>
          </div>

          {/* Job Title */}
          <Link href={`/job/${job.slug}`} className="block">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#071522] leading-snug line-clamp-2 transition-colors">
              {job.title}
            </h3>
          </Link>

          {/* Tags & Key Badges: Salary, Visa Sponsorship, Category */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {salary && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200/80">
                <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{salary}</span>
              </span>
            )}

            {hasSponsorship ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-bold text-xs border border-sky-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Visa Sponsorship</span>
              </span>
            ) : hasNegative ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Right to Work Required</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Direct Employer</span>
              </span>
            )}

            {job.category && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                {job.category.name}
              </span>
            )}

            {job.employmentType && job.employmentType !== "UNKNOWN" && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium capitalize">
                {job.employmentType.toLowerCase().replace("_", " ")}
              </span>
            )}
          </div>

          {/* Footer: Date + CTAs */}
          <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{formatPostedDate(job.postedAt)}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/job/${job.slug}`}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center touch-manipulation"
              >
                View Details
              </Link>
              {/* Apply button — gated behind auth */}
              <button
                type="button"
                onClick={handleApplyClick}
                title={!isLoggedIn ? "Create a free account to apply" : "Apply now"}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#071421] hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer relative touch-manipulation"
              >
                {!isLoggedIn && <Lock className="w-3 h-3 text-amber-400" />}
                <span>Apply</span>
                <ExternalLink className="w-3 h-3 text-[#18D6E5]" />
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
