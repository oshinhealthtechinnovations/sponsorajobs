"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Bookmark, Share2, Lock } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { saveLocalApplication } from "@/lib/utils/clientApplicationTracker";
import { JobShareModal } from "./JobShareModal";

interface JobDetailSidebarActionsProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  locationFormatted?: string;
  salaryFormatted?: string | null;
  applyUrl: string;
  countryCode: string;
}

export function JobDetailSidebarActions({
  jobId,
  jobTitle,
  companyName,
  locationFormatted = "Global",
  salaryFormatted = null,
  applyUrl,
  countryCode,
}: JobDetailSidebarActionsProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { isLoggedIn, user } = useSession();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      setIsSaved(saved.includes(jobId));
    } catch {}
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

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: { defaultTab: "register", redirectUrl: applyUrl },
        })
      );
      return;
    }

    // 1. Immediately save to local application tracker
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

    // 2. Asynchronously log application to user tracker backend
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

    // 3. Open official career portal in new tab
    window.open(applyUrl, "_blank", "noopener,noreferrer");

    // 4. Trigger cross-verification prompt
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

  return (
    <>
      {/* Primary Apply CTA */}
      <button
        type="button"
        onClick={handleApply}
        title={!isLoggedIn ? "Create a free account to apply" : "Apply on Official Website"}
        className="w-full h-14 rounded-2xl bg-[#071421] hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer group"
      >
        {!isLoggedIn && <Lock className="w-4 h-4 text-amber-400" />}
        <span>Apply on Official Website</span>
        <ExternalLink className="w-4 h-4 text-[#18D6E5] group-hover:translate-x-0.5 transition-transform" />
      </button>

      <div className="text-center text-[11px] text-slate-500 font-medium">
        <span className="font-bold text-slate-700">100% Direct Application</span>
        {" · "}Redirects directly to the employer's official career portal.
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={toggleSave}
          title={!isLoggedIn ? "Sign in to save role" : isSaved ? "Saved" : "Save role"}
          className={`py-3 px-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            isSaved
              ? "bg-rose-50 text-rose-600 border border-rose-200"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
          <span>{isSaved ? "Saved" : "Save Role"}</span>
        </button>

        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-brand-600" />
          <span>Share</span>
        </button>
      </div>

      <JobShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        jobTitle={jobTitle}
        companyName={companyName}
        countryCode={countryCode}
      />
    </>
  );
}
