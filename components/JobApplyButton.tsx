"use client";

import React from "react";
import { ArrowRight, Lock, Crown } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { saveLocalApplication } from "@/lib/utils/clientApplicationTracker";

interface JobApplyButtonProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  locationFormatted?: string;
  salaryFormatted?: string | null;
  applyUrl: string;
  variant?: "hero" | "sidebar" | "sticky" | "card";
  label?: string;
  className?: string;
}

export function JobApplyButton({
  jobId,
  jobTitle,
  companyName,
  locationFormatted = "Global",
  salaryFormatted = null,
  applyUrl,
  variant = "hero",
  label,
  className = "",
}: JobApplyButtonProps) {
  const { user, isPro, isLoggedIn } = useSession();

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. If not logged in, prompt authentication
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

    // 2. If not Pro, open VIP Paywall modal
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

    // 3. Save to local application tracker
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

    // 4. Asynchronously sync to backend / Supabase
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

    // 5. Open official career portal in new tab
    window.open(applyUrl, "_blank", "noopener,noreferrer");

    // 6. Trigger the Cross-Verification Modal with 12s countdown
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

  // Base styling depending on variant
  if (variant === "hero") {
    return (
      <button
        type="button"
        onClick={handleApplyClick}
        title={!isPro ? "Upgrade to VIP to access direct apply links" : "Start Application"}
        className={
          className ||
          `inline-flex items-center justify-center gap-2.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base transition-all shadow-lg active:scale-[0.98] cursor-pointer group relative touch-manipulation w-full sm:w-auto ${
            !isPro
              ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/25"
              : "bg-gradient-to-r from-[#18D6E5] to-[#0ebccc] hover:from-[#15c0ce] hover:to-[#0aa8b7] text-[#071421] shadow-cyan-500/25"
          }`
        }
      >
        {!isPro ? <Crown className="w-5 h-5 text-slate-950" /> : null}
        <span>{label || (!isPro ? "Apply (Unlock VIP)" : "Start Application")}</span>
        <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform shrink-0 ${!isPro ? "text-slate-950" : "text-[#071421]"}`} />
      </button>
    );
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={handleApplyClick}
        title={!isPro ? "Upgrade to VIP to access direct apply links" : "Start Application"}
        className={
          className ||
          `w-full h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer group touch-manipulation ${
            !isPro
              ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/25"
              : "bg-gradient-to-r from-[#071421] to-[#0e273f] hover:from-[#0d2235] hover:to-[#173859] text-white"
          }`
        }
      >
        {!isPro ? <Crown className="w-4 h-4 text-slate-950" /> : null}
        <span>{label || (!isPro ? "Apply (Unlock VIP)" : "Start Application")}</span>
        <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0 ${!isPro ? "text-slate-950" : "text-[#18D6E5]"}`} />
      </button>
    );
  }

  // Default button
  return (
    <button
      type="button"
      onClick={handleApplyClick}
      title={!isPro ? "Upgrade to VIP to access direct apply links" : "Start Application"}
      className={
        className ||
        `inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer group touch-manipulation ${
          !isPro
            ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black"
            : "bg-[#071421] hover:bg-slate-800 text-white"
        }`
      }
    >
      {!isPro ? <Lock className="w-3.5 h-3.5 text-slate-950" /> : null}
      <span>{label || (!isPro ? "Apply (VIP)" : "Start Application")}</span>
      <ArrowRight className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0 ${!isPro ? "text-slate-950" : "text-[#18D6E5]"}`} />
    </button>
  );
}

