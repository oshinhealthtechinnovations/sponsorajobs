"use client";

import React from "react";
import {
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Zap,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";

interface ToolAuthGuardProps {
  toolName: string;
  toolDescription?: string;
  featurePills?: string[];
  children: React.ReactNode;
}

export const ToolAuthGuard: React.FC<ToolAuthGuardProps> = ({
  toolName,
  toolDescription = "This candidate intelligence tool requires an active Candidate Pro account to unlock full visa sponsorship matching, keyword gap analysis, and legal cover letter generation.",
  featurePills = [
    "Candidate Pro All-Access",
    "Instant Verification",
    "Auto-Saved Career Progress",
    "Verified Visa Opportunities",
  ],
  children,
}) => {
  const { isLoggedIn, isLoading } = useSession();

  // Show neutral loading skeleton while initial session resolves
  if (isLoading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-2xl border-3 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-500 animate-pulse">
          Verifying candidate membership...
        </p>
      </div>
    );
  }

  // If candidate is logged in, render the full tool interface
  if (isLoggedIn) {
    return <>{children}</>;
  }

  // Otherwise, render the High-Conversion Account Creation Gateway
  const handleOpenAuth = (tab: "register" | "login" = "register") => {
    window.dispatchEvent(
      new CustomEvent("open-auth-gate", {
        detail: { defaultTab: tab },
      })
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 p-6 sm:p-10 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl text-white relative overflow-hidden animate-fade-in">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6 text-center sm:text-left">
        {/* Top Badge */}
        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-black uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Candidate Account Required</span>
          </div>

          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
            100% Free Forever
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
            Unlock <span className="text-[#19CBE0]">{toolName}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {toolDescription}
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {featurePills.map((pill, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 text-xs font-semibold text-slate-200"
            >
              <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
              <span>{pill}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons (Strictly >44px height for Mobile Usability) */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => handleOpenAuth("register")}
            className="min-h-[48px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 via-[#19CBE0] to-teal-400 hover:from-brand-400 hover:to-teal-300 active:scale-[0.98] text-slate-950 font-black text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Create Free Candidate Account</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenAuth("login")}
            className="min-h-[48px] px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
          >
            <UserCheck className="w-4 h-4 text-brand-400" />
            <span>Already have an account? Sign In</span>
          </button>
        </div>

        {/* Trust Notice */}
        <p className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>No credit card required &middot; Instant setup in under 30 seconds &middot; Zero spam guarantee</span>
        </p>
      </div>
    </div>
  );
};
