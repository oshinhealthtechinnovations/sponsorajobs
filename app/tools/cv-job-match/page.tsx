"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { ToolAuthGuard } from "@/components/ToolAuthGuard";
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
  Cpu,
  Layers,
  Award,
  BarChart3,
  Flame,
  Check,
  Plus,
} from "lucide-react";
import { RecommendationResultItem, CandidateMatchingPreferences } from "@/lib/services/cvJobMatchEngine";
import { useSession } from "@/hooks/useSession";
import { JobApplyButton } from "@/components/JobApplyButton";

const SAMPLE_PRESETS = [
  {
    id: "fullstack",
    label: "💻 Senior Full Stack Engineer (6+ Yrs)",
    role: "Senior Full Stack Engineer",
    text: `Alex Rivera
Senior Full Stack Engineer | London, UK | alex.rivera@example.com | linkedin.com/in/alexrivera-tech | github.com/alexrivera-dev

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
Bachelor of Science (BSc) in Computer Science | University of Manchester`,
  },
  {
    id: "data_ai",
    label: "🧠 Data Scientist & ML Lead (5+ Yrs)",
    role: "Senior Data Scientist",
    text: `Dr. Elena Vance
Senior Data Scientist & Machine Learning Lead | elena.vance@example.com | London, UK

SUMMARY
Data Scientist with 5+ years of production ML experience building predictive models, NLP pipelines, and real-time recommendation engines in Python, PyTorch, and AWS.

TECHNICAL SKILLS
Languages: Python, SQL, R, Scala, C++
Machine Learning: PyTorch, TensorFlow, Scikit-Learn, XGBoost, HuggingFace, NLP
Data Engineering: Spark, Pandas, Airflow, Snowflake, PostgreSQL, BigQuery
Cloud: AWS (SageMaker, S3, Redshift), Docker, MLflow, CI/CD

EXPERIENCE
Lead Machine Learning Engineer | BioTech Analytics Corp (2022 - Present)
• Led end-to-end deployment of deep learning NLP models processing 2M+ medical records with 94.2% precision.
• Optimized distributed PyTorch inference pipelines, cutting cloud compute costs by $120k annually.

Data Scientist | FinMetrics Global (2019 - 2022)
• Developed fraud detection classifier in Python and XGBoost identifying 98.6% of suspicious transactions.

EDUCATION
PhD in Computational Statistics & Machine Learning | Imperial College London`,
  },
  {
    id: "devops",
    label: "☁️ Cloud & DevOps Architect (8+ Yrs)",
    role: "Principal Cloud Architect",
    text: `Marcus Chen
Principal Cloud & DevOps Architect | marcus.chen@example.com | Manchester, UK

SUMMARY
Cloud Infrastructure Architect with 8+ years of enterprise experience designing fault-tolerant AWS/Azure architectures, Kubernetes orchestration, and GitOps automation.

TECHNICAL SKILLS
Cloud: AWS, Microsoft Azure, Google Cloud Platform (GCP)
DevOps & IaC: Terraform, Ansible, Docker, Kubernetes (K8s), Helm, ArgoCD, GitHub Actions
Monitoring: Prometheus, Grafana, Datadog, ELK Stack
Languages: Go, Python, Bash, Shell scripting

EXPERIENCE
Principal DevOps Architect | Enterprise Cloud Systems (2021 - Present)
• Orchestrated zero-downtime migration of 140+ microservices to multi-region Kubernetes clusters on AWS.
• Standardized infrastructure-as-code across 12 teams using Terraform and GitOps.

Senior Infrastructure Engineer | ScaleTech Europe (2017 - 2021)
• Automated CI/CD pipelines reducing deployment cycle times from 4 hours to 8 minutes.

EDUCATION
BSc in Computer Systems & Networking | University of Edinburgh`,
  },
];

