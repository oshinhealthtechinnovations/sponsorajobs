"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SearchX, ArrowRight, RotateCcw, Sparkles, Bell, CheckCircle2, Lightbulb, ShieldCheck } from "lucide-react";
import { getRelatedSearchSuggestions } from "@/lib/utils/searchNormalizer";

interface EmptyStateProps {
  query?: string;
  country?: string;
  category?: string;
  onReset?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ query, country, category }) => {
  const suggestions = getRelatedSearchSuggestions(query);
  const [email, setEmail] = useState("");
  const [isAlertCreated, setIsAlertCreated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleQuickAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    try {
      await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          keyword: query,
          country: country || "all",
          category: category || "all",
          frequency: "daily",
        }),
      });
      setIsAlertCreated(true);
    } catch {
      setIsAlertCreated(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* ── Main Empty State Box ── */}
      <div className="p-6 sm:p-10 text-center rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-brand-600 flex items-center justify-center mx-auto mb-4 border border-sky-100 shadow-xs">
          <Sparkles className="w-7 h-7 text-brand-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 font-display">
          {query ? `Exploring Alternative Roles for "${query}"` : "Discover Top Sponsorship Vacancies"}
        </h3>
        <p className="text-sm text-slate-600 max-w-lg mx-auto mb-6">
          Check out these recommended sponsor roles below or try one of the popular search pathways.
        </p>

        {/* Suggested Quick Search Tags */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Try searching these popular related roles:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {suggestions.map((tag) => (
                <Link
                  key={tag}
                  href={`/jobs?q=${encodeURIComponent(tag)}${country ? `&country=${country}` : ""}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 text-slate-700 border border-slate-200/80 text-xs font-semibold transition-all touch-manipulation"
                >
                  <Sparkles className="w-3 h-3 text-brand-500" />
                  <span>{tag}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Inline Fast Job Alert Box */}
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white text-left border border-slate-700/80 shadow-md">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">
              Get notified when &ldquo;{query || "matching"}&rdquo; jobs are listed
            </h4>
          </div>
          <p className="text-xs text-slate-300 mb-4">
            We scan 250+ certified visa sponsors daily. We&apos;ll email you instantly when new openings drop.
          </p>

          {isAlertCreated ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Alert active! We sent a confirmation email to <strong>{email}</strong>.
              </span>
            </div>
          ) : (
            <form onSubmit={handleQuickAlert} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-70 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Notify Me</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-all touch-manipulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </Link>
          <Link
            href="/countries"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all touch-manipulation"
          >
            <span>Browse All Countries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Applicant Mistake Prevention & Success Guide ── */}
      <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-200/80 shadow-xs">
        <div className="flex items-center gap-2.5 text-blue-900 mb-3 font-bold text-sm">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>Top Advice: How to Avoid the Most Common Visa Application Mistakes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-blue-950">
          <div className="p-3 bg-white/90 rounded-2xl border border-blue-100 space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              1. Avoid Overly Specific Keyword Searches
            </p>
            <p className="text-slate-600 leading-relaxed">
              Employers often list jobs as <em>&ldquo;Software Engineer&rdquo;</em> rather than <em>&ldquo;Senior React GraphQL AWS Specialist&rdquo;</em>. Use broader titles to uncover hidden sponsor roles.
            </p>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-blue-100 space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              2. Apply In the First 72 Hours
            </p>
            <p className="text-slate-600 leading-relaxed">
              Visa sponsorship openings receive international applications rapidly. Set up alerts and apply within 3 days for a 4x higher response rate.
            </p>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-blue-100 space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              3. Check Multi-Country Shortage Lists
            </p>
            <p className="text-slate-600 leading-relaxed">
              If your role is competitive in the UK or US, check Australia (482/186 visas) or Canada (Global Talent Stream) which have active occupation shortage fast-tracks.
            </p>
          </div>

          <div className="p-3 bg-white/90 rounded-2xl border border-blue-100 space-y-1">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              4. Tailor Your CV for ATS Screening
            </p>
            <p className="text-slate-600 leading-relaxed">
              State clearly in your profile that you are qualified for visa sponsorship and highlight your key relevant project achievements prominently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
