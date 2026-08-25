"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Share2, Bell, Check, ExternalLink } from "lucide-react";
import { JobAlertModal } from "./JobAlertModal";

interface JobDetailActionsProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  countryCode: string;
  categorySlug?: string;
  applyUrl: string;
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

  return (
    <>
      <div className="flex flex-col gap-3 sm:w-60 shrink-0">
        {/* Main Apply CTA */}
        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-brand-600/20 transition-all text-center cursor-pointer group"
        >
          <span>Apply on Official Portal</span>
          <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={toggleSave}
            title={isSaved ? "Saved in bookmarks" : "Save this job"}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isSaved
                ? "bg-rose-50 border-rose-200 text-rose-600 shadow-xs"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>

          <button
            onClick={handleShare}
            title="Share job"
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Copied</span>
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
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 transition-all cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts</span>
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-400">
          Direct redirect to employer / job portal
        </p>
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
