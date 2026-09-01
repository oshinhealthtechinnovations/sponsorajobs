"use client";

import React from "react";
import { ExternalLink, Lock } from "lucide-react";
import { useSession } from "@/hooks/useSession";

interface CompanyCareersButtonProps {
  companyName: string;
  websiteUrl: string;
}

export function CompanyCareersButton({ companyName, websiteUrl }: CompanyCareersButtonProps) {
  const { isLoggedIn } = useSession();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: { defaultTab: "register", redirectUrl: websiteUrl },
        })
      );
      return;
    }

    window.open(websiteUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer shrink-0"
    >
      <span>Official Careers Portal</span>
      {isLoggedIn ? (
        <ExternalLink className="w-3.5 h-3.5 text-[#18D6E5]" />
      ) : (
        <Lock className="w-3.5 h-3.5 text-amber-400" />
      )}
    </button>
  );
}
