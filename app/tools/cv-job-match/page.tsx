"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Briefcase,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Bookmark,
  ExternalLink,
  Zap,
  Info,
  RefreshCw,
  Search,
  Bell,
  Wand2,
} from "lucide-react";
import { RecommendationResultItem, CandidateMatchingPreferences } from "@/lib/services/cvJobMatchEngine";

const SAMPLE_RESUME_TEXT = `
Alex Rivera
Senior Full Stack Engineer
London, UK | alex.rivera@example.com | linkedin.com/in/alexrivera-tech | github.com/alexrivera-dev

SUMMARY
Senior Software Engineer with 6+ years of experience architecting distributed cloud applications and scalable APIs in TypeScript, Node.js, and AWS.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
Frameworks: React, Next.js, Node.js, Express, Tailwind CSS
Cloud & DevOps: AWS (EC2, S3, Lambda, ECS), Docker, Kubernetes, CI/CD, Git
Databases: PostgreSQL, Redis, MongoDB

PROFESSIONAL EXPERIENCE
Senior Full Stack Engineer | FinTech Innovations Ltd | London, UK (2022 - Present)
• Architected high-throughput payment microservices in TypeScript and Node.js serving 500k+ active users with 99.99% uptime.
• Reduced database query latency by 45% by optimizing PostgreSQL indexing and introducing Redis caching.
• Mentored 4 engineers and spearheaded cloud migration to Docker containers on AWS.

Full Stack Developer | GrowthTech Digital | London, UK (2019 - 2022)
• Developed responsive SaaS web applications using React, Next.js, and Node.js.
• Built RESTful and GraphQL APIs integrated with third-party banking providers.

EDUCATION
Bachelor of Science (BSc) in Computer Science | University of Manchester
`;

