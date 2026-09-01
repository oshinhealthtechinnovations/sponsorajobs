"use client";

import React from "react";
import { ExternalLink, Lock } from "lucide-react";
import { useSession } from "@/hooks/useSession";

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
  const { isLoggedIn } = useSession();

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Mandatory Auth Check: if user is not logged in, show Auth Gate
    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: {
            defaultTab: "register",
            redirectUrl: applyUrl,
          },
        })
      );
      return;
    }

    // 2. User is logged in -> Log application in tracker backend
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

    // 4. Trigger the Cross-Verification Modal with 12s countdown
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
        title={!isLoggedIn ? "Create a free account to apply" : "Apply on Employer Website"}
        className={
          className ||
          "inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-[#18D6E5] hover:bg-[#15c0ce] text-[#071421] font-black text-sm transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-[0.99] cursor-pointer group relative"
        }
      >
        {!isLoggedIn && <Lock className="w-4 h-4 text-slate-800" />}
        <span>{label || "Apply on Employer Website"}</span>
        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    );
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={handleApplyClick}
        title={!isLoggedIn ? "Create a free account to apply" : "Apply on Official Website"}
        className={
          className ||
          "w-full h-14 rounded-2xl bg-[#071421] hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer group"
        }
      >
        {!isLoggedIn && <Lock className="w-4 h-4 text-amber-400" />}
        <span>{label || "Apply on Official Website"}</span>
        <ExternalLink className="w-4 h-4 text-[#18D6E5] group-hover:translate-x-0.5 transition-transform" />
      </button>
    );
  }

  // Default button
  return (
    <button
      type="button"
      onClick={handleApplyClick}
      title={!isLoggedIn ? "Create a free account to apply" : "Apply now"}
      className={
        className ||
        "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#071421] hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
      }
    >
      {!isLoggedIn && <Lock className="w-3.5 h-3.5 text-amber-400" />}
      <span>{label || "Apply"}</span>
      <ExternalLink className="w-3.5 h-3.5 text-[#18D6E5]" />
    </button>
  );
}
