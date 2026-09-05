"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  ChevronLeft,
  Lightbulb,
  Clock,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { ATSWaitingStudio } from "@/components/ATSWaitingStudio";

// ── 4 CURATED DOMAIN RESUMES FOR INSTANT TESTING ──
const SAMPLE_RESUMES = {
  software: {
    id: "software",
    label: "Software Engineer",
    icon: "💻",
    country: "GB",
    fileName: "sample_senior_fullstack_engineer.pdf",
    text: `Alex Rivera
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
• Certified Kubernetes Application Developer (CKAD)`,
  },
  mechanical: {
    id: "mechanical",
    label: "Mechanical Engineer",
    icon: "⚙️",
    country: "US",
    fileName: "sample_senior_mechanical_engineer.pdf",
    text: `Marcus Vance
Senior Mechanical Systems & Design Engineer
Natick, MA | marcus.vance@eng-solutions.com | +1 (508) 555-0192 | linkedin.com/in/mvance-mechanical

PROFESSIONAL SUMMARY
Dedicated Senior Mechanical Systems & Design Engineer with 7+ years of experience in thermal-fluid analysis, electro-mechanical hardware packaging, finite element modeling (FEA), and high-reliability defense and robotics systems. Proven track record leading multidisciplinary teams through the ASME and DoD product development lifecycle from concept validation to initial production.

TECHNICAL COMPETENCIES & SOFTWARE
• Mechanical CAD & Simulation: SolidWorks, PTC Creo, Autodesk Inventor, ANSYS Mechanical, ANSYS Fluent (CFD), Abaqus FEA
• Standards & Geometric Tolerancing: ASME Y14.5 (GD&T), MIL-STD-810H, ASTM, ISO 9001, DFMA, Root Cause Analysis (8D)
• Fabrication & Testing: CNC Machining, Additive Manufacturing (DMLS), Injection Molding, Vibration & Shock Testing, Thermal Cycling

PROFESSIONAL EXPERIENCE
Senior Mechanical Systems Engineer | Raytheon Defense Technologies | Natick, MA (2021 - Present)
• Led mechanical packaging and structural FEA for ruggedized electronic control enclosures conforming to MIL-STD-810H vibration and temperature specs.
• Modeled thermal distribution profiles using ANSYS Fluent, reducing peak junction temperatures by 18°C and extending MTBF by 35%.
• Formulated detailed engineering drawings with strict ASME Y14.5 GD&T tolerance stack-up studies, reducing prototype machining revisions by 28%.
• Directed cross-functional reviews with quality assurance, systems engineering, and machine shops to deliver 12 mission-critical test articles on schedule.

Mechanical Design Engineer | Boston Dynamics & Robotic Systems | Waltham, MA (2018 - 2021)
• Designed lightweight structural aluminum components, precision gear assemblies, and actuator mounts using SolidWorks and Creo.
• Conducted static, modal, and non-linear dynamic stress analysis using ANSYS, reducing total structural weight by 14% while exceeding safety factors.
• Collaborated with manufacturing vendors to optimize tooling and DFM guidelines, achieving a $75,000 annual production cost saving.

EDUCATION & CREDENTIALS
• Master of Science (MS) in Mechanical Engineering — Northeastern University (2016 - 2018)
• Bachelor of Science (BS) in Mechanical Engineering — University of Massachusetts Amherst (2012 - 2016)
• Certified SolidWorks Professional (CSWP)
• Fundamentals of Engineering (FE / EIT Certified - Massachusetts Board)`,
  },
  civil: {
    id: "civil",
    label: "Civil Engineer",
    icon: "🏗️",
    country: "GB",
    fileName: "sample_senior_civil_engineer.pdf",
    text: `David Campbell
Senior Civil & Structural Engineer
Birmingham, UK | david.campbell@engineer-pro.co.uk | +44 7700 900821 | linkedin.com/in/dcampbell-civil

PROFESSIONAL SUMMARY
Chartered Senior Civil & Structural Engineer (CEng MICE) with 7+ years of experience leading major infrastructure projects, reinforced concrete design, and highway drainage schemes across the UK. Proven capability in structural modeling, Eurocode compliance (EC2/EC3), and managing on-site contractor operations.

TECHNICAL COMPETENCIES & SOFTWARE
• Engineering Design: AutoCAD Civil 3D, Revit Structure, Tekla Structural Designer, MicroDrainage, STAAD.Pro
• Project Delivery: Site Supervision, Structural Inspections, NEC4 ECC Management, Temporary Works, CDM 2015
• Statutory & Standards: Eurocodes (EC1, EC2, EC3), DMRB, British Standards (BS EN 1990)

PROFESSIONAL EXPERIENCE
Senior Civil Engineer | Balfour Beatty Infrastructure | Birmingham, UK (2021 - Present)
• Delivered multi-million pound highway infrastructure and bridge deck rehabilitation schemes under NEC4 Option A contracts.
• Conducted non-linear finite element structural calculations using Tekla, optimizing reinforced concrete tonnage by 18% (£95,000 saving).
• Supervised 25+ subcontractors and site engineers, enforcing strict CDM 2015 health, safety, and environmental standards with zero reportable incidents.
• Prepared Section 278 and Section 38 technical submission packages for local highway authorities.

Civil Design Engineer | Mott MacDonald | Manchester, UK (2018 - 2021)
• Produced detailed structural drawings, foundation designs, and drainage models using AutoCAD Civil 3D and MicroDrainage.
• Liaised with statutory undertakers, water utility authorities, and local council planning officers to achieve full regulatory technical approvals.
• Authored comprehensive structural inspection and risk assessment reports for aging rail viaduct assets.

EDUCATION & PROFESSIONAL CREDENTIALS
• Master of Engineering (MEng) in Civil & Structural Engineering (First Class Honours) — University of Birmingham (2014 - 2018)
• Chartered Engineer (CEng) — Institution of Civil Engineers (MICE, 2022)
• CSCS Professionally Qualified Person (PQP) Card`,
  },
  controls: {
    id: "controls",
    label: "Project Controls",
    icon: "📋",
    country: "GB",
    fileName: "sample_project_controls_planning.pdf",
    text: `Sumit Patel
Senior Project Controls & Planning Specialist
Manchester, UK | sumit.patel@controls-delivery.co.uk | +44 7911 123456 | linkedin.com/in/spatel-controls

PROFESSIONAL SUMMARY
Dedicated Lead Project Controls & Planning Specialist with 6+ years of expertise managing Tier-1 rail and civil infrastructure project schedules. Expert in Primavera P6, Earned Value Management (EVM), critical path delay analysis, and quantitative schedule risk modeling (QSRA).

CORE CAPABILITIES & TOOLS
• Systems & Software: Oracle Primavera P6 (EPPM), Microsoft Project, Power BI, Advanced Excel, Deltek Acumen Fuse
• Controls Methodologies: Earned Value Management (EVM), Critical Path Method (CPM), WBS Formulation, S-Curves, Milestone Tracking
• Project Governance: Schedule Risk Analysis (QSRA), Time Impact Analysis (TIA), Change Control, APM PMQ

PROFESSIONAL EXPERIENCE
Lead Planning Engineer | Mace Major Programmes | Manchester, UK (2022 - Present)
• Formulated and baseline-managed Level 4 integrated EPC master schedules across a £140M station redevelopment portfolio in Primavera P6.
• Implemented monthly EVM performance dashboards in Power BI, identifying schedule variance (SV) and cost variance (CV) trends 6 weeks ahead of critical path impacts.
• Authored forensic delay analysis reports using Time Impact Analysis (TIA) to resolve contractor extension-of-time (EOT) claims.
• Directed weekly schedule alignment meetings with multidisciplinary client engineering leads and project managers.

Project Planner & Controls Analyst | Kier Group | Leeds, UK (2019 - 2022)
• Maintained resource-loaded baseline construction schedules, tracking weekly progress against planned S-curves and key project milestones.
• Conducted quantitative Monte Carlo schedule risk analysis using Deltek Acumen, establishing 80% confidence level delivery dates.
• Coordinated change management workflows, evaluating subcontractor compensation events and schedule revisions.

EDUCATION & CERTIFICATIONS
• MSc in Project & Infrastructure Management — Brunel University London (Distinction, 2018 - 2019)
• BEng in Mechanical & Industrial Engineering — University of Leeds (2015 - 2018)
• APM Project Management Qualification (PMQ) — Association for Project Management
• Oracle Primavera P6 Professional Certified`,
  },
  data: {
    id: "data",
    label: "Data & AI Engineer",
    icon: "📊",
    country: "GB",
    fileName: "sample_data_ai_engineer.pdf",
    text: `Priya Sharma
Lead Data & Machine Learning Engineer
London, UK | priya.sharma@aiml-dev.com | +44 7400 554433 | github.com/priyasharma-ai

PROFESSIONAL SUMMARY
Innovative Lead Data & AI Engineer with 5+ years of production experience architecting end-to-end machine learning pipelines, distributed data platforms, and generative AI microservices. Proven track record in high-scale feature engineering, cloud infrastructure (AWS/GCP), and MLOps automation.

CORE SKILLS & TECH STACK
• Programming: Python, SQL, Scala, TypeScript
• Data & ML: PyTorch, TensorFlow, Scikit-learn, Spark/PySpark, Databricks, BigQuery, Snowflake, dbt
• MLOps & Cloud: AWS (SageMaker, Lambda, EKS), Docker, Kubernetes, MLflow, Terraform, CI/CD, Airflow

WORK EXPERIENCE
Lead Machine Learning Engineer | Quantum AI FinTech | London, UK (2022 - Present)
• Architected real-time fraud detection ML inference engine processing 15,000 transactions per second with sub-40ms latency.
• Built automated CI/CD MLOps pipelines using MLflow and Docker on AWS EKS, reducing model deployment cycle times from 3 weeks to 2 hours.
• Deployed LLM fine-tuning pipelines using LoRA and PyTorch for financial document classification with 94.8% F1 accuracy.

Senior Data Engineer | DataSphere Analytics | Cambridge, UK (2019 - 2022)
• Designed scalable Lakehouse pipelines in Databricks and Apache Spark processing 4TB+ daily clickstream and telemetry data.
• Implemented automated dbt data quality test suites achieving 99.9% pipeline reliability and reducing query compute costs by 35%.

EDUCATION & CREDENTIALS
• MSc in Artificial Intelligence & Machine Learning (Distinction) — Imperial College London (2018 - 2019)
• BSc (Hons) in Computer Science — University of Bristol (2015 - 2018)
• AWS Certified Machine Learning - Specialty
• Databricks Certified Data Engineer Professional`,
  },
};

