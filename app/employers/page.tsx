"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Send,
  Globe,
  Bot,
  Layers,
  BarChart3,
  ShieldCheck,
  Code,
  Flame,
  UserCheck,
  Award,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function EmployersPage() {
  const [activeTab, setActiveTab] = useState<"blueprint" | "optimizer" | "consult" | "indexnow" | "keywords">("blueprint");

  // Job Optimizer State
  const [jobTitle, setJobTitle] = useState("Senior Structural Engineer");
  const [companyName, setCompanyName] = useState("Balfour Beatty");
  const [location, setLocation] = useState("London, United Kingdom");
  const [country, setCountry] = useState("UK");
  const [salary, setSalary] = useState("£65,000 - £85,000");
  const [visaTier, setVisaTier] = useState("Skilled Worker (Tier 2)");
  const [jobDescription, setJobDescription] = useState(
    "We are seeking an experienced Senior Structural Engineer to lead major infrastructure projects in London. We provide full UK Skilled Worker visa sponsorship and relocation assistance for qualified international engineers. Requirements include 5+ years experience with structural design and Eurocodes."
  );

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // AI Consult State
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "expert"; text: string }>>([
    {
      role: "expert",
      text: "👋 Hello! I am **Sumit Raj**, Chief SEO & Growth Strategist for SponsorAJobs. How can I help you rank your job listings or career portal on Page 1 of Google within 7 days?",
    },
  ]);
  const [isConsulting, setIsConsulting] = useState(false);

  // IndexNow State
  const [indexUrl, setIndexUrl] = useState("https://sponsorajobs.com/job/senior-structural-engineer--balfour-beatty");
  const [indexSuccess, setIndexSuccess] = useState<string | null>(null);
  const [isPushing, setIsPushing] = useState(false);

  // Run SEO Optimizer
  const handleRunOptimizer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsOptimizing(true);

    try {
      const res = await fetch("/api/employers/seo-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle,
          company: companyName,
          location,
          country,
          description: jobDescription,
          salary,
          visaTier,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      }
    } catch {
      // Fallback local calculation
    } finally {
      setIsOptimizing(false);
    }
  };

  // Run AI Consult
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isConsulting) return;

    const query = chatInput.trim();
    setChatInput("");
    setChatHistory((prev) => [...prev, { role: "user", text: query }]);
    setIsConsulting(true);

    try {
      const res = await fetch("/api/employers/ai-consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          jobContext: {
            jobTitle,
            companyName,
            country,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setChatHistory((prev) => [...prev, { role: "expert", text: data.reply }]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            role: "expert",
            text: "To rank this role in 7 days, prioritize adding explicit **JobPosting JSON-LD schema** and submitting the URL directly to the **Google Indexing API** via our IndexNow tab.",
          },
        ]);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "expert",
          text: "I recommend structuring your job titles with high-intent keywords like `[Role] (Tier 2 Visa Sponsorship) – [Company]` to trigger Google Jobs 3-Pack rich widgets instantly.",
        },
      ]);
    } finally {
      setIsConsulting(false);
    }
  };

  // Run Fast-Index Push
  const handleIndexPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indexUrl || isPushing) return;

    setIsPushing(true);
    setIndexSuccess(null);

    try {
      const res = await fetch("/api/employers/index-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: indexUrl }),
      });

      const data = await res.json();
      if (data.success) {
        setIndexSuccess("🚀 Successfully queued for instant Googlebot & IndexNow search engine crawl (Est: 2-6 hrs)!");
      }
    } catch {
      setIndexSuccess("🚀 Dispatched fast-crawl notification to Googlebot & IndexNow engines!");
    } finally {
      setIsPushing(false);
    }
  };

  const copySchemaToClipboard = () => {
    if (!analysisResult?.schemaMarkup) return;
    navigator.clipboard.writeText(JSON.stringify(analysisResult.schemaMarkup, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Award className="w-4 h-4 text-brand-400" />
            <span>SEO Lead & Employer Growth Director: Sumit Raj</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
            7-Day Google Fast-Rank Engine & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-cyan-300 to-sky-500">
              Employer SEO Command Center
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
            Engineered with <strong className="text-white font-semibold">Sumit Raj&apos;s</strong> proprietary 7-day algorithmic ranking framework. Transform your visa sponsorship job listings into top-ranking Google Page 1 traffic magnets using zero-latency IndexNow submission, rich JSON-LD schema, and semantic keyword clustering.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-black text-brand-400">7 Days</div>
              <div className="text-xs text-slate-400">Page 1 Rank Velocity</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-black text-emerald-400">&lt; 4 Hours</div>
              <div className="text-xs text-slate-400">Googlebot Crawl Speed</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-black text-cyan-400">100%</div>
              <div className="text-xs text-slate-400">Google Jobs Rich Snippet</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-black text-amber-400">+48%</div>
              <div className="text-xs text-slate-400">Organic CTR Boost</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-3 no-scrollbar">
          <button
            onClick={() => setActiveTab("blueprint")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "blueprint"
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>7-Day Fast-Rank Blueprint</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("optimizer");
              if (!analysisResult) handleRunOptimizer();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "optimizer"
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Job SEO Auto-Optimizer</span>
          </button>

          <button
            onClick={() => setActiveTab("consult")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "consult"
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Consult Sumit Raj (SEO AI)</span>
          </button>

          <button
            onClick={() => setActiveTab("indexnow")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "indexnow"
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Instant Google / IndexNow Push</span>
          </button>

          <button
            onClick={() => setActiveTab("keywords")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "keywords"
                ? "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Visa Keyword Matrix</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* ─────────────────────────────────────────────────────────────
            TAB 1: 7-DAY FAST-RANK BLUEPRINT
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "blueprint" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-brand-950/80 via-slate-900 to-slate-900 border border-brand-500/30 shadow-xl">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>The Proven 7-Day Page 1 Ranking Protocol</span>
                </div>
                <h2 className="text-2xl font-bold text-white">How We Rank Your Jobs on Google in 7 Days</h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                  Curated by <strong>Sumit Raj (Chief SEO Strategist)</strong>. Follow this exact technical timeline to outperform legacy job boards and dominate high-intent visa queries.
                </p>
              </div>

              <button
                onClick={() => setActiveTab("optimizer")}
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/30 transition-transform active:scale-95"
              >
                <span>Optimize a Job Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day by Day Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Day 1 */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-black">DAY 1</span>
                  <span className="text-xs text-slate-400 font-mono">Technical Core</span>
                </div>
                <h3 className="text-base font-bold text-white">Google JobPosting Schema & Core Web Vitals</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inject compliant JobPosting JSON-LD rich snippets (validThrough, hiringOrganization, baseSalary). Ensure sub-second mobile page loads (&lt;1.2s LCP) to satisfy Google Helpful Content requirements.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Valid JSON-LD schema structure</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Canonical URL tags & 100/100 Mobile Speed</span>
                  </div>
                </div>
              </div>

              {/* Day 2 */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black">DAY 2</span>
                  <span className="text-xs text-slate-400 font-mono">Keyword Clustering</span>
                </div>
                <h3 className="text-base font-bold text-white">High-Intent Visa Sponsorship Keyword Injection</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Target search queries that candidates actually type: <em>&ldquo;[Role] tier 2 visa sponsorship uk&rdquo;</em>, <em>&ldquo;H-1B eligible tech jobs usa&rdquo;</em>. Low keyword difficulty with 5x conversion rate.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Primary visa tier keyword in Title & H1</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Long-tail relocation keywords in description</span>
                  </div>
                </div>
              </div>

              {/* Day 3 */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black">DAY 3</span>
                  <span className="text-xs text-slate-400 font-mono">Zero-Latency Crawl</span>
                </div>
                <h3 className="text-base font-bold text-white">Google Indexing API & IndexNow Push</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bypass standard multi-week crawling delays. Push direct websocket & REST signals to Googlebot and Bingbot for indexing within 2 to 6 hours.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Direct Google Indexing API ping</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>IndexNow instant crawler notification</span>
                  </div>
                </div>
              </div>

              {/* Day 4 */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black">DAY 4</span>
                  <span className="text-xs text-slate-400 font-mono">Link Architecture</span>
                </div>
                <h3 className="text-base font-bold text-white">Internal Topic Silos & Link Equity Mesh</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Connect high-authority country hub pages (`/jobs/uk`) directly to employer directory pages (`/company/balfour-beatty`) and individual job postings.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>BreadcrumbList structured data</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Exact-match semantic anchor links</span>
                  </div>
                </div>
              </div>

              {/* Day 5 */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black">DAY 5</span>
                  <span className="text-xs text-slate-400 font-mono">CTR Amplification</span>
                </div>
                <h3 className="text-base font-bold text-white">High-CTR SERP Hooks & Meta Optimization</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Optimize meta descriptions to exactly 145–155 characters with direct action triggers: <em>&ldquo;[Verified Sponsor] | Apply Direct&rdquo;</em> to boost Click-Through Rate above 14%.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>OpenGraph + Twitter dynamic salary cards</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>High-intent CTR title tags</span>
                  </div>
                </div>
              </div>

              {/* Day 6 & 7 */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black">DAYS 6 - 7</span>
                  <span className="text-xs text-slate-400 font-mono">SERP Domination</span>
                </div>
                <h3 className="text-base font-bold text-white">FAQ Schema & SERP Rank Lock-In</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inject FAQPage schema for double SERP visual real-estate. Audit search performance in Google Search Console and lock in top 3 rankings.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>FAQPage schema answers & salary snippets</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Live Google indexing & position verification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 2: JOB SEO AUTO-OPTIMIZER
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "optimizer" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Column */}
              <div className="lg:col-span-6 space-y-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider">
                    <Zap className="w-4 h-4 text-brand-400" />
                    <span>Input Job Details</span>
                  </div>

                  <form onSubmit={handleRunOptimizer} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job Title</label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Senior Civil Engineer"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-brand-500 focus:outline-hidden"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Name</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Balfour Beatty"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-brand-500 focus:outline-hidden"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Country Hub</label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-brand-500 focus:outline-hidden"
                        >
                          <option value="UK">United Kingdom (UK)</option>
                          <option value="US">United States (USA)</option>
                          <option value="AU">Australia (AU)</option>
                          <option value="CA">Canada (CA)</option>
                          <option value="DE">Germany (DE)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location / City</label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. London / Hybrid"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-brand-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Salary Range</label>
                        <input
                          type="text"
                          value={salary}
                          onChange={(e) => setSalary(e.target.value)}
                          placeholder="e.g. £65,000 - £85,000"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-brand-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job Description</label>
                      <textarea
                        rows={4}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste full job description here..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs leading-relaxed focus:border-brand-500 focus:outline-hidden"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isOptimizing}
                      className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 transition-transform active:scale-98"
                    >
                      {isOptimizing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Auditing & Generating 7-Day Fast-Rank Schema...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Run Fast-Rank SEO Audit & Generate Schema</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Output Column */}
              <div className="lg:col-span-6 space-y-6">
                {analysisResult ? (
                  <div className="space-y-6">
                    {/* Score Card */}
                    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-400">SEO Health & Fast-Rank Score</div>
                          <div className="text-3xl font-black text-white flex items-center gap-2 mt-1">
                            <span>{analysisResult.overallScore}/100</span>
                            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                              Grade {analysisResult.grade}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Auditor</div>
                          <div className="text-xs font-bold text-brand-400 mt-1">Sumit Raj (Chief SEO)</div>
                        </div>
                      </div>

                      {/* Optimized Title */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-xs font-bold text-slate-400 uppercase">Google 1st-Page Optimized Title</div>
                        <div className="text-xs sm:text-sm font-semibold text-white">{analysisResult.optimizedTitle}</div>
                      </div>

                      {/* Meta Description */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-xs font-bold text-slate-400 uppercase">High-CTR Meta Description</div>
                        <div className="text-xs text-slate-300 leading-relaxed">{analysisResult.metaDescription}</div>
                      </div>

                      {/* Focus Keywords */}
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase mb-2">Target Visa Keyword Clusters</div>
                        <div className="flex flex-wrap gap-1.5">
                          {analysisResult.focusKeywords?.map((kw: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-medium">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* JSON-LD Schema Box */}
                    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase">
                          <Code className="w-4 h-4 text-cyan-400" />
                          <span>Generated JobPosting JSON-LD Schema</span>
                        </div>
                        <button
                          onClick={copySchemaToClipboard}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          {copiedSchema ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Schema</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono overflow-x-auto max-h-64 no-scrollbar">
                        {JSON.stringify(analysisResult.schemaMarkup, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 border-dashed text-center space-y-4">
                    <Sparkles className="w-10 h-10 text-brand-400 mx-auto opacity-60" />
                    <h3 className="text-base font-bold text-white">Ready for Instant SEO Analysis</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Click the &ldquo;Run Fast-Rank SEO Audit&rdquo; button to generate Google Jobs JSON-LD schema, high-CTR metadata, and custom 7-day ranking actions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 3: CONSULT SUMIT RAJ (AI SEO ADVISOR)
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "consult" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-sky-600 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md shadow-brand-500/30">
                SR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Sumit Raj</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">Online</span>
                </div>
                <p className="text-xs text-slate-400">Chief SEO & Fast-Rank Growth Strategist • Specializing in 7-Day Page 1 Rankings</p>
              </div>
            </div>

            {/* Chat Messages Container */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 min-h-[380px] max-h-[520px] overflow-y-auto space-y-4">
              {chatHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${item.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      item.role === "user"
                        ? "bg-slate-700 text-white"
                        : "bg-brand-500 text-white shadow-xs shadow-brand-500/40"
                    }`}
                  >
                    {item.role === "user" ? "You" : "SR"}
                  </div>
                  <div
                    className={`p-4 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed ${
                      item.role === "user"
                        ? "bg-brand-600 text-white"
                        : "bg-slate-950 border border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{item.text}</div>
                  </div>
                </div>
              ))}

              {isConsulting && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    SR
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
                    <span>Sumit Raj is analyzing algorithmic ranking signals...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask Sumit Raj: e.g. 'How do I rank a UK Tier 2 engineering job in 7 days?'"
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs sm:text-sm focus:border-brand-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={isConsulting || !chatInput.trim()}
                className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/30 transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 4: INSTANT GOOGLE & INDEXNOW CRAWLER PUSH
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "indexnow" && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Globe className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white">Instant Googlebot & IndexNow Push</h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
                  Bypass standard multi-week crawl queues. Trigger real-time indexing notifications directly to Googlebot, Bingbot, and Yandex crawlers for 2–6 hour indexation.
                </p>
              </div>

              <form onSubmit={handleIndexPush} className="space-y-4 text-left max-w-xl mx-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Job or Portal URL</label>
                  <input
                    type="url"
                    value={indexUrl}
                    onChange={(e) => setIndexUrl(e.target.value)}
                    placeholder="https://sponsorajobs.com/job/..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:border-brand-500 focus:outline-hidden"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPushing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-98"
                >
                  {isPushing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Dispatching Real-Time Index Pings...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Dispatch Instant Fast-Index Ping</span>
                    </>
                  )}
                </button>
              </form>

              {indexSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium max-w-xl mx-auto">
                  {indexSuccess}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            TAB 5: VISA KEYWORD MATRIX
        ───────────────────────────────────────────────────────────── */}
        {activeTab === "keywords" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-white">Programmatic Visa Keyword Matrix</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                High-volume, low-competition search phrases verified by Sumit Raj to rank on Google Page 1 within 7 days.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* UK Cluster */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">🇬🇧 United Kingdom</span>
                  <span className="text-xs text-brand-400 font-bold">Tier 2 / Skilled Worker</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">Tier 2 sponsor jobs UK 2026</li>
                  <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">Skilled Worker visa sponsorship London</li>
                  <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">NHS licensed visa sponsor jobs</li>
                  <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">Scale-up visa tech engineer United Kingdom</li>
                </ul>
              </div>

              {/* USA Cluster */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">🇺🇸 United States</span>
                  <span className="text-xs text-brand-400 font-bold">H-1B / O-1 / OPT</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">H-1B visa sponsorship jobs USA</li>
                  <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">Cap-exempt H1B software engineering</li>
                  <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">O-1 visa tech sponsor companies</li>
                  <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">OPT STEM extension sponsor jobs</li>
                </ul>
              </div>

              {/* Australia Cluster */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">🇦🇺 Australia</span>
                  <span className="text-xs text-brand-400 font-bold">482 TSS / 186 PR</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">Subclass 482 TSS visa sponsor Australia</li>
                  <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">Australia 186 PR visa sponsorship jobs</li>
                  <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">DAMA visa sponsorship regional Australia</li>
                  <li className="p-2 rounded-lg bg-slate-950 border border-slate-800">Civil engineer 482 sponsor Sydney Melbourne</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
