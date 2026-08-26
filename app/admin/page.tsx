import React from "react";
import { getDatabase } from "@/lib/db/client";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { verifyAdminSession } from "@/lib/services/adminAuth";
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
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    redirect("/admin/login");
  }

  const db = getDatabase();

  // Metrics (Section 58)
  const totalRow = await db.prepare("SELECT COUNT(*) as count FROM jobs").first<{ count: number }>();
  const activeRow = await db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'").first<{ count: number }>();
  const expiredRow = await db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'expired'").first<{ count: number }>();
  const reviewRow = await db.prepare("SELECT COUNT(*) as count FROM jobs WHERE status = 'review_required'").first<{ count: number }>();
  const strongRow = await db.prepare("SELECT COUNT(*) as count FROM jobs WHERE sponsorship_label = 'Strong' AND status = 'active'").first<{ count: number }>();

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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform telemetry, sponsorship intelligence health, and ingestion metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/sources"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Manage Sources</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid (Section 58) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Listings
          </span>
          <div className="text-2xl font-black text-white">{totalRow?.count || 0}</div>
          <span className="text-[10px] text-slate-500">All database records</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            Active Published
          </span>
          <div className="text-2xl font-black text-emerald-400">{activeRow?.count || 0}</div>
          <span className="text-[10px] text-slate-500">Live search inventory</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider block">
            Strong Signals
          </span>
          <div className="text-2xl font-black text-brand-400">{strongRow?.count || 0}</div>
          <span className="text-[10px] text-slate-500">Explicit sponsorship</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
            Review Required
          </span>
          <div className="text-2xl font-black text-purple-400">{reviewRow?.count || 0}</div>
          <span className="text-[10px] text-slate-500">Conflicting signals</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Expired
          </span>
          <div className="text-2xl font-black text-slate-400">{expiredRow?.count || 0}</div>
          <span className="text-[10px] text-slate-500">Archived vacancies</span>
        </div>
      </div>

      {/* Target Countries Inventory Distribution */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Target Country Distribution</h2>
          <Link href="/admin/jobs" className="text-xs font-semibold text-brand-400 hover:underline">
            View All Jobs →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {countryCounts.map((c) => (
            <div key={c.code} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{c.flag}</span>
                <div>
                  <h3 className="text-xs font-bold text-white">{c.name}</h3>
                  <span className="text-[10px] text-slate-400">{c.code}</span>
                </div>
              </div>
              <span className="text-sm font-black text-brand-400">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ingestion Activity History */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-bold text-white">Recent Ingestion Activity</h2>
          </div>
          <Link href="/admin/runs" className="text-xs font-semibold text-brand-400 hover:underline">
            Full Ingestion History →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Source ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Status</th>
                <th className="p-3">Fetched</th>
                <th className="p-3">Inserted</th>
                <th className="p-3">Duplicates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentRuns.results.map((run: any) => (
                <tr key={run.id} className="hover:bg-slate-900/50">
                  <td className="p-3 font-mono font-semibold text-white">{run.source_id}</td>
                  <td className="p-3 text-slate-400">{new Date(run.started_at).toLocaleString()}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        run.status === "success"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {run.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3">{run.jobs_fetched}</td>
                  <td className="p-3 text-emerald-400 font-semibold">{run.jobs_inserted}</td>
                  <td className="p-3 text-slate-400">{run.jobs_duplicates}</td>
                </tr>
              ))}
              {recentRuns.results.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    No ingestion runs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
