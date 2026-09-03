"use client";

/**
 * CandidateProGateModal
 *
 * Premium upgrade gate shown when a user tries to access a Premium-only feature.
 * Displays the 4 subscription plans with inline Razorpay Standard Checkout.
 *
 * Usage:
 *   window.dispatchEvent(new CustomEvent("open-pro-gate", {
 *     detail: { featureName: "CV Analysis" }
 *   }));
 */

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Shield,
  FileText,
  Brain,
  BarChart3,
  Globe,
  CheckCircle2,
  Zap,
  Lock,
  Crown,
} from "lucide-react";
import { RazorpayCheckoutButton } from "@/components/RazorpayCheckoutButton";
import Link from "next/link";

// ─── Plans (display only) ────────────────────────────────────────────────────
const PLANS = [
  { code: "SA_MONTH_199",  label: "1 Month",  amount: 199, perDay: "₹6.6/day" },
  { code: "SA_3MONTH_499", label: "3 Months", amount: 499, perDay: "₹5.5/day", badge: "Best Value" },
  { code: "SA_6MONTH_799", label: "6 Months", amount: 799, perDay: "₹4.4/day" },
  { code: "SA_YEAR_999",   label: "12 Months", amount: 999, perDay: "₹2.7/day", badge: "Popular", highlight: true },
];

const FEATURES = [
  { icon: Crown,    label: "Direct Employer Apply Links (7,800+ Jobs)" },
  { icon: FileText, label: "Full Unblurred Job Descriptions & Requirements" },
  { icon: Brain,    label: "AI CV → Job ATS Match Scorer" },
  { icon: BarChart3, label: "Custom Visa Sponsorship Cover Letters" },
  { icon: Shield,   label: "Salary Package & Eligibility Analysis" },
  { icon: Sparkles, label: "Daily Priority Job Alerts" },
];

export function CandidateProGateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [featureName, setFeatureName] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("SA_3MONTH_499");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Listen for the open event dispatched by any premium feature gate
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setFeatureName(detail?.featureName || null);
      setIsOpen(true);

      // Grab current user session
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((d) => { if (d.success) setUser(d.user); })
        .catch(() => {});
    };

    window.addEventListener("open-pro-gate", handleOpen);
    window.addEventListener("open-vip-paywall", handleOpen);
    return () => {
      window.removeEventListener("open-pro-gate", handleOpen);
      window.removeEventListener("open-vip-paywall", handleOpen);
    };
  }, []);

  if (!isOpen) return null;

  const plan = PLANS.find((p) => p.code === selectedPlan)!;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
    >
      <div
        className="relative max-w-2xl w-full rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-2xl my-auto"
        style={{
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Top Accent Bar */}
        <div className="h-2.5 bg-gradient-to-r from-[#18D6E5] via-amber-400 to-emerald-500 w-full" />

        {/* Close */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold mb-3 bg-amber-50 border border-amber-200 text-amber-800 shadow-xs">
            <Crown size={13} className="text-amber-600" />
            VIP Candidate Pass
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-1.5 tracking-tight">
            {featureName ? `Unlock ${featureName}` : "Unlock SponsorAJobs VIP Access"}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
            Get instant access to 7,800+ licensed sponsor jobs, direct employer application portals, and AI career tools.
          </p>
        </div>

        <div className="px-6 sm:px-8 py-6">
          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <f.icon size={14} className="text-brand-600 shrink-0" />
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            {PLANS.map((p) => (
              <button
                key={p.code}
                onClick={() => setSelectedPlan(p.code)}
                className={`relative rounded-2xl p-3.5 text-center transition-all cursor-pointer border ${
                  selectedPlan === p.code
                    ? "bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-sm"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-xs">
                    {p.badge}
                  </span>
                )}
                <p className="text-[11px] font-bold text-slate-600 mt-1">{p.label}</p>
                <p className="text-lg font-black text-slate-950">₹{p.amount}</p>
                <p className="text-[10px] text-slate-500 font-medium">{p.perDay}</p>
              </button>
            ))}
          </div>

          {/* CTA */}
          <RazorpayCheckoutButton
            planCode={plan.code}
            planLabel={`SponsorAJobs VIP Pass — ${plan.label}`}
            amount={plan.amount}
            userEmail={user?.email}
            userName={user?.name}
            onSuccess={({ paymentId }) => {
              console.log("[ProGate] Payment success:", paymentId);
              setIsOpen(false);
              window.dispatchEvent(new Event("user-session-changed"));
              setTimeout(() => (window.location.href = "/dashboard"), 800);
            }}
            className="w-full py-4 text-sm sm:text-base font-black shadow-lg shadow-amber-500/25 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-2xl flex items-center justify-center gap-2"
          >
            <Zap size={18} className="text-slate-950" />
            <span>Unlock VIP Pass — ₹{plan.amount.toLocaleString("en-IN")} / {plan.label}</span>
          </RazorpayCheckoutButton>

          <div className="flex items-center justify-center gap-5 mt-4 text-slate-500 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Official Razorpay Payment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>UPI / Card / NetBanking</span>
            </div>
          </div>

          <p className="text-center mt-4">
            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors underline"
            >
              See full plan details & comparison →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
