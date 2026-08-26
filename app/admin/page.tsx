import React from "react";
import { getDatabase } from "@/lib/db/client";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { verifyAdminSession } from "@/lib/services/adminAuth";
import { blogRepository } from "@/lib/repositories/blogRepository";
import { AlertRepository } from "@/lib/repositories/alertRepository";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  History,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  Globe,
  Bell,
  Sparkles,
  Send,
  Zap,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    redirect("/admin/login");
  }

  const db = getDatabase();

  // Metrics
  const totalRow = await db.prepare("SELECT COUNT(*) as count FROM jobs").first<{ count: number }>();
  const activeRow = await db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'").first<{ count: number }>();
  const strongRow = await db.prepare("SELECT COUNT(*) as count FROM jobs WHERE sponsorship_label = 'Strong' AND status = 'active'").first<{ count: number }>();

  // Blog metrics
  const { total: blogTotal, posts: recentPosts } = await blogRepository.getAllPosts({ limit: 4 });

  // Alert metrics
  const alertRepo = new AlertRepository();
  const activeAlerts = await alertRepo.getAllActiveAlerts();

  // Country counts
  const countryCounts: { code: string; name: string; flag: string; count: number }[] = [];
  for (const c of INITIAL_COUNTRIES) {
    const row = await db.prepare("SELECT COUNT(*) as count FROM jobs WHERE country_code = ?").bind(c.code).first<{ count: number }>();
    countryCounts.push({ code: c.code, name: c.name, flag: c.flag, count: row?.count || 0 });
  }

  // Recent runs
  const recentRuns = await db.prepare(
    "SELECT * FROM source_runs ORDER BY started_at DESC LIMIT 4"
  ).all<any>();

  return (
    <div className="space-y-8">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform telemetry, SEO blog engine, subscriber distribution, and ingestion metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs transition-colors border border-amber-500/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate SEO Post</span>
          </Link>

          <Link
            href="/admin/sources"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors shadow-xs"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Manage Sources</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Listings
          </span>
          <div className="text-2xl font-black text-white">{totalRow?.count || 0}</div>
          <span className="text-[10px] text-slate-500">All database records</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            Active Published
          </span>
          <div className="text-2xl font-black text-emerald-400">{activeRow?.count || 0}</div>
          <span className="text-[10px] text-slate-500">Live search inventory</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider block">
            Strong Signals
          </span>
          <div className="text-2xl font-black text-brand-400">{strongRow?.count || 0}</div>
          <span className="text-[10px] text-slate-500">Verified CoS / LMIA</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Blog Articles
          </span>
          <div className="text-2xl font-black text-amber-400">{blogTotal}</div>
          <span className="text-[10px] text-slate-500">100/100 SEO guides</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
            Alert Subscribers
          </span>
          <div className="text-2xl font-black text-rose-400">{activeAlerts.length}</div>
          <span className="text-[10px] text-slate-500">Active email digests</span>
        </div>
      </div>

      {/* ── Quick Operation Shortcuts Hub ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/blog"
          className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
              SEO Blog Engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesize new keyword-targeted guides targeting high-search international terms.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400">
            <span>Manage Content</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/seo"
          className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
              Google Indexing & Sitemap
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify Google tokens, review 779+ sitemap URLs, and trigger search engine pings.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
            <span>Inspect Indexing</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/jobs"
          className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-brand-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-brand-400 transition-colors">
              Job Operations & Overrides
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review classified listings, override sponsorship tags, and manage active jobs.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-brand-400">
            <span>Manage Jobs</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/alerts"
          className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm group-hover:text-rose-400 transition-colors">
              Job Alert Subscribers
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage email alert subscribers, dispatch daily digests, and export CSVs.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-rose-400">
            <span>Dispatch Digests</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* ── Country Distribution & Recent Blog Guides ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-400" />
            <span>Jurisdiction Inventory Distribution</span>
          </h3>
          <div className="space-y-3">
            {countryCounts.map((c) => (
              <div key={c.code} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{c.flag}</span>
                  <span className="text-xs font-bold text-white">{c.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-brand-400 font-bold">{c.count}</span>
                  <span className="text-slate-500">jobs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Blog Guides */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Latest Authority Guides</span>
            </h3>
            <Link href="/admin/blog" className="text-xs font-bold text-amber-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1 max-w-md">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    {post.category.name}
                  </span>
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {post.title}
                  </h4>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold shrink-0 transition-colors"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
