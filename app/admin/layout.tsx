import React from "react";
import Link from "next/link";
import { LayoutDashboard, Briefcase, Radio, History, Settings, ArrowLeft, Bell, BookOpen, Globe } from "lucide-react";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

export const metadata = {
  title: "Admin Panel — SponsorAJobs",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-black text-white text-sm">
              SA
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">Admin Console</span>
              <p className="text-[10px] text-slate-400">SponsorAJobs Operations</p>
            </div>
          </div>

          <nav className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-brand-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/jobs"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Job Management</span>
            </Link>

            <Link
              href="/admin/sources"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Radio className="w-4 h-4 text-sky-400" />
              <span>Source Adapters</span>
            </Link>

            <Link
              href="/admin/alerts"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4 text-rose-400" />
              <span>Alert Subscribers</span>
            </Link>

            <Link
              href="/admin/blog"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Blog Engine</span>
            </Link>

            <Link
              href="/admin/seo"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>SEO & Indexing</span>
            </Link>

            <Link
              href="/admin/runs"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <History className="w-4 h-4 text-sky-400" />
              <span>Ingestion Runs</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-purple-400" />
              <span>System Settings</span>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-3">
          <AdminLogoutButton />

          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
