"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Star,
  Globe2,
  Smartphone,
  CreditCard,
  Building,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSession } from "@/hooks/useSession";

export default function PricingPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useSession();
  const [selectedGateway, setSelectedGateway] = useState<"razorpay" | "stripe">("razorpay");
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartCheckout = async () => {
    setLoading(true);
    setErrorMsg(null);

    const targetEmail = user?.email || guestEmail.trim();
    if (!targetEmail) {
      setErrorMsg("Please enter your email address to activate your Candidate Pro pass.");
      setLoading(false);
      return;
    }

    try {
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
        window.location.href = data.data.checkoutUrl;
      } else {
        setErrorMsg(data.error || "Failed to initialize checkout. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMsg("Network error connecting to payment gateway.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* ── Page Header ── */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Candidate Pro Access &middot; ₹299 INR</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            One Simple Plan. Complete Visa Sponsorship Access.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Direct employer ATS applications, real-time Certificate of Sponsorship (CoS) alerts, and AI-tailored cover letters designed specifically for statutory immigration compliance. All access is fully unlocked.
          </p>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold max-w-md mx-auto">
              {errorMsg}
            </div>
          )}
        </div>

        {/* ── Single Focused Pricing Card (₹299 INR) ── */}
        <div className="max-w-2xl mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 text-white border-2 border-brand-500 shadow-2xl relative flex flex-col justify-between space-y-8 overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Popular Badge */}
            <div className="absolute top-6 right-6">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                <Star className="w-3 h-3 fill-slate-950" />
                ALL-INCLUSIVE PASS
              </span>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#19CBE0]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Candidate Pro All-Access</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white">Full Platform Access</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Direct official ATS application access, automated salary verification, and unlimited AI cover letter optimization for 1 full year.
                </p>
              </div>

              <div className="flex items-baseline gap-2 pb-2 border-b border-slate-800">
                <span className="text-5xl sm:text-6xl font-black text-white font-display">₹299</span>
                <span className="text-xs font-semibold text-slate-400">/ 1-year all-inclusive pass (INR)</span>
              </div>

              {/* Feature Matrix */}
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Included in Your Candidate Pro Pass:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>100% Direct ATS Links:</strong> Apply directly to official employer portals without recruiters.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Statutory Salary Check:</strong> Automatic £38,700 UK threshold & US LCA prevailing wage validation.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Unlimited AI Cover Letters:</strong> Tailored with legal Certificate of Sponsorship phrases.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Real-Time 60s Alerts:</strong> Instant notifications the moment verified sponsors post new vacancies.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>5 Global Countries:</strong> Comprehensive coverage across UK, USA, Australia, Canada, and NZ.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Unlimited ATS Resume Scans:</strong> Match score analysis and keyword optimization radar.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Application Tracker:</strong> Comprehensive pipeline to manage all submitted applications.</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>14-Day Money-Back Guarantee:</strong> 100% risk-free refund if not satisfied with verified sponsor access.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Payment Gateway Selection Tabs ── */}
            <div className="space-y-4 relative z-10 pt-4 border-t border-slate-800">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Select Payment Method & Gateway:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Option 1: Razorpay India */}
                  <button
                    type="button"
                    onClick={() => setSelectedGateway("razorpay")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                      selectedGateway === "razorpay"
                        ? "bg-blue-950/70 border-blue-400 ring-2 ring-blue-500/40"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>🇮🇳 India (Razorpay)</span>
                      </span>
                      {selectedGateway === "razorpay" && (
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-300 flex items-center gap-2">
                      <span>UPI &middot; GPay &middot; PhonePe &middot; RuPay &middot; NetBanking</span>
                    </div>
                  </button>

                  {/* Option 2: Stripe International */}
                  <button
                    type="button"
                    onClick={() => setSelectedGateway("stripe")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                      selectedGateway === "stripe"
                        ? "bg-teal-950/70 border-[#19CBE0] ring-2 ring-teal-500/40"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white flex items-center gap-1.5">
                        <Globe2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>🌍 International (Stripe)</span>
                      </span>
                      {selectedGateway === "stripe" && (
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-300 flex items-center gap-2">
                      <span>Apple Pay &middot; Google Pay &middot; Visa &middot; Mastercard &middot; Amex</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Email Input */}
              {!isLoggedIn && (
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Account Email (for Instant Pro Activation)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="candidate@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40"
                  />
                </div>
              )}

              {isLoggedIn && user?.email && (
                <div className="p-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <span>Activating pass for:</span>
                  <span className="font-bold text-white truncate max-w-[220px]">{user.email}</span>
                </div>
              )}

              {/* Checkout Launch Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleStartCheckout}
                className={`w-full py-4 px-6 rounded-2xl active:scale-[0.98] font-black text-sm sm:text-base shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-manipulation ${
                  selectedGateway === "razorpay"
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30"
                    : "bg-gradient-to-r from-brand-500 via-[#19CBE0] to-teal-400 hover:from-brand-400 hover:to-teal-300 text-slate-950 shadow-brand-500/25"
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>
                  {loading
                    ? "Initializing Secure Gateway..."
                    : selectedGateway === "razorpay"
                    ? "Pay ₹299 INR with UPI / Razorpay (India)"
                    : "Pay with International Card / Stripe"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>256-Bit Encrypted &middot; Instant Activation &middot; 14-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── FAQ Section ── */}
        <div className="max-w-4xl mx-auto pt-8 border-t border-slate-200/80 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-slate-500">
              Clear answers regarding Candidate Pro access, payments, and guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <h4 className="text-sm font-bold text-slate-900">How does the India vs International payment work?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                If you are paying from India, select <strong>India (Razorpay)</strong> to use UPI (Google Pay, PhonePe, Paytm), RuPay, or NetBanking. If paying from the UK, USA, Australia, or elsewhere, select <strong>International (Stripe)</strong> to use Apple Pay, Google Pay, or global credit/debit cards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <h4 className="text-sm font-bold text-slate-900">What is the 14-day refund guarantee?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                If you are not satisfied with the verified visa employer opportunities or tools within 14 days of purchase, email <strong className="text-slate-800">auth@sponsorajobs.com</strong> for a prompt refund per our <Link href="/refund-policy" className="text-brand-600 underline">Refund Policy</Link>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <h4 className="text-sm font-bold text-slate-900">How long does my Candidate Pro pass last?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The Pro pass grants full, unrestricted access for 1 full year (365 days) from the date of purchase, ensuring coverage through multiple hiring and visa lottery cycles.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
              <h4 className="text-sm font-bold text-slate-900">Why are all plans paid?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                To maintain verified, real-time employer datasets, continuously monitor Home Office / DOL sponsor registers, and eliminate spam applications, all platform access is provided through our ₹299 INR Candidate Pro pass.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
