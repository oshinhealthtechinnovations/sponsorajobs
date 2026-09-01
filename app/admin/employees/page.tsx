"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Globe,
  Award,
  Zap,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Search,
  Key,
  Briefcase,
  Mail,
  Clock,
  ArrowRight,
  Code2,
  BarChart3,
  Cpu,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: "ACTIVE" | "ON_DUTY" | "STANDBY";
  avatar: string;
  specialization: string;
  bio: string;
  keySkills: string[];
  sevenDayTrackRecord: {
    targetMetric: string;
    achievement: string;
  }[];
  activeAssignments: string[];
  directTools: {
    name: string;
    href: string;
    iconName: string;
  }[];
}

const EMPLOYEES: Employee[] = [
  {
    id: "emp-001",
    name: "Sumit Raj",
    role: "Chief SEO & Growth Strategist (SEO Expert)",
    department: "Organic Search & SERP Ranking Operations",
    email: "sumit.raj@sponsorajobs.com",
    status: "ON_DUTY",
    avatar: "SR",
    specialization: "7-Day Google Page 1 Job Portal Ranking & Schema Infrastructure",
    bio: "Principal SEO Growth Engineer spearheading the 7-day Google Fast-Rank Protocol for SponsorAJobs. Master of Programmatic JobPosting Schema, zero-latency IndexNow crawlers, high-intent Tier 2/H-1B visa keywords, and high-CTR SERP snippets.",
    keySkills: [
      "7-Day Page 1 Ranking Protocol",
      "Google JobPosting JSON-LD Rich Schema",
      "IndexNow & Googlebot Realtime Pushing",
      "Visa Keyword Topical Authority (Tier 2, H-1B, TSS 482)",
      "High-CTR Meta Description & SERP Hook Engineering",
      "Core Web Vitals & Zero-CLS Layout Optimization",
    ],
    sevenDayTrackRecord: [
      { targetMetric: "Day 1 Technical Schema", achievement: "100% Rich Result Eligibility across 1,400+ jobs" },
      { targetMetric: "Day 2 Keyword Clusters", achievement: "Topical coverage for 5 Tier-1 immigration destinations" },
      { targetMetric: "Day 3 IndexNow Push", achievement: "Zero-latency dispatch to Bing, Yandex & Googlebot" },
      { targetMetric: "Day 7 Google SERP Verification", achievement: "Page 1 ranking framework active across all niches" },
    ],
    activeAssignments: [
      "Auditing daily JobPosting JSON-LD schemas for 1,408 active positions",
      "Running AI SEO Advisory for employer sponsored requisitions",
      "Monitoring programmatic sitemaps and direct crawler indexing queues",
    ],
    directTools: [
      { name: "SEO & Structured Data Audit", href: "/admin/seo", iconName: "Globe" },
      { name: "Live Job Management & Posting", href: "/admin/jobs", iconName: "Briefcase" },
      { name: "Realtime Ingestion & Crawler Runs", href: "/admin/runs", iconName: "Clock" },
      { name: "Source Adapters & Feeds", href: "/admin/sources", iconName: "Radio" },
    ],
  },
  {
    id: "emp-002",
    name: "AI Candidate Matcher Engine",
    role: "Autonomous ATS & Resume Matching Specialist",
    department: "Talent Acquisition & Classification",
    email: "ats.engine@sponsorajobs.com",
    status: "ACTIVE",
    avatar: "AI",
    specialization: "Multi-parameter CV Parser, Skill Vectoring & Visa Scoring",
    bio: "Automated deep-learning scoring agent matching international candidate resumes with verified visa-sponsoring employers.",
    keySkills: ["Resume Parsing", "Vector Skill Cosine Similarity", "ATS Keyword Extraction", "Sponsorship Classification"],
    sevenDayTrackRecord: [
      { targetMetric: "Match Speed", achievement: "< 150ms roundtrip CV analysis" },
      { targetMetric: "Precision Score", achievement: "94.8% sponsorship signal confidence" },
    ],
    activeAssignments: ["Processing candidate CV uploads", "Calculating ATS readiness scores"],
    directTools: [
      { name: "CV Intelligence DB", href: "/admin/cv-analytics", iconName: "BarChart3" },
      { name: "ATS Checker Tool", href: "/tools/ats-checker", iconName: "ShieldCheck" },
    ],
  },
  {
    id: "emp-003",
    name: "Data Ingestion & Verification Bot",
    role: "Automated Data Ingestion & Deduplication Pipeline",
    department: "Data Engineering & Sourcing",
    email: "pipeline@sponsorajobs.com",
    status: "ACTIVE",
    avatar: "DB",
    specialization: "Automated Job Aggregation, Deduplication & Anti-Scam Verification",
    bio: "Fault-tolerant scraping and API ingestion robot acquiring, sanitizing, and validating sponsor jobs across 5 countries.",
    keySkills: ["Adzuna API Ingestion", "USAJobs API Adapter", "Deduplication Engine", "Spam & Fee Detection Filter"],
    sevenDayTrackRecord: [
      { targetMetric: "Active Database", achievement: "1,408 verified jobs across 472 sponsors" },
      { targetMetric: "Zero Stale Jobs", achievement: "Automated 30-day purge cycle" },
    ],
    activeAssignments: ["Hourly ingestion from multi-country adapters", "Company license cross-verification"],
    directTools: [
      { name: "Source Adapters", href: "/admin/sources", iconName: "Briefcase" },
      { name: "Ingestion Runs", href: "/admin/runs", iconName: "Clock" },
    ],
  },
];

