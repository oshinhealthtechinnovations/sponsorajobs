"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Send,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Globe,
  Briefcase,
  Mail,
  Zap,
  Tag,
} from "lucide-react";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";

export function SubscriberPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">("daily");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if already subscribed or recently dismissed
    const isSubscribed = localStorage.getItem("sa_subscriber_active");
    const dismissedUntil = localStorage.getItem("sa_subscriber_dismissed_until");
    const now = Date.now();

    if (isSubscribed === "true") return;
    if (dismissedUntil && now < Number(dismissedUntil)) return;

    // 1. Timer Trigger: Open after 6 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 6000);

    // 2. Exit-intent trigger on desktop
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !sessionStorage.getItem("sa_exit_intent_shown")) {
        sessionStorage.setItem("sa_exit_intent_shown", "true");
        setIsOpen(true);
      }
    };

    // 3. Custom trigger event
    const handleOpenEvent = () => {
      setIsOpen(true);
    };

    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("open-subscriber-popup", handleOpenEvent);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("open-subscriber-popup", handleOpenEvent);
    };
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    // Suppress for 5 days on manual close
    localStorage.setItem(
      "sa_subscriber_dismissed_until",
      String(Date.now() + 5 * 24 * 60 * 60 * 1000)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          keyword: keyword.trim() || undefined,
          country: selectedCountry,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          frequency,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        localStorage.setItem("sa_subscriber_active", "true");
      } else {
        setErrorMessage(data.error || "Failed to subscribe. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-8 space-y-6 text-slate-900 my-auto">
        {/* Ambient Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#18D6E5] via-brand-600 to-indigo-600 rounded-t-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="space-y-2 pr-6 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Verified Visa Job Alerts</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Never Miss a Sponsoring Job in Your Field
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Receive instant notifications the moment verified employers in the UK, USA, Canada, or Australia post vacancies with Certificate of Sponsorship (CoS) or LMIA support.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Subscriber Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Your Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Target Country Selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Destination Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="ALL">🌐 All Countries (UK, USA, Canada, Australia, NZ)</option>
                  {INITIAL_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Industry / Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Target Industry
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-brand-500 focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="all">All Industries</option>
                    {INITIAL_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Target Role / Keywords
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="e.g. Software Engineer, Nurse"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Frequency Selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Alert Frequency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "daily", label: "Daily Digest" },
                    { id: "weekly", label: "Weekly Top 10" },
                    { id: "instant", label: "Instant Alert" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFrequency(f.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                        frequency === f.id
                          ? "bg-brand-50 text-brand-700 border-brand-300 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-sky-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-500 text-white font-black text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
                <span>{loading ? "Activating Your Alerts..." : "Start Free Job Alerts"}</span>
              </button>

              {/* Trust Badges */}
              <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Free Forever
                </span>
                <span>•</span>
                <span>Zero Spam</span>
                <span>•</span>
                <span>Unsubscribe Anytime</span>
              </div>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Alerts Successfully Activated!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                We've registered your preferences for <strong className="text-slate-900">{email}</strong>. You'll receive matched visa sponsorship opportunities directly to your inbox.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 text-left space-y-1.5 max-w-sm mx-auto">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-600" />
                <span>Selected Criteria:</span>
              </p>
              <p className="text-[11px] text-slate-600">
                Country: <span className="text-slate-900 font-semibold">{selectedCountry}</span>
              </p>
              {keyword && (
                <p className="text-[11px] text-slate-600">
                  Role: <span className="text-slate-900 font-semibold">{keyword}</span>
                </p>
              )}
              <p className="text-[11px] text-slate-600">
                Frequency: <span className="text-emerald-600 font-bold uppercase">{frequency}</span>
              </p>
            </div>

            <div className="flex items-center justify-center pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                Continue Browsing Jobs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
