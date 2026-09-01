"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Share2, Bell, Check, ExternalLink, Lock, Sparkles, CheckCircle2, Flag } from "lucide-react";
import { JobAlertModal } from "./JobAlertModal";
import { JobShareModal } from "./JobShareModal";
import { ReportIssueModal } from "./ReportIssueModal";

import { useSession } from "@/hooks/useSession";
import { saveLocalApplication } from "@/lib/utils/clientApplicationTracker";

interface JobDetailActionsProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  countryCode: string;
  categorySlug?: string;
  applyUrl: string;
  isMobileSticky?: boolean;
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
  isMobileSticky = false,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { isLoggedIn, user } = useSession();

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
    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: { defaultTab: "register", redirectUrl: applyUrl },
        })
      );
      return;
    }

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
      window.dispatchEvent(new Event("storage"));
    } catch {
      // safe fallback
    }
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: { defaultTab: "register", redirectUrl: applyUrl },
        })
      );
      return;
    }

    // Immediately save to local application tracker
    saveLocalApplication(
      {
        jobId,
        jobTitle,
        companyName,
        applyUrl,
        status: "APPLIED",
      },
      user?.id
    );

    // Asynchronously log to application tracker
    try {
      fetch("/api/user/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          jobTitle,
          companyName,
          applyUrl,
          status: "APPLIED",
        }),
      }).catch(() => {});
    } catch {}

    // Direct free 1-click apply to official employer site
    window.open(applyUrl, "_blank", "noopener,noreferrer");

    // Trigger cross-verification prompt
    window.dispatchEvent(
      new CustomEvent("verify-job-application", {
        detail: {
          jobId,
          jobTitle,
          companyName,
          applyUrl,
        },
      })
    );
  };

  return (
    <>
      {isMobileSticky ? (
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={toggleSave}
            title={isSaved ? "Saved" : "Save this job"}
            className={`p-3 rounded-xl border transition-all cursor-pointer touch-manipulation shrink-0 ${
              isSaved
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>

          <button
            onClick={handleShare}
            title="Share this job"
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer touch-manipulation shrink-0"
          >
            <Share2 className="w-4 h-4 text-brand-600" />
          </button>

          <button
            type="button"
            onClick={handleApplyClick}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-brand-600/25 transition-all text-center cursor-pointer touch-manipulation"
          >
            <span>{isDirect ? "Apply for This Job" : "View Employer Site"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full sm:w-64 shrink-0">
          {/* === MAIN APPLY CTA (Direct Free Access) === */}
          <button
            type="button"
            onClick={handleApplyClick}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-brand-600/25 transition-all text-center cursor-pointer group touch-manipulation"
          >
            <span>{isDirect ? "Apply for This Job" : "View on Employer Site"}</span>
            <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          {/* Link quality & access notice */}
          <p className="text-[11px] text-center text-emerald-700 font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Official Employer Application</span>
          </p>

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
              <Share2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Share</span>
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

          {/* Quality Audit & Report Link */}
          <div className="pt-2 text-center">
            <button
              onClick={() => setReportModalOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
            >
              <Flag className="w-3 h-3 text-slate-400" />
              <span>Report issue with this listing</span>
            </button>
          </div>
        </div>
      )}

      <JobAlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        defaultRole={jobTitle}
        defaultCountry={countryCode.toLowerCase()}
        defaultCategory={categorySlug || "all"}
      />

      <JobShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        jobTitle={jobTitle}
        companyName={companyName}
        countryCode={countryCode}
      />

      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        jobId={jobId}
        jobTitle={jobTitle}
        companyName={companyName}
      />
    </>
  );
};
