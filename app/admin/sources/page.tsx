"use client";

import React, { useState, useEffect } from "react";
import { Radio, Play, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, ExternalLink, RefreshCw } from "lucide-react";

export default function AdminSourceManagementPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningSource, setRunningSource] = useState<string | null>(null);
  const [termsModalSource, setTermsModalSource] = useState<any | null>(null);

  const loadSources = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sources");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSources(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleToggleSource = async (sourceId: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", sourceId, active: active ? 1 : 0 }),
      });
      if (res.ok) {
        setTermsModalSource(null);
        loadSources();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunSource = async (sourceId: string) => {
    setRunningSource(sourceId);
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_now", sourceId }),
      });
      const data = await res.json();
      alert(`Ingestion finished for ${sourceId}: Fetched ${data.report?.jobsFetched || 0} jobs, Inserted ${data.report?.jobsInserted || 0}, Updated ${data.report?.jobsUpdated || 0}`);
      loadSources();
    } catch (err: any) {
      alert(`Error executing source run: ${err.message}`);
    } finally {
      setRunningSource(null);
    }
  };

  const getStatusBadge = (source: any) => {
    if (!source.active) {
      return <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">DISABLED</span>;
    }
    if (source.last_error_at && !source.last_success_at) {
      return <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">FAILED</span>;
    }
    if (source.last_error_at && source.last_success_at) {
      return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">WARNING</span>;
    }
    return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">HEALTHY</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Source Adapters & Ingestion Feeds</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor API limits, review terms compliance, and execute on-demand ingestion runs safely.
          </p>
        </div>
        <button
          onClick={loadSources}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <div
            key={src.id}
            className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-brand-400" />
                  <h2 className="text-base font-bold text-white">{src.name}</h2>
                </div>
                {getStatusBadge(src)}
              </div>

              <p className="text-xs text-slate-400 font-mono">Type: {src.type} • ID: {src.id}</p>

              {/* Stats Metrics (Section 60) */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Seen</span>
                  <span className="font-bold">{src.total_jobs_seen || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Imported</span>
                  <span className="font-bold text-emerald-400">{src.total_jobs_imported || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Last Success</span>
                  <span className="text-[11px] text-slate-400">
                    {src.last_success_at ? new Date(src.last_success_at).toLocaleDateString() : "Never"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Attribution Required</span>
                  <span className="font-semibold">{src.attribution_required ? "Yes (Mandated)" : "No"}</span>
                </div>
              </div>

              {src.last_error_message && (
                <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  <strong>Last Error:</strong> {src.last_error_message}
                </div>
              )}
            </div>

            {/* Actions (Section 60) */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
              {src.terms_url && (
                <a
                  href={src.terms_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <span>Terms</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <div className="flex items-center gap-2">
                {src.active ? (
                  <button
                    onClick={() => handleToggleSource(src.id, false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Disable
                  </button>
                ) : (
                  <button
                    onClick={() => setTermsModalSource(src)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    Enable
                  </button>
                )}

                <button
                  disabled={runningSource === src.id}
                  onClick={() => handleRunSource(src.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{runningSource === src.id ? "Running..." : "Run Now"}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Source Activation Rule Modal (Section 138) */}
      {termsModalSource && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white">Confirm Source Activation</h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Per <strong>Section 138</strong>, activating an external job source requires reviewing its terms of service and attribution mandates before enabling:
            </p>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <div><strong>Source:</strong> {termsModalSource.name} ({termsModalSource.id})</div>
              <div><strong>Rate Limit:</strong> {termsModalSource.rate_limit || 30} req/min</div>
              <div><strong>Attribution:</strong> {termsModalSource.attribution_required ? "Required on Job Cards" : "Not Required"}</div>
              {termsModalSource.terms_url && (
                <div>
                  <strong>Terms URL:</strong>{" "}
                  <a href={termsModalSource.terms_url} target="_blank" rel="noopener noreferrer" className="text-brand-400 underline">
                    {termsModalSource.terms_url}
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTermsModalSource(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleToggleSource(termsModalSource.id, true)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm & Enable Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
