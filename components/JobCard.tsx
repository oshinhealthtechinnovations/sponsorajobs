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
  const { isLoggedIn, user, isPro } = useSession();

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

  /** Open auth gate or PRO gate */
  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. If not logged in, request quick login/OTP
    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: {
            defaultTab: "register",
            redirectUrl: `/job/${job.slug}`,
          },
        })
      );
      return;
    }

    // 2. If logged in but not PRO, trigger VIP Pro Paywall
    if (!isPro) {
      window.dispatchEvent(
        new CustomEvent("open-pro-gate", {
          detail: {
            featureName: `Direct Apply Link for "${job.title}"`,
          },
        })
      );
      return;
    }

    // 3. If PRO, proceed with official application
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

    window.open(job.applyUrl, "_blank", "noopener,noreferrer");

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
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: {
            defaultTab: "register",
            redirectUrl: `/job/${job.slug}`,
          },
        })
      );
      return;
    }

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

  const salary = formatSalary();
  const hasNegative = job.sponsorship.label === "Explicitly Not Offered";
  const hasSponsorship =
    job.sponsorship.label === "Strong" ||
    job.sponsorship.label === "Likely" ||
    (!hasNegative && (confidence.label === "VERIFIED" || confidence.label === "HIGH CONFIDENCE" || confidence.label === "SIGNAL DETECTED"));

  return (
    <>
      <div className="rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all duration-200 flex flex-col group relative overflow-hidden">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-2xl" />

        <div className="p-5 flex flex-col flex-1 gap-3">
          {/* Header: Company logo, name, location + Save */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
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

            {/* Save button */}
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
            <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-900 leading-snug line-clamp-2 transition-colors">
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
                <span>Verified Sponsor</span>
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

          {/* Blurred Teaser Preview for Non-Pro Users (matching ukvisasponsorships.co.uk) */}
          {!isPro && (
            <div className="relative mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 overflow-hidden">
              <div className="text-xs text-slate-500 line-clamp-2 blur-[4px] select-none pointer-events-none">
                This licensed sponsor role requires expertise in candidate project execution, technical leadership, regulatory compliance, and cross-functional team delivery with direct visa certificate support.
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 backdrop-blur-[1px]">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/90 text-slate-950 font-black text-[10px] shadow-xs tracking-wide">
                  <Lock className="w-3 h-3" />
                  <span>FULL DESCRIPTION WITH PREMIUM</span>
                </span>
              </div>
            </div>
          )}

          {/* Footer: Date + CTAs */}
          <div className="mt-auto pt-3 border-t border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{formatPostedDate(job.postedAt)}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Link
                href={`/job/${job.slug}`}
                className="flex-1 sm:flex-none min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center touch-manipulation text-center"
              >
                View Details
              </Link>

              {/* Apply button — gated behind Pro */}
              <button
                type="button"
                onClick={handleApplyClick}
                title={!isPro ? "Upgrade to VIP to access direct apply links" : "Start application"}
                className={`flex-1 sm:flex-none min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md active:scale-[0.98] cursor-pointer relative touch-manipulation group ${
                  !isPro
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
                    : "bg-[#071421] hover:bg-slate-800 text-white"
                }`}
              >
                {!isPro && <Lock className="w-3 h-3 text-slate-950" />}
                <span>{!isPro ? "Apply (VIP)" : "Start Application"}</span>
                <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0 ${!isPro ? "text-slate-950" : "text-[#18D6E5]"}`} />
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
