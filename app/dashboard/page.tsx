"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  ShieldCheck,
  AlertCircle,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
  Bookmark,
  Mail,
  RefreshCw,
  Lock,
  Zap,
} from "lucide-react";

import { JobApplication, ApplicationStatus } from "@/lib/repositories/applicationRepository";
import { AuthGateModal } from "@/components/AuthGateModal";
import {
  getLocalApplications,
  saveLocalApplication,
  updateLocalApplicationStatus,
  deleteLocalApplication,
} from "@/lib/utils/clientApplicationTracker";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Applications state
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<ApplicationStatus>("APPLIED");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Email Verification State
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Manual Add Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    salary: "",
    applyUrl: "",
    status: "APPLIED" as ApplicationStatus,
    notes: "",
  });

  // Pro Waitlist State
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistMsg, setWaitlistMsg] = useState<string | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);

  const handleJoinWaitlist = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = (waitlistEmail || user?.email || "").trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      setWaitlistError("Please enter a valid email address.");
      return;
    }

    setWaitlistLoading(true);
    setWaitlistError(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          name: user?.name,
          profession: user?.profession,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWaitlistSuccess(true);
        setWaitlistMsg(data.message || `🎉 You're on the waitlist! We'll notify you at ${targetEmail}`);
      } else {
        setWaitlistError(data.error || "Failed to join waitlist. Please try again.");
      }
    } catch {
      setWaitlistError("Network error. Please try again.");
    } finally {
      setWaitlistLoading(false);
    }
  };


  // Load user session
  const fetchSession = async () => {
    // Read local apps immediately on page mount before network requests
    const initialApps = getLocalApplications();
    if (initialApps.length > 0) {
      setApplications(initialApps);
    }

    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        fetchApplications(data.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    } catch {
      setUser(null);
      setLoading(false);
    }
  };

  // Fetch applications
  const fetchApplications = async (targetUserId?: string) => {
    // 1. Immediately read from local-first storage so applications display with zero delay
    const currentUserId = targetUserId || user?.id;
    const localApps = getLocalApplications(currentUserId);
    if (localApps.length > 0) {
      setApplications(localApps);
    }

    try {
      const res = await fetch("/api/user/applications");
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        // Merge remote + local applications so nothing is lost across serverless instances
        const map = new Map<string, JobApplication>();
        for (const a of localApps) map.set(a.jobId || a.id, a);
        for (const a of data.data) map.set(a.jobId || a.id, a);
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime()
        );
        setApplications(merged);
        if (typeof window !== "undefined") {
          localStorage.setItem("sa_user_applications", JSON.stringify(merged));
        }
      } else if (localApps.length > 0) {
        setApplications(localApps);
      }
    } catch (err) {
      console.error("Failed to load applications from API:", err);
      if (localApps.length > 0) {
        setApplications(localApps);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    const handleSessionChange = () => fetchSession();
    window.addEventListener("user-session-changed", handleSessionChange);
    return () => window.removeEventListener("user-session-changed", handleSessionChange);
  }, []);

  // Handle status update
  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingId(appId);
    updateLocalApplicationStatus(appId, newStatus);
    setApplications((prev) =>
      prev.map((a) => (a.id === appId || a.jobId === appId ? { ...a, status: newStatus, lastUpdatedAt: new Date().toISOString() } : a))
    );

    try {
      await fetch("/api/user/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle save notes
  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    updateLocalApplicationStatus(selectedApp.id, editStatus, editNotes);
    setApplications((prev) =>
      prev.map((a) =>
        a.id === selectedApp.id || a.jobId === selectedApp.id
          ? { ...a, status: editStatus, notes: editNotes, lastUpdatedAt: new Date().toISOString() }
          : a
      )
    );
    setNotesModalOpen(false);

    try {
      await fetch("/api/user/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedApp.id,
          status: editStatus,
          notes: editNotes,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle delete application
  const handleDeleteApplication = async (appId: string) => {
    if (!confirm("Are you sure you want to remove this job from your tracker?")) return;
    deleteLocalApplication(appId);
    setApplications((prev) => prev.filter((a) => a.id !== appId && a.jobId !== appId));

    try {
      await fetch(`/api/user/applications?id=${appId}`, { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle manual add
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.jobTitle || !manualForm.companyName || !manualForm.applyUrl) {
      alert("Please fill in Job Title, Company Name, and Apply URL.");
      return;
    }

    const newApp = saveLocalApplication(
      {
        jobId: `manual_${Date.now()}`,
        jobTitle: manualForm.jobTitle,
        companyName: manualForm.companyName,
        location: manualForm.location || "Worldwide",
        salary: manualForm.salary || null,
        applyUrl: manualForm.applyUrl,
        status: manualForm.status,
        notes: manualForm.notes,
      },
      user?.id
    );

    setApplications((prev) => [newApp, ...prev]);
    setAddModalOpen(false);
    setManualForm({
      jobTitle: "",
      companyName: "",
      location: "",
      salary: "",
      applyUrl: "",
      status: "APPLIED",
      notes: "",
    });

    try {
      await fetch("/api/user/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newApp),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Send verification code
  const handleRequestVerificationCode = async () => {
    if (!user?.email) return;
    setVerifyLoading(true);
    setVerifyMsg(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.success) {
        setVerifyMsg({ type: "success", text: "6-digit verification code sent to your email!" });
        setResendCooldown(60);
      } else {
        setVerifyMsg({ type: "error", text: data.error || "Failed to send code." });
      }
    } catch {
      setVerifyMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setVerifyLoading(false);
    }
  };

  // Submit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setVerifyMsg({ type: "error", text: "Please enter the complete 6-digit code." });
      return;
    }

    setVerifyLoading(true);
    setVerifyMsg(null);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, code: otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        setVerifyMsg({ type: "success", text: "🎉 Email verified successfully!" });
        setUser((prev: any) => ({ ...prev, isEmailVerified: true }));
        setTimeout(() => {
          setVerifyModalOpen(false);
          setVerifyMsg(null);
          setOtpCode("");
        }, 1500);
      } else {
        setVerifyMsg({ type: "error", text: data.error || "Invalid code." });
      }
    } catch {
      setVerifyMsg({ type: "error", text: "Verification failed. Please try again." });
    } finally {
      setVerifyLoading(false);
    }
  };

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    const matchesQuery =
      searchQuery === "" ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.location && app.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  const counts = {
    total: applications.length,
    applied: applications.filter((a) => a.status === "APPLIED").length,
    interviewing: applications.filter((a) => a.status === "INTERVIEWING").length,
    offer: applications.filter((a) => a.status === "OFFER").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "APPLIED":
        return <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">📝 Applied</span>;
      case "INTERVIEWING":
        return <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">📞 Interviewing</span>;
      case "OFFER":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">🎯 Offer Received</span>;
      case "REJECTED":
        return <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">❌ Not Selected</span>;
      case "ARCHIVED":
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold">📁 Archived</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-600" />
            <span>Loading Candidate Dashboard...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-5">
              <Briefcase className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
              Candidate Application Tracker
            </h1>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Sign in with your verified candidate account to track all your job applications, log interview stages, and store hiring manager notes.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-auth-gate", { detail: { defaultTab: "login" } }))}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
        <AuthGateModal />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Candidate Profile Header Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "CA"}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {user.name}
                  </h1>
                  {user.isEmailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Candidate</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setVerifyModalOpen(true);
                        handleRequestVerificationCode();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-600" />
                      <span>Verify Email ID</span>
                    </button>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <span>{user.profession || "Global Job Seeker"}</span>
                  <span>•</span>
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Track New Job</span>
              </button>
              <Link
                href="/jobs"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>Search Jobs</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Total Applied</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{counts.total}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
              <div className="text-xs text-purple-700 font-medium">Interviewing</div>
              <div className="text-2xl font-black text-purple-900 mt-0.5">{counts.interviewing}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="text-xs text-emerald-700 font-medium">Offers Received</div>
              <div className="text-2xl font-black text-emerald-900 mt-0.5">{counts.offer}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
              <div className="text-xs text-blue-700 font-medium">Pending Feedback</div>
              <div className="text-2xl font-black text-blue-900 mt-0.5">{counts.applied}</div>
            </div>
          </div>
        </div>

        {/* ── PRO MEMBERSHIP CARD ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071522] via-[#0d2137] to-[#071522] border border-[#19CBE0]/30 shadow-xl mb-8 p-6 sm:p-8">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-80 h-full bg-[#19CBE0]/10 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-1/4 w-64 h-32 bg-violet-500/10 blur-2xl pointer-events-none rounded-full" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#19CBE0]/15 border border-[#19CBE0]/40 text-[#19CBE0] text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> SponsorAJobs Premium
                </span>
                {user?.subscriptionTier === "PRO" ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                    ✓ Active Pro Membership
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    From ₹2.7 / Day
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  Unlock Full Visa Intelligence.<br />
                  <span className="text-[#19CBE0]">Get Sponsored Faster.</span>
                </h2>
                <p className="text-sm text-slate-300 mt-2 max-w-lg">
                  Premium candidates unlock AI CV scoring against 650+ verified sponsors, direct cover letter generation, and priority employer match shortlists.
                </p>
              </div>

              {/* Feature grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { icon: "🤖", label: "AI CV Rewrite & ATS Optimiser", desc: "Tailored to every job you apply for" },
                  { icon: "📊", label: "Salary Negotiation Intelligence", desc: "Know your market worth by city & role" },
                  { icon: "🎯", label: "Guaranteed Interview Shortlist", desc: "Curated roles matched to your profile" },
                  { icon: "📩", label: "Unlimited Job Alerts", desc: "Instant notifications for new openings" },
                  { icon: "🛂", label: "Visa Sponsorship Score", desc: "Probability rating per application" },
                  { icon: "🧑‍💼", label: "Cover Letter AI Suite", desc: "Tailored visa sponsorship pitch" },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
                  >
                    <span className="text-base shrink-0 mt-0.5">{f.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{f.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{f.desc}</div>
                    </div>
                    <span className="ml-auto shrink-0">
                      {user?.subscriptionTier === "PRO" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Box */}
            <div className="flex flex-col items-center gap-3 shrink-0 text-center w-full lg:w-72 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#19CBE0]/20 to-violet-500/20 border border-[#19CBE0]/30 flex items-center justify-center">
                <Award className="w-7 h-7 text-[#19CBE0]" />
              </div>

              {user?.subscriptionTier === "PRO" ? (
                <div className="space-y-3 py-2 w-full">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Premium Active</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    You have full all-access to every intelligence tool and ATS scanner.
                  </p>
                  <Link
                    href="/tools/ats-checker"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#19CBE0] to-emerald-400 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch AI Tools</span>
                  </Link>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="text-center">
                    <div className="text-xs font-extrabold text-slate-300">Upgrade to Pro</div>
                    <div className="text-2xl font-black text-white mt-0.5">
                      ₹199 <span className="text-xs text-slate-400 font-normal">/ month</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                      Or ₹999 for 1 Full Year (₹2.7/day)
                    </div>
                  </div>

                  <Link
                    href="/pricing"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#19CBE0] to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-lg shadow-[#19CBE0]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>View Plans & Upgrade</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>UPI, Cards & NetBanking</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SMART RECOMMENDATIONS ── */}
        {user?.profession && (
          <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Recommended For You</h3>
                  <p className="text-[11px] text-slate-500">Based on your profile: {user.profession}</p>
                </div>
              </div>
              <Link
                href={`/jobs?q=${encodeURIComponent(user.profession)}`}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                user.profession,
                `${user.profession} UK`,
                `${user.profession} Australia`,
                `${user.profession} Canada`,
                `Senior ${user.profession}`,
                `${user.profession} Remote`,
              ].map((query) => (
                <Link
                  key={query}
                  href={`/jobs?q=${encodeURIComponent(query)}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-slate-700 hover:text-brand-700 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Search className="w-3 h-3 text-slate-400" />
                  {query}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { label: "All Applications", value: "ALL", count: counts.total },
              { label: "Applied", value: "APPLIED", count: counts.applied },
              { label: "Interviewing", value: "INTERVIEWING", count: counts.interviewing },
              { label: "Offers", value: "OFFER", count: counts.offer },
              { label: "Not Selected", value: "REJECTED", count: counts.rejected },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.value
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    statusFilter === tab.value ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by job or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No tracked applications yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              When you click "Apply" on any job vacancy, it will be automatically saved here so you can keep track of every application status and interview.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Track a Job Manually
              </button>
              <Link
                href="/jobs"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Browse Sponsor Jobs &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left: Job & Company info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {app.companyName ? app.companyName.slice(0, 2).toUpperCase() : "CO"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {app.jobTitle}
                      </h4>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700">{app.companyName}</span>
                      {app.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{app.location}</span>
                          </span>
                        </>
                      )}
                      {app.salary && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">{app.salary}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </span>
                    </div>

                    {/* Optional Notes Preview */}
                    {app.notes && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                        <Edit3 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <p className="line-clamp-2 italic">{app.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions & Status selector */}
                <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Status Dropdown */}
                  <select
                    value={app.status}
                    disabled={updatingId === app.id}
                    onChange={(e) => handleUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  >
                    <option value="APPLIED">📝 Applied</option>
                    <option value="INTERVIEWING">📞 Interviewing</option>
                    <option value="OFFER">🎯 Offer Received</option>
                    <option value="REJECTED">❌ Not Selected</option>
                    <option value="ARCHIVED">📁 Archived</option>
                  </select>

                  {/* Edit Notes button */}
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setEditNotes(app.notes || "");
                      setEditStatus(app.status);
                      setNotesModalOpen(true);
                    }}
                    title="Add or Edit Notes"
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Direct Link */}
                  {app.applyUrl && (
                    <a
                      href={app.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Direct Employer Job Link"
                      className="p-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteApplication(app.id)}
                    title="Untrack Application"
                    className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Notes Modal */}
      {notesModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Application Notes & Stage
            </h3>
            <p className="text-xs text-slate-500 mb-4 truncate">
              {selectedApp.jobTitle} at {selectedApp.companyName}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application Stage</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ApplicationStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="APPLIED">📝 Applied (Submitted)</option>
                  <option value="INTERVIEWING">📞 Interviewing (Screen / Technical / Final)</option>
                  <option value="OFFER">🎯 Offer Received</option>
                  <option value="REJECTED">❌ Not Selected</option>
                  <option value="ARCHIVED">📁 Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Interview / Contact Notes</label>
                <textarea
                  rows={4}
                  placeholder="e.g. HR Phone screen scheduled for Thursday. Discussed UK Skilled Worker sponsorship requirements..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setNotesModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Save Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Track Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <form onSubmit={handleManualAdd} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Track an External Job Application
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add any job vacancy you applied to on company portals or LinkedIn.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Civil Engineer"
                  value={manualForm.jobTitle}
                  onChange={(e) => setManualForm({ ...manualForm, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Burns & McDonnell"
                  value={manualForm.companyName}
                  onChange={(e) => setManualForm({ ...manualForm, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. London, UK"
                    value={manualForm.location}
                    onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. £65,000 / yr"
                    value={manualForm.salary}
                    onChange={(e) => setManualForm({ ...manualForm, salary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://company.jobs/view/12345"
                  value={manualForm.applyUrl}
                  onChange={(e) => setManualForm({ ...manualForm, applyUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Stage</label>
                <select
                  value={manualForm.status}
                  onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as ApplicationStatus })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="APPLIED">📝 Applied</option>
                  <option value="INTERVIEWING">📞 Interviewing</option>
                  <option value="OFFER">🎯 Offer Received</option>
                  <option value="REJECTED">❌ Not Selected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Add Application
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Email Verification OTP Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <form onSubmit={handleVerifyOtp} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Verify Your Email Address
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Enter the 6-digit code sent to <strong className="text-slate-800">{user.email}</strong>
            </p>

            {verifyMsg && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-medium ${
                  verifyMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {verifyMsg.text}
              </div>
            )}

            <div className="mb-4">
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-48 text-center tracking-[8px] text-2xl font-black py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                type="button"
                disabled={resendCooldown > 0 || verifyLoading}
                onClick={handleRequestVerificationCode}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:text-slate-400 cursor-pointer"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend 6-Digit Code"}
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setVerifyModalOpen(false);
                  setVerifyMsg(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={verifyLoading || otpCode.length < 6}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {verifyLoading ? "Verifying..." : "Verify & Activate"}
              </button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
}
