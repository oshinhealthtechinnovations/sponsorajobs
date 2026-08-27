"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Sparkles,
  X,
  Mail,
  KeyRound,
  User,
  Briefcase,
  Gift,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
  Linkedin,
  Trophy,
  PartyPopper,
  Zap,
  Check,
} from "lucide-react";

export function AuthGateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"register" | "trial" | "login">("register");
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profession, setProfession] = useState("");
  const [promoCode, setPromoCode] = useState("");

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Congratulation Celebration State
  const [celebrationData, setCelebrationData] = useState<{
    name: string;
    profession: string;
    email: string;
    promoCode: string;
  } | null>(null);

  useEffect(() => {
    const handleOpenAuth = (e: CustomEvent<{ redirectUrl?: string; defaultTab?: "register" | "trial" | "login" }>) => {
      setErrorMsg(null);
      setSuccessMsg(null);
      setCelebrationData(null);
      if (e.detail?.redirectUrl) {
        setPendingUrl(e.detail.redirectUrl);
      }
      if (e.detail?.defaultTab) {
        setActiveTab(e.detail.defaultTab);
      }
      setIsOpen(true);
    };

    window.addEventListener("open-auth-gate" as any, handleOpenAuth);
    return () => window.removeEventListener("open-auth-gate" as any, handleOpenAuth);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          profession,
          promoCode,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("sa_user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user-session-changed"));

        // Trigger Congratulation Celebration Screen!
        setCelebrationData({
          name: data.user.name,
          profession: data.user.profession,
          email: data.user.email,
          promoCode: data.user.promoCodeUsed || promoCode,
        });
      } else {
        setErrorMsg(data.error || "Registration failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(`👋 Welcome back, ${data.user.name}!`);
        localStorage.setItem("sa_user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("user-session-changed"));

        setTimeout(() => {
          setIsOpen(false);
          if (pendingUrl) {
            window.open(pendingUrl, "_blank");
            setPendingUrl(null);
          }
        }, 1000);
      } else {
        setErrorMsg(data.error || "Invalid credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrialRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/trial-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profession, email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("✅ Your Free Trial Request has been submitted! Our team will activate your access shortly.");
      } else {
        setErrorMsg(data.error || "Failed to submit trial request.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const proceedWithApplication = () => {
    setIsOpen(false);
    if (pendingUrl) {
      window.open(pendingUrl, "_blank");
      setPendingUrl(null);
    }
    setCelebrationData(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 text-white overflow-hidden my-auto">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            setIsOpen(false);
            setPendingUrl(null);
            setCelebrationData(null);
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ═══════════════════════════════════════════════════════════════
            🎉 CONGRATULATIONS & FREE TRIAL WELCOME CELEBRATION VIEW
        ═══════════════════════════════════════════════════════════════ */}
        {celebrationData ? (
          <div className="space-y-6 text-center py-2 animate-fade-in">
            {/* Top Celebration Trophy & Glow */}
            <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-2xl shadow-amber-500/30 flex items-center justify-center animate-bounce-short">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <Trophy className="w-10 h-10 text-amber-400 drop-shadow-md" />
              </div>
              <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <Sparkles className="w-2.5 h-2.5" />
                VERIFIED
              </div>
            </div>

            {/* Congratulatory Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                <PartyPopper className="w-3.5 h-3.5 text-amber-400" />
                <span>Congratulations!</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                Welcome! You Have Received Free Premium Trial Access!
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Your VIP invite code has been successfully validated. You now have full access to direct employer application links.
              </p>
            </div>

            {/* Candidate Profile Pill */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-sky-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {celebrationData.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{celebrationData.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{celebrationData.profession}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
                VIP Trial Active
              </span>
            </div>

            {/* Unlocked Benefits Checklist */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-left space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Unlocked Candidate Privileges:</span>
              </p>
              <div className="grid grid-cols-1 gap-2 text-xs text-slate-200">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span><strong>Direct Employer ATS Links</strong> (Greenhouse, Lever, Workable & ATS endpoints)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span><strong>Deterministic Visa Sponsorship Audits</strong> (UK CoS, US H-1B, Canada LMIA, Australia 482)</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span><strong>Unlimited Job Alert Preferences & Saved Bookmarks</strong></span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={proceedWithApplication}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>{pendingUrl ? "Proceed to Job Application" : "Start Exploring Sponsored Jobs"}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href="https://www.linkedin.com/in/ersumitraj/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-sky-400 hover:text-sky-300 font-bold text-xs border border-slate-800 hover:border-sky-500/40 transition-all flex items-center justify-center gap-2"
              >
                <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                <span>Connect & Thank Sumit Raj on LinkedIn</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════
              REGULAR AUTH / TRIAL REQUEST FORM VIEW
          ═══════════════════════════════════════════════════════════════ */
          <>
            {/* Header */}
            <div className="space-y-2 pr-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Member Access Gateway</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {activeTab === "register"
                  ? "Create Your Verified Candidate Account"
                  : activeTab === "trial"
                  ? "Request Free Trial Access"
                  : "Sign In to Your Account"}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeTab === "register"
                  ? "Unlock direct job application links, employer sponsor verification records, and instant salary benchmarking."
                  : activeTab === "trial"
                  ? "Don't have an invite code? Submit your details for complimentary 7-day access or contact Sumit Raj directly on LinkedIn."
                  : "Access your saved jobs, personalized alerts, and verified sponsor listings."}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                  activeTab === "register"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("trial");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                  activeTab === "trial"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Request Trial
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                  activeTab === "login"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Feedback Messages */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium space-y-2">
                <p className="flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </p>
                {activeTab === "register" && (
                  <div className="pt-2 border-t border-rose-500/20 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("trial")}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30 transition-colors"
                    >
                      Request Free Trial Access →
                    </button>
                    <a
                      href="https://www.linkedin.com/in/ersumitraj/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] font-bold border border-sky-500/30 transition-colors"
                    >
                      <Linkedin className="w-3 h-3" />
                      <span>Ask Sumit Raj on LinkedIn</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ── TAB 1: CREATE ACCOUNT WITH PROMO CODE ── */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Profession / Role <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Promo / Invite Code Field */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" />
                      <span>Promo / Referral Invite Code</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab("trial")}
                      className="text-[10px] text-brand-400 hover:underline font-bold"
                    >
                      Don't have a code?
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter your VIP invite / promo code"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-sky-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{loading ? "Verifying Promo Code..." : "Create Account & Unlock Free Trial"}</span>
                </button>
              </form>
            )}

            {/* ── TAB 2: REQUEST FREE TRIAL ACCESS ── */}
            {activeTab === "trial" && (
              <div className="space-y-4">
                <form onSubmit={handleTrialRequest} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Professional Discipline / Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      placeholder="e.g. Data Scientist / Civil Engineer"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? "Submitting Request..." : "Request 7-Day Free Trial Access"}</span>
                  </button>
                </form>

                {/* Direct LinkedIn Referral Action Button */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <p className="text-center text-[11px] text-slate-400">
                    Want instant approval? Request a direct referral code from Sumit Raj on LinkedIn:
                  </p>
                  <a
                    href="https://www.linkedin.com/in/ersumitraj/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-sky-400 hover:text-sky-300 font-bold text-xs border border-slate-800 hover:border-sky-500/40 transition-all flex items-center justify-center gap-2"
                  >
                    <Linkedin className="w-4 h-4 text-sky-400" />
                    <span>Connect & Message Sumit Raj on LinkedIn</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* ── TAB 3: SIGN IN ── */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? "Signing In..." : "Sign In to Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Footer Trust Bar */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Sponsor Community
              </span>
              <span>•</span>
              <span>100% Free Candidate Access</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
