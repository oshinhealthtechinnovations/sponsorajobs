"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AlertTriangle, RotateCcw, Home, Sparkles, Briefcase, Compass } from "lucide-react";

export default function ToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tools error boundary caught exception:", error);
  }, [error]);

  const handleClearParamsAndReload = () => {
    if (typeof window !== "undefined") {
      const cleanPath = window.location.pathname;
      window.location.href = cleanPath;
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-16 flex items-center justify-center">
        <div className="w-full p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <span>Career Tool Workspace Notice</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              We encountered an issue loading this tool view
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              This tool encountered an unexpected configuration or parameter when loading. You can restart the tool cleanly without parameters or browse our other career intelligence tools.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleClearParamsAndReload}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset &amp; Open Clean Tool</span>
            </button>

            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Try Again</span>
            </button>

            <Link
              href="/jobs"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-colors"
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Browse 650+ Visa Jobs</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-colors"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