export default function CVJobMatchPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [targetCountry, setTargetCountry] = useState("GB");
  const [sponsorshipPref, setSponsorshipPref] = useState<"required" | "preferred" | "any">("required");
  const [workArrangement, setWorkArrangement] = useState<"any" | "remote" | "hybrid" | "onsite">("any");

  // State for Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [profile, setProfile] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResultItem[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Filter state in results view
  const [filterCountry, setFilterCountry] = useState("ALL");
  const [filterMinScore, setFilterMinScore] = useState(60);
  const [filterSponsorshipOnly, setFilterSponsorshipOnly] = useState(false);

  // Shortlist Modal State
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [shortlistEmail, setShortlistEmail] = useState("");
  const [shortlistSubscribed, setShortlistSubscribed] = useState(false);

  const processingStepsText = [
    "Reading and decoding CV document...",
    "Extracting experience chronology & seniority...",
    "Mapping technical skills against ESCO taxonomy...",
    "Classifying UK SOC 2020 occupation code...",
    "Querying live database & computing 2-stage match scores...",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleFindJobs = async () => {
    if (activeTab === "upload" && !selectedFile) {
      setError("Please select a CV document (.pdf, .docx, or .txt) to upload.");
      return;
    }
    if (activeTab === "paste" && resumeText.trim().length < 50) {
      setError("Please paste a comprehensive CV (at least 50 words) to enable accurate matching.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);
    setError(null);

    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 450);

    try {
      const formData = new FormData();
      if (activeTab === "upload" && selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("text", resumeText.trim());
      }
      formData.append("country", targetCountry);
      formData.append("sponsorship", sponsorshipPref);
      formData.append("workArrangement", workArrangement);

      const res = await fetch("/api/cv-job-match", {
        method: "POST",
        body: formData,
      });

      const raw = await res.text();
      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error("Unable to parse match results. Please ensure you are uploading a valid PDF, DOCX, or text resume.");
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to find matching jobs.");
      }

      clearInterval(stepInterval);
      setProcessingStep(4);
      setProfile(data.profile);
      setRecommendations(data.results || []);
      setTotalMatches(data.total_matches || 0);

      if (data.results && data.results.length > 0) {
        setExpandedJobId(data.results[0].job.id);
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || "An unexpected error occurred during matching.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleSave = (jobId: string) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

  const handleShortlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortlistEmail || !shortlistEmail.includes("@")) return;

    try {
      await fetch("/api/shortlist/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: shortlistEmail,
          targetCountry: targetCountry,
          targetRole: profile?.primary_occupation || "Software Engineer",
          sponsorshipPreference: sponsorshipPref,
          skillsSnapshot: profile?.top_skills || [],
        }),
      });
      setShortlistSubscribed(true);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredResults = recommendations.filter((r) => {
    if (filterCountry !== "ALL" && r.job.location.country !== filterCountry) return false;
    if (r.sponsorJobMatchScore < filterMinScore) return false;
    if (filterSponsorshipOnly && r.sponsorshipStatus !== "CONFIRMED" && r.sponsorshipStatus !== "LIKELY") return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Hero */}
        {!profile && (
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/70 border border-brand-200 text-brand-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Deterministic CV-to-Job Recommendation Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              Discover Jobs Matched to Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">CV & Visa Preferences</span>
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Upload your CV to automatically filter and rank 650+ verified sponsor jobs by technical skills, experience alignment, SOC 2020 codes, and visa sponsorship status.
            </p>
          </div>
        )}

        {/* Input Screen (When not analyzed yet) */}
        {!profile && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-colors ${
                  activeTab === "upload"
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Upload CV (PDF / DOCX / TXT)
              </button>
              <button
                onClick={() => setActiveTab("paste")}
                className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-colors ${
                  activeTab === "paste"
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Paste Text
              </button>
            </div>

            {/* Dropzone */}
            {activeTab === "upload" ? (
              <label className="border-2 border-dashed border-slate-300 hover:border-brand-500 bg-slate-50/50 hover:bg-brand-50/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-brand-100/70 text-brand-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedFile ? selectedFile.name : "Click to browse or drop your CV here"}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Supports modern PDF, Word (.docx), or plain text (.txt)
                </div>
              </label>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your full CV text here..."
                  className="w-full h-44 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => setResumeText(SAMPLE_RESUME_TEXT)}
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Load Sample Senior Engineer CV
                  </button>
                </div>
              </div>
            )}

            {/* Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Country</label>
                <select
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">🌍 Global (All Countries)</option>
                  <option value="GB">🇬🇧 United Kingdom (Skilled Worker & CoS)</option>
                  <option value="US">🇺🇸 United States (H-1B Specialty Occupation)</option>
                  <option value="CA">🇨🇦 Canada (Global Talent Stream)</option>
                  <option value="AU">🇦🇺 Australia (TSS 482 / PR 186)</option>
                  <option value="DE">🇩🇪 Germany (EU Blue Card)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Visa Sponsorship Preference</label>
                <select
                  value={sponsorshipPref}
                  onChange={(e) => setSponsorshipPref(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-brand-500"
                >
                  <option value="required">🛂 Sponsorship Required (Prioritize Confirmed)</option>
                  <option value="preferred">⭐ Sponsorship Preferred (Ranking Boost)</option>
                  <option value="any">🌐 Any Opportunity</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleFindJobs}
              disabled={isProcessing}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{processingStepsText[processingStep]}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Find My Matched Jobs</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* RESULTS VIEW */}
        {profile && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Bar Candidate Profile Pill Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-black text-xs uppercase tracking-wider border border-brand-200">
                      {profile.primary_occupation}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                      {profile.experience_years}+ Years Exp
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                      SOC Code {profile.primary_soc_code}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
                      🛂 {profile.sponsorship_preference === "required" ? "Sponsorship Required" : "Sponsorship Preferred"}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    🎯 Jobs Matched to Your CV Profile
                  </h2>
                  <p className="text-xs text-slate-500">
                    Showing <span className="font-bold text-slate-900">{filteredResults.length}</span> ranked opportunities across verified databases.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setProfile(null);
                      setRecommendations([]);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Upload Another CV
                  </button>
                  <button
                    onClick={() => setShowShortlistModal(true)}
                    className="px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Get Match Alerts</span>
                  </button>
                </div>
              </div>

              {/* Detected Skills Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 mr-1">Extracted Core Skills:</span>
                {profile.top_skills.map((skill: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs uppercase">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Dynamic Filter Controls */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                  <span>Refine Results:</span>
                </div>

                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="ALL">All Countries</option>
                  <option value="GB">🇬🇧 United Kingdom</option>
                  <option value="US">🇺🇸 United States</option>
                  <option value="CA">🇨🇦 Canada</option>
                  <option value="AU">🇦🇺 Australia</option>
                  <option value="DE">🇩🇪 Germany</option>
                </select>

                <select
                  value={filterMinScore}
                  onChange={(e) => setFilterMinScore(Number(e.target.value))}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value={80}>⭐ 80%+ Strong Matches Only</option>
                  <option value={70}>70%+ Good Matches</option>
                  <option value={60}>60%+ All Potential Matches</option>
                </select>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={filterSponsorshipOnly}
                    onChange={(e) => setFilterSponsorshipOnly(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Confirmed Sponsorship Only</span>
                </label>
              </div>

              <div className="text-xs text-slate-500">
                Algorithm: <span className="font-mono text-slate-700">cv-match-v1.0</span>
              </div>
            </div>

            {/* Recommendation Cards Stream */}
            <div className="space-y-5">
              {filteredResults.map((rec, index) => {
                const isExpanded = expandedJobId === rec.job.id;
                const isSaved = savedJobIds.has(rec.job.id);
                const isTopMatch = index === 0 && rec.sponsorJobMatchScore >= 85;

                return (
                  <div
                    key={rec.job.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                      isTopMatch
                        ? "border-brand-500/80 shadow-md ring-1 ring-brand-500/20"
                        : "border-slate-200/80 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    {/* Top Match Banner */}
                    {isTopMatch && (
                      <div className="bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-1.5 text-white text-xs font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>TOP COMPATIBILITY MATCH FOR YOUR CV</span>
                        </span>
                        <span>Ranking #1</span>
                      </div>
                    )}

                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Main Job Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-500 text-xs">{rec.job.company.name}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{rec.job.location.formatted}</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Briefcase className="w-3 h-3 text-slate-400" />
                              <span>{rec.job.employmentType}</span>
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 hover:text-brand-600 transition-colors">
                            <Link href={`/jobs/${rec.job.slug || rec.job.id}`}>
                              {rec.job.title}
                            </Link>
                          </h3>

                          {/* Sponsorship Signal Pill */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              rec.sponsorshipStatus === "CONFIRMED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : rec.sponsorshipStatus === "LIKELY"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{rec.sponsorshipStatus === "CONFIRMED" ? "Sponsorship Confirmed" : rec.sponsorshipStatus === "LIKELY" ? "Sponsorship Likely" : "Requires Verification"}</span>
                            </span>

                            {((rec.job as any).salaryFormatted || (rec.job.salary ? `${rec.job.salary.currency || "£"}${rec.job.salary.min?.toLocaleString() || ""}` : null)) && (
                              <span className="font-bold text-xs text-slate-800 px-2 py-0.5 bg-slate-100 rounded">
                                {(rec.job as any).salaryFormatted || `${rec.job.salary?.currency || "£"}${rec.job.salary?.min?.toLocaleString()}`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Match Scores Column */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <div className="text-right">
                            <div className="text-2xl sm:text-3xl font-black text-brand-600 tracking-tight">
                              {rec.sponsorJobMatchScore}%
                            </div>
                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                              SponsorJob Match
                            </div>
                          </div>

                          <div className="text-xs font-medium text-slate-400">
                            Pure Match: <span className="font-bold text-slate-700">{rec.jobMatchScore}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Component Pillar Breakdown Pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                        <div className="p-2 rounded-lg bg-slate-50">
                          <div className="text-slate-400 text-[11px]">Skills Fit</div>
                          <div className="font-bold text-slate-800">{rec.skillMatchScore}%</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50">
                          <div className="text-slate-400 text-[11px]">Experience</div>
                          <div className="font-bold text-slate-800">{rec.experienceMatchScore}%</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50">
                          <div className="text-slate-400 text-[11px]">Occupation</div>
                          <div className="font-bold text-slate-800">{rec.occupationMatchScore}%</div>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50">
                          <div className="text-slate-400 text-[11px]">Sponsorship</div>
                          <div className="font-bold text-slate-800">{rec.sponsorshipScore}%</div>
                        </div>
                      </div>

                      {/* Skill Requirement Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {rec.matchedSkills.map((s, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{s}</span>
                          </span>
                        ))}
                        {rec.missingSkills.map((s, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>{s} (Missing)</span>
                          </span>
                        ))}
                      </div>

                      {/* Expandable "Why This Matches You" Section */}
                      {isExpanded && (
                        <div className="pt-4 border-t border-slate-100 space-y-4 text-xs animate-fade-in">
                          <div>
                            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                              <Info className="w-4 h-4 text-brand-600" />
                              <span>Why this job matches you:</span>
                            </h4>
                            <ul className="space-y-1.5 text-slate-700">
                              {rec.reasons.map((r, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Skill Gap Breakdown */}
                          <div>
                            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                              <Zap className="w-4 h-4 text-amber-500" />
                              <span>Skills Employers Want for This Role:</span>
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {rec.skillGapBreakdown.map((item, idx) => (
                                <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                                  <span className="font-semibold text-slate-800 capitalize">{item.skill}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    item.status === "STRONG" ? "bg-emerald-100 text-emerald-800" :
                                    item.status === "MODERATE" ? "bg-blue-100 text-blue-800" :
                                    "bg-rose-100 text-rose-800"
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => setExpandedJobId(isExpanded ? null : rec.job.id)}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                        >
                          <span>{isExpanded ? "Hide Match Details" : "Why This Matches You"}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Link
                            href={`/tools/ats-checker?targetRole=${encodeURIComponent(rec.job.title)}&jobId=${rec.job.id}`}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Improve My CV For This Job</span>
                          </Link>

                          <button
                            onClick={() => handleToggleSave(rec.job.id)}
                            className={`p-2 rounded-lg border text-xs font-semibold transition-colors ${
                              isSaved ? "bg-brand-50 border-brand-200 text-brand-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                            title="Save Job"
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                          </button>

                          <a
                            href={rec.job.applyUrl || (rec.job as any).jobUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                          >
                            <span>Apply Directly</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* No Matches Found State */}
              {filteredResults.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                    <Search className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    We couldn't find a strong enough match based on your current filters
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try broadening your country preference or lowering the minimum match score threshold. Alternatively, get notified when matching sponsor opportunities are added.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setFilterCountry("ALL");
                        setFilterMinScore(60);
                        setFilterSponsorshipOnly(false);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold"
                    >
                      Broaden My Search
                    </button>
                    <button
                      onClick={() => setShowShortlistModal(true)}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Get My Shortlist</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shortlist Email Modal */}
        {showShortlistModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Don't Miss Your Match</h3>
                </div>
                <button
                  onClick={() => setShowShortlistModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {!shortlistSubscribed ? (
                <form onSubmit={handleShortlistSubmit} className="space-y-4 text-xs">
                  <p className="text-slate-600">
                    We continuously ingest new visa-sponsored job openings. Subscribe to get an automated shortlist sent to your inbox when a job matching your profile is detected.
                  </p>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Your Email Address</label>
                    <input
                      type="email"
                      required
                      value={shortlistEmail}
                      onChange={(e) => setShortlistEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold shadow-md shadow-brand-500/20"
                  >
                    Subscribe to My Match Shortlist
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">You're on the Shortlist!</h4>
                  <p className="text-xs text-slate-500">
                    We have registered your candidate profile. When matching sponsor opportunities are added, you will receive a notification.
                  </p>
                  <button
                    onClick={() => setShowShortlistModal(false)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold mt-2"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
