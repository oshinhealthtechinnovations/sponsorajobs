"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Bookmark, Share2, Sparkles, Building2, CheckCircle2 } from "lucide-react";
import { JobShareModal } from "./JobShareModal";

interface StickyJobApplyBarProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  locationFormatted?: string;
  applyUrl: string;
  salaryFormatted: string;
  sponsorshipLabel: string;
}

export const StickyJobApplyBar: React.FC<StickyJobApplyBarProps> = ({
  jobId,
  jobTitle,
  companyName,
  locationFormatted = "Global",
  applyUrl,
  salaryFormatted,
  sponsorshipLabel,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past 280px (past the hero card)
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    try {
      const saved = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      setIsSaved(saved.includes(jobId));
    } catch {
      // safe fallback
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [jobId]);

  const toggleSave = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      let updated: string[];
      if (saved.includes(jobId)) {
        updated = saved.filter((id) => id !== jobId);
        setIsSaved(false);
      } else {
        updated = [...saved, jobId];
        setIsSaved(true);
      }
      localStorage.setItem("sa_saved_jobs", JSON.stringify(updated));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const handleApply = () => {
    window.open(applyUrl, "_blank", "noopener,noreferrer");
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop & Mobile Floating Conversion Bar */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-4xl z-50 animate-fade-in">
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/40 text-white flex items-center justify-between gap-3 sm:gap-6">
          {/* Company & Role Details */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 border border-white/10 flex items-center justify-center font-black text-sm text-white shrink-0 shadow-md">
              {companyName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate">{jobTitle}</span>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  {sponsorshipLabel}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                <span>{companyName}</span>
                <span>&middot;</span>
                <span>{locationFormatted}</span>
                {salaryFormatted !== "Competitive / Not disclosed" && (
                  <>
                    <span className="hidden sm:inline">&middot;</span>
                    <span className="hidden sm:inline text-amber-300 font-semibold">{salaryFormatted}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleSave}
              title={isSaved ? "Saved" : "Save this job"}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer ${
                isSaved
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? "fill-rose-400 text-rose-400" : ""}`} />
            </button>

            <button
              onClick={() => setShareOpen(true)}
              title="Share job"
              className="p-2.5 sm:p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer hidden sm:flex items-center justify-center"
            >
              <Share2 className="w-4 h-4 text-brand-400" />
            </button>

            <button
              onClick={handleApply}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
            >
              <span>Apply Directly</span>
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      <JobShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        jobTitle={jobTitle}
        companyName={companyName}
        countryCode="GLOBAL"
      />
    </>
  );
};
