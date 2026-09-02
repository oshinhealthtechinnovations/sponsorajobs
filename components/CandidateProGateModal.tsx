"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Briefcase,
  Zap,
  Globe2,
  Clock,
  Star,
  Check,
} from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { saveLocalApplication } from "@/lib/utils/clientApplicationTracker";

export interface ProGateJobDetail {
  jobId: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  salary?: string | null;
  applyUrl: string;
}

export function CandidateProGateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [targetJob, setTargetJob] = useState<ProGateJobDetail | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<"razorpay" | "stripe">("razorpay");
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { isLoggedIn, isPro, user } = useSession();

  useEffect(() => {
    const handleOpen = (e: CustomEvent<ProGateJobDetail>) => {
      const detail = e.detail;
      setTargetJob(detail);
      if (user?.email) {
        setEmailInput(user.email);
      }
      setErrorMsg(null);
      setIsOpen(true);
    };

    window.addEventListener("open-pro-gate" as any, handleOpen);
    return () => window.removeEventListener("open-pro-gate" as any, handleOpen);
  }, [user]);

  if (!isOpen) return null;

  const handleStartCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const targetEmail = (user?.email || emailInput).trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address to activate your Pro pass.");
      setLoading(false);
      return;
    }

    try {
      // Save pending application locally so it is tracked immediately
      if (targetJob) {
        saveLocalApplication(
          {
            jobId: targetJob.jobId,
            jobTitle: targetJob.jobTitle,
            companyName: targetJob.companyName,
            location: targetJob.location || "Global",
            salary: targetJob.salary || null,
            applyUrl: targetJob.applyUrl,
            status: "APPLIED",
          },
          user?.id
        );
      }

      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          name: user?.name || "Candidate",
          userId: user?.id,
          gateway: selectedGateway,
          currency: "INR",
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.checkoutUrl) {
        // Stash pending application URL in sessionStorage to redirect after payment
        if (targetJob?.applyUrl) {
          sessionStorage.setItem("sa_pending_apply_url", targetJob.applyUrl);
        }
        window.location.href = data.data.checkoutUrl;
      } else {
        setErrorMsg(data.error || "Failed to initialize secure checkout. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg("Network connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="relative w-full max-w-xl rounded-3xl bg-slate-950 border-2 border-brand-500/70 text-white shadow-2xl shadow-brand-500/15 overflow-hidden my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient backgrounds */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-5 relative z-10">
          {/* Top Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-400/30 text-[#19CBE0] text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Sponsor Internal Gateway
            </span>
          </div>

          {/* Target Job Showcase Pill */}
          {targetJob && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Target Opportunity:
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white truncate">
                    {targetJob.jobTitle}
                  </h3>
                  <p className="text-xs text-[#19CBE0] font-semibold flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{targetJob.companyName}</span>
                    <span className="text-slate-600">&middot;</span>
                    <span className="text-slate-300">{targetJob.location || "Global"}</span>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  SPONSOR LICENSED
                </span>
              </div>
            </div>
          )}

          {/* The Psychological Pain vs Advantage Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Why Apply via the Pro Internal Channel?</span>
            </div>
            <p className="text-[11px] sm:text-xs text-amber-200/90 leading-relaxed">
              <strong>92% of international applicants</strong> get auto-rejected on public job boards because their CV lacks statutory sponsorship justification. Candidate Pro gives you the <strong>direct internal employer ATS link</strong>, pre-cleared salary compliance, and tailored AI cover letters.
            </p>
          </div>

          {/* Feature Checklist */}
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>100% Direct Official ATS Application Link:</strong> Skip 400+ public LinkedIn applicants.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Statutory Salary Clearance:</strong> Home Office £38,700 minimum salary validation check.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Unlimited AI Visa Cover Letters:</strong> Tailored with legal Certificate of Sponsorship (CoS) clauses.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Instant 60s Job Alerts:</strong> Real-time alerts the moment verified employers post openings.</span>
            </div>
          </div>

          {/* Price Anchoring & Micro-Investment Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-white font-display">₹299</span>
                <span className="text-xs text-slate-400 font-medium">/ 1-Year Pass (INR)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block">
                Less than a cup of coffee ☕ &middot; Only ~₹25/month
              </span>
            </div>

            <div className="text-right text-[10px] text-slate-400 space-y-0.5 border-l border-slate-800 pl-3">
              <div>Immigration Lawyer: <span className="text-rose-400 line-through">₹25,000+</span></div>
              <div>Applying Blindly: <span className="text-rose-400">100+ Hrs Lost</span></div>
              <div className="text-emerald-400 font-bold">Pro Access: ₹299</div>
            </div>
          </div>

          {/* Gateway Switcher */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Payment Method:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedGateway("razorpay")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedGateway === "razorpay"
                    ? "bg-blue-950/80 border-blue-400 ring-2 ring-blue-500/40 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                <span className="text-xs font-bold">🇮🇳 India (Razorpay)</span>
                <span className="text-[9px] text-slate-400 truncate">UPI, GPay, PhonePe, RuPay</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedGateway("stripe")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedGateway === "stripe"
                    ? "bg-teal-950/80 border-[#19CBE0] ring-2 ring-teal-500/40 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                <span className="text-xs font-bold">🌍 International (Stripe)</span>
                <span className="text-[9px] text-slate-400 truncate">Apple Pay, Cards, Global</span>
              </button>
            </div>
          </div>

          {/* Email input if not logged in */}
          {!isLoggedIn && (
            <div className="space-y-1 text-left">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Your Email (for Instant Account Activation & Application Tracking):
              </label>
              <input
                type="email"
                required
                placeholder="candidate@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#19CBE0]"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Unlock Button */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={handleStartCheckout}
              className={`w-full py-4 px-5 rounded-2xl active:scale-[0.98] font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                selectedGateway === "razorpay"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30"
                  : "bg-gradient-to-r from-brand-500 via-[#19CBE0] to-teal-400 hover:from-brand-400 hover:to-teal-300 text-slate-950 shadow-brand-500/25"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {loading
                  ? "Preparing Secure Checkout..."
                  : selectedGateway === "razorpay"
                  ? "Unlock Direct Application with UPI / Razorpay (₹299)"
                  : "Unlock Direct Application with Stripe (₹299)"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 text-center pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>256-Bit Encrypted &middot; 14-Day 100% Money-Back Guarantee &middot; Instant ATS Unlock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
