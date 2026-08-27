"use client";

import React, { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { ATSAnalysisResult, ATSJobMatch } from "@/lib/services/atsScanner";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Award,
  Globe2,
  Zap,
  Briefcase,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Check,
  X,
  ChevronRight,
  TrendingUp,
  Lock,
  Copy,
  CheckCheck,
  Building,
  Flag,
} from "lucide-react";
import Link from "next/link";

const SAMPLE_RESUME = `Alex Rivera
Senior Full Stack Engineer
London, UK | alex.rivera@example.com | linkedin.com/in/alexrivera-tech | github.com/alexrivera-dev

PROFESSIONAL SUMMARY
Results-driven Senior Full Stack Software Engineer with 6+ years of experience architecting distributed cloud applications, microservices, and modern web platforms. Proven track record of scaling high-throughput systems, reducing latency by 45%, and leading agile engineering teams in fintech and SaaS.

TECHNICAL SKILLS
• Languages: TypeScript, JavaScript, Python, Go, SQL
• Frontend: React, Next.js, Vue, TailwindCSS, Redux
• Backend & Cloud: Node.js, Express, FastAPI, PostgreSQL, Redis, AWS (ECS, Lambda, S3), Docker, Kubernetes
• Practices: CI/CD, Microservices, System Design, Unit Testing, Agile, Scrum

PROFESSIONAL EXPERIENCE
Senior Software Engineer | Global Fintech Solutions | London, UK (2022 - Present)
• Architected and deployed high-performance microservices in TypeScript and Node.js serving 500k+ daily active users.
• Reduced API response times by 40% and infrastructure costs by $120,000 annually through Redis caching and PostgreSQL query optimization.
• Spearheaded migration of monolithic services to Docker and Kubernetes on AWS with automated CI/CD pipelines.
• Mentored 5 junior engineers and led bi-weekly system design workshops.

Full Stack Developer | Nexa Digital Tech | Manchester, UK (2019 - 2022)
• Built responsive customer-facing web applications using React, Next.js, and Python FastAPI.
• Integrated Stripe payment gateways and authentication services processing over £4M in monthly transaction volume.
• Implemented automated testing suites with 92% code coverage, reducing production bug reports by 35%.

EDUCATION
Bachelor of Science (BSc) in Computer Science (First Class Honours)
University of Manchester (2015 - 2018)

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate
• Certified Kubernetes Application Developer (CKAD)`;