// ── 5 INTERACTIVE BENCHMARK ROLE PRESETS ──
const BENCHMARK_ROLE_PRESETS = [
  {
    id: "mechanical",
    label: "Mechanical Engineer",
    icon: "⚙️",
    country: "US",
    employerName: "Aerospace, Defense & Advanced Robotics",
    city: "Natick, MA",
    salary: { min: 98000, max: 135000, currency: "USD" },
    socDesc: "Mechanical Engineering Systems (ASME, CAD & Thermal Analysis)",
  },
  {
    id: "civil",
    label: "Civil & Structural Engineer",
    icon: "🏗️",
    country: "GB",
    employerName: "Balfour Beatty / AtkinsRéalis / Tier-1 Infrastructure",
    city: "Birmingham, UK",
    salary: { min: 48000, max: 68000, currency: "GBP" },
    socDesc: "UK SOC 2121 (Civil & Structural Engineering)",
  },
  {
    id: "software",
    label: "Software & Cloud Engineer",
    icon: "💻",
    country: "GB",
    employerName: "FinTech, Cloud Platforms & Enterprise SaaS",
    city: "London, UK",
    salary: { min: 65000, max: 95000, currency: "GBP" },
    socDesc: "UK SOC 2136 (Programmers & Software Development)",
  },
  {
    id: "controls",
    label: "Project Controls Specialist",
    icon: "📋",
    country: "GB",
    employerName: "Mace / Kier / Major Capital Delivery",
    city: "Manchester, UK",
    salary: { min: 55000, max: 78000, currency: "GBP" },
    socDesc: "UK SOC 2424 (Business & Project Controls)",
  },
  {
    id: "data",
    label: "Data & AI Systems Engineer",
    icon: "📊",
    country: "GB",
    employerName: "AI Research Labs & Enterprise Lakehouse Platforms",
    city: "Cambridge, UK",
    salary: { min: 70000, max: 105000, currency: "GBP" },
    socDesc: "UK SOC 2135 (IT Analytics & Machine Learning)",
  },
];

