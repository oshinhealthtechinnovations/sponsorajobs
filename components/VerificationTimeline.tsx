"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Building2,
  ExternalLink,
  Search,
  Clock,
  Sparkles,
  Link2,
  FileCheck2,
  ArrowRight,
} from "lucide-react";

const VERIFICATION_STAGES = [
  {
    step: "01",
    title: "Original Employer Ingestion",
    subtitle: "Source Authenticity",
    description: "Ingested directly from verified employer ATS platforms (Greenhouse, Lever, Workable, Ashby) and authorized career registries.",
    icon: <Building2 className="w-5 h-5 text-blue-600" />,
    badge: "Direct ATS Source",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    step: "02",
    title: "Employer License Verification",
    subtitle: "Official Registry Matching",
    description: "Employer identity is cross-referenced against UKVI Licensed Sponsors, USCIS databases, and national corporate registries.",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
    badge: "Official Registry Checked",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    step: "03",
    title: "Live Application Endpoint",
    subtitle: "Direct Apply Integrity",
    description: "Automated checks confirm the employer application URL is active, reachable (HTTP 200), and links directly to the original job requisition.",
    icon: <Link2 className="w-5 h-5 text-[#19CBE0]" />,
    badge: "100% Direct Application",
    badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
  },
  {
    step: "04",
    title: "Sponsorship Signal Extraction",
    subtitle: "Evidence & Policy Audit",
    description: "Deterministic linguistic classification parses positive evidence, explicit visa declarations, and flags roles where sponsorship is not offered.",
    icon: <Search className="w-5 h-5 text-indigo-600" />,
    badge: "Deterministic Language Scan",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    step: "05",
    title: "Freshness & Expiration Check",
    subtitle: "Daily Stale Role Purge",
    description: "Expired, filled, or closed vacancies are automatically removed or flagged daily so you never waste time on dead job postings.",
    icon: <Clock className="w-5 h-5 text-amber-600" />,
    badge: "Daily Expiration Sync",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    step: "06",
    title: "Published With Application Fit",
    subtitle: "Application Readiness Score",
    description: "Only qualifying opportunities are published with clear 0–100 Application Fit scores and transparent statutory visa route intelligence.",
    icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
    badge: "Verified & Live",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200",
    highlight: true,
  },
];

export const VerificationTimeline: React.FC = () => {
  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verification Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Every Job Is Checked Before You Apply
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Our multi-stage verification pipeline inspects original sources, confirms employer sponsor credentials, and validates direct application links.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Automated 6-Point Verification</span>
        </div>
      </div>

      {/* Modern 6-Stage Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {VERIFICATION_STAGES.map((stage) => (
          <div
            key={stage.step}
            className={`group relative p-6 rounded-3xl bg-white border transition-all duration-300 flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:shadow-lg ${
              stage.highlight
                ? "border-emerald-300/80 bg-gradient-to-br from-white via-emerald-50/20 to-white shadow-xs"
                : "border-slate-200/90 hover:border-slate-300"
            }`}
          >
            {/* Top Bar: Icon + Step */}
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                {stage.icon}
              </div>
              <span className="text-xs font-black tracking-widest text-slate-400 font-mono">
                STAGE {stage.step}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {stage.subtitle}
              </div>
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {stage.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {stage.description}
              </p>
            </div>

            {/* Stage Feature Badge */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${stage.badgeColor}`}>
                <CheckCircle2 className="w-3 h-3" />
                <span>{stage.badge}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Bottom Banner */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-6 text-slate-700 font-semibold">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            100% Direct Employer ATS Links
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Zero Scraping Middlemen
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Daily Live Requisition Sync
          </span>
        </div>
        <div className="text-slate-500 text-[11px]">
          Verified against official immigration & employer records
        </div>
      </div>
    </div>
  );
};
