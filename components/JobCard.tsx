"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PublicJobDTO } from "@/lib/types/job";
import { calculateJobIntelligence } from "@/lib/utils/intelligenceScorer";
import { ApplicationWorthinessGauge } from "./ApplicationWorthinessGauge";
import { JobDNAProfile } from "./JobDNAProfile";
import { JobShareModal } from "./JobShareModal";
import {
  MapPin,
  Banknote,
  Clock,
  ArrowRight,
  Bookmark,
  Share2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Globe2,
  Building2,
  Sparkles,
} from "lucide-react";

interface JobCardProps {
  job: PublicJobDTO;
  compact?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, compact = false }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const intelligence = calculateJobIntelligence(job);
  const { worthScore, breakdown, jobDNA, confidence, whyWorthApplying, visaRoute } = intelligence;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      setIsSaved(saved.includes(job.id));
    } catch {
      // safe fallback
    }
  }, [job.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("sa_saved_jobs") || "[]");
      let updated: string[];
      if (saved.includes(job.id)) {
        updated = saved.filter((id) => id !== job.id);
        setIsSaved(false);
      } else {
        updated = [...saved, job.id];
        setIsSaved(true);
      }
      localStorage.setItem("sa_saved_jobs", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(job.applyUrl, "_blank", "noopener,noreferrer");
  };

  // Format salary
  const formatSalary = () => {
    if (!job.salary || (!job.salary.min && !job.salary.max)) return null;
    const curr = job.salary.currency || "USD";
    if (job.salary.min && job.salary.max) {
      return `${curr} ${job.salary.min.toLocaleString()} – ${job.salary.max.toLocaleString()}`;
    }
    if (job.salary.min) return `From ${curr} ${job.salary.min.toLocaleString()}`;
    return `Up to ${curr} ${job.salary.max?.toLocaleString()}`;
  };

  const formatFreshness = (dateStr: string | null) => {
    if (!dateStr) return "Verified recently";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays <= 0) return "Verified today";
    if (diffDays === 1) return "Verified 1d ago";
    if (diffDays < 7) return `Verified ${diffDays}d ago`;
    return `Verified ${Math.floor(diffDays / 7)}w ago`;
  };

  // Deterministic avatar gradient
  const getGradient = (name: string) => {
    const gradients = [
      "from-blue-600 to-indigo-700",
      "from-sky-500 to-blue-600",
      "from-emerald-600 to-teal-700",
      "from-violet-600 to-purple-700",
      "from-slate-700 to-slate-900",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  };

  const salary = formatSalary();

  return (
    <>
      <div className="rounded-3xl bg-white border border-[#E2E8F0] hover:border-[#18D6E5]/80 shadow-[0_2px_8px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col group relative overflow-hidden">
        {/* Subtle Brand Hover Top Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#18D6E5] to-[#7567F8] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div className="p-5 sm:p-6 flex flex-col flex-1 space-y-4">
          {/* Header Row: Company + Location + Top Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${getGradient(
                  job.company.name
                )} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs`}
              >
                {job.company.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0">
                <Link
                  href={`/company/${job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="text-xs sm:text-sm font-bold text-slate-800 hover:text-[#087F8C] transition-colors truncate block"
                >
                  {job.company.name}
                </Link>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {job.location.formatted || `${job.location.city || ""}, ${job.location.country}`}
                  </span>
                  {job.remoteType !== "UNKNOWN" && (
                    <>
                      <span className="text-slate-300">&middot;</span>
                      <span className="capitalize text-slate-500 font-medium">
                        {job.remoteType.toLowerCase()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Share & Save */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShareModalOpen(true);
                }}
                type="button"
                aria-label="Share job"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={toggleSave}
                type="button"
                aria-label={isSaved ? "Remove from saved" : "Save opportunity"}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  isSaved
                    ? "bg-rose-50 text-rose-600 border border-rose-200"
                    : "text-slate-300 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Job Title */}
          <Link href={`/job/${job.slug}`} className="block group-hover:text-[#087F8C]">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug font-display transition-colors line-clamp-2">
              {job.title}
            </h3>
          </Link>

          {/* Intelligence Score & Confidence Row */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
            <ApplicationWorthinessGauge score={worthScore} size="sm" />

            <div className="text-right">
              {/* 4-Tier Confidence Badge */}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase border ${confidence.bgClass} ${confidence.textClass} ${confidence.borderClass}`}
                title={confidence.tooltip}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{confidence.label}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-1">
                {visaRoute}
              </div>
            </div>
          </div>

          {/* Metadata Row: Salary + Visa Route */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {salary && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200/60">
                <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                <span>{salary}</span>
              </span>
            )}
            {job.category && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                {job.category.name}
              </span>
            )}
          </div>

          {/* Job DNA Micro Telemetry */}
          <JobDNAProfile dna={jobDNA} compact={true} />

          {/* "Why It Matches" Evidence Snippet */}
          <div className="space-y-1 text-xs text-slate-600 pt-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Why this job is worth applying for:
            </div>
            <div className="space-y-1">
              {whyWorthApplying.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Row: Freshness + Primary CTAs */}
          <div className="mt-auto pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatFreshness(job.postedAt)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/job/${job.slug}`}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
              >
                Inspect
              </Link>

              <button
                type="button"
                onClick={handleApplyClick}
                className="px-4 py-2 rounded-xl bg-[#071421] hover:bg-[#0D1B2A] text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer group/btn"
              >
                <span>Apply with confidence</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#18D6E5] group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <JobShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        jobTitle={job.title}
        companyName={job.company.name}
        countryCode={job.location.country}
        slug={job.slug}
      />
    </>
  );
};
