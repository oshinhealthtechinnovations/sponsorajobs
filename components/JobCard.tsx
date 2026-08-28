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
    if (diffDays <= 0) return "today";
    if (diffDays === 1) return "1d ago";
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
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
      <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200 hover:border-[#18D6E5]/80 shadow-[0_2px_8px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col group relative overflow-hidden">
        {/* Subtle Brand Hover Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#18D6E5] to-[#7567F8] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div className="p-5 sm:p-6 flex flex-col flex-1 space-y-4">
          
          {/* Header: Company, Location, Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getGradient(
                  job.company.name
                )} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}
              >
                {job.company.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/company/${job.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  className="text-sm font-bold text-slate-900 hover:text-[#087F8C] transition-colors truncate block"
                >
                  {job.company.name}
                </Link>
                <div className="flex items-center gap-1.5 text-[13px] text-slate-500 mt-0.5 truncate">
                  <span className="truncate">
                    {job.location.formatted || `${job.location.city || ""}, ${job.location.country}`}
                  </span>
                  {job.remoteType !== "UNKNOWN" && (
                    <>
                      <span className="text-slate-300">&middot;</span>
                      <span className="capitalize">{job.remoteType.toLowerCase()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Save */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={toggleSave}
                type="button"
                aria-label={isSaved ? "Remove from saved" : "Save opportunity"}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isSaved
                    ? "bg-rose-50 text-rose-600 border border-rose-200"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? "fill-rose-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Job Title & Salary */}
          <div>
            <Link href={`/job/${job.slug}`} className="block group-hover:text-[#087F8C] transition-colors">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug line-clamp-2">
                {job.title}
              </h3>
            </Link>
            {salary && (
              <div className="mt-1.5 text-sm font-bold text-slate-700">
                {salary}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {worthScore >= 60 && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                <span className="text-emerald-500 font-bold">🟢</span>
                Employer Verified
              </div>
            )}
            {(confidence.label.includes("VERIFIED") || confidence.label.includes("HIGH CONFIDENCE")) && (
              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                <span className="text-emerald-500 font-bold">🟢</span>
                Sponsorship Signal
              </div>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                <span className="text-emerald-500 font-bold">🟢</span>
                Recently Verified
            </div>
          </div>

          {/* Job Match Score & Checklist */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
             <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-sm">
                  {worthScore}% Job Match
                </div>
                {visaRoute && (
                   <div className="text-xs text-slate-500 font-medium">Route: {visaRoute}</div>
                )}
             </div>
             
             <div className="space-y-1.5">
               <div className="text-xs font-semibold text-slate-600 mb-1">Why this job matches you</div>
               {whyWorthApplying.slice(0, 3).map((item, idx) => (
                 <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                   <span className="text-emerald-600 font-bold shrink-0">✓</span>
                   <span className="line-clamp-1">{item.replace("Sponsorship likelihood is extremely high", "Strong sponsorship signal detected").replace("Verified licensed employer", "Employer verified")}</span>
                 </div>
               ))}
             </div>
          </div>

          {/* Footer: Freshness & CTAs */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium truncate">
              Last verified: {formatFreshness(job.postedAt).replace('Verified ', '')}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/job/${job.slug}`}
                className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                View Job
              </Link>
              <button
                type="button"
                onClick={handleApplyClick}
                className="px-4 py-2.5 rounded-lg bg-[#071421] hover:bg-[#0D1B2A] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer group/btn"
              >
                <span>Apply on Employer Site</span>
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
