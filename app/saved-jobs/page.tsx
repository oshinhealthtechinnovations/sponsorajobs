"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { PublicJobDTO } from "@/lib/types/job";
import {
  Bookmark,
  Search,
  ArrowRight,
  Sparkles,
  Trash2,
  Briefcase,
  AlertCircle,
} from "lucide-react";

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<PublicJobDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavedJobs = async () => {
      try {
        const stored = localStorage.getItem("sa_saved_jobs");
        const ids: string[] = stored ? JSON.parse(stored) : [];

        if (!ids || ids.length === 0) {
          setSavedJobs([]);
          setLoading(false);
          return;
        }

        // Fetch all jobs to match saved IDs
        const res = await fetch("/api/jobs?limit=100");
        const data = await res.json();
        const allJobs: PublicJobDTO[] = data.jobs || [];

        const matched = allJobs.filter((j) => ids.includes(j.id));
        setSavedJobs(matched);
      } catch (err) {
        console.error("Failed to load saved jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSavedJobs();
    window.addEventListener("storage", loadSavedJobs);
    return () => window.removeEventListener("storage", loadSavedJobs);
  }, []);

  const handleClearAll = () => {
    localStorage.removeItem("sa_saved_jobs");
    setSavedJobs([]);
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2 border border-brand-100">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Candidate Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Saved Jobs & Requisitions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your personalized shortlist of verified international visa sponsorship opportunities.
            </p>
          </div>

          {savedJobs.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-slate-100 border border-slate-200" />
            ))}
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {savedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 sm:p-16 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Saved Jobs Yet</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When exploring vacancies, click the bookmark icon on any job card to save and track your applications here.
            </p>
            <div className="pt-2">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Explore Verified Jobs</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
