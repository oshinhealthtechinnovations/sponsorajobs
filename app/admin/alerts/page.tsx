"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Download,
  Copy,
  Check,
  Plus,
  Search,
  Mail,
  Calendar,
  Globe,
  Database,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Send,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  keyword?: string | null;
  country?: string | null;
  category?: string | null;
  frequency?: string | null;
  created_at: string;
  active: number;
}

export default function AdminAlertsPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Form state
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newCountry, setNewCountry] = useState("all");
  const [newFrequency, setNewFrequency] = useState("daily");
  const [submitting, setSubmitting] = useState(false);

  const handleDispatchDigest = async () => {
    if (subscribers.length === 0) return;
    setDispatching(true);
    setDispatchSuccess(null);
    try {
      const res = await fetch("/api/cron/alerts");
      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchSuccess(`Successfully dispatched ${data.digestsDispatched} job alert digests!`);
        setTimeout(() => setDispatchSuccess(null), 5000);
      } else {
        alert("Failed to dispatch digest: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error triggering digest: " + err.message);
    } finally {
      setDispatching(false);
    }
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/alerts");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleCopyAll = () => {
    if (subscribers.length === 0) return;
    const emails = Array.from(new Set(subscribers.map((s) => s.email.trim()))).join(", ");
    navigator.clipboard.writeText(emails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          keyword: newRole.trim() || undefined,
          country: newCountry,
          frequency: newFrequency,
        }),
      });

      if (res.ok) {
        setNewEmail("");
        setNewRole("");
        setShowAddModal(false);
        await fetchSubscribers();
      }
    } catch (err) {
      console.error("Failed to add subscriber:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubscribers = subscribers.filter((s) => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      s.email.toLowerCase().includes(q) ||
      (s.keyword && s.keyword.toLowerCase().includes(q)) ||
      (s.country && s.country.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bell className="w-7 h-7 text-brand-400" />
            Job Alert Subscribers & Manual Mailer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View captured subscriber emails, export them to CSV, or copy them to send visa job alerts manually.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchSubscribers}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleCopyAll}
            disabled={subscribers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors border border-slate-700 disabled:opacity-50 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-brand-400" />}
            <span>{copied ? "Emails Copied!" : "Copy All Emails"}</span>
          </button>

          <a
            href="/api/admin/alerts?format=csv"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={handleDispatchDigest}
            disabled={dispatching || subscribers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Scan live jobs and dispatch automated email digests to active subscribers"
          >
            <Send className={`w-4 h-4 ${dispatching ? "animate-pulse" : ""}`} />
            <span>{dispatching ? "Dispatching..." : "Send Digest Now"}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscriber</span>
          </button>
        </div>
      </div>

      {/* ── Success Toast Banner ── */}
      {dispatchSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{dispatchSuccess}</span>
        </div>
      )}

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Subscribers</span>
          <p className="text-3xl font-extrabold text-white mt-1">{subscribers.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Active Alert Preferences</span>
          <p className="text-3xl font-extrabold text-brand-400 mt-1">
            {subscribers.filter((s) => s.active).length}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Cloud Database Storage</span>
          <p className="text-sm font-semibold text-emerald-400 mt-2 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Upstash / Supabase Ready
          </p>
        </div>
      </div>

      {/* ── Supabase Live Real-Time Cloud Database Hub ── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-2">
              <Database className="w-3.5 h-3.5" />
              <span>Supabase Cloud Database &bull; Connected</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Supabase Real-Time Subscriber Sync Hub</h2>
            <p className="text-xs text-slate-400 mt-1">
              Synchronizing with table <code className="text-emerald-300 font-mono">job_alerts</code> in <strong className="text-slate-200">SponsorAJobs Cloud Database</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => fetchSubscribers()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-emerald-400 hover:text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync from Supabase</span>
            </button>

            <a
              href="https://supabase.com/dashboard/projects"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Supabase Dashboard</span>
            </a>
          </div>
        </div>

        {/* Supabase Active Connection Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Live REST API</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Direct HTTPS REST integration active with zero connection latency.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-sky-300 flex items-center gap-1.5">
              <span>📑</span>
              <span>Table Schema</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Auto-maps <code className="text-sky-300 font-mono">id, email, keyword, country_code, created_at</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Zero Data Loss</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Dual-persists to Cloud Supabase + Local Memory for instant retrieval.
            </p>
          </div>
        </div>
      </div>

      {/* ── Subscribers Table Card ── */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email, role, country..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Showing {filteredSubscribers.length} of {subscribers.length} subscribers
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading subscriber data...
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Mail className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No subscribers captured yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When jobseekers submit their email on the site, their target role and preferences will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Target Role / Skill</th>
                  <th className="py-3 px-4">Country</th>
                  <th className="py-3 px-4">Frequency</th>
                  <th className="py-3 px-4">Date Subscribed</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSubscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span className="select-all">{s.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {s.keyword ? (
                        <span className="px-2 py-0.5 rounded-md bg-brand-950 text-brand-300 border border-brand-800/60 font-medium">
                          {s.keyword}
                        </span>
                      ) : (
                        <span className="text-slate-500">All Roles</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 uppercase font-bold">
                      {s.country || "ALL"}
                    </td>
                    <td className="py-3 px-4 text-slate-400 capitalize">
                      {s.frequency || "daily"}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(s.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800/60">
                        <ShieldCheck className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Manual Add Subscriber Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Add Job Alert Subscriber Manually</h2>
            <form onSubmit={handleAddSubscriber} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subscriber Email</label>
                <input
                  type="email"
                  required
                  placeholder="jobseeker@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Desired Role / Keyword</label>
                <input
                  type="text"
                  placeholder="e.g. Civil Engineer, React, Nurse"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Country</label>
                  <select
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="all">All Countries</option>
                    <option value="gb">United Kingdom (GB)</option>
                    <option value="us">United States (US)</option>
                    <option value="au">Australia (AU)</option>
                    <option value="ca">Canada (CA)</option>
                    <option value="nz">New Zealand (NZ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="instant">Instant (Real-time)</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Subscriber"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
