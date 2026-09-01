"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Briefcase,
  X,
  ExternalLink,
  ArrowRight,
  Bookmark,
  Sparkles,
  Check,
} from "lucide-react";

import { saveLocalApplication, deleteLocalApplication } from "@/lib/utils/clientApplicationTracker";

export interface VerifyJobEventDetail {
  jobId: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  applyUrl?: string;
  salary?: string | null;
}

const AUTO_CONFIRM_SECONDS = 12;

export function AppliedVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [jobData, setJobData] = useState<VerifyJobEventDetail | null>(null);
  const [countdown, setCountdown] = useState(AUTO_CONFIRM_SECONDS);
  const [statusState, setStatusState] = useState<"pending" | "confirmed" | "saved">("pending");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleVerifyEvent = (e: CustomEvent<VerifyJobEventDetail>) => {
      if (!e.detail?.jobId) return;

      setJobData(e.detail);
      setCountdown(AUTO_CONFIRM_SECONDS);
      setStatusState("pending");
      setIsOpen(true);

      // Pre-save into local tracker immediately
      saveLocalApplication({
        jobId: e.detail.jobId,
        jobTitle: e.detail.jobTitle,
        companyName: e.detail.companyName,
        location: e.detail.location || "Global",
        salary: e.detail.salary || null,
        applyUrl: e.detail.applyUrl || "",
        status: "APPLIED",
      });
    };

    window.addEventListener("verify-job-application" as any, handleVerifyEvent);
    return () => {
      window.removeEventListener("verify-job-application" as any, handleVerifyEvent);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Countdown logic — if user does not reply, automatically assume it as Applied
  useEffect(() => {
    if (!isOpen || statusState !== "pending") return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Timer reached 0 -> Auto-confirm as Applied
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoConfirm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, statusState, jobData]);

  // Auto-confirm fallback (assumed applied)
  const handleAutoConfirm = () => {
    setStatusState("confirmed");
    if (jobData) {
      saveLocalApplication({
        jobId: jobData.jobId,
        jobTitle: jobData.jobTitle,
        companyName: jobData.companyName,
        location: jobData.location || "Global",
        salary: jobData.salary || null,
        applyUrl: jobData.applyUrl || "",
        status: "APPLIED",
      });

      try {
        fetch("/api/user/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: jobData.jobId,
            jobTitle: jobData.jobTitle,
            companyName: jobData.companyName,
            location: jobData.location || "Global",
            salary: jobData.salary || null,
            applyUrl: jobData.applyUrl || "",
            status: "APPLIED",
          }),
        }).catch(() => {});
        window.dispatchEvent(new Event("user-session-changed"));
      } catch {}
    }
    // Auto-close after short confirmation toast
    setTimeout(() => {
      setIsOpen(false);
    }, 2500);
  };

  // User explicitly clicks "Yes, I Applied"
  const handleExplicitApplied = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatusState("confirmed");

    if (jobData) {
      saveLocalApplication({
        jobId: jobData.jobId,
        jobTitle: jobData.jobTitle,
        companyName: jobData.companyName,
        location: jobData.location || "Global",
        salary: jobData.salary || null,
        applyUrl: jobData.applyUrl || "",
        status: "APPLIED",
      });

      try {
        await fetch("/api/user/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: jobData.jobId,
            jobTitle: jobData.jobTitle,
            companyName: jobData.companyName,
            location: jobData.location || "Global",
            salary: jobData.salary || null,
            applyUrl: jobData.applyUrl || "",
            status: "APPLIED",
          }),
        });
        window.dispatchEvent(new Event("user-session-changed"));
      } catch {}
    }

    setTimeout(() => {
      setIsOpen(false);
    }, 2500);
  };

  // User clicks "Not Yet / Just Browsing" -> change to Saved / remove from applied
  const handleNotYet = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatusState("saved");

    if (jobData?.jobId) {
      deleteLocalApplication(jobData.jobId);
      try {
        // Save to saved jobs in localStorage
        const saved: string[] = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
        if (!saved.includes(jobData.jobId)) {
          saved.push(jobData.jobId);
          localStorage.setItem("sa_saved_jobs", JSON.stringify(saved));
          window.dispatchEvent(new Event("storage"));
        }

        // Remove from applications or update status to ARCHIVED
        await fetch(`/api/user/applications?id=${jobData.jobId}`, {
          method: "DELETE",
        }).catch(() => {});
      } catch {}
    }

    setTimeout(() => {
      setIsOpen(false);
    }, 2500);
  };

  // Dismiss via X button (still keeps assumed APPLIED status in background)
  const handleDismiss = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsOpen(false);
  };

  if (!isOpen || !jobData) return null;

  const progressPercent = (countdown / AUTO_CONFIRM_SECONDS) * 100;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[420px] z-50 animate-slide-up">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-black/60 p-5 text-white">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[#19CBE0]/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#19CBE0]/15 border border-[#19CBE0]/30 text-[#19CBE0] text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Application Tracker</span>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content based on state */}
        {statusState === "pending" && (
          <div className="space-y-3.5">
            <div>
              <h3 className="text-base font-extrabold text-white leading-snug">
                Did you complete your application at <span className="text-[#19CBE0]">{jobData.companyName}</span>?
              </h3>
              <p className="text-xs text-slate-300 mt-1 truncate">
                Role: <span className="font-semibold text-slate-100">{jobData.jobTitle}</span>
              </p>
            </div>

            {/* Live Progress Bar for Auto-Assumed Application */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Auto-confirming as <strong className="text-emerald-400 font-bold">Applied</strong>:
                </span>
                <span className="font-mono font-bold text-amber-300">{countdown}s</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-[#19CBE0] to-emerald-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleExplicitApplied}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-[#19CBE0] hover:from-emerald-500 hover:to-[#14b8ca] text-white font-extrabold text-xs shadow-md shadow-emerald-950/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Yes, Applied</span>
              </button>

              <button
                type="button"
                onClick={handleNotYet}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                <span>Just Browsing</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              No action needed — auto-recorded in your Candidate Dashboard.
            </p>
          </div>
        )}

        {statusState === "confirmed" && (
          <div className="space-y-3 py-2 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">
                Application Recorded as Applied!
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Track status and notes anytime in your dashboard.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#19CBE0] hover:underline"
            >
              <span>View in Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {statusState === "saved" && (
          <div className="space-y-3 py-2 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">
                Saved to Your Wishlist Instead
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                You can revisit this job anytime from your Saved Jobs.
              </p>
            </div>
            <Link
              href="/saved-jobs"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#19CBE0] hover:underline"
            >
              <span>View Saved Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