// ── SAFE SALARY FORMATTER ──
function formatSalaryDisplay(salary: any): string | null {
  if (!salary || typeof salary !== "object") return null;
  const min = typeof salary.min === "number" ? salary.min : Number(salary.min) || 0;
  const max = typeof salary.max === "number" ? salary.max : Number(salary.max) || 0;
  if (!min && !max) return null;

  const rawCurr = String(salary.currency || "GBP").toUpperCase();
  const symbol = rawCurr === "USD" ? "$" : rawCurr === "EUR" ? "€" : "£";

  if (min && max) {
    return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
  }
  if (min) return `From ${symbol}${min.toLocaleString()}`;
  return `Up to ${symbol}${max.toLocaleString()}`;
}

const SAMPLE_RESUME = SAMPLE_RESUMES.software.text;

function ATSCheckerContent() {
  const { user, isLoggedIn, isPro, isLoading: isSessionLoading } = useSession();
  const searchParams = useSearchParams();
  const urlJobId = searchParams ? searchParams.get("jobId") : null;

  const [resumeText, setResumeText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetCountry, setTargetCountry] = useState("GB");
  const [targetJobId, setTargetJobId] = useState<string>("");
  const [targetJob, setTargetJob] = useState<any | null>(null);
  const [isLoadingTargetJob, setIsLoadingTargetJob] = useState(false);
  const [targetJobStatus, setTargetJobStatus] = useState<"idle" | "loading" | "loaded" | "not_found">("idle");
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [roleSearchResults, setRoleSearchResults] = useState<any[]>([]);
  const [isSearchingRoles, setIsSearchingRoles] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(12);
  const [activeStage, setActiveStage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intelligence, setIntelligence] = useState<FullATSIntelligenceResult | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<any | null>(null);
  const [targetJobMatch, setTargetJobMatch] = useState<any | null>(null);
  const [matches, setMatches] = useState<ATSJobMatch[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-detect & load targeted job vacancy if ?jobId= is provided in URL
  useEffect(() => {
    const rawId = urlJobId || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("jobId") : null);
    if (!rawId) {
      setTargetJobStatus("idle");
      return;
    }

    const sanitizedJobId = String(rawId).trim();
    if (!sanitizedJobId) {
      setTargetJobStatus("idle");
      return;
    }

    let isMounted = true;
    setTargetJobId(sanitizedJobId);
    setIsLoadingTargetJob(true);
    setTargetJobStatus("loading");

    fetch(`/api/jobs?ids=${encodeURIComponent(sanitizedJobId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data && Array.isArray(data.jobs) && data.jobs.length > 0) {
          const found = data.jobs[0];
          if (found && typeof found === "object" && found.id) {
            setTargetJob(found);
            setTargetJobStatus("loaded");

            const rawCountry =
              (typeof found.location === "object" && found.location?.country) ||
              found.country_code ||
              found.countryCode ||
              "GB";

            if (typeof rawCountry === "string") {
              const countryMap: Record<string, string> = {
                UK: "GB",
                "United Kingdom": "GB",
                USA: "US",
                "United States": "US",
                Australia: "AU",
                Canada: "CA",
                "New Zealand": "NZ",
              };
              const code = (countryMap[rawCountry] || rawCountry).toUpperCase();
              if (["GB", "US", "AU", "CA", "NZ"].includes(code)) {
                setTargetCountry(code);
              }
            }
            return;
          }
        }
        // Vacancy not found or retired from index
        if (isMounted) {
          setTargetJob(null);
          setTargetJobStatus("not_found");
        }
      })
      .catch((err) => {
        console.warn("Could not load target job for ATS benchmark:", err);
        if (isMounted) {
          setTargetJob(null);
          setTargetJobStatus("not_found");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingTargetJob(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [urlJobId]);

  // Live search for target role benchmark switcher
  useEffect(() => {
    if (!roleSearchQuery || roleSearchQuery.trim().length < 2) {
      setRoleSearchResults([]);
      setIsSearchingRoles(false);
      return;
    }

    const timeout = setTimeout(() => {
      setIsSearchingRoles(true);
      fetch(`/api/jobs?q=${encodeURIComponent(roleSearchQuery.trim())}&limit=5`)
        .then((res) => res.json())
        .then((data) => {
          const jobsList = Array.isArray(data?.data) ? data.data : (Array.isArray(data?.jobs) ? data.jobs : []);
          setRoleSearchResults(jobsList);
        })
        .catch(() => setRoleSearchResults([]))
        .finally(() => setIsSearchingRoles(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [roleSearchQuery]);

  const handleSelectPresetRole = (preset: typeof BENCHMARK_ROLE_PRESETS[0]) => {
    setTargetJob({
      id: `preset_${preset.id}`,
      title: preset.label,
      company: { name: preset.employerName },
      location: { city: preset.city, country: preset.country },
      salary: preset.salary,
      sponsorship: { label: preset.country === "GB" ? "Confirmed Licensed Sponsor" : "Specialty Occupation" },
      isPreset: true,
      socDesc: preset.socDesc,
    });
    setTargetJobId(`preset_${preset.id}`);
    setTargetCountry(preset.country);
    setTargetJobStatus("loaded");
    setIsRoleSelectorOpen(false);
  };

  const handleSelectLiveJob = (job: any) => {
    setTargetJob(job);
    setTargetJobId(job.id);
    const country = (typeof job.location === "object" ? job.location?.country : null) || job.country_code || "GB";
    if (["GB", "US", "AU", "CA", "NZ"].includes(country)) {
      setTargetCountry(country);
    }
    setTargetJobStatus("loaded");
    setIsRoleSelectorOpen(false);
    setRoleSearchQuery("");
    setRoleSearchResults([]);
  };

  const handleDismissBenchmark = () => {
    setTargetJob(null);
    setTargetJobId("");
    setTargetJobStatus("idle");
    setIsRoleSelectorOpen(false);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("jobId");
        window.history.replaceState({}, "", url.pathname);
      } catch {}
    }
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);
    setError(null);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setError(null);
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile && (!resumeText || resumeText.trim().length < 15)) {
      setError("Please select a file or paste your resume text (at least 15 characters).");
      return;
    }

    setIsAnalyzing(true);
    setProgressPercent(14);
    setActiveStage(0);
    setError(null);

    // Realistic smooth asymptotic progress increments during waiting time
    const startTime = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 2200) {
        setActiveStage(0);
        setProgressPercent(Math.min(26, 14 + Math.floor((elapsed / 2200) * 12)));
      } else if (elapsed < 4500) {
        setActiveStage(1);
        setProgressPercent(Math.min(48, 26 + Math.floor(((elapsed - 2200) / 2300) * 22)));
      } else if (elapsed < 7000) {
        setActiveStage(2);
        setProgressPercent(Math.min(68, 48 + Math.floor(((elapsed - 4500) / 2500) * 20)));
      } else if (elapsed < 9800) {
        setActiveStage(3);
        setProgressPercent(Math.min(84, 68 + Math.floor(((elapsed - 7000) / 2800) * 16)));
      } else if (elapsed < 13000) {
        setActiveStage(4);
        setProgressPercent(Math.min(92, 84 + Math.floor(((elapsed - 9800) / 3200) * 8)));
      } else {
        setActiveStage(5);
        setProgressPercent((prev) => (prev < 96 ? prev + 1 : 96));
      }
    }, 250);

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

      // Complete progress smoothly
      setProgressPercent(100);
      setActiveStage(5);

      setIntelligence(data.intelligence);
      setMatches(data.matches || []);
      if (data.candidateProfile) setCandidateProfile(data.candidateProfile);
      if (data.targetJobMatch) setTargetJobMatch(data.targetJobMatch);

      // Brief delay to let the user see the 100% completion badge before smooth scroll
      setTimeout(() => {
        setIsAnalyzing(false);
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 450);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
      setIsAnalyzing(false);
    } finally {
      clearInterval(progressTimer);
    }
  };

  const handleSelectSample = (key: keyof typeof SAMPLE_RESUMES) => {
    const sample = SAMPLE_RESUMES[key];
    setResumeText(sample.text);
    setSelectedFile(null);
    setFileName(sample.fileName);
    setTargetCountry(sample.country);
    setActiveTab("paste");
    setError(null);
  };

  const handleLoadSample = () => {
    handleSelectSample("software");
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
        {/* ── HEADER HERO SECTION ── */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-50 via-indigo-50 to-emerald-50 border border-brand-200/80 text-brand-800 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
            <span>Visa-Aware ATS & Sponsorship Intelligence Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            ATS Compatibility & <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">Visa Sponsorship Scorer</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Upload your CV to run deterministic document parsing, UK SOC 2020 occupation code mapping, and sponsorship readiness evaluated against 110,000+ verified employer visa licenses.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs text-slate-600 font-semibold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>110,000+ Licensed Sponsors</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <Building className="w-3.5 h-3.5 text-brand-600" />
              <span>UK SOC 2020 Mapped</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>Workday & Taleo Emulation</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Skilled Worker Salary Audit</span>
            </span>
          </div>
        </div>

        {/* ── TARGET VACANCY BANNER & INTERACTIVE BENCHMARK ASSISTANT ── */}
        {isLoadingTargetJob && (
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl mb-8 animate-pulse flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="w-36 h-5 rounded-full bg-slate-800" />
              <div className="w-64 h-7 rounded-xl bg-slate-800" />
              <div className="w-96 h-4 rounded-md bg-slate-800" />
            </div>
            <div className="w-24 h-8 rounded-xl bg-slate-800 shrink-0" />
          </div>
        )}

        {/* 1. ACTIVE BENCHMARK CARD (When a role is selected/loaded and selector is not open) */}
        {targetJob && typeof targetJob === "object" && targetJobStatus === "loaded" && !isRoleSelectorOpen && (
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-brand-950 text-white border border-brand-500/40 shadow-xl mb-8 relative overflow-hidden animate-fade-in">
            <div className="absolute -top-12 -right-12 w-56 h-56 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/40 text-[#19CBE0] text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#19CBE0]" />
                    <span>Target Vacancy Benchmark Active</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {targetJob.isPreset
                        ? "Role Archetype Benchmark"
                        : (typeof targetJob.location === "object" && targetJob.location?.country === "US")
                        ? "US Direct Employer Vacancy"
                        : "Verified Licensed Sponsor"}
                    </span>
                  </span>
                  <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                    <Globe2 className="w-3 h-3 text-slate-400" />
                    {typeof targetJob.location === "object" && targetJob.location?.city ? `${targetJob.location.city}, ` : ""}
                    {typeof targetJob.location === "object" ? (targetJob.location?.country || "United Kingdom") : (typeof targetJob.location === "string" ? targetJob.location : "United Kingdom")}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
                    {targetJob.title || "Target Vacancy"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Hiring Employer: <strong className="text-white">{typeof targetJob.company === "object" ? (targetJob.company?.name || "Verified Employer") : (targetJob.company || "Verified Employer")}</strong>
                    {formatSalaryDisplay(targetJob.salary) && (
                      <span className="text-emerald-400 ml-2 font-semibold">
                        • {formatSalaryDisplay(targetJob.salary)}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-brand-200/80 mt-1">
                    {targetJob.socDesc
                      ? `Calibrated against ${targetJob.socDesc} and specific tool proficiencies.`
                      : "Your CV will be benchmarked directly against this role's specific skills, required tenure, and immigration eligibility criteria."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0">
                <button
                  type="button"
                  onClick={() => setIsRoleSelectorOpen(true)}
                  className="px-4 py-2 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-xs font-bold text-brand-300 border border-brand-400/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Switch Role</span>
                </button>
                <button
                  type="button"
                  onClick={handleDismissBenchmark}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Benchmark</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. INTERACTIVE VACANCY BENCHMARK ASSISTANT (When not found or user wants to pick a role) */}
        {((targetJobStatus === "not_found") || isRoleSelectorOpen) && (
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-brand-500/40 shadow-xl mb-8 relative overflow-hidden animate-fade-in space-y-5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-400/40 text-brand-400 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-[#19CBE0]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Role Benchmark Assistant</span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-brand-500/20 text-[#19CBE0] border border-brand-400/30">
                      Tailor Your Score
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {targetJobStatus === "not_found"
                      ? "The requested vacancy link is no longer active in our live catalog. You can 1-click benchmark against any engineering role below, search active vacancies, or run universal ATS scoring:"
                      : "Choose a target role archetype or search active vacancies from our database of 110,000+ sponsors to benchmark your CV:"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDismissBenchmark}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Run Universal Scan (No Target)</span>
                </button>
              </div>
            </div>

            {/* 1-Click Role Presets */}
            <div className="space-y-2 relative z-10">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Popular Benchmark Roles:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {BENCHMARK_ROLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPresetRole(preset)}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 hover:border-brand-400/60 border border-slate-700/80 text-left transition-all cursor-pointer group hover:scale-[1.02] shadow-xs"
                  >
                    <div className="flex items-center justify-between text-base mb-1">
                      <span>{preset.icon}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                        {preset.country}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                      {preset.label}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                      {formatSalaryDisplay(preset.salary)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      {preset.employerName}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search Bar for any Vacancy */}
            <div className="space-y-2 relative z-10 pt-2">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-brand-400" />
                <span>Or search any active job in our database:</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={roleSearchQuery}
                  onChange={(e) => setRoleSearchQuery(e.target.value)}
                  placeholder="Type a title or company (e.g. Mechanical Engineer, Balfour Beatty, Mace, Raytheon)..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                />
                {isSearchingRoles && (
                  <div className="absolute right-3.5 top-3.5">
                    <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {roleSearchResults.length > 0 && (
                <div className="p-2 rounded-2xl bg-slate-900 border border-brand-500/40 shadow-2xl space-y-1 mt-1 max-h-60 overflow-y-auto">
                  {roleSearchResults.map((j: any) => (
                    <div
                      key={j.id}
                      onClick={() => handleSelectLiveJob(j)}
                      className="p-2.5 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{j.title}</span>
                        <span className="text-slate-400 ml-2">
                          at {typeof j.company === "object" ? (j.company?.name || "Verified Employer") : (j.company || "Verified Employer")}
                        </span>
                        {typeof j.location === "object" && j.location?.formatted && (
                          <span className="text-[11px] text-slate-500 block">
                            📍 {j.location.formatted}
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-brand-500/20 text-brand-300 font-bold text-[11px] shrink-0">
                        Select Role →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SECTION 1: UNRESTRICTED CV UPLOAD & PARSER WORKSPACE
        ═══════════════════════════════════════════════════════════════ */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm mb-10 space-y-6">
          
          {/* Top Bar: Tabs + 1-Click Sample Resumes */}
          <div className="space-y-4 border-b border-slate-100 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "upload"
                      ? "bg-white text-brand-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload File (PDF / DOCX / TXT)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("paste")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === "paste"
                      ? "bg-white text-brand-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Paste Text Directly</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                Max file size: <span className="font-semibold text-slate-700">10 MB</span>
              </div>
            </div>

            {/* Quick 1-Click Sample Resumes */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Test with realistic sample profiles:</span>
              </span>
              {(Object.keys(SAMPLE_RESUMES) as (keyof typeof SAMPLE_RESUMES)[]).map((key) => {
                const sample = SAMPLE_RESUMES[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectSample(key)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
                  >
                    <span>{sample.icon}</span>
                    <span>{sample.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content: Upload Drag & Drop or Text Area */}
          {activeTab === "upload" ? (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all group relative overflow-hidden ${
                  isDragging
                    ? "border-brand-500 bg-brand-50/50 scale-[1.01]"
                    : selectedFile
                    ? "border-emerald-300 bg-emerald-50/20 hover:border-emerald-400"
                    : "border-slate-300 hover:border-brand-500 bg-slate-50/50 hover:bg-brand-50/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                      <FileCheck2 className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready for deep ATS parsing &amp; visa audit
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Document Loaded Successfully</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline">
                        Click or drop a different file to replace
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-100 to-indigo-100 text-brand-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform shadow-xs">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800">
                        {isDragging ? "Drop your file to upload" : "Click or Drag & Drop your Resume / CV here"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        Supports standard PDF (with text layer), Word Documents (.docx), and plain text (.txt)
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-semibold text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100">PDF</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100">DOCX</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100">TXT</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">Paste Full CV Text:</label>
                {fileName && (
                  <span className="text-xs text-brand-600 font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>Loaded: {fileName}</span>
                  </span>
                )}
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the full text of your resume or CV here (including summary, skills, work experience, and education)..."
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
                className="w-full px-3.5 py-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="GB">🇬🇧 United Kingdom (Skilled Worker Visa &amp; Defined CoS)</option>
                <option value="US">🇺🇸 United States (H-1B &amp; Specialty Occupation)</option>
                <option value="AU">🇦🇺 Australia (TSS 482 / PR 186 Subclasses)</option>
                <option value="CA">🇨🇦 Canada (Global Talent Stream / LMIA)</option>
                <option value="NZ">🇳🇿 New Zealand (Accredited Employer Work Visa)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                {targetCountry === "GB" && "Auditing against UK Home Office Skilled Worker route, £38,700 threshold & SOC 2020 codes."}
                {targetCountry === "US" && "Auditing against US DOL Prevailing Wage levels, H-1B specialty degree requirements."}
                {targetCountry === "CA" && "Auditing against Canadian NOC 2021 codes and Global Talent Stream fast-track eligibility."}
                {targetCountry === "AU" && "Auditing against ANZSCO 6-digit occupation codes and TSS 482 Medium-Term shortage list."}
                {targetCountry === "NZ" && "Auditing against Immigration New Zealand Green List tier-1 and tier-2 fast-track roles."}
              </p>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                disabled={isAnalyzing || (!selectedFile && !resumeText.trim())}
                onClick={handleRunAnalysis}
                className="w-full px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-700 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Running Multi-Pillar Diagnostic Scan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>
                      {targetJob
                        ? `Score CV Against ${typeof targetJob.company === "object" ? (targetJob.company?.name || "Target Vacancy") : (targetJob.company || "Target Vacancy")}`
                        : "Run Deep ATS & Visa Analysis"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              MAKE USE OF WAITING TIME: LIVE DIAGNOSTIC & INSIGHTS STUDIO
          ═══════════════════════════════════════════════════════════════ */}
          {isAnalyzing && (
            <ATSWaitingStudio
              progressPercent={progressPercent}
              activeStage={activeStage}
              targetJobTitle={targetJob?.title}
              targetCompanyName={typeof targetJob?.company === "object" ? targetJob?.company?.name : targetJob?.company}
            />
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fade-in">
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
                        {intelligence?.profile?.seniority || "Professional"} Candidate Profile
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {intelligence?.sponsorshipDiagnostics?.occupationRule?.domain || "Technology & Engineering"}
                      </span>
                      <span className="text-xs text-slate-500">
                        {intelligence?.wordCount ?? 0} words extracted
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                      SponsorAJobs Candidate Intelligence
                    </h2>
                    <div className="inline-flex items-center gap-2 pt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadge(intelligence?.overallScore ?? 75).color}`}>
                        {getScoreBadge(intelligence?.overallScore ?? 75).label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-3xl border-2 border-brand-200 bg-brand-50 text-brand-700 flex flex-col items-center justify-center font-extrabold shadow-sm">
                      <span className="text-3xl tracking-tight">{intelligence?.overallScore ?? 75}</span>
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

                {/* ── 7-FACTOR COMPREHENSIVE MATCH SCOREBOARD ── */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Multi-Dimensional Match Intelligence (7 Scoring Signals)
                    </span>
                    <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                      Weighted Deterministic System
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* Score 1: ATS Compatibility */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 truncate">ATS Compatibility</div>
                      <div className="text-xl font-black text-brand-600">
                        {targetJobMatch?.atsCompatibilityScore ?? intelligence?.atsDiagnostics?.score ?? 85}%
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${targetJobMatch?.atsCompatibilityScore ?? intelligence?.atsDiagnostics?.score ?? 85}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">Machine parseability</span>
                    </div>

                    {/* Score 2: Skills Match (25%) */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 truncate">Skills Match (25%)</div>
                      <div className="text-xl font-black text-indigo-600">
                        {targetJobMatch?.skillsMatchScore ?? (isPro ? (intelligence?.jobMatchDiagnostics?.score ?? 88) : 88)}%
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${targetJobMatch?.skillsMatchScore ?? (isPro ? (intelligence?.jobMatchDiagnostics?.score ?? 88) : 88)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">Required &amp; tools parity</span>
                    </div>

                    {/* Score 3: Experience Match (20%) */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 truncate">Experience (20%)</div>
                      <div className="text-xl font-black text-slate-800">
                        {targetJobMatch?.experienceMatchScore ?? 85}%
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-slate-700 rounded-full"
                          style={{ width: `${targetJobMatch?.experienceMatchScore ?? 85}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">Seniority &amp; years</span>
                    </div>

                    {/* Score 4: Role Similarity (15%) */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 truncate">Role Match (15%)</div>
                      <div className="text-xl font-black text-purple-600">
                        {targetJobMatch?.roleSimilarityScore ?? 88}%
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${targetJobMatch?.roleSimilarityScore ?? 88}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">Career progression</span>
                    </div>

                    {/* Score 5: Qualification Match (10%) */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 truncate">Qualification (10%)</div>
                      <div className="text-xl font-black text-teal-600">
                        {targetJobMatch?.qualificationMatchScore ?? 92}%
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${targetJobMatch?.qualificationMatchScore ?? 92}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">Degree &amp; licensing</span>
                    </div>

                    {/* Score 6: Visa Sponsorship (10%) */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-500 truncate">Visa Match (10%)</div>
                      <div className="text-xl font-black text-emerald-600">
                        {targetJobMatch?.visaMatchScore ?? intelligence?.sponsorshipDiagnostics?.score ?? 90}%
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${targetJobMatch?.visaMatchScore ?? intelligence?.sponsorshipDiagnostics?.score ?? 90}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">Statutory license</span>
                    </div>
                  </div>
                </div>

                {/* ── STRUCTURED CANDIDATE PROFILE CARD ── */}
                {candidateProfile && (
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-brand-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Extracted Candidate Profile &amp; Career Taxonomy
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {candidateProfile.yearsOfExperience}+ Years Experience • {candidateProfile.seniority}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Role:</span>
                        <p className="font-bold text-slate-800">{candidateProfile.currentRole}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Industry:</span>
                        <p className="font-bold text-slate-800">{candidateProfile.primaryIndustry}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Education:</span>
                        <p className="font-bold text-slate-800">
                          {candidateProfile.highestDegree !== "Not Detected" ? candidateProfile.highestDegree : "Bachelor's Equivalent"}
                          {candidateProfile.degreeField ? ` in ${candidateProfile.degreeField}` : ""}
                        </p>
                      </div>
                    </div>

                    {candidateProfile.transferablePotentialRoles && candidateProfile.transferablePotentialRoles.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                          Identified Transferable &amp; Lateral Roles:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {candidateProfile.transferablePotentialRoles.map((r: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-semibold"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── 3 EXPLAINABILITY PILLARS: WHY YOU MATCH, WHAT IS MISSING, HOW TO IMPROVE ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Pillar 1: Why You Match */}
                  <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Why You Match</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {targetJobMatch?.whyYouMatch && targetJobMatch.whyYouMatch.length > 0 ? (
                        targetJobMatch.whyYouMatch.map((reason: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{reason}</span>
                          </li>
                        ))
                      ) : (
                        (intelligence?.strongSignals || []).slice(0, 3).map((sig: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{sig}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  {/* Pillar 2: What Is Missing */}
                  <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>What Is Missing</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {targetJobMatch?.whatIsMissing && targetJobMatch.whatIsMissing.length > 0 ? (
                        targetJobMatch.whatIsMissing.map((gap: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                            <span>{gap}</span>
                          </li>
                        ))
                      ) : (
                        (intelligence?.potentialRisks || []).slice(0, 3).map((risk: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                            <span>{risk}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  {/* Pillar 3: How To Improve */}
                  <div className="p-5 rounded-2xl bg-brand-50/70 border border-brand-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-brand-800 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>How To Improve</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {targetJobMatch?.howToImprove && targetJobMatch.howToImprove.length > 0 ? (
                        targetJobMatch.howToImprove.map((tip: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-brand-600 mt-0.5 shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))
                      ) : (
                        [
                          "Explicitly highlight tool certifications (e.g. MS Project, AutoCAD, Cloud platforms).",
                          "Frame achievements in STAR format (Situation, Task, Action, Result with metrics).",
                          "Ensure visa eligibility keywords and target occupation codes are in the summary.",
                        ].map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-brand-600 mt-0.5 shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
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
                        {(intelligence?.strongSignals || []).map((sig, idx) => (
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
                        {(intelligence?.potentialRisks || []).map((risk, idx) => (
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
                        <strong className="text-white">{intelligence?.sponsorshipDiagnostics?.lastVerified || "Current 2026 Rules"}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">Target Route</span>
                        <div className="text-sm font-bold text-white">
                          {intelligence?.sponsorshipDiagnostics?.route || "Skilled Worker Route"} ({intelligence?.sponsorshipDiagnostics?.targetCountry || targetCountry})
                        </div>
                        <p className="text-xs text-slate-400">
                          {intelligence?.sponsorshipDiagnostics?.eligibilitySignal || "Eligible for certificate of sponsorship."}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Occupation Classification</span>
                        <div className="text-sm font-bold text-white">
                          SOC Code {intelligence?.sponsorshipDiagnostics?.occupationRule?.socCode || "2134"}
                        </div>
                        <p className="text-xs text-slate-400 truncate">
                          {intelligence?.sponsorshipDiagnostics?.occupationRule?.title || "Professional & Technical Occupations"}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Salary & Shortage Status</span>
                        <div className="text-sm font-bold text-white">
                          £38,700 Baseline (Going Rate Eligible)
                        </div>
                        <p className="text-xs text-slate-400">
                          {intelligence?.sponsorshipDiagnostics?.occupationRule?.ukEligibility?.isOnShortageOrISL ? "Listed on Immigration Salary List (ISL)" : "Standard Threshold Required"}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                        <span>Evidence & Authoritative Guidance:</span>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-400">
                        {(intelligence?.sponsorshipDiagnostics?.evidence || []).map((ev, idx) => (
                          <li key={idx}>• {ev}</li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-slate-500 pt-1 italic">
                        * {intelligence?.sponsorshipDiagnostics?.disclaimer || "SponsorAJobs is an AI career intelligence platform and does not provide legal immigration counsel."}
                      </p>
                    </div>
                  </div>

                  {/* ── LAYER 4: TARGET ROLE & KEYWORD MATCH (EXACT VS MISSING) ── */}
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-brand-600" />
                        <span>Target Role Keyword Alignment ({(intelligence?.jobMatchDiagnostics?.exactMatches || []).length} Core Matches)</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(intelligence?.jobMatchDiagnostics?.exactMatches || []).map((skill, idx) => (
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

                    {(intelligence?.jobMatchDiagnostics?.missingCriticalRequirements || []).length > 0 && (
                      <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span>Missing Critical Must-Have Requirements</span>
                        </h3>
                        <p className="text-xs text-slate-500 mb-3">
                          These critical technologies are commonly required by sponsoring employers for this role. If you have genuine experience with them, add them to your CV:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {intelligence?.jobMatchDiagnostics?.missingCriticalRequirements.map((kw, idx) => (
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
                      {(intelligence?.actionPlan || []).map((action, idx) => (
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
                    {intelligence?.suggestedStarBullets && intelligence.suggestedStarBullets.length > 0 && (
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
                        {matches.map((m: any, idx: number) => {
                          const skillsList: string[] = m.matchingSkills || m.matchedSkills || [];
                          return (
                            <div key={idx} className="relative group flex flex-col justify-between">
                              <div className="mb-2 flex items-center justify-between bg-brand-50/60 px-3 py-1.5 rounded-xl border border-brand-200/60 text-xs">
                                <span className="font-bold text-brand-900">
                                  {m.matchScore}% Compatibility Match
                                </span>
                                <span className="text-[11px] text-brand-700 font-medium truncate max-w-[200px]">
                                  {skillsList.slice(0, 3).join(", ")}
                                </span>
                              </div>
                              <JobCard job={m.job} />
                            </div>
                          );
                        })}
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

export default function ATSCheckerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
            <div className="w-10 h-10 rounded-2xl border-3 border-brand-500 border-t-transparent animate-spin" />
          </main>
          <Footer />
        </div>
      }
    >
      <ATSCheckerContent />
    </Suspense>
  );
}

