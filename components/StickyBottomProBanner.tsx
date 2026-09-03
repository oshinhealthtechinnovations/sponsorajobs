"use client";

import React, { useState } from "react";
import { Crown, Sparkles, X, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useSession } from "@/hooks/useSession";

export function StickyBottomProBanner() {
  const { isPro, isLoading } = useSession();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isLoading || isPro || isDismissed) {
    return null;
  }

  const handleOpenProGate = () => {
    window.dispatchEvent(
      new CustomEvent("open-pro-gate", {
        detail: {
          featureName: "All 7,800+ Sponsor Jobs & Direct Application Links",
        },
      })
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2.5 sm:p-3 bg-gradient-to-r from-[#071421] via-slate-900 to-[#0A1A2F] text-white border-t border-amber-400/40 shadow-2xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0 hidden sm:flex">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold text-white">
                You&apos;re viewing free preview.
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-400">
                Premium unlocks 7,800+ verified sponsor jobs + direct apply links.
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden md:block">
              Includes full job descriptions, direct employer career portals, salary ranges &amp; AI ATS matching.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleOpenProGate}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer shrink-0"
          >
            <Crown className="w-4 h-4" />
            <span>Get 30-Day Pass — ₹199 / ₹499</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
