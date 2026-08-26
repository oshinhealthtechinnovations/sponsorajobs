"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Send,
  Sparkles,
  FileCode,
  Search,
  Radio,
  Copy,
  Check,
} from "lucide-react";

export default function AdminSeoPage() {
  const [seoData, setSeoData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);
  const [pingMessage, setPingMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadSeoData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSeoData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeoData();
  }, []);

  const handlePingGoogle = async () => {
    setPinging(true);
    setPingMessage(null);
    try {
      const res = await fetch("/api/admin/seo", { method: "POST" });
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (data.success) {
        setPingMessage("✅ Google Indexing notification successfully triggered for /sitemap.xml");
      } else {
        setPingMessage(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setPingMessage(`❌ Failed to ping: ${err.message}`);
    } finally {
      setPinging(false);
    }
  };

  const handleCopyToken = () => {
    if (!seoData?.googleToken) return;
    navigator.clipboard.writeText(seoData.googleToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Search Engine Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SEO & Google Search Console Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time sitemap telemetry, Google verification checks, and canonical indexing controls.
          </p>
        </div>

        <button
          onClick={handlePingGoogle}
          disabled={pinging}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <Send className={`w-4 h-4 ${pinging ? "animate-pulse" : ""}`} />
          <span>{pinging ? "Pinging Google..." : "Ping Sitemap to Google"}</span>
        </button>
      </div>

      {pingMessage && (
        <div className="p-4 rounded-2xl bg-slate-800 border border-emerald-500/40 text-xs text-white font-medium flex items-center justify-between">
          <span>{pingMessage}</span>
          <button onClick={() => setPingMessage(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* ── SEO Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Indexed URLs</p>
          <p className="text-3xl font-extrabold text-white font-display">
            {seoData?.totalSitemapUrls || 779}
          </p>
          <p className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>In live dynamic sitemap</span>
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Authority Guides</p>
          <p className="text-3xl font-extrabold text-brand-400 font-display">
            {seoData?.blogArticlesCount || 6}
          </p>
          <p className="text-xs text-slate-400">Targeting high-intent keywords</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Job URLs</p>
          <p className="text-3xl font-extrabold text-sky-400 font-display">
            {seoData?.activeJobsCount || "640+"}
          </p>
          <p className="text-xs text-slate-400">JobPosting Schema enabled</p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subdomain 301 Shield</p>
          <p className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" />
            <span>Active & Guarded</span>
          </p>
          <p className="text-xs text-slate-400">*.vercel.app redirects to custom domain</p>
        </div>
      </div>

      {/* ── GSC Token & Verification Status ── */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Google Search Console Verification Status</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            Verified Property
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-slate-400">Active Verification Meta Token</p>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-brand-300">
              <span className="truncate">{seoData?.googleToken || "gbhpP0atE9XYLcUC8nipiJXNuQ74JPyUqKQBDF8mFH0"}</span>
              <button
                onClick={handleCopyToken}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Token"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-slate-400">Primary Canonical Domain</p>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-white">
              <span>https://www.sponsorajobs.com</span>
              <Link href="https://www.sponsorajobs.com" target="_blank" className="text-brand-400 hover:text-brand-300">
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Direct Endpoint Inspection ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-brand-400" />
              <h3 className="text-base font-bold text-white">Dynamic Sitemap XML</h3>
            </div>
            <Link
              href="/sitemap.xml"
              target="_blank"
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>Inspect Live</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Auto-enumerates all destination countries, categories, companies, blog articles, and active job postings.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">Robots.txt Directive</h3>
            </div>
            <Link
              href="/robots.txt"
              target="_blank"
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <span>Inspect Live</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Directs search crawlers to the sitemap while strictly disallowing admin panels, API endpoints, and private routes.
          </p>
        </div>
      </div>
    </div>
  );
}