export default function AdminEmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");

  const filteredEmployees = EMPLOYEES.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.keySkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === "ALL" || emp.department.includes(selectedDept);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/20">
            <Users className="w-3.5 h-3.5" />
            <span>Backend Staff Directory & Roles</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Backend Employee & Expert Section
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Oversee staff members, SEO Growth Specialists, and autonomous backend automation agents.
          </p>
        </div>

        <Link
          href="/admin/seo"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Globe className="w-4 h-4" />
          <span>SEO & Indexing Command</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, specialization, or skill (e.g. Sumit Raj, SEO, Schema)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "SEO", "Talent", "Data"].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedDept === dept
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
              }`}
            >
              {dept === "ALL" ? "All Staff" : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEmployees.map((emp) => {
          const isSumit = emp.name === "Sumit Raj";

          return (
            <div
              key={emp.id}
              className={`rounded-3xl p-6 transition-all relative overflow-hidden flex flex-col justify-between ${
                isSumit
                  ? "bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10"
                  : "bg-slate-950 border border-slate-800"
              }`}
            >
              {/* Special Badge for Sumit Raj */}
              {isSumit && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-bl-2xl shadow-md">
                  ★ Lead SEO Expert
                </div>
              )}

              <div>
                {/* Header Profile */}
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-inner ${
                      isSumit
                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950"
                        : "bg-slate-800 text-brand-400 border border-slate-700"
                    }`}
                  >
                    {emp.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg sm:text-xl font-black text-white">{emp.name}</h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {emp.status}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-amber-400 mt-0.5">{emp.role}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>{emp.email}</span>
                      <span className="text-slate-600">•</span>
                      <span>{emp.department}</span>
                    </p>
                  </div>
                </div>

                {/* Bio / Summary */}
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-5">
                  {emp.bio}
                </div>

                {/* Core Expertise Skills */}
                <div className="mb-5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Specialized SEO & Technical Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {emp.keySkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 7-Day Performance & Milestones */}
                <div className="mb-5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>7-Day Fast-Rank Framework Milestones</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {emp.sevenDayTrackRecord.map((record, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px]"
                      >
                        <div className="font-bold text-slate-200">{record.targetMetric}</div>
                        <div className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                          <span>{record.achievement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Assignments */}
                <div className="mb-5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Live Operations & In-Flight Tasks</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {emp.activeAssignments.map((task, idx) => (
                      <li
                        key={idx}
                        className="text-[11px] text-slate-300 flex items-start gap-2 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Direct Tool Shortcuts */}
              <div className="pt-4 border-t border-slate-800/80">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Direct Command Tool Access:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {emp.directTools.map((tool, idx) => (
                    <Link
                      key={idx}
                      href={tool.href}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-[11px] font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer group"
                    >
                      <span className="truncate">{tool.name}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0 ml-1" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
