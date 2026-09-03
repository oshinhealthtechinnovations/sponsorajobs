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
  { icon: FileText, label: "CV Upload & AI Analysis" },
  { icon: Brain,    label: "CV → Job Match Score" },
  { icon: BarChart3, label: "Application Fit Score" },
  { icon: Shield,   label: "Eligibility Analysis" },
  { icon: Globe,    label: "Sponsorship Intelligence" },
  { icon: Sparkles, label: "Advanced Career Analysis" },
];

export function CandidateProGateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [featureName, setFeatureName] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("SA_YEAR_999");
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
    return () => window.removeEventListener("open-pro-gate", handleOpen);
  }, []);

  if (!isOpen) return null;

  const plan = PLANS.find((p) => p.code === selectedPlan)!;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(7,21,34,0.9)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
    >
      <div
        className="relative max-w-2xl w-full rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #0a1f35 0%, #071522 100%)",
          border: "1px solid rgba(25,203,224,0.25)",
          boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8), 0 0 60px -20px rgba(25,203,224,0.15)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Close */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div
          className="px-8 pt-8 pb-6 text-center"
          style={{
            background: "linear-gradient(180deg, rgba(25,203,224,0.06) 0%, transparent 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
            style={{
              background: "rgba(25,203,224,0.12)",
              border: "1px solid rgba(25,203,224,0.3)",
              color: "#19CBE0",
            }}
          >
            <Lock size={11} />
            Premium Feature
          </div>
          <h2
            className="text-2xl font-extrabold text-white mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {featureName ? `Unlock ${featureName}` : "Unlock SponsorAJobs Premium"}
          </h2>
          <p className="text-slate-400 text-sm">
            Get full access to all career intelligence tools with one simple plan.
          </p>
        </div>

        <div className="px-8 py-6">
          {/* Features */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-xs text-slate-300">
                <f.icon size={13} className="text-cyan-400 shrink-0" />
                {f.label}
              </div>
            ))}
          </div>

          {/* Plan selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {PLANS.map((p) => (
              <button
                key={p.code}
                onClick={() => setSelectedPlan(p.code)}
                className="relative rounded-xl p-3 text-center transition-all duration-150"
                style={{
                  background: selectedPlan === p.code
                    ? (p.highlight ? "rgba(25,203,224,0.2)" : "rgba(25,203,224,0.12)")
                    : "rgba(255,255,255,0.04)",
                  border: selectedPlan === p.code
                    ? "1.5px solid rgba(25,203,224,0.5)"
                    : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {p.badge && (
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "#19CBE0", color: "#071522" }}
                  >
                    {p.badge}
                  </span>
                )}
                <p className="text-[11px] text-slate-400 mt-1">{p.label}</p>
                <p className="text-base font-bold text-white">₹{p.amount}</p>
                <p className="text-[10px] text-slate-500">{p.perDay}</p>
              </button>
            ))}
          </div>

          {/* CTA */}
          <RazorpayCheckoutButton
            planCode={plan.code}
            planLabel={`SponsorAJobs Premium — ${plan.label}`}
            amount={plan.amount}
            userEmail={user?.email}
            userName={user?.name}
            onSuccess={({ paymentId }) => {
              console.log("[ProGate] Payment success:", paymentId);
              setIsOpen(false);
              window.dispatchEvent(new Event("user-session-changed"));
              setTimeout(() => (window.location.href = "/dashboard"), 800);
            }}
            className="text-[#071522] font-bold"
            style={{
              background: "linear-gradient(135deg, #19CBE0 0%, #19C98B 100%)",
              boxShadow: "0 4px 20px -5px rgba(25,203,224,0.5)",
            }}
          >
            <Zap size={16} />
            Unlock Premium — ₹{plan.amount.toLocaleString("en-IN")} / {plan.label}
          </RazorpayCheckoutButton>

          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <CheckCircle2 size={11} className="text-slate-600" />
              Secure Razorpay payment
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <CheckCircle2 size={11} className="text-slate-600" />
              UPI / Card / NetBanking
            </div>
          </div>

          <p className="text-center mt-4">
            <Link
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-500 hover:text-cyan-400 transition-colors underline"
            >
              See full plan comparison →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