export default function CVJobMatchPage() {
  const { isLoggedIn } = useSession();
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

  // Interactive "What If" Skill Simulator
  const [simulatedSkills, setSimulatedSkills] = useState<Set<string>>(new Set());

  // Filter state in results view
  const [filterCountry, setFilterCountry] = useState("ALL");
  const [filterMinScore, setFilterMinScore] = useState(55);
  const [filterSponsorshipOnly, setFilterSponsorshipOnly] = useState(false);

  // Shortlist Modal State
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [shortlistEmail, setShortlistEmail] = useState("");
  const [shortlistSubscribed, setShortlistSubscribed] = useState(false);
  const [minMatchThreshold, setMinMatchThreshold] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Initialize saved jobs from localStorage
  useEffect(() => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      setSavedJobIds(new Set(saved));
    } catch {}
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      if (!validTypes.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) {
        setError("Invalid file format. Please upload a PDF (.pdf), Word Document (.docx), or Plain Text (.txt) file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit. Please upload a smaller document.");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setActiveTab("paste");
    setResumeText(preset.text);
    setError(null);
  };

  const processingStepsText = [
    "Decompressing & reading PDF text streams (zlib)...",
    "Extracting experience chronology & seniority...",
    "Cross-referencing 250+ canonical ESCO skills...",
    "Classifying UK SOC 2020 & O*NET occupation codes...",
    "Executing 2-stage ranking across 650+ verified sponsor jobs...",
  ];

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

  const handleToggleSimulatedSkill = (skill: string) => {
    setSimulatedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });
  };

  const handleToggleSave = (e: React.MouseEvent, jobId: string, applyUrl?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("open-auth-gate", {
          detail: { defaultTab: "register", redirectUrl: applyUrl },
        })
      );
      return;
    }

    try {
      const saved: string[] = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      let updated: string[];
      if (saved.includes(jobId)) {
        updated = saved.filter((id) => id !== jobId);
      } else {
        updated = [...saved, jobId];
      }
      localStorage.setItem("sa_saved_jobs", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch {}

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
    // Calculate simulated boost if user toggled missing skills
    let effectiveScore = r.sponsorJobMatchScore;
    if (simulatedSkills.size > 0) {
      const simulatedCount = r.missingSkills.filter((s) => simulatedSkills.has(s)).length;
      effectiveScore = Math.min(99, effectiveScore + simulatedCount * 5);
    }
    if (effectiveScore < filterMinScore) return false;
    if (filterSponsorshipOnly && r.sponsorshipStatus !== "CONFIRMED" && r.sponsorshipStatus !== "LIKELY") return false;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* ── Background Glowing Mesh & Luminous Orbs ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-brand-600/20 via-indigo-600/20 to-cyan-500/15 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulseGlow" />
      <div className="absolute top-96 right-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 z-10">
        {/* ── Hero Header ── */}
        {!profile && (
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
            {/* Live Ticker Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 shadow-lg text-slate-300 text-xs font-semibold backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="font-bold text-white">658 Verified Visa Sponsors Indexed</span>
              <span className="text-slate-500">•</span>
              <span>Deterministic SOC 2020 Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
              Discover Jobs Matched to Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-brand-400 to-indigo-400">
                CV &amp; Visa Preferences
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
              Upload your CV to automatically filter and rank 650+ verified sponsor jobs by technical skills, experience alignment, SOC 2020 occupation codes, and visa sponsorship status.
            </p>

            {/* 1-Click Quick Demo Presets */}
            <div className="pt-2 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Or Test Instantly with Sample Profiles:</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {SAMPLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Auth Gated Tool Workspace */}
        <ToolAuthGuard
          toolName="CV & Resume Job Matcher"
          toolDescription="Upload your CV to automatically filter and rank 650+ verified sponsor jobs by technical skills, experience alignment, SOC 2020 occupation codes, and visa sponsorship status."
          requiresPro={true}
          featurePills={[
            "Direct PDF & DOCX Resume Parsing",
            "Multi-Attribute Sponsorship Scorer",
            "Missing Skill Gap Analysis",
            "Auto-Saved Candidate Shortlists",
          ]}
        >

        {/* ── Scanning / Processing Animation HUD ── */}
        {isProcessing && (
          <div className="max-w-xl mx-auto bg-slate-800/90 rounded-3xl border border-slate-700/80 p-8 shadow-2xl backdrop-blur-xl space-y-6 text-center animate-fadeIn relative overflow-hidden">
            {/* Glowing Laser Scan Line */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-scan pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Analyzing CV Intelligence</h3>
              <p className="text-xs text-cyan-300 font-mono">
                {processingStepsText[processingStep]}
              </p>
            </div>

            {/* Live Step Tracker */}
            <div className="space-y-2.5 text-left text-xs bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60">
              {processingStepsText.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  {idx < processingStep ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : idx === processingStep ? (
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                  )}
                  <span className={idx <= processingStep ? "text-slate-200 font-semibold" : "text-slate-500"}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Input Upload Card (When Not Processing and Not Profile) ── */}
        {!profile && !isProcessing && (
          <div className="max-w-2xl mx-auto bg-slate-800/90 rounded-3xl border border-slate-700/80 shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-slate-700">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-colors ${
                  activeTab === "upload"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Upload CV (PDF / DOCX / TXT)
              </button>
              <button
                onClick={() => setActiveTab("paste")}
                className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-colors ${
                  activeTab === "paste"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                Paste Text
              </button>
            </div>

            {/* Dropzone */}
            {activeTab === "upload" ? (
              <label className="border-2 border-dashed border-slate-600 hover:border-cyan-400 bg-slate-900/60 hover:bg-cyan-950/20 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="font-bold text-white text-sm text-center">
                  {selectedFile ? selectedFile.name : "Click to browse or drop your CV here"}
                </div>
                <div className="text-xs text-slate-400 mt-1 text-center">
                  Supports modern PDF, Word (.docx), or plain text (.txt)
                </div>
              </label>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your full CV text here (Summary, Technical Skills, Experience, Education)..."
                  className="w-full h-44 p-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-400 font-mono leading-relaxed"
                />
              </div>
            )}

            {/* Preferences Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700/60 text-xs font-medium">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Target Country Jurisdiction</label>
                <select
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="all">🌍 Global (All Countries)</option>
                  <option value="GB">🇬🇧 United Kingdom (Skilled Worker &amp; CoS)</option>
                  <option value="US">🇺🇸 United States (H-1B Specialty Occupation)</option>
                  <option value="CA">🇨🇦 Canada (Global Talent Stream)</option>
                  <option value="AU">🇦🇺 Australia (TSS 482 / PR 186)</option>
                  <option value="DE">🇩🇪 Germany (EU Blue Card)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Visa Sponsorship Filter</label>
                <select
                  value={sponsorshipPref}
                  onChange={(e) => setSponsorshipPref(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="required">🛂 Sponsorship Required (Prioritize Confirmed)</option>
                  <option value="preferred">⭐ Sponsorship Preferred (Ranking Boost)</option>
                  <option value="any">🌐 Any Opportunity</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleFindJobs}
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 via-brand-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>Find My Matched Jobs</span>
            </button>
          </div>
        )}

        {/* ── RESULTS VIEW ── */}
        {profile && (
          <div className="space-y-8 animate-fadeIn text-slate-900">
            {/* Top Candidate Profile Summary & Radar Pillar Bar */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3.5 py-1 rounded-full bg-brand-50 text-brand-700 font-black text-xs uppercase tracking-wider border border-brand-200">
                      {profile.primary_occupation}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                      {profile.experience_years}+ Years Experience
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                      SOC Code {profile.primary_soc_code}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                      🛂 {profile.sponsorship_preference === "required" ? "Sponsorship Required" : "Sponsorship Preferred"}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    🎯 Jobs Matched to Your CV Profile
                  </h2>
                  <p className="text-xs text-slate-500">
                    Showing <span className="font-bold text-slate-900">{filteredResults.length}</span> ranked opportunities across verified employer databases.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setProfile(null);
                      setRecommendations([]);
                      setSimulatedSkills(new Set());
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Scan Another CV
                  </button>
                  <button
                    onClick={() => setShowShortlistModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-md shadow-brand-500/20"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Get Match Alerts</span>
                  </button>
                </div>
              </div>

              {/* Extracted Skills Matrix */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-500">Extracted Core Competencies:</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {profile.top_skills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs uppercase border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive "What If" Skill Simulator Widget */}
              <div className="bg-gradient-to-r from-indigo-50 via-brand-50 to-cyan-50 rounded-2xl p-5 border border-brand-200/80 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <span className="font-bold text-xs text-slate-900">
                      Interactive Match Simulator (What-If Skill Booster):
                    </span>
                  </div>
                  {simulatedSkills.size > 0 && (
                    <button
                      onClick={() => setSimulatedSkills(new Set())}
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      Reset Simulator
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  Click missing skills to simulate adding them to your CV and watch your match score increase in real-time:
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {["Kubernetes", "AWS", "Docker", "Terraform", "PostgreSQL", "GraphQL", "Redis"].map((s) => {
                    const isAdded = simulatedSkills.has(s);
                    return (
                      <button
                        key={s}
                        onClick={() => handleToggleSimulatedSkill(s)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isAdded
                            ? "bg-emerald-600 text-white shadow-md scale-105"
                            : "bg-white text-slate-700 border border-slate-300 hover:border-brand-500 hover:bg-brand-50"
                        }`}
                      >
                        {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-brand-600" />}
                        <span>{s}</span>
                        {isAdded && <span className="text-[10px] bg-emerald-700 px-1.5 py-0.5 rounded ml-1">+5% Match</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dynamic Filter Controls */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center justify-between gap-4 flex-wrap text-xs">
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
                  <option value={65}>65%+ Good Matches</option>
                  <option value={50}>50%+ All Potential Matches</option>
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
                const isTopMatch = index === 0 && rec.sponsorJobMatchScore >= 80;

                // Apply simulated boost
                const simulatedCount = rec.missingSkills.filter((s) => simulatedSkills.has(s)).length;
                const displayScore = Math.min(99, rec.sponsorJobMatchScore + simulatedCount * 5);

                return (
                  <div
                    key={rec.job.id}
                    className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                      isTopMatch
                        ? "border-brand-500 shadow-xl ring-1 ring-brand-500/30"
                        : "border-slate-200 hover:border-slate-300 shadow-md"
                    }`}
                  >
                    {/* Top Match Banner */}
                    {isTopMatch && (
                      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 px-5 py-2 text-white text-xs font-black flex items-center justify-between tracking-wide">
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          <span>TOP COMPATIBILITY MATCH FOR YOUR CV PROFILE</span>
                        </span>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">Rank #1</span>
                      </div>
                    )}

                    <div className="p-6 sm:p-7 space-y-5">
                      {/* Main Job Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-600 text-xs">{rec.job.company.name}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{rec.job.location.formatted}</span>
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              <span>{rec.job.employmentType}</span>
                            </span>
                          </div>

                          <h3 className="text-xl sm:text-2xl font-black text-slate-900 hover:text-brand-600 transition-colors">
                            <Link href={`/jobs/${rec.job.slug || rec.job.id}`}>
                              {rec.job.title}
                            </Link>
                          </h3>

                          {/* Sponsorship Signal Pill */}
                          <div className="flex items-center gap-2 pt-1">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
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
                              <span className="font-bold text-xs text-slate-800 px-2.5 py-1 bg-slate-100 rounded-lg">
                                {(rec.job as any).salaryFormatted || `${rec.job.salary?.currency || "£"}${rec.job.salary?.min?.toLocaleString()}`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Match Scores Gauge Column */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
                          <div className="text-right">
                            <div className="text-3xl sm:text-4xl font-black text-brand-600 tracking-tight">
                              {displayScore}%
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              SponsorJob Match
                            </div>
                          </div>

                          <div className="text-xs font-medium text-slate-400">
                            Pure Match: <span className="font-bold text-slate-700">{rec.jobMatchScore}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Component Pillar Breakdown Pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 text-[11px] font-medium">Skills Fit (30%)</div>
                          <div className="font-black text-slate-900 text-sm mt-0.5">{rec.skillMatchScore}%</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 text-[11px] font-medium">Experience (20%)</div>
                          <div className="font-black text-slate-900 text-sm mt-0.5">{rec.experienceMatchScore}%</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 text-[11px] font-medium">Occupation (15%)</div>
                          <div className="font-black text-slate-900 text-sm mt-0.5">{rec.occupationMatchScore}%</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-slate-400 text-[11px] font-medium">Sponsorship (5%)</div>
                          <div className="font-black text-slate-900 text-sm mt-0.5">{rec.sponsorshipScore}%</div>
                        </div>
                      </div>

                      {/* Skill Requirement Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {rec.matchedSkills.map((s, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{s}</span>
                          </span>
                        ))}
                        {rec.missingSkills.map((s, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{s} (Missing)</span>
                          </span>
                        ))}
                      </div>

                      {/* Expandable "Why This Matches You" Section */}
                      {isExpanded && (
                        <div className="pt-4 border-t border-slate-100 space-y-4 text-xs animate-fadeIn">
                          <div>
                            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-sm">
                              <Info className="w-4 h-4 text-brand-600" />
                              <span>Why this job matches you:</span>
                            </h4>
                            <ul className="space-y-2 text-slate-700">
                              {rec.reasons.map((r, idx) => (
                                <li key={idx} className="flex items-start gap-2.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                  <span className="leading-relaxed">{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Skill Gap Breakdown */}
                          <div>
                            <h4 className="font-bold text-slate-900 mb-2.5 flex items-center gap-1.5 text-sm">
                              <Zap className="w-4 h-4 text-amber-500" />
                              <span>Skills Employers Want for This Role:</span>
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                              {rec.skillGapBreakdown.map((item, idx) => (
                                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                  <span className="font-semibold text-slate-800 capitalize">{item.skill}</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
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
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? "Hide Match Details" : "Why This Matches You"}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Link
                            href={`/tools/ats-checker?targetRole=${encodeURIComponent(rec.job.title)}&jobId=${rec.job.id}`}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Improve My CV For This Job</span>
                          </Link>

                          <button
                            onClick={(e) => handleToggleSave(e, rec.job.id, rec.job.applyUrl || (rec.job as any).jobUrl)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                              isSaved ? "bg-brand-50 border-brand-200 text-brand-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                            title="Save Job"
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                          </button>

                          <JobApplyButton
                            jobId={rec.job.id}
                            jobTitle={rec.job.title}
                            companyName={rec.job.company.name}
                            locationFormatted={rec.job.location.formatted || rec.job.location.country}
                            applyUrl={rec.job.applyUrl || (rec.job as any).jobUrl || "#"}
                            label="Start Application"
                            variant="card"
                            className="flex-1 sm:flex-none h-9 px-4 text-xs font-bold rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* No Matches State */}
              {filteredResults.length === 0 && (
                <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    No Matching Jobs Found for Selected Filters
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Try broadening your country preference or lowering the minimum match score threshold. Alternatively, get notified when matching sponsor opportunities are added.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setFilterCountry("ALL");
                        setFilterMinScore(50);
                        setFilterSponsorshipOnly(false);
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Broaden My Search
                    </button>
                    <button
                      onClick={() => setShowShortlistModal(true)}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20 cursor-pointer"
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

        {/* ── Shortlist Email Modal ── */}
        {showShortlistModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-fadeIn text-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Don't Miss Your Match</h3>
                </div>
                <button
                  onClick={() => setShowShortlistModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {!shortlistSubscribed ? (
                <form onSubmit={handleShortlistSubmit} className="space-y-4 text-xs">
                  <p className="text-slate-600 leading-relaxed">
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-md shadow-brand-500/20 cursor-pointer"
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
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold mt-2 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        </ToolAuthGuard>
      </main>
    </div>
  );
}
