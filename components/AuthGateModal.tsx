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
  Trophy,
  PartyPopper,
  Zap,
  Check,
  RotateCcw,
} from "lucide-react";
import { saveLocalApplication } from "@/lib/utils/clientApplicationTracker";

export function AuthGateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"register" | "login">("register");
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profession, setProfession] = useState("");
  const [promoCode, setPromoCode] = useState("");

  // Derived: password match state
  const passwordsMatch = confirmPassword === "" || password === confirmPassword;
  const confirmTouched = confirmPassword.length > 0;

  // Registration OTP State
  const [registerStep, setRegisterStep] = useState<"form" | "otp">("form");
  const [registerOtp, setRegisterOtp] = useState("");
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot / Reset Password State
  const [forgotStep, setForgotStep] = useState<"closed" | "email" | "otp">("closed");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);

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

  // Pending Job Data for automatic tracking
  const [pendingJobData, setPendingJobData] = useState<{
    jobId: string;
    jobTitle: string;
    companyName: string;
    companyLogo?: string | null;
    location?: string;
    salary?: string | null;
    applyUrl: string;
  } | null>(null);

  useEffect(() => {
    const handleOpenAuth = (
      e: CustomEvent<{
        redirectUrl?: string;
        defaultTab?: "register" | "login";
        jobId?: string;
        jobTitle?: string;
        companyName?: string;
        companyLogo?: string | null;
        location?: string;
        salary?: string | null;
        applyUrl?: string;
      }>
    ) => {
      setErrorMsg(null);
      setSuccessMsg(null);
      setCelebrationData(null);
      setRegisterStep("form");
      setRegisterOtp("");
      setPendingToken(null);
      setPreviewOtp(null);
      setForgotStep("closed");

      const targetUrl = e.detail?.redirectUrl || e.detail?.applyUrl;
      if (targetUrl) {
        setPendingUrl(targetUrl);
      }
      if (e.detail?.jobId || e.detail?.jobTitle || targetUrl) {
        setPendingJobData({
          jobId: e.detail.jobId || `job_${Date.now()}`,
          jobTitle: e.detail.jobTitle || "Sponsored Job Position",
          companyName: e.detail.companyName || "Verified Sponsor Employer",
          companyLogo: e.detail.companyLogo || null,
          location: e.detail.location || "Global / UK",
          salary: e.detail.salary || null,
          applyUrl: targetUrl || "#",
        });
      }
      if (e.detail?.defaultTab) {
        setActiveTab(e.detail.defaultTab);
      }
      setIsOpen(true);
    };

    window.addEventListener("open-auth-gate" as any, handleOpenAuth);
    return () => window.removeEventListener("open-auth-gate" as any, handleOpenAuth);
  }, []);

  // Cooldown countdown timer for resending OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // STEP 1: Submit details -> Send 6-digit OTP to user's email
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate passwords match before submitting
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please check and try again.");
      return;
    }
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
        setRegisterStep("otp");
        setResendCooldown(60);
        if (data.pendingToken) {
          setPendingToken(data.pendingToken);
        }
        if (data.otpPreview) {
          setPreviewOtp(data.otpPreview);
        } else {
          setPreviewOtp(null);
        }
        setSuccessMsg(`📧 6-digit verification code sent to ${email}!`);
      } else {
        setErrorMsg(data.error || "Registration failed. Please check your information.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP code -> Activate account & Celebrate
  const handleVerifyRegistrationOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!registerOtp || registerOtp.length < 6) {
      setErrorMsg("Please enter the complete 6-digit code sent to your email.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otpCode: registerOtp,
          action: "verify_otp",
          pendingToken,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("sa_user", JSON.stringify(data.user));
        
        // Auto-save pending application upon account verification
        if (pendingJobData) {
          saveLocalApplication(pendingJobData, data.user?.id);
          try {
            fetch("/api/user/applications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(pendingJobData),
            }).catch(() => {});
          } catch {}
        }

        window.dispatchEvent(new Event("user-session-changed"));

        // Trigger Congratulation Celebration Screen!
        setCelebrationData({
          name: data.user?.name || name || "Candidate",
          profession: data.user?.profession || profession || "Professional",
          email: data.user?.email || email,
          promoCode: data.user?.promoCodeUsed || promoCode,
        });
      } else {
        setErrorMsg(data.error || "Invalid or expired verification code.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP code
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          action: "resend_otp",
          pendingToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`🚀 Fresh 6-digit verification code sent to ${email}!`);
        setResendCooldown(60);
        if (data.pendingToken) {
          setPendingToken(data.pendingToken);
        }
        if (data.otpPreview) {
          setPreviewOtp(data.otpPreview);
        } else {
          setPreviewOtp(null);
        }
      } else {
        setErrorMsg(data.error || "Failed to resend code.");
      }
    } catch {
      setErrorMsg("Failed to resend verification code.");
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
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(`👋 Welcome back, ${data.user?.name || "Candidate"}!`);
        if (data.user) {
          localStorage.setItem("sa_user", JSON.stringify(data.user));
        }

        // Auto-save pending application upon login
        if (pendingJobData) {
          saveLocalApplication(pendingJobData, data.user?.id);
          try {
            fetch("/api/user/applications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(pendingJobData),
            }).catch(() => {});
          } catch {}
        }

        window.dispatchEvent(new Event("user-session-changed"));

        setTimeout(() => {
          setIsOpen(false);
          if (pendingUrl) {
            window.open(pendingUrl, "_blank", "noopener,noreferrer");
            setPendingUrl(null);
          }
        }, 800);
      } else {
        setErrorMsg(data.error || "Invalid credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter your registered account email.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setForgotStep("otp");
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
        if (data.otpPreview) {
          setResetOtp(data.otpPreview);
        }
        setSuccessMsg(`📧 6-digit reset code sent to ${email}!`);
      } else {
        setErrorMsg(data.error || "Could not find an account with this email.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp || resetOtp.length < 6) {
      setErrorMsg("Please enter the 6-digit code sent to your email.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otpCode: resetOtp,
          newPassword,
          resetToken,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("🎉 Password reset successfully! Logging you in...");
        if (data.user) {
          localStorage.setItem("sa_user", JSON.stringify(data.user));
        }
        window.dispatchEvent(new Event("user-session-changed"));

        setTimeout(() => {
          setIsOpen(false);
          setForgotStep("closed");
          setResetOtp("");
          setNewPassword("");
          if (pendingUrl) {
            window.open(pendingUrl, "_blank");
            setPendingUrl(null);
          }
        }, 1200);
      } else {
        setErrorMsg(data.error || "Invalid or expired reset code.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const proceedWithApplication = () => {
    setIsOpen(false);
    const targetUrl = pendingUrl;
    setPendingUrl(null);
    setCelebrationData(null);

    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 overflow-hidden my-auto">
        {/* Top Gradient Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-600 via-sky-500 to-emerald-500 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            setIsOpen(false);
            setPendingUrl(null);
            setCelebrationData(null);
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ═══════════════════════════════════════════════════════════════
            🎉 CONGRATULATIONS & FREE TRIAL WELCOME CELEBRATION VIEW
        ═══════════════════════════════════════════════════════════════ */}
        {celebrationData ? (
          <div className="space-y-6 text-center py-2 animate-fade-in">
            {/* Top Celebration Trophy & Glow */}
            <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/25 flex items-center justify-center animate-bounce-short">
              <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
                <Trophy className="w-10 h-10 text-amber-500 drop-shadow-md" />
              </div>
              <div className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <Sparkles className="w-2.5 h-2.5" />
                VERIFIED
              </div>
            </div>

            {/* Congratulatory Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider">
                <PartyPopper className="w-3.5 h-3.5 text-amber-600" />
                <span>Congratulations!</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                Email Verified! Account Active
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your email is verified. You now have full free access to direct official ATS application links, salary compliance insights, and personalized job alerts.
              </p>
            </div>

            {/* Candidate Profile Pill */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-sky-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {celebrationData.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{celebrationData.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{celebrationData.profession}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider shrink-0">
                Verified Candidate
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={proceedWithApplication}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-sky-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-500 text-white font-black text-sm shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{pendingUrl ? "Continue to Application" : "Start Exploring Jobs"}</span>
                <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════
              REGULAR AUTH / TRIAL REQUEST FORM VIEW
          ═══════════════════════════════════════════════════════════════ */
          <>
            {/* Header */}
            <div className="space-y-2 pr-6 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Member Access Gateway</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeTab === "register"
                  ? registerStep === "otp"
                    ? "Verify Your Email Address"
                    : "Create Candidate Account"
                  : forgotStep === "email"
                  ? "Reset Your Password"
                  : forgotStep === "otp"
                  ? "Create New Password"
                  : "Sign In to Your Account"}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {activeTab === "register"
                  ? registerStep === "otp"
                    ? `Enter the 6-digit code sent to ${email} to activate your account.`
                    : "Unlock direct job application links, application tracking, and verified employer sponsorship."
                  : forgotStep === "email"
                  ? "Enter your account email to receive a 6-digit verification code."
                  : forgotStep === "otp"
                  ? `Enter the 6-digit code sent to ${email} and choose a new password.`
                  : "Access your saved jobs, personalized alerts, and verified sponsor listings."}
              </p>
            </div>

            {/* Navigation Tabs (Only when not in OTP step) */}
            {registerStep === "form" && (
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                    activeTab === "register"
                      ? "bg-white text-brand-700 shadow-xs border border-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                    setForgotStep("closed");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all text-center cursor-pointer ${
                    activeTab === "login"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Feedback Messages */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium space-y-2">
                <p className="flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </p>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ── TAB 1: CREATE ACCOUNT (STEP 1: FORM) ── */}
            {activeTab === "register" && registerStep === "form" && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      Profession / Role <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span>Confirm Password <span className="text-rose-500">*</span></span>
                    {confirmTouched && (
                      passwordsMatch
                        ? <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</span>
                        : <span className="text-rose-600 text-[10px] font-bold">✗ Do not match</span>
                    )}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border text-slate-900 text-xs focus:outline-none transition-colors ${
                        !confirmTouched
                          ? "border-slate-200 focus:border-brand-500 focus:bg-white"
                          : passwordsMatch
                          ? "border-emerald-500 focus:border-emerald-600 focus:bg-white"
                          : "border-rose-400 focus:border-rose-500 focus:bg-white"
                      }`}
                    />
                  </div>
                </div>

                {/* Promo / Invite Code Field (Optional) */}
                <div className="space-y-1 pt-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-amber-500" />
                    <span>Promo / Referral Code (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter referral code if you have one (Optional)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-sky-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-500 text-white font-black text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-4 h-4 text-white" />
                  <span>{loading ? "Sending 6-Digit OTP Code..." : "Create Account & Send Verification Code"}</span>
                </button>
              </form>
            )}

            {/* ── TAB 1: CREATE ACCOUNT (STEP 2: OTP VERIFICATION) ── */}
            {activeTab === "register" && registerStep === "otp" && (
              <div className="space-y-5 text-center py-2 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center mx-auto shadow-xs">
                  <Mail className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">
                    Enter Verification Code
                  </h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                    We sent a 6-digit code to <strong className="text-slate-900">{email}</strong>. Please enter it below to verify your email.
                  </p>
                </div>

                <div className="py-2 space-y-2">
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="123456"
                    value={registerOtp}
                    onChange={(e) => setRegisterOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-48 text-center tracking-[10px] text-3xl font-black py-3 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 mx-auto block shadow-inner"
                  />
                  <p className="text-[11px] text-slate-500 pt-1">
                    💡 If not in your primary inbox, please check your <strong className="text-slate-700">Spam</strong> or <strong className="text-slate-700">Promotions</strong> tab.
                  </p>

                  {previewOtp && (
                    <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 max-w-sm mx-auto animate-fade-in text-left mt-2">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="text-amber-600">🔑 Instant Code:</span>
                          <span className="font-mono text-amber-700 text-sm tracking-widest font-black">{previewOtp}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Resend test sandbox mode active. Click to auto-fill code.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRegisterOtp(previewOtp);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-xs shrink-0"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-semibold">
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendOtp}
                    className="text-brand-600 hover:text-brand-700 disabled:text-slate-400 cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}</span>
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterStep("form");
                      setErrorMsg(null);
                    }}
                    className="text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Change email
                  </button>
                </div>

                <button
                  type="button"
                  disabled={loading || registerOtp.length < 6}
                  onClick={() => handleVerifyRegistrationOtp()}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-700 hover:to-brand-700 text-white font-black text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? "Verifying..." : "Verify OTP & Activate Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ── TAB 2: SIGN IN OR FORGOT PASSWORD ── */}
            {activeTab === "login" && forgotStep === "closed" && (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
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
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
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
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] text-slate-500">Need help signing in?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep("email");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-brand-600 hover:text-brand-700 font-bold cursor-pointer underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? "Signing In..." : "Sign In to Account"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* ── FORGOT PASSWORD STEP 1: ENTER EMAIL ── */}
            {activeTab === "login" && forgotStep === "email" && (
              <form onSubmit={handleRequestPasswordReset} className="space-y-4 animate-fade-in">
                <div className="text-center space-y-1 py-1">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Reset Your Password</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Enter your account email to receive a 6-digit verification code.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  <span>{loading ? "Sending Reset Code..." : "Send 6-Digit Reset Code"}</span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep("closed");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    &larr; Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* ── FORGOT PASSWORD STEP 2: ENTER OTP & NEW PASSWORD ── */}
            {activeTab === "login" && forgotStep === "otp" && (
              <form onSubmit={handleConfirmPasswordReset} className="space-y-3.5 animate-fade-in">
                <div className="text-center space-y-1 py-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900">Create New Password</h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Enter the 6-digit code sent to <strong className="text-slate-900">{email}</strong>.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="123456"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full text-center tracking-[8px] text-2xl font-black py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
                  />
                  <p className="text-[10px] text-slate-500 text-center pt-0.5 font-medium">
                    Check Spam / Promotions folder if not in primary inbox.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    New Password (Min 6 chars)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new secure password"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || resetOtp.length < 6 || newPassword.length < 6}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{loading ? "Updating Password..." : "Save Password & Sign In"}</span>
                </button>

                <div className="flex items-center justify-center gap-4 text-xs pt-1 font-semibold">
                  <button
                    type="button"
                    onClick={handleRequestPasswordReset}
                    disabled={loading}
                    className="text-brand-600 hover:text-brand-700 cursor-pointer"
                  >
                    Resend Code
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep("closed");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Footer Trust Bar */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1 text-emerald-600">
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
