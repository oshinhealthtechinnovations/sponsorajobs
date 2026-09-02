"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, FileCheck, Bell, Wand2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [pendingApplyUrl, setPendingApplyUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUrl = sessionStorage.getItem("sa_pending_apply_url");
      if (storedUrl) {
        setPendingApplyUrl(storedUrl);
      }
    }

    if (!sessionId) {
      setLoading(false);
      setErrorMsg("No session ID found in return URL.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();

        if (data.success && data.user) {
          setVerified(true);
          setUser(data.user);
          localStorage.setItem("sa_user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("user-session-changed"));
        } else {
          setErrorMsg(data.error || "Unable to verify payment session.");
        }
      } catch (err: any) {
        setErrorMsg("Failed to connect to verification server.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [sessionId]);

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 space-y-8 animate-fade-in">
      {loading ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl border-4 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Verifying Your Payment & Activating Pro Pass...</h2>
          <p className="text-xs text-slate-500">Please wait while your candidate credentials are being upgraded.</p>
        </div>
      ) : verified ? (
        <div className="space-y-8">
          {/* Hero Celebration Card */}
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden text-center space-y-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-2xl shadow-amber-500/30 flex items-center justify-center animate-bounce-short">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
              <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <Sparkles className="w-2.5 h-2.5" />
                ACTIVE
              </div>
            </div>

            <div className="space-y-2 max-w-xl mx-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                Payment Successful &middot; ₹299 INR
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-display">
                Welcome to Candidate Pro!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Your payment has been processed and your account is now fully upgraded. You have unlocked unlimited access to verified visa sponsor applications, direct ATS links, and AI tools.
              </p>
            </div>

            {/* Candidate Details Pill */}
            {user && (
              <div className="inline-flex items-center gap-3 p-3.5 px-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-200 shadow-inner">
                <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.email}</span>
                <span className="text-slate-500">&middot;</span>
                <span className="text-emerald-400 font-bold">1-Year Pro Pass Active</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {pendingApplyUrl ? (
                <a
                  href={pendingApplyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sessionStorage.removeItem("sa_pending_apply_url")}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-[#19CBE0] hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                >
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>Proceed to Your Unlocked Official ATS Application</span>
                  <ArrowRight className="w-5 h-5 text-slate-950" />
                </a>
              ) : (
                <Link
                  href="/jobs"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-brand-500 hover:from-emerald-400 hover:to-brand-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Browse & Apply to Sponsored Jobs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>View Candidate Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Direct ATS Applications</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apply directly to official corporate ATS portals without middleman delays or screening gates.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <Wand2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">AI Visa Cover Letters</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate high-impact cover letters structured specifically for Certificate of Sponsorship (CoS) compliance.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Instant Alert Dispatch</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive instant notifications within 60 seconds of newly verified sponsoring roles matching your profile.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Payment Verification Issue</h2>
          <p className="text-xs text-slate-600">{errorMsg}</p>
          <div className="pt-2">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Return to Pricing
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading order details...</div>}>
        <CheckoutSuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