export default function ATSCheckerPage() {
  const [resumeText, setResumeText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetCountry, setTargetCountry] = useState("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ATSAnalysisResult | null>(null);
  const [matches, setMatches] = useState<ATSJobMatch[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkUserAccess = () => {
    try {
      const stored = localStorage.getItem("sa_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id && (parsed.has_active_trial || parsed.hasActiveTrial || parsed.promoCodeUsed || parsed.promo_code_used)) {
          setUser(parsed);
          return parsed;
        }
      }
      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    checkUserAccess();
    const handleSessionChange = () => {
      const loggedUser = checkUserAccess();
      if (loggedUser && (selectedFile || resumeText.trim().length >= 20) && !analysis) {
        handleRunAnalysis(loggedUser);
      }
    };

    window.addEventListener("user-session-changed", handleSessionChange);
    return () => window.removeEventListener("user-session-changed", handleSessionChange);
  }, [resumeText, selectedFile, analysis]);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);
    setError(null);
  };

  const handleRunAnalysis = async (overrideUser?: any) => {
    if (!selectedFile && (!resumeText || resumeText.trim().length < 15)) {
      setError("Please select a file or paste your resume text (at least 15 characters).");
      return;
    }

    // ── STRICT PROMO CODE / AUTH GATE ──
    const currentUser = overrideUser || user || checkUserAccess();
    if (!currentUser || !currentUser.id) {
      setError(null);
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: { defaultTab: "register" },
        })
      );
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      if (selectedFile && activeTab === "upload") {
        formData.append("file", selectedFile);
      } else {
        formData.append("text", resumeText.trim());
      }
      formData.append("country", targetCountry);

      const res = await fetch("/api/tools/ats-parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze resume.");
      }

      setAnalysis(data.analysis);
      setMatches(data.matches || []);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    setResumeText(SAMPLE_RESUME);
    setSelectedFile(null);
    setFileName("sample_senior_engineer_cv.txt");
    setActiveTab("paste");
  };

  const handleCopyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 65) return "text-brand-600 bg-brand-50 border-brand-200";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 65) return "bg-brand-600";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>AI ATS Resume Matcher & Visa Scorer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Check Your ATS Score & Get <span className="text-brand-600">Visa Sponsored Job Matches</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Upload your CV for industrial-grade ATS extraction, shortage occupation visa readiness scoring, and instant matching with 650+ verified sponsor employers across the UK, USA, Australia, and Canada.
          </p>
        </div>

        {/* Input Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm mb-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "upload"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Upload File (PDF / DOCX / TXT)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "paste"
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Paste Text
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline cursor-pointer"
              >
                Try With Sample Senior CV
              </button>
            </div>
          </div>

          {activeTab === "upload" ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-brand-50/20 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,text/plain,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-base font-bold text-slate-800">
                {fileName ? `Selected: ${fileName}` : "Click or Drag & Drop your Resume / CV here"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports modern compressed PDF, Word Documents (.docx), and plain text (.txt)
              </p>
              {selectedFile && (
                <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready for deep ATS & visa parsing ({Math.round(selectedFile.size / 1024)} KB)</span>
                </p>
              )}
            </div>
          ) : (
            <div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the full text of your resume or CV here (including summary, skills, experience, and education)..."
                rows={10}
                className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono leading-relaxed"
              />
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label htmlFor="countrySelect" className="text-xs font-semibold text-slate-600 shrink-0">
                Target Country:
              </label>
              <select
                id="countrySelect"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Global (All Countries)</option>
                <option value="GB">United Kingdom (UK)</option>
                <option value="US">United States (USA)</option>
                <option value="AU">Australia</option>
                <option value="CA">Canada</option>
                <option value="NZ">New Zealand</option>
              </select>
            </div>

            <button
              type="button"
              disabled={isAnalyzing || (!selectedFile && !resumeText.trim())}
              onClick={() => handleRunAnalysis()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting & Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Analyze CV & Match Jobs</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ── ANALYSIS RESULTS SECTION ── */}
        {analysis && (
          <div className="space-y-8 animate-fade-in">
            {/* Overall Score Dashboard */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5 mb-1">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                      {analysis.estimatedSeniority} Candidate Profile
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      {analysis.primaryDomain}
                    </span>
                    <span className="text-xs text-slate-500">
                      {analysis.wordCount} words analyzed
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                    ATS & Visa Sponsorship Scorecard
                  </h2>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={`w-24 h-24 rounded-3xl border-2 flex flex-col items-center justify-center font-extrabold shadow-sm ${getScoreColor(
                      analysis.overallScore
                    )}`}
                  >
                    <span className="text-3xl tracking-tight">{analysis.overallScore}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">/ 100</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {analysis.overallScore >= 80
                        ? "Excellent ATS & Visa Match"
                        : analysis.overallScore >= 65
                        ? "Good - Ready With Minor Tweaks"
                        : "Requires ATS Optimization"}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
                      Evaluated against Enterprise ATS systems (Workday, Greenhouse, Lever, Ashby) & Global Visa Shortage registries.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Sub-Pillar Score Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>ATS Format & Hierarchy</span>
                    <span className="text-brand-600 font-extrabold">{analysis.atsFormattingScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(analysis.atsFormattingScore)}`}
                      style={{ width: `${analysis.atsFormattingScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Standard sections, clear contact info, and readable parse tree.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Keyword Density</span>
                    <span className="text-brand-600 font-extrabold">{analysis.keywordDensityScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(analysis.keywordDensityScore)}`}
                      style={{ width: `${analysis.keywordDensityScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{analysis.detectedSkills.length} domain keywords detected.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Measurable Impact</span>
                    <span className="text-indigo-600 font-extrabold">{analysis.contentQualityScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(analysis.contentQualityScore)}`}
                      style={{ width: `${analysis.contentQualityScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Action verbs, numbers, percentages, and metrics.</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Visa Readiness</span>
                    <span className="text-emerald-600 font-extrabold">{analysis.visaReadinessScore}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(analysis.visaReadinessScore)}`}
                      style={{ width: `${analysis.visaReadinessScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Shortage list alignment & CoS feasibility.</p>
                </div>
              </div>
            </div>

            {/* ── GLOBAL VISA SPONSORSHIP ELIGIBILITY MATRIX (UNIQUE MOAT) ── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-lg sm:text-xl font-extrabold font-display">
                    International Visa Sponsorship Eligibility Matrix
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  Algorithmic Verification
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                    <span>🇬🇧 United Kingdom</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {analysis.visaEligibilityBreakdown.ukSkilledWorkerEligible ? "CoS Eligible (Skilled Worker)" : "Standard CoS Route"}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {analysis.visaEligibilityBreakdown.ukShortageOccupation}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <span>🇺🇸 United States</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    H-1B Specialty Occupation
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {analysis.visaEligibilityBreakdown.usH1BSuitability}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <span>🇨🇦 Canada</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    LMIA / Global Talent Stream
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {analysis.visaEligibilityBreakdown.canadaLMIAProfile}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <span>🇦🇺 Australia</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    TSS 482 / PR 186
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {analysis.visaEligibilityBreakdown.australiaTSS482Readiness}
                  </p>
                </div>
              </div>
            </div>

            {/* Strengths & Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Detected Profile Strengths</span>
                </div>
                <ul className="space-y-3">
                  {analysis.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Improvements */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-amber-700 font-bold text-base">
                  <TrendingUp className="w-5 h-5" />
                  <span>High-Priority ATS Fixes</span>
                </div>
                <ul className="space-y-3">
                  {analysis.improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── ATS STAR-FORMAT BULLET REWRITES (HIGH VALUE FEATURE) ── */}
            {analysis.suggestedBulletRewrites && analysis.suggestedBulletRewrites.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                    <Sparkles className="w-5 h-5 text-brand-600" />
                    <span>AI-Generated High-Impact Bullet Points (Copy & Paste Into Your CV)</span>
                  </div>
                  <span className="text-xs text-slate-500">STAR Methodology Optimized</span>
                </div>
                <div className="space-y-3">
                  {analysis.suggestedBulletRewrites.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 hover:bg-brand-50/30 border border-slate-200/80 flex items-center justify-between gap-4 transition-all"
                    >
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-mono">
                        • {bullet}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCopyBullet(bullet, idx)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
                      >
                        {copiedBulletIdx === idx ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Skills & Missing Keywords */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand-600" />
                  <span>Detected Technical Skills & Keywords ({analysis.detectedSkills.length})</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.detectedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {analysis.missingHighImpactKeywords.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Recommended Keywords to Add for Global Visa Sponsorship</span>
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Adding these industry-standard keywords will boost your match rate for sponsored roles in your field:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingHighImpactKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Job Recommendations */}
            <div className="space-y-5 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 font-display">
                    <Globe2 className="w-6 h-6 text-brand-600" />
                    <span>Top Visa Sponsorship Job Matches ({matches.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Direct vacancies matching your detected skillset with verified employer visa sponsorship.
                  </p>
                </div>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  <span>Explore all 650+ sponsor jobs</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.map((m, idx) => (
                    <div key={idx} className="relative group flex flex-col justify-between">
                      <div className="mb-2 flex items-center justify-between bg-brand-50/60 px-3 py-1.5 rounded-xl border border-brand-200/60 text-xs">
                        <span className="font-bold text-brand-900">
                          {m.matchScore}% Skill & Seniority Match
                        </span>
                        <span className="text-[11px] text-brand-700 font-medium truncate max-w-[200px]">
                          {m.matchingSkills.slice(0, 3).join(", ")}
                        </span>
                      </div>
                      <JobCard job={m.job} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
                  <p className="text-sm text-slate-600">No exact matches found for this specific keyword combination.</p>
                  <Link
                    href="/jobs"
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold inline-block"
                  >
                    Browse All Visa Sponsored Jobs
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
