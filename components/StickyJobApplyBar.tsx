"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Bookmark, Share2, Sparkles, Building2, CheckCircle2, Lock } from "lucide-react";
import { JobShareModal } from "./JobShareModal";
import { useSession } from "@/hooks/useSession";
import { saveLocalApplication } from "@/lib/utils/clientApplicationTracker";

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
  const { isLoggedIn, user, isPro } = useSession();

  // Show floating bar after scrolling past the main hero CTA
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync saved status from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      setIsSaved(saved.includes(jobId));
    } catch {
      // safe fallback
    }
  }, [jobId]);

  const toggleSave = () => {
    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: {
            defaultTab: "register",
            redirectUrl: window.location.pathname,
          },
        })
      );
      return;
    }

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
      window.dispatchEvent(new Event("storage"));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const handleApply = () => {
    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: {
            defaultTab: "register",
            redirectUrl: window.location.pathname,
          },
        })
      );
      return;
    }

    if (!isPro) {
      window.dispatchEvent(
        new CustomEvent("open-pro-gate", {
          detail: {
            featureName: `Direct Application Portal for "${jobTitle}"`,
          },
        })
      );
      return;
    }

    // 1. Save to local application tracker immediately
    saveLocalApplication(
      {
        jobId,
        jobTitle,
        companyName,
        location: locationFormatted,
        salary: salaryFormatted,
        applyUrl,
        status: "APPLIED",
      },
      user?.id
    );

    // 2. Asynchronously sync to backend / Supabase
    try {
      fetch("/api/user/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          jobTitle,
          companyName,
          location: locationFormatted,
          salary: salaryFormatted,
          applyUrl,
          status: "APPLIED",
        }),
      }).catch(() => {});
    } catch {}

    // 3. Open career application in new tab
    window.open(applyUrl, "_blank", "noopener,noreferrer");

    // 4. Trigger Cross-Verification Modal with 12s countdown
    window.dispatchEvent(
      new CustomEvent("verify-job-application", {
        detail: {
          jobId,
          jobTitle,
          companyName,
          location: locationFormatted,
          salary: salaryFormatted,
          applyUrl,
        },
      })
    );
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Desktop & Mobile Floating Conversion Bar */}
      <div className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-4 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-4xl z-40 animate-fade-in">
        <div className="p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/40 text-white flex items-center justify-between gap-2.5 sm:gap-6">
          {/* Company & Role Details */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 border border-white/10 flex items-center justify-center font-black text-xs sm:text-sm text-white shrink-0 shadow-md">
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
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={toggleSave}
              title={isSaved ? "Saved" : "Save this job"}
              aria-label={isSaved ? "Saved" : "Save this job"}
              className={`p-2.5 sm:p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-all cursor-pointer touch-manipulation ${
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
              aria-label="Share job"
              className="p-2 sm:p-3 min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer hidden sm:flex items-center justify-center touch-manipulation"
            >
              <Share2 className="w-4 h-4 text-brand-400" />
            </button>

            <button
              onClick={handleApply}
              title="Start Application"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 sm:py-3.5 min-h-[44px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:scale-[0.98] text-white font-black text-xs sm:text-sm shadow-lg shadow-brand-600/30 transition-all cursor-pointer group touch-manipulation"
            >
              <span>Start Application</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#18D6E5] group-hover:translate-x-1 transition-transform shrink-0" />
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
