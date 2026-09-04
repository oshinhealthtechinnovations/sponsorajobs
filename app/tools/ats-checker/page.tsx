"use client";

import React, { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToolAuthGuard } from "@/components/ToolAuthGuard";
import { JobCard } from "@/components/JobCard";
import { useSession } from "@/hooks/useSession";
import {
  FullATSIntelligenceResult,
  ATSJobMatch,
} from "@/lib/services/atsScanner";
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
  HelpCircle,
  ExternalLink,
  Target,
  FileCheck2,
  AlertCircle,
  Layers,
  Crown,
  Eye,
  FileSearch,
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
  const { user, isLoggedIn, isPro, isLoading: isSessionLoading } = useSession();

  const [resumeText, setResumeText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetCountry, setTargetCountry] = useState("GB");
  const [targetJobId, setTargetJobId] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [intelligence, setIntelligence] = useState<FullATSIntelligenceResult | null>(null);
  const [matches, setMatches] = useState<ATSJobMatch[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const SCAN_STEPS = [
    "Decompressing & extracting text streams...",
    "Validating document hierarchy & contact metadata...",
    "Cross-referencing 250+ canonical technical skills...",
    "Matching official UK SOC 2020 & global occupation codes...",
    "Auditing salary thresholds against 650+ verified sponsor licenses...",
  ];

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);
    setError(null);
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile && (!resumeText || resumeText.trim().length < 15)) {
      setError("Please select a file or paste your resume text (at least 15 characters).");
      return;
    }

    setIsAnalyzing(true);
    setScanStep(0);
    setError(null);

    const stepTimer = setInterval(() => {
      setScanStep((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 400);

    try {
      const formData = new FormData();
      if (selectedFile && activeTab === "upload") {
        formData.append("file", selectedFile);
      } else {
        formData.append("text", resumeText.trim());
      }
      formData.append("country", targetCountry);
      if (targetJobId) {
        formData.append("jobId", targetJobId);
      }

      const res = await fetch("/api/tools/ats-parse", {
        method: "POST",
        body: formData,
      });

      const rawText = await res.text();
      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Unable to read document response. Please upload a standard PDF, DOCX, or paste the CV text directly.");
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze resume.");
      }

      setIntelligence(data.intelligence);
      setMatches(data.matches || []);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      clearInterval(stepTimer);
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

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: "Strong Match", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (score >= 65) return { label: "Good Match — Ready with Minor Tweaks", color: "text-brand-700 bg-brand-50 border-brand-200" };
    if (score >= 50) return { label: "Moderate — Needs Optimization", color: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "Action Required Before Applying", color: "text-rose-700 bg-rose-50 border-rose-200" };
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
            <span>Visa-Aware ATS & Sponsorship Intelligence Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            ATS Compatibility & <span className="text-brand-600">Visa Sponsorship Scorer</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Upload your CV to run deterministic document parsing, UK SOC 2020 occupation code mapping, and sponsorship readiness evaluated against 650+ verified employer visa licenses.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: UNRESTRICTED CV UPLOAD & PARSER WORKSPACE
        ═══════════════════════════════════════════════════════════════ */}
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
                Try With Sample Senior Engineer CV
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
                  <span>Document loaded for multi-pillar analysis ({Math.round(selectedFile.size / 1024)} KB)</span>
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

          {/* Target Country & Action Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label htmlFor="countrySelect" className="block text-xs font-bold text-slate-700">
                Target Sponsorship Jurisdiction:
              </label>
              <select
                id="countrySelect"
                value={targetCountry}
                onChange={(e) => setTargetCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="GB">🇬🇧 United Kingdom (Skilled Worker & CoS)</option>
                <option value="US">🇺🇸 United States (H-1B & Specialty Occupation)</option>
                <option value="AU">🇦🇺 Australia (TSS 482 / PR 186)</option>
                <option value="CA">🇨🇦 Canada (Global Talent Stream / LMIA)</option>
                <option value="NZ">🇳🇿 New Zealand (Accredited Employer Work Visa)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                disabled={isAnalyzing || (!selectedFile && !resumeText.trim())}
                onClick={handleRunAnalysis}
                className="w-full px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing ATS & Sponsorship Readiness...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Run Deep CV & Visa Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real-time Multi-Stage Scanning Animation */}
          {isAnalyzing && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-brand-400 flex items-center gap-2">
                  <FileSearch className="w-4 h-4 animate-pulse" />
                  <span>Step {scanStep + 1} of {SCAN_STEPS.length}</span>
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{Math.round(((scanStep + 1) / SCAN_STEPS.length) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${((scanStep + 1) / SCAN_STEPS.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-300 font-mono">
                &gt; {SCAN_STEPS[scanStep]}
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 2: ATS SCORECARD & RESULTS DASHBOARD (WITH PREMIUM LOCK)
        ═══════════════════════════════════════════════════════════════ */}
        <div ref={resultsRef}>
          {intelligence && (
            <div className="space-y-10 animate-fade-in">

              {/* ── TEASER SNEAK-PEEK / LAYER 1: CANDIDATE PROFILE & SCORE ── */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                        {intelligence.profile.seniority} Candidate Profile
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {intelligence.sponsorshipDiagnostics.occupationRule.domain}
                      </span>
                      <span className="text-xs text-slate-500">
                        {intelligence.wordCount} words extracted
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                      SponsorAJobs Candidate Intelligence
                    </h2>
                    <div className="inline-flex items-center gap-2 pt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadge(intelligence.overallScore).color}`}>
                        {getScoreBadge(intelligence.overallScore).label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-3xl border-2 border-brand-200 bg-brand-50 text-brand-700 flex flex-col items-center justify-center font-extrabold shadow-sm">
                      <span className="text-3xl tracking-tight">{intelligence.overallScore}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">/ 100</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        Overall SponsorJob Match
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 max-w-xs leading-relaxed">
                        Weighted composite of CV structure, machine parseability, technical keywords, and verified immigration criteria.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4 Distinct Score Pillar Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Score 1: CV Quality */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>1. CV Quality</span>
                      <span className="text-slate-900 font-extrabold">{intelligence.cvQualityScore}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(intelligence.cvQualityScore)}`}
                        style={{ width: `${intelligence.cvQualityScore}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">Structure, hierarchy, contact info, and chronological dates.</p>
                  </div>

                  {/* Score 2: ATS Compatibility */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>2. ATS Compatibility</span>
                      <span className="text-brand-600 font-extrabold">{intelligence.atsDiagnostics.score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(intelligence.atsDiagnostics.score)}`}
                        style={{ width: `${intelligence.atsDiagnostics.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">Machine parseability ({intelligence.atsDiagnostics.parsingRisk} Parsing Risk).</p>
                  </div>

                  {/* Score 3: Job Match */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>3. Job Match</span>
                      <span className="text-indigo-600 font-extrabold">{isPro ? `${intelligence.jobMatchDiagnostics.score}%` : "Locked 🔒"}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(intelligence.jobMatchDiagnostics.score)}`}
                        style={{ width: isPro ? `${intelligence.jobMatchDiagnostics.score}%` : "60%" }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isPro ? `${intelligence.jobMatchDiagnostics.exactMatches.length} technical skills aligned.` : "Detailed keyword parity analysis."}
                    </p>
                  </div>

                  {/* Score 4: Sponsorship Readiness */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>4. Sponsorship Readiness</span>
                      <span className="text-emerald-600 font-extrabold">{isPro ? `${intelligence.sponsorshipDiagnostics.score}%` : "Locked 🔒"}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(intelligence.sponsorshipDiagnostics.score)}`}
                        style={{ width: isPro ? `${intelligence.sponsorshipDiagnostics.score}%` : "80%" }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isPro ? `SOC Code ${intelligence.sponsorshipDiagnostics.occupationRule.socCode} eligibility.` : "Official immigration statutory eligibility."}
                    </p>
                  </div>
                </div>

                {/* Free Teaser Sneak-Peek Signals (Revealed to everyone) */}
                {!isPro && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Free Diagnostic Sneak Peek (2 Signals Detected)</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {intelligence.strongSignals.slice(0, 2).map((sig, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{sig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* ── CONDITIONAL RENDER: PRO RESULTS VS LOCKED PAYWALL ── */}
              {isPro ? (
                /* ══════════════════════════════════════════════════════════
                    FULL UNBLURRED REPORT (PRO USERS)
                ══════════════════════════════════════════════════════════ */
                <div className="space-y-10">
                  {/* ── LAYER 2: WHY? STRONGEST SIGNALS & POTENTIAL RISKS ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strong Signals */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-base">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Your Strongest Signals</span>
                      </div>
                      <ul className="space-y-3">
                        {intelligence.strongSignals.map((sig, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                            <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                            <span>{sig}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Potential Problems */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-2.5 text-amber-700 font-bold text-base">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <span>Potential Problems & Opportunities</span>
                      </div>
                      <ul className="space-y-3">
                        {intelligence.potentialRisks.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                            <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                              <ArrowRight className="w-2.5 h-2.5" />
                            </span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* ── LAYER 3: SPONSORSHIP FIT & IMMIGRATION OCCUPATION MAPPING (SIGNATURE MOAT) ── */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        <div>
                          <h3 className="text-lg sm:text-xl font-extrabold font-display">
                            Sponsorship Fit & Official Immigration Route Analysis
                          </h3>
                          <p className="text-xs text-slate-400">
                            Evaluated against published government salary baselines and Standard Occupational Classification.
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                        <span>Last Verified:</span>
                        <strong className="text-white">{intelligence.sponsorshipDiagnostics.lastVerified}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">Target Route</span>
                        <div className="text-sm font-bold text-white">
                          {intelligence.sponsorshipDiagnostics.route} ({intelligence.sponsorshipDiagnostics.targetCountry})
                        </div>
                        <p className="text-xs text-slate-400">
                          {intelligence.sponsorshipDiagnostics.eligibilitySignal}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Occupation Classification</span>
                        <div className="text-sm font-bold text-white">
                          SOC Code {intelligence.sponsorshipDiagnostics.occupationRule.socCode}
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {intelligence.sponsorshipDiagnostics.occupationRule.title}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Salary & Shortage Status</span>
                        <div className="text-sm font-bold text-white">
                          £38,700 Baseline (Going Rate Eligible)
                        </div>
                        <p className="text-xs text-slate-400">
                          {intelligence.sponsorshipDiagnostics.occupationRule.ukEligibility.isOnShortageOrISL ? "Listed on Immigration Salary List (ISL)" : "Standard Threshold Required"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                        <span>Evidence & Authoritative Guidance:</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-400">
                        {intelligence.sponsorshipDiagnostics.evidence.map((ev, idx) => (
                          <li key={idx}>• {ev}</li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-slate-500 pt-1 italic">
                        * {intelligence.sponsorshipDiagnostics.disclaimer}
                      </p>
                    </div>
                  </div>

                  {/* ── LAYER 4: TARGET ROLE & KEYWORD MATCH (EXACT VS MISSING) ── */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-brand-600" />
                        <span>Target Role Keyword Alignment ({intelligence.jobMatchDiagnostics.exactMatches.length} Core Matches)</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {intelligence.jobMatchDiagnostics.exactMatches.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200 flex items-center gap-1.5"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>{skill}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {intelligence.jobMatchDiagnostics.missingCriticalRequirements.length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span>Missing Critical Must-Have Requirements</span>
                        </h3>
                        <p className="text-xs text-slate-500 mb-3">
                          These critical technologies are commonly required by sponsoring employers for this role. If you have genuine experience with them, add them to your CV:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {intelligence.jobMatchDiagnostics.missingCriticalRequirements.map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200"
                            >
                              + {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── LAYER 5: ACTION PLAN & COPYABLE STAR BULLET REWRITES ── */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-5 h-5 text-brand-600" />
                        <h3 className="text-lg font-bold text-slate-900">
                          Fix My CV — Concrete Action Plan
                        </h3>
                      </div>
                      <span className="text-xs text-slate-500 font-semibold">Priority Fixes Before Applying</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {intelligence.actionPlan.map((action, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-100 text-brand-800">
                              {action.category}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{action.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{action.description}</p>
                          {action.suggestedFix && (
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800">
                              {action.suggestedFix}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Ready-to-Copy STAR Bullet Points */}
                    {intelligence.suggestedStarBullets && intelligence.suggestedStarBullets.length > 0 && (
                      <div className="pt-6 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                            <Sparkles className="w-4 h-4 text-brand-600" />
                            <span>Recommended High-Impact Bullet Points (STAR Format)</span>
                          </div>
                          <span className="text-xs text-slate-500">Copy & Paste Directly Into Your CV</span>
                        </div>

                        <div className="space-y-3">
                          {intelligence.suggestedStarBullets.map((bullet, idx) => (
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
                  </div>

                  {/* ── LIVE VERIFIED VISA SPONSORED JOB MATCHES ── */}
                  <div className="space-y-5 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 font-display">
                          <Globe2 className="w-6 h-6 text-brand-600" />
                          <span>Live Visa Sponsorship Jobs Matching Your Profile ({matches.length})</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Direct vacancies from licensed employers matching your detected skillset and experience level.
                        </p>
                      </div>
                      <Link
                        href="/jobs"
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                      >
                        <span>Browse all 650+ sponsor jobs</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {matches.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matches.map((m, idx) => (
                          <div key={idx} className="relative group flex flex-col justify-between">
                            <div className="mb-2 flex items-center justify-between bg-brand-50/60 px-3 py-1.5 rounded-xl border border-brand-200/60 text-xs">
                              <span className="font-bold text-brand-900">
                                {m.matchScore}% Compatibility Match
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
              ) : (
                /* ══════════════════════════════════════════════════════════
                    LOCKED PAYWALL GATEWAY (NON-PRO / GUEST USERS)
                ══════════════════════════════════════════════════════════ */
                <div className="relative pt-2">
                  {/* Frosted Glass Blurred Preview of Detailed Diagnostic Layers */}
                  <div className="space-y-8 filter blur-md select-none pointer-events-none opacity-40">
                    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 h-64" />
                    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white h-64" />
                    <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 h-64" />
                  </div>

                  {/* Centered High-Converting Paywall Gate */}
                  <div className="relative -mt-[580px] z-20 max-w-3xl mx-auto">
                    <ToolAuthGuard
                      toolName="Full ATS Scorecard & Visa Diagnostics"
                      toolDescription="Unlock your complete UK SOC 2020 occupation salary assessment, full missing keyword list, ready-to-copy STAR bullet rewrites, and 650+ verified sponsor job matches."
                      requiresPro={true}
                      featurePills={[
                        "UK SOC 2020 & ISL Salary Threshold Verification",
                        "100% Full Missing Keyword Breakdown",
                        "Pre-Engineered STAR Bullet Point Rewrites",
                        "650+ Live Verified Visa Sponsor Job Matches",
                      ]}
                    >
                      <div />
                    </ToolAuthGuard>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
