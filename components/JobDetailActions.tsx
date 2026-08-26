"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Share2, Bell, Check, ExternalLink, AlertCircle } from "lucide-react";
import { JobAlertModal } from "./JobAlertModal";

interface JobDetailActionsProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  countryCode: string;
  categorySlug?: string;
  applyUrl: string;
}

/**
 * Detects if a URL is a direct job listing or a generic careers page.
 */
function isDirectJobUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
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
    return true;
  } catch {
    return true;
  }
}

export const JobDetailActions: React.FC<JobDetailActionsProps> = ({
  jobId,
  jobTitle,
  companyName,
  countryCode,
  categorySlug,
  applyUrl,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const isDirect = isDirectJobUrl(applyUrl);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      setIsSaved(saved.includes(jobId));
    } catch {
      // safe fallback
    }
  }, [jobId]);

  const toggleSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      let updated: string[];
      if (saved.includes(jobId)) {
        updated = saved.filter((id: string) => id !== jobId);
        setIsSaved(false);
      } else {
        updated = [...saved, jobId];
        setIsSaved(true);
      }
      localStorage.setItem("sa_saved_jobs", JSON.stringify(updated));
    } catch {
      // safe fallback
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${jobTitle} at ${companyName}`,
          text: `Check out this visa sponsorship opportunity: ${jobTitle} at ${companyName}`,
          url,
        });
        return;
      } catch {
        // User cancelled or fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    try {
      const user = localStorage.getItem("sa_user");
      if (!user) {
        e.preventDefault();
        window.dispatchEvent(
          new CustomEvent("open-auth-gate", {
            detail: { redirectUrl: applyUrl, defaultTab: "register" },
          })
        );
      }
    } catch {
      // proceed if localstorage fails
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 w-full sm:w-64 shrink-0">
        {/* === MAIN APPLY CTA === */}
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleApplyClick}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-brand-600/25 transition-all text-center cursor-pointer group touch-manipulation"
        >
          <span>{isDirect ? "Apply for This Job" : "View on Employer Site"}</span>
          <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        {/* Link quality notice */}
        {!isDirect ? (
          <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-snug">
              This opens the employer&apos;s careers page. Search for &ldquo;{jobTitle}&rdquo; once you arrive to find this specific role.
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-center text-emerald-700 font-medium">
            ✅ Direct link to this specific job posting
          </p>
        )}

        {/* === Secondary Action Row === */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={toggleSave}
            title={isSaved ? "Saved" : "Save this job"}
            className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer touch-manipulation ${
              isSaved
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>

          <button
            onClick={handleShare}
            title="Share this job"
            className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer touch-manipulation"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={() => setAlertModalOpen(true)}
            title="Get alerts for similar jobs"
            className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-semibold bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 transition-all cursor-pointer touch-manipulation"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alert</span>
          </button>
        </div>
      </div>

      <JobAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        defaultRole={jobTitle}
        defaultCountry={countryCode.toLowerCase()}
        defaultCategory={categorySlug || "all"}
      />
    </>
  );
};
