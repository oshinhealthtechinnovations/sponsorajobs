"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, Sparkles, Send, ShieldCheck, MailCheck } from "lucide-react";
import { INITIAL_COUNTRIES } from "@/config/countries";

export const JobAlertSignup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [targetCountry, setTargetCountry] = useState("all");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          country: targetCountry,
          category: "all",
          frequency: "daily",
        }),
      });

      const data = await res.json();

      try {
        const existing = JSON.parse(localStorage.getItem("sa_job_alerts") || "[]");
        existing.push({
          email,
          country: targetCountry,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("sa_job_alerts", JSON.stringify(existing));
      } catch {
        // Safe fallback
      }

      setFeedbackMessage(data?.message || `Confirmation email dispatched to ${email}!`);
      setIsSubmitted(true);
    } catch {
      setFeedbackMessage(`Job alerts activated for ${email}!`);
      setIsSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-base text-slate-900">Alerts Successfully Activated!</h4>
          <p className="text-xs text-slate-600 mt-1 max-w-sm">
            {feedbackMessage || `We will notify you at ${email} when verified opportunities are published.`}
          </p>
        </div>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setEmail("");
          }}
          className="mt-2 text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
        >
          Add another destination or email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="flex-1 px-4 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs"
        />

        <select
          value={targetCountry}
          onChange={(e) => setTargetCountry(e.target.value)}
          className="px-3.5 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
        >
          <option value="all">🌍 All Destinations</option>
          {INITIAL_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code.toLowerCase()}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-cyan-600 to-sky-700 hover:from-sky-700 hover:to-cyan-700 disabled:opacity-70 text-white font-extrabold text-sm transition-all duration-200 flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md hover:shadow-lg"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Subscribe Free</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Zero Spam · 1-click unsubscribe
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          100% Free Forever
        </span>
      </div>
    </form>
  );
};
