"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToolAuthGuard } from "@/components/ToolAuthGuard";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Zap,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function CvCoverLetterPage() {
  const [activeTab, setActiveTab] = useState<"cover-letter" | "bullet-optimizer" | "occupations">("cover-letter");

  // Cover Letter Form State
  const [candidateName, setCandidateName] = useState("Alex Johnson");
  const [jobTitle, setJobTitle] = useState("Senior Software Engineer");
  const [companyName, setCompanyName] = useState("Atlassian");
  const [countryCode, setCountryCode] = useState("UK");
  const [experienceYears, setExperienceYears] = useState(6);
  const [keySkills, setKeySkills] = useState("Distributed Systems, TypeScript, React, Cloud Architecture");
  const [cvText, setCvText] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [subjectLine, setSubjectLine] = useState<string>("");
  const [loadingLetter, setLoadingLetter] = useState(false);
  const [copied, setCopied] = useState(false);

  // Bullet Optimizer State
  const [bulletInput, setBulletInput] = useState(
    "Responsible for helping the engineering team with backend API development and bug fixes.\nHandled customer data migration to the new cloud database."
  );
  const [bulletResults, setBulletResults] = useState<any[]>([]);
  const [loadingBullets, setLoadingBullets] = useState(false);

  // Occupations State
  const [occQuery, setOccQuery] = useState("Software");
  const [occResults, setOccResults] = useState<any[]>([]);
  const [loadingOcc, setLoadingOcc] = useState(false);

  const handleGenerateCoverLetter = async () => {
    setLoadingLetter(true);
    try {
      const res = await fetch("/api/tools/cv-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName,
          jobTitle,
          companyName,
          countryCode,
          experienceYears,
          keySkills: keySkills.split(",").map((s) => s.trim()),
          cvText,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedLetter(data.data.coverLetter);
        setSubjectLine(data.data.subjectLine);
      }
    } catch {
      //
    } finally {
      setLoadingLetter(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLetter) return;
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOptimizeBullets = async () => {
    setLoadingBullets(true);
    try {
      const bullets = bulletInput.split("\n").map((b) => b.trim()).filter(Boolean);
      const res = await fetch("/api/tools/cv-bullet-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullets }),
      });

      const data = await res.json();
      if (data.success && data.results) {
        setBulletResults(data.results);
      }
    } catch {
      //
    } finally {
      setLoadingBullets(false);
    }
  };

  const handleSearchOccupations = async () => {
    setLoadingOcc(true);
    try {
      const res = await fetch(`/api/tools/cv-occupations?query=${encodeURIComponent(occQuery)}`);
      const data = await res.json();
      if (data.success && data.occupations) {
        setOccResults(data.occupations);
      }
    } catch {
      //
    } finally {
      setLoadingOcc(false);
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
            <span>Free AI-Powered International Career Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            CV & Visa Cover Letter Intelligence
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Craft high-converting visa sponsorship applications, optimize passive CV bullet points into quantified achievements, and discover official immigration occupation codes.
          </p>
        </div>

        {/* Auth Gated Tool Workspace */}
        <ToolAuthGuard
          toolName="CV & Visa Cover Letter Intelligence Suite"
          toolDescription="Craft high-converting visa sponsorship pitch letters, optimize passive CV bullet points into quantified achievements, and discover official immigration occupation codes."
          featurePills={[
            "AI Visa Sponsorship Pitch Generator",
            "Action Verb & Bullet Point Impact Scorer",
            "UK SOC 2020 & Canada NOC Code Mapping",
            "Australia ANZSCO Shortage Search",
          ]}
        >
          <div className="text-center mb-8">
            {/* Navigation Tabs */}
            <div className="inline-flex p-1 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("cover-letter")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "cover-letter"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📄 Visa Cover Letter Generator
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("bullet-optimizer");
                  if (bulletResults.length === 0) handleOptimizeBullets();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "bullet-optimizer"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ⚡ CV Bullet Optimizer
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("occupations");
                  if (occResults.length === 0) handleSearchOccupations();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "occupations"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🌐 Immigration SOC Codes
              </button>
            </div>
          </div>

        {/* ── TAB 1: Cover Letter Generator ── */}
        {activeTab === "cover-letter" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Application Details</span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase bg-emerald-50 px-2 py-0.5 rounded-full">
                  100% Free
                </span>
              </h2>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Your Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Target Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Country & Visa</label>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="UK">🇬🇧 UK (Skilled Worker CoS)</option>
                    <option value="US">🇺🇸 USA (H-1B / O-1)</option>
                    <option value="AU">🇦🇺 Australia (TSS 482 / 186)</option>
                    <option value="CA">🇨🇦 Canada (Global Talent)</option>
                    <option value="NZ">🇳🇿 New Zealand (AEWV)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Years Experience</label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">Top 3-4 Key Skills</label>
                <input
                  type="text"
                  value={keySkills}
                  onChange={(e) => setKeySkills(e.target.value)}
                  placeholder="e.g. React, Node.js, AWS, Kubernetes"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase">
                  Paste CV Snippet (Optional)
                </label>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Paste your past achievements, current title, or recent responsibilities..."
                  rows={3}
                  className="w-full text-xs font-normal p-2.5 rounded-xl border border-slate-300 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateCoverLetter}
                disabled={loadingLetter}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                {loadingLetter ? (
                  <span>Generating AI Pitch Letter...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Generate Visa Cover Letter</span>
                  </>
                )}
              </button>
            </div>

            {/* Letter Preview Column */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tailored Visa Sponsorship Cover Letter</h3>
                  <span className="text-[11px] text-slate-500">{subjectLine || "Ready to copy or export"}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Letter"}</span>
                </button>
              </div>

              {generatedLetter ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs leading-relaxed text-slate-800 whitespace-pre-line font-mono font-normal">
                    {generatedLetter}
                  </div>

                  <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-100 text-xs text-brand-900 space-y-1">
                    <strong className="block font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-brand-600" />
                      Legal Sponsorship Advantage:
                    </strong>
                    <p className="text-[11px] text-brand-800">
                      This letter proactively answers the hiring manager's primary doubt: whether sponsoring you is legally straightforward, compliant with local salary minimums, and worth their administrative effort.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">No cover letter generated yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Fill in the position and company on the left, then click "Generate Visa Cover Letter" to produce an executive international pitch.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateCoverLetter}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-xs hover:bg-brand-700 transition-colors"
                  >
                    <span>Generate Sample Now</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: CV Bullet Optimizer ── */}
        {activeTab === "bullet-optimizer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Paste Your Raw CV Bullet Points
              </h2>
              <p className="text-xs text-slate-500">
                Enter one bullet per line. The optimizer eliminates passive phrases (e.g. "responsible for") and elevates each line with decisive action verbs and quantifiable impact.
              </p>

              <textarea
                value={bulletInput}
                onChange={(e) => setBulletInput(e.target.value)}
                rows={8}
                className="w-full text-xs font-mono p-3 rounded-2xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                placeholder="Responsible for building backend services in Node.js..."
              />

              <button
                type="button"
                onClick={handleOptimizeBullets}
                disabled={loadingBullets}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                {loadingBullets ? "Rewriting Bullets..." : "⚡ Optimize Bullet Points"}
              </button>
            </div>

            <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Optimized High-Impact Bullets
              </h3>

              {bulletResults.length > 0 ? (
                <div className="space-y-4">
                  {bulletResults.map((b, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                          Action Verb: {b.actionVerbUsed}
                        </span>
                        <span className={`text-xs font-black ${b.score >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                          Score: {b.score}/100
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 line-through">
                        {b.original}
                      </div>

                      <div className="text-xs font-bold text-slate-900 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b.optimized}</span>
                      </div>

                      <div className="text-[11px] text-slate-500 italic">
                        💡 {b.critique}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-xs">
                  Click "Optimize Bullet Points" to see real-time AI rewrites.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: Immigration Occupation Codes ── */}
        {activeTab === "occupations" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Immigration Occupation Codes Directory
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official UK SOC, Canada NOC, and Australia ANZSCO codes mapped to verified visa sponsorship shortage lists.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={occQuery}
                  onChange={(e) => setOccQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchOccupations()}
                  placeholder="Filter by role (e.g. Engineer, Nurse)..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 pr-8"
                />
                <button
                  type="button"
                  onClick={handleSearchOccupations}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-brand-600"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {occResults.map((occ, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{occ.title}</h4>
                    {occ.isShortageList && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        Shortage List
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div>🇬🇧 <strong>UK SOC 2020:</strong> {occ.ukSocCode}</div>
                    <div>🇨🇦 <strong>Canada NOC:</strong> {occ.canadaNocCode}</div>
                    <div>🇦🇺 <strong>Australia ANZSCO:</strong> {occ.australiaAnzscoCode}</div>
                    <div>💰 <strong>UK Benchmark Median:</strong> {occ.standardMedianSalaryGbp}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-1">
                    {occ.eligibleVisaRoutes.map((v: string) => (
                      <span key={v} className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </ToolAuthGuard>
      </main>

      <Footer />
    </div>
  );
}
