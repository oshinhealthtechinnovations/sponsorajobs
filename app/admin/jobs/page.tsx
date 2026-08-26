"use client";

import React, { useState, useEffect } from "react";
import { SponsorshipBadge } from "@/components/SponsorshipBadge";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Edit3,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export default function AdminJobManagementPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [overrideModalJob, setOverrideModalJob] = useState<any | null>(null);
  const [overrideLabel, setOverrideLabel] = useState("Strong");
  const [overrideReason, setOverrideReason] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/jobs?q=${encodeURIComponent(search)}&status=${statusFilter}`);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch (err) {
      console.error("Error loading jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  const handleUpdateStatus = async (jobId: string, status: string) => {
    setActionLoading(jobId);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", jobId, status }),
      });
      if (res.ok) {
        loadJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOverrideClassification = async () => {
    if (!overrideModalJob) return;
    setActionLoading(overrideModalJob.id);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "override_classification",
          jobId: overrideModalJob.id,
          sponsorshipLabel: overrideLabel,
          overrideReason,
        }),
      });
      if (res.ok) {
        setOverrideModalJob(null);
        setOverrideReason("");
        loadJobs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Job Inventory Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review sponsorship evidence, approve conflicted listings, and override classifications with audit trails.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="review_required">Review Required (Conflicts)</option>
            <option value="expired">Expired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Job Table */}
      <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading job inventory...</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No matching jobs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Position & Employer</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Signal & Status</th>
                  <th className="p-4">Evidence</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-white text-sm">{job.title}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{job.company_name || "Employer"}</div>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {job.id.slice(0, 10)}</span>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div>{job.city || "Various"}</div>
                      <span className="text-[10px] text-slate-500">{job.country_code} • {job.remote_type}</span>
                    </td>
                    <td className="p-4 space-y-1.5">
                      <div>
                        <SponsorshipBadge label={job.sponsorship_label} size="sm" />
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          job.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : job.status === "review_required"
                            ? "bg-purple-500/20 text-purple-400"
                            : job.status === "rejected"
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        {job.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs text-[11px]">
                      {job.sponsorship_positive_evidence && (
                        <div className="text-emerald-400 truncate">
                          + {JSON.parse(job.sponsorship_positive_evidence).join(", ")}
                        </div>
                      )}
                      {job.sponsorship_negative_evidence && (
                        <div className="text-rose-400 truncate">
                          - {JSON.parse(job.sponsorship_negative_evidence).join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      {/* Override Button (Section 146) */}
                      <button
                        onClick={() => {
                          setOverrideModalJob(job);
                          setOverrideLabel(job.sponsorship_label);
                        }}
                        title="Override classification"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Status Mutation Buttons */}
                      {job.status !== "active" && (
                        <button
                          onClick={() => handleUpdateStatus(job.id, "active")}
                          title="Approve & Publish"
                          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {job.status !== "rejected" && (
                        <button
                          onClick={() => handleUpdateStatus(job.id, "rejected")}
                          title="Reject"
                          className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {job.status !== "expired" && (
                        <button
                          onClick={() => handleUpdateStatus(job.id, "expired")}
                          title="Expire"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Override Classification Modal (Section 146 & 147) */}
      {overrideModalJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Override Sponsorship Classification</h2>
            <p className="text-xs text-slate-400">
              Modifying: <strong className="text-white">{overrideModalJob.title}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  New Sponsorship Label
                </label>
                <select
                  value={overrideLabel}
                  onChange={(e) => setOverrideLabel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="Strong">Strong (Explicit Visa Sponsorship)</option>
                  <option value="Likely">Likely (Strong Indicators)</option>
                  <option value="Possible">Possible (May Be Considered)</option>
                  <option value="Weak">Weak</option>
                  <option value="Explicitly Not Offered">Explicitly Not Offered</option>
                  <option value="No Sponsorship Signal">No Sponsorship Signal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Reason for Override (Recorded in Audit Log)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Verified employer's Home Office sponsor licence on official register."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setOverrideModalJob(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!overrideReason.trim()}
                onClick={handleOverrideClassification}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                Save & Record Audit Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
