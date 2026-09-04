"use client";

import React, { useState, useRef } from "react";
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
  UploadCloud,
  FileText,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Layers,
  Check,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

const SAMPLE_PROMPTS = [
  "Assistant Project Manager with 4 years experience in civil construction looking for UK Skilled Worker sponsorship",
  "Senior Full Stack React & Node.js Developer with 5 years experience looking for UK Skilled Worker jobs",
  "Mechanical Engineer with SolidWorks, CAD design, and manufacturing maintenance experience seeking sponsorship",
  "DevOps Engineer with AWS, Kubernetes and Terraform looking for Australia TSS 482 visa sponsorship",
  "Data Analyst with SQL and Python seeking US H-1B sponsorship opportunities",
];

export default function SmartJobFinderPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "prompt">("upload");
  const [prompt, setPrompt] = useState(
    "Assistant Project Manager with 4 years experience in civil construction looking for UK Skilled Worker sponsorship"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [country, setCountry] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileName(file.name);
    setError(null);
  };

  const handleMatch = async (overridePrompt?: string) => {
    const textToSearch = overridePrompt || prompt;

    if (activeTab === "upload" && !selectedFile && !textToSearch.trim()) {
      setError("Please select a CV file or enter your career background.");
      return;
    }

    if (activeTab === "prompt" && !textToSearch.trim()) {
      setError("Please enter your career background, target role, or skills.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let res: Response;

      if (activeTab === "upload" && selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        if (country !== "ALL") formData.append("country", country);
        formData.append("limit", "8");

        res = await fetch("/api/tools/smart-job-match", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/tools/smart-job-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: textToSearch,
            country: country !== "ALL" ? country : undefined,
            limit: 8,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to find matching opportunities.");
      }

      setResult(data.data);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      setError(err.message || "An error occurred while matching your profile.");
    } finally {
      setLoading(false);
    }
  };

  const candidate = result?.candidateProfile;

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
            Upload your CV or describe your background. Our central intelligence engine analyzes your experience,
            uncovers transferable career pathways, and ranks verified visa-sponsoring opportunities across our entire database.
          </p>
        </div>

        {/* 4 Step Workflow Pill Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-brand-700 shadow-2xs">
            1. Upload CV / Profile
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
            2. Structured Analysis
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
            3. Transferable Roles
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-emerald-700 shadow-2xs">
            4. Ranked Sponsor Jobs
          </div>
        </div>

        {/* Auth Gated Tool Workspace */}
        <ToolAuthGuard
          toolName="AI Smart Job Matcher"
          toolDescription="Match your skills and background against verified visa-sponsoring vacancies with algorithmic salary and visa viability checks."
          featurePills={[
            "Natural Language Match Scoring",
            "Transferable Role Mapping (Assistant PM → PM → Construction PM)",
            "Verified Employer License Auditing",
            "Statutory Visa Threshold Checks",
          ]}
        >
          {/* Main Input Card */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "upload"
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload CV / Resume</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("prompt")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "prompt"
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Describe Background</span>
                </button>
              </div>

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
            </div>

            {/* Tab 1: CV File Upload */}
            {activeTab === "upload" ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-brand-50/20 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,text/plain,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {fileName ? `Selected: ${fileName}` : "Click or Drag & Drop your CV / Resume here"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports modern PDF, Word (.docx), and plain text (.txt)
                </p>
                {selectedFile && (
                  <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Loaded {fileName} ({Math.round(selectedFile.size / 1024)} KB)</span>
                  </p>
                )}
              </div>
            ) : (
              /* Tab 2: Text Prompt Input */
              <div className="space-y-1.5">
                <label htmlFor="jobPromptInput" className="block text-xs font-bold text-slate-700">
                  Describe your target role, experience, and core skills:
                </label>
                <textarea
                  id="jobPromptInput"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="e.g. Mechanical Engineer with 4 years experience in SolidWorks, CAD design, and preventative maintenance seeking sponsorship in the UK..."
                  className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans leading-relaxed"
                />
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Button & Sample Prompts */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={loading || (activeTab === "upload" && !selectedFile && !prompt.trim()) || (activeTab === "prompt" && !prompt.trim())}
                onClick={() => handleMatch()}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? "Analyzing Profile & Searching Live Jobs..." : "Find My Sponsoring Jobs"}</span>
              </button>

              <span className="text-[11px] text-slate-500 text-center sm:text-right">
                Evaluates multi-factor role, skill, and sponsorship certainty
              </span>
            </div>

            {/* 1-Click Samples */}
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
                      setActiveTab("prompt");
                      setPrompt(p);
                      handleMatch(p);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition-colors text-left cursor-pointer"
                  >
                    💡 {p.slice(0, 48)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              RESULTS DISPLAY: STRUCTURED PROFILE + RANKED OPPORTUNITIES
          ═══════════════════════════════════════════════════════════════ */}
          <div ref={resultsRef}>
            {result && (
              <div className="space-y-8 animate-fade-in">
                {/* ── STEP 2: STRUCTURED CANDIDATE PROFILE CARD ── */}
                {candidate && (
                  <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-brand-600" />
                            <span>Candidate Profile Intelligence</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                            {candidate.seniority}
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-900 font-display">
                          {candidate.currentRole}
                        </h3>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Experience</div>
                        <div className="text-lg font-black text-slate-800">{candidate.yearsOfExperience}+ Years</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Industry</span>
                        <p className="font-bold text-slate-800">{candidate.primaryIndustry}</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Highest Degree</span>
                        <p className="font-bold text-slate-800">
                          {candidate.highestDegree !== "Not Detected" ? candidate.highestDegree : "Professional Experience Basis"}
                          {candidate.degreeField ? ` in ${candidate.degreeField}` : ""}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Certifications Detected</span>
                        <p className="font-bold text-slate-800">
                          {candidate.certifications && candidate.certifications.length > 0
                            ? candidate.certifications.join(", ")
                            : "Standard Industry Qualifications"}
                        </p>
                      </div>
                    </div>

                    {/* Detected Skills */}
                    {candidate.coreSkills && candidate.coreSkills.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Verified Core &amp; Technical Skills:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.coreSkills.map((s: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold capitalize"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transferable Potential Roles (Cross-Title Intelligence) */}
                    {result.transferableRoles && result.transferableRoles.length > 0 && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-brand-50/70 border border-indigo-100 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          <span>Identified Transferable &amp; Related Career Paths:</span>
                        </div>
                        <p className="text-xs text-indigo-800/80">
                          Based on your skill patterns, the system searched beyond exact keywords to include these viable adjacent roles:
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {result.transferableRoles.map((r: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-xl bg-white border border-indigo-200 text-indigo-800 text-xs font-bold shadow-2xs"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 3 & 4: BEST JOB MATCHES CARDS ── */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/80 pb-3">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 font-display">
                        Your Best Sponsorship Matches ({result.matchedJobs?.length || 0})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ranked by multi-factor compatibility (skills, experience, role similarity, and verified statutory sponsorship certainty).
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 w-fit">
                      100% Sponsor Database Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.matchedJobs?.map((item: any, idx: number) => {
                      const job = item.job;
                      const breakdown = item.breakdown;
                      const reasons: string[] = item.reasons || [];
                      const companyName = job.company?.name || job.companyName || job.company_name || "Verified Employer";
                      const locationStr = job.location?.city
                        ? `${job.location.city}, ${job.location.country}`
                        : job.city
                        ? `${job.city}, ${job.country_code}`
                        : (job.location?.country || job.country || "Direct");

                      const salaryStr = job.salary_max
                        ? `${job.salary_currency || "£"}${job.salary_max.toLocaleString()}`
                        : job.salary_min
                        ? `${job.salary_currency || "£"}${job.salary_min.toLocaleString()}`
                        : "Competitive Package";

                      // Determine strict sponsorship badge styling
                      const isConfirmed = item.sponsorshipStatus === "CONFIRMED_IN_LISTING" || job.has_sponsorship === 1;
                      const isHistorical = item.sponsorshipStatus === "HISTORICAL_EMPLOYER_SPONSOR" || job.sponsorship_score >= 80;

                      return (
                        <div
                          key={job.id || idx}
                          className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:border-brand-400 transition-all flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-3">
                            {/* Header: Company, Title, Scores */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 min-w-0">
                                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 truncate">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{companyName}</span>
                                </span>
                                <h4 className="text-base font-extrabold text-slate-900 leading-snug line-clamp-2">
                                  {job.title}
                                </h4>
                              </div>

                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 whitespace-nowrap shadow-2xs">
                                  {item.matchScore}% Match
                                </span>
                                {item.atsScore && (
                                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                                    ATS: {item.atsScore}%
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Location & Salary */}
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

                            {/* Sponsorship Status Badge (Truth in Advertising) */}
                            <div className="pt-1">
                              {isConfirmed ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Sponsorship Confirmed in Listing</span>
                                </div>
                              ) : isHistorical ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Historical Licensed Sponsor (Verify Vacancy)</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">
                                  <span>General Vacancy (Sponsorship Unconfirmed)</span>
                                </div>
                              )}
                            </div>

                            {/* Skills Matched & Missing */}
                            <div className="space-y-1.5 pt-1">
                              {item.matchedSkills && item.matchedSkills.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className="text-[10px] font-bold text-emerald-700">Matching Skills:</span>
                                  {item.matchedSkills.slice(0, 4).map((s: string, sIdx: number) => (
                                    <span
                                      key={sIdx}
                                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold capitalize"
                                    >
                                      ✓ {s}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {item.missingSkills && item.missingSkills.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className="text-[10px] font-bold text-amber-700">Missing Requirements:</span>
                                  {item.missingSkills.slice(0, 3).map((s: string, mIdx: number) => (
                                    <span
                                      key={mIdx}
                                      className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold capitalize"
                                    >
                                      • {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* "Why This Job?" Explanation Box */}
                            <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                Why we recommend this opportunity:
                              </span>
                              <div className="space-y-1">
                                {reasons.slice(0, 2).map((r: string, rIdx: number) => (
                                  <div key={rIdx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span className="leading-snug">{r}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                            <Link
                              href={`/job/${job.slug || job.id}`}
                              className="text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
                            >
                              View Full Listing
                            </Link>

                            <JobApplyButton
                              jobId={job.id}
                              jobTitle={job.title}
                              companyName={companyName}
                              locationFormatted={locationStr}
                              salaryFormatted={salaryStr}
                              applyUrl={job.apply_url || job.applyUrl}
                              label="Apply with Verified Sponsorship"
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
          </div>
        </ToolAuthGuard>
      </main>

      <Footer />
    </div>
  );
}
