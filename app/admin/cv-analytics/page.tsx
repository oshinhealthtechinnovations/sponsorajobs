"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  BarChart3,
  TrendingUp,
  Globe,
  Award,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { CVAnalysisRecord, CVAggregateStats } from "@/lib/types/database";

export default function AdminCVAnalyticsPage() {
  const [stats, setStats] = useState<CVAggregateStats | null>(null);
  const [analyses, setAnalyses] = useState<CVAnalysisRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<CVAnalysisRecord | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cv-analytics?limit=100");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setAnalyses(data.analyses || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load CV analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAnalyses = analyses.filter((a) => {
    const q = filterQuery.toLowerCase();
    if (!q) return true;
    return (
      (a.target_role || "").toLowerCase().includes(q) ||
      (a.candidate_email || "").toLowerCase().includes(q) ||
      (a.soc_code || "").toLowerCase().includes(q) ||
      (a.seniority || "").toLowerCase().includes(q) ||
      (a.target_country || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-brand-600" />
            <span>CV Intelligence & ATS Database Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time candidate ingestion database, global skill shortages, and immigration readiness trends.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Scanned CVs</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{total}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Overall Score</div>
            <div className="text-2xl font-black text-emerald-700 mt-0.5">
              {stats?.averageOverallScore ?? 0}<span className="text-sm font-medium text-slate-400">/100</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Sponsorship Match</div>
            <div className="text-2xl font-black text-blue-700 mt-0.5">
              {stats?.averageSponsorshipScore ?? 0}<span className="text-sm font-medium text-slate-400">/100</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Target Country</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {stats?.countryDistribution?.[0]?.country || "United Kingdom"}
            </div>
          </div>
        </div>
      </div>

      {/* Aggregate Intelligence Grids */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Identified Skills */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Top Identified Skills in Database</span>
              </h2>
            </div>
            <div className="space-y-2.5">
              {stats.topSkills.slice(0, 7).map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 uppercase">{s.skill}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-600">
                    {s.count} CVs
                  </span>
                </div>
              ))}
              {stats.topSkills.length === 0 && (
                <div className="text-xs text-slate-400 py-4 text-center">No skill data yet</div>
              )}
            </div>
          </div>

          {/* Top Missing Skills (Talent Gaps) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Most Common Missing Skill Gaps</span>
              </h2>
            </div>
            <div className="space-y-2.5">
              {stats.topMissingSkills.slice(0, 7).map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 capitalize">{s.skill}</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 font-bold text-rose-700">
                    {s.count} Gaps
                  </span>
                </div>
              ))}
              {stats.topMissingSkills.length === 0 && (
                <div className="text-xs text-slate-400 py-4 text-center">No missing gaps recorded</div>
              )}
            </div>
          </div>

          {/* SOC 2020 Distribution */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-600" />
                <span>SOC 2020 Occupation Breakdown</span>
              </h2>
            </div>
            <div className="space-y-2.5">
              {stats.socDistribution.slice(0, 7).map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">SOC Code {s.socCode}</span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-50 border border-brand-100 font-bold text-brand-700">
                    {s.count} Candidates
                  </span>
                </div>
              ))}
              {stats.socDistribution.length === 0 && (
                <div className="text-xs text-slate-400 py-4 text-center">No SOC records yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search & Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role, email, SOC code..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredAnalyses.length}</span> of {total} stored analyses
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Scan ID</th>
                <th className="px-4 py-3">Candidate / Role</th>
                <th className="px-4 py-3">Country / SOC</th>
                <th className="px-4 py-3">Overall</th>
                <th className="px-4 py-3">Sponsorship</th>
                <th className="px-4 py-3">Seniority / Exp</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAnalyses.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                    {a.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{a.target_role}</div>
                    <div className="text-slate-500">{a.candidate_email || "Anonymous Scan"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{a.target_country}</div>
                    <div className="text-[11px] text-brand-600 font-medium">SOC {a.soc_code || "N/A"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold ${
                      a.overall_score >= 75 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      a.overall_score >= 50 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {a.overall_score}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold ${
                      a.sponsorship_score >= 70 ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-100 text-slate-600"
                    }`}>
                      {a.sponsorship_score}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{a.seniority}</div>
                    <div className="text-[11px] text-slate-400">{a.years_experience} yrs experience</div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedScan(a)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAnalyses.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No CV scans found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Inspector */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedScan.target_role}</h3>
                <p className="text-xs text-slate-500 font-mono">Scan ID: {selectedScan.id}</p>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-500">Overall</div>
                <div className="text-xl font-bold text-slate-900">{selectedScan.overall_score}%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-500">CV Quality</div>
                <div className="text-xl font-bold text-emerald-700">{selectedScan.cv_quality_score}%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-500">ATS Parse</div>
                <div className="text-xl font-bold text-brand-700">{selectedScan.ats_compatibility_score}%</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-500">Sponsorship</div>
                <div className="text-xl font-bold text-blue-700">{selectedScan.sponsorship_score}%</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700">Detected Skills: </span>
                <span className="text-slate-600">{JSON.parse(selectedScan.detected_skills || "[]").join(", ") || "None"}</span>
              </div>
              <div>
                <span className="font-bold text-rose-700">Missing Critical Skills: </span>
                <span className="text-rose-600">{JSON.parse(selectedScan.missing_skills || "[]").join(", ") || "None"}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Seniority & Degree: </span>
                <span className="text-slate-600">{selectedScan.seniority} • {selectedScan.highest_degree}</span>
              </div>
              {selectedScan.raw_text_snippet && (
                <div>
                  <div className="font-bold text-slate-700 mb-1">Raw Extracted Text Preview:</div>
                  <pre className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedScan.raw_text_snippet}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
