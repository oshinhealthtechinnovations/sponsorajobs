"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Sparkles,
  Search,
  CheckCircle2,
  Building2,
  MapPin,
  Banknote,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
} from "lucide-react";
import Link from "next/link";

const SAMPLE_PROMPTS = [
  "Senior Full Stack React & Node.js Developer with 5 years experience looking for UK Skilled Worker jobs",
  "DevOps Engineer with AWS, Kubernetes and Terraform looking for Australia TSS 482 visa sponsorship",
  "Data Analyst with SQL and Python seeking US H-1B sponsorship opportunities",
  "Civil Engineer with structural design background looking to relocate to the UK",
];

export default function SmartJobFinderPage() {
  const [prompt, setPrompt] = useState(
    "Senior Full Stack React & Node.js Developer with 5 years experience looking for UK Skilled Worker jobs"
  );
  const [country, setCountry] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleMatch = async (searchPrompt?: string) => {
    const textToSearch = searchPrompt || prompt;
    if (!textToSearch.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/tools/smart-job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSearch,
          country: country !== "ALL" ? country : undefined,
          limit: 6,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Semantic Natural Language Matcher • 100% Free</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            AI Smart Job Finder & Suggestion Engine
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Describe your skills, target country, and experience in plain words. Our intelligent matching engine scans 1,850+ live verified sponsor vacancies to find your highest-probability matches.
          </p>
        </div>

        {/* Input Match Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Describe What You Are Looking For
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full text-sm font-medium p-3.5 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500 resize-none"
              placeholder="e.g. Senior Backend Engineer with Golang and Kubernetes experience seeking UK visa sponsorship..."
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Destination:</span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800"
              >
                <option value="ALL">🌍 Any Country</option>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="US">🇺🇸 United States</option>
                <option value="AU">🇦🇺 Australia</option>
                <option value="CA">🇨🇦 Canada</option>
                <option value="NZ">🇳🇿 New Zealand</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleMatch()}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <span>Scanning 1,850+ Live Jobs...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Find Suggested Jobs</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Quick Suggestion Examples:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(p);
                    handleMatch(p);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-left"
                >
                  ⚡ {p.slice(0, 48)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Recommended Positions ({result.matchedJobs.length} matches found)
                </h3>
                {result.detectedIntent.skills.length > 0 && (
                  <p className="text-xs text-slate-500">
                    Detected Skills:{" "}
                    <strong>{result.detectedIntent.skills.join(", ")}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.matchedJobs.map(({ job, matchScore, visaViable, reasons }: any) => {
                const salaryStr = job.salary?.max
                  ? `${job.salary.currency || "£"}${job.salary.max.toLocaleString()}`
                  : job.salary?.min
                  ? `${job.salary.currency || "£"}${job.salary.min.toLocaleString()}`
                  : "Competitive Package";

                return (
                  <div
                    key={job.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-brand-300 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {job.company.name}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {job.title}
                          </h4>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            {matchScore}% Match
                          </span>
                          {visaViable && (
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                              ✓ Visa Viable
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location.country} &middot; {job.location.city || "Direct"}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-emerald-700">
                          <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                          {salaryStr}
                        </span>
                      </div>

                      {/* Matching Reasons */}
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        {reasons.map((r: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <Link
                        href={`/job/${job.id}`}
                        className="text-xs font-bold text-slate-600 hover:text-brand-600"
                      >
                        View Full Details
                      </Link>

                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-xs"
                      >
                        <span>Apply on Official ATS</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
