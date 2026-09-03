"use client";

import React, { useState } from "react";
import {
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Zap,
  Crown,
  Check,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { RazorpayCheckoutButton } from "@/components/RazorpayCheckoutButton";
import Link from "next/link";

interface ToolAuthGuardProps {
  toolName: string;
  toolDescription?: string;
  featurePills?: string[];
  requiresPro?: boolean;
  children: React.ReactNode;
}

const PRO_PLANS = [
  { code: "SA_MONTH_199",  label: "1 Month",  amount: 199, perDay: "₹6.6/day", subtitle: "Starter" },
  { code: "SA_3MONTH_499", label: "3 Months", amount: 499, perDay: "₹5.5/day", subtitle: "Best Value", badge: "Save 16%" },
  { code: "SA_6MONTH_799", label: "6 Months", amount: 799, perDay: "₹4.4/day", subtitle: "Career Builder" },
  { code: "SA_YEAR_999",   label: "12 Months", amount: 999, perDay: "₹2.7/day", subtitle: "Full Year", badge: "Most Popular", highlight: true },
];

export const ToolAuthGuard: React.FC<ToolAuthGuardProps> = ({
  toolName,
  toolDescription = "This candidate intelligence tool provides full visa sponsorship matching, keyword gap analysis, and legal cover letter generation.",
  featurePills = [
    "Candidate All-Access",
    "Instant Verification",
    "Auto-Saved Career Progress",
    "Verified Visa Opportunities",
  ],
  requiresPro = false,
  children,
}) => {
  const { user, isLoggedIn, isPro, isLoading } = useSession();
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("SA_YEAR_999");

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

  // 1. If not logged in, render account creation / login prompt
  if (!isLoggedIn) {
    const handleOpenAuth = (tab: "register" | "login" = "register") => {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: { defaultTab: tab },
        })
      );
    };

    return (
      <div className="w-full max-w-3xl mx-auto my-6 p-6 sm:p-10 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl text-white relative overflow-hidden animate-fade-in">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-black uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Candidate Account Required</span>
            </div>

            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Free Registration
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              Unlock <span className="text-[#19CBE0]">{toolName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {toolDescription}
            </p>
          </div>

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

          <p className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Instant setup in under 30 seconds &middot; Zero spam guarantee</span>
          </p>
        </div>
      </div>
    );
  }

  // 2. If requires PRO and user is NOT Pro, show Premium Paywall Gate
  if (requiresPro && !isPro) {
    const selectedPlan = PRO_PLANS.find((p) => p.code === selectedPlanCode) || PRO_PLANS[3];

    return (
      <div className="w-full max-w-3xl mx-auto my-6 p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#071522] to-[#0a1f35] border border-[#19CBE0]/30 shadow-2xl text-white relative overflow-hidden animate-fade-in">
        {/* Ambient lighting */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#19CBE0]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>SponsorAJobs Premium Feature</span>
            </div>

            <span className="text-[10px] font-extrabold text-[#19CBE0] bg-[#19CBE0]/10 border border-[#19CBE0]/30 px-3 py-1 rounded-full uppercase tracking-wider">
              From ₹2.7 / Day
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Unlock <span className="text-[#19CBE0]">{toolName}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              This advanced AI intelligence tool requires an active SponsorAJobs Premium membership. Choose your subscription plan below to unlock instant, unlimited access.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {featurePills.map((pill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-200"
              >
                <Check className="w-4 h-4 text-[#19CBE0] shrink-0" />
                <span>{pill}</span>
              </div>
            ))}
          </div>

          {/* Plan Selector Grid */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Select Subscription Duration:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRO_PLANS.map((plan) => {
                const isSelected = selectedPlanCode === plan.code;
                return (
                  <button
                    key={plan.code}
                    type="button"
                    onClick={() => setSelectedPlanCode(plan.code)}
                    className={`relative p-3.5 rounded-2xl text-left transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#19CBE0]/15 border-[#19CBE0] shadow-lg shadow-[#19CBE0]/15"
                        : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20"
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#19CBE0] text-slate-950 uppercase tracking-wide">
                        {plan.badge}
                      </span>
                    )}
                    <div className="text-xs font-extrabold text-white">{plan.label}</div>
                    <div className="text-lg font-black text-[#19CBE0] mt-1">₹{plan.amount}</div>
                    <div className="text-[10px] text-slate-400">{plan.perDay}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Razorpay Checkout CTA */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex-1 max-w-xs">
              <RazorpayCheckoutButton
                planCode={selectedPlan.code}
                planLabel={`SponsorAJobs Premium — ${selectedPlan.label}`}
                amount={selectedPlan.amount}
                userEmail={user?.email || ""}
                userName={user?.name || ""}
                className="w-full"
              >
                <div className="min-h-[48px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#19CBE0] to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm shadow-xl shadow-[#19CBE0]/25 flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Unlock Now for ₹{selectedPlan.amount}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </RazorpayCheckoutButton>
            </div>

            <Link
              href="/pricing"
              className="text-xs font-bold text-slate-400 hover:text-[#19CBE0] transition-colors text-center sm:text-right"
            >
              Compare all plan features &rarr;
            </Link>
          </div>

          {/* Trust Guarantee */}
          <p className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Secured by Razorpay &middot; UPI, Cards, NetBanking &middot; Instant Automated Activation</span>
          </p>
        </div>
      </div>
    );
  }

  // 3. User is authorized (logged in and meets requirement)
  return <>{children}</>;
};
