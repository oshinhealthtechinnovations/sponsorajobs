"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToolAuthGuard } from "@/components/ToolAuthGuard";
import { JobApplyButton } from "@/components/JobApplyButton";
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

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>AI Semantic Recommendation Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            AI Smart Job Matcher
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Describe your skills, background, target role, and preferred destination in plain English.
            Our algorithm matches you against verified visa-sponsoring employers and legal thresholds.
          </p>
        </div>

        {/* Auth Gated Tool Workspace */}
        <ToolAuthGuard
          toolName="AI Smart Job Matcher"
          toolDescription="Match your skills and background against verified visa-sponsoring vacancies with algorithmic salary and visa viability checks."
          featurePills={[
            "Natural Language Match Scoring",
            "Statutory Visa Threshold Checks",
            "Verified Employer License Auditing",
            "Direct ATS Application Integration",
          ]}
        >
          {/* Search Box Card */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="jobPromptInput" className="block text-xs font-bold text-slate-700">
                Describe your dream role, skills & experience:
              </label>
              <textarea
                id="jobPromptInput"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. Frontend developer with 4 years Vue and TypeScript experience looking for relocation to London with Certificate of Sponsorship..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans leading-relaxed"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <label htmlFor="countryFilterSelect" className="text-xs font-bold text-slate-500">Destination:</label>
                <select
                  id="countryFilterSelect"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-800"
                >
                  <option value="ALL">🌍 Any Destination</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="AU">🇦🇺 Australia</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="NZ">🇳🇿 New Zealand</option>
                </select>
              </div>

              <button
                type="button"
                disabled={loading || !prompt.trim()}
                onClick={() => handleMatch()}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Matching against 1,800+ Live Vacancies..." : "Find My Sponsoring Jobs"}</span>
              </button>
            </div>

            {/* Sample Prompts */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick 1-Click Sample Profiles:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(p);
                      handleMatch(p);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition-colors text-left"
                  >
                    💡 {p.slice(0, 48)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Profile Rationale Card */}
              <div className="p-5 rounded-2xl bg-brand-50/70 border border-brand-100 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-wider text-brand-800 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-brand-600" />
                    AI Profile Extraction & Analysis
                  </span>
                  <span className="text-xs font-bold text-brand-700">
                    Confidence: {result.confidenceScore}%
                  </span>
                </div>
                <p className="text-xs text-brand-900 leading-relaxed">
                  {result.explanation}
                </p>

                {result.candidateProfile?.skills?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-500">Extracted Skills:</span>
                    {result.candidateProfile.skills.map((s: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-brand-200 text-brand-700 text-[10px] font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Matched Job Cards */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/80 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    Recommended Positions ({result.matchedJobs?.length || 0} matches found)
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Ranked by role relevance, skills overlap &amp; statutory visa viability
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.matchedJobs?.map((item: any, idx: number) => {
                    const job = item.job;
                    const reasons: string[] = item.reasons || [];
                    const companyName = job.company?.name || job.companyName || "Verified Sponsor";
                    const locationStr = job.location?.city
                      ? `${job.location.city}, ${job.location.country}`
                      : (job.location?.country || job.country || "Direct");
                    const salaryStr = job.salary?.max
                      ? `${job.salary.currency || "$"}${job.salary.max.toLocaleString()}`
                      : job.salary?.min
                      ? `${job.salary.currency || "$"}${job.salary.min.toLocaleString()}`
                      : typeof job.salary === "string"
                      ? job.salary
                      : "Competitive Package";

                    return (
                      <div
                        key={job.id || idx}
                        className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-brand-300 transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 truncate">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{companyName}</span>
                              </span>
                              <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                                {job.title}
                              </h4>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 whitespace-nowrap shadow-2xs">
                                {item.matchScore}% Match
                              </span>
                              {item.visaViable && (
                                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 shrink-0 whitespace-nowrap flex items-center gap-1">
                                  <span>✓</span>
                                  <span>Visa Viable</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{locationStr}</span>
                            </span>
                            <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50/60 px-2 py-0.5 rounded-md border border-emerald-200/50">
                              <Banknote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{salaryStr}</span>
                            </span>
                          </div>

                          {/* Match Reasons */}
                          <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Why this matches your profile:
                            </span>
                            <div className="space-y-1">
                              {reasons.map((r: string, rIdx: number) => (
                                <div key={rIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{r}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                          <Link
                            href={`/job/${job.slug || job.id}`}
                            className="text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
                          >
                            View Full Details
                          </Link>

                          {/* Gated Apply Button */}
                          <JobApplyButton
                            jobId={job.id}
                            jobTitle={job.title}
                            companyName={companyName}
                            locationFormatted={locationStr}
                            salaryFormatted={salaryStr}
                            applyUrl={job.applyUrl}
                            label="Apply on Official ATS"
                            variant="card"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer touch-manipulation"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </ToolAuthGuard>
      </main>

      <Footer />
    </div>
  );
}
