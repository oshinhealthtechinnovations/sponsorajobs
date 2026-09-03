"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, CreditCard, Zap, CheckCircle2, ArrowRight, Lock, Bell, Mail, RefreshCw } from "lucide-react";

export default function MaintenancePage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          profession: "Payment Gateway Upgrade Alert",
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Unable to save your request. Please try again.");
      }
    } catch {
      setErrorMsg("Connection error. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071421] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">
              Sponsor<span className="text-cyan-400">A</span>Jobs
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
              Verified Sponsorship Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-medium text-slate-300 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Scheduled Upgrade</span>
        </div>
      </header>

      {/* Main Content Hero */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col items-center justify-center text-center relative z-10">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold mb-8 shadow-lg shadow-cyan-950/50 backdrop-blur-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>System Upgrade in Progress · Payment Gateway Integration</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          We&apos;re Upgrading Our <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
            Payment Systems
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          SponsorAJobs is undergoing a planned infrastructure upgrade to integrate our high-speed, multi-currency payment gateway. Candidate applications and verified employer matching will resume shortly.
        </p>

        {/* Progress Bar Component */}
        <div className="w-full max-w-md bg-slate-900/80 border border-slate-700/60 rounded-2xl p-4 mb-10 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span>Gateway Integration &amp; Security Audits</span>
            <span className="text-cyan-400">85% Complete</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full w-[85%] transition-all duration-1000 animate-pulse" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
            <span>Estimated Resumption: Shortly</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Lock className="w-3 h-3" /> PCI-DSS Compliant
            </span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-12 text-left">
          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-5 backdrop-blur-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-3">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Multi-Currency Gateway</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seamless checkout supporting USD, CAD, GBP, AUD, EUR, and INR with automated currency conversion.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-5 backdrop-blur-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Bank-Grade Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              End-to-end tokenized transactions with instant digital tax invoicing and full privacy compliance.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-5 backdrop-blur-sm transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-800/50 flex items-center justify-center text-sky-400 mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Instant Activation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero-latency unlocking of verified direct employer application channels and priority AI CV matching.
            </p>
          </div>
        </div>

        {/* Email Notification Form */}
        <div className="w-full max-w-lg bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-center gap-2 text-cyan-400 mb-2">
            <Bell className="w-5 h-5" />
            <h2 className="text-base sm:text-lg font-bold text-white">Get Notified When We&apos;re Back Live</h2>
          </div>
          <p className="text-xs text-slate-400 mb-6 max-w-sm mx-auto">
            Drop your email below and we will automatically send you an alert the minute payment systems are live.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>You&apos;re on the priority notification list! We&apos;ll email you immediately upon launch.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Notify Me</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {errorMsg && <p className="text-xs text-rose-400 mt-3">{errorMsg}</p>}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 relative z-10">
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} SponsorAJobs Inc. All rights reserved.</span>
          <span className="hidden sm:inline text-slate-700">&bull;</span>
          <span className="hidden sm:inline">Encrypted Infrastructure</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="mailto:support@sponsorajobs.com"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Support: support@sponsorajobs.com</span>
          </a>
          <span className="text-slate-700">&bull;</span>
          <Link
            href="/admin/login"
            className="hover:text-slate-300 transition-colors text-slate-500 hover:underline"
          >
            Staff &amp; Admin Access
          </Link>
        </div>
      </footer>
    </div>
  );
}
