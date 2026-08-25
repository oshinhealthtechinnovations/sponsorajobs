import React from "react";
import { getDatabase } from "@/lib/db/client";
import { History, CheckCircle2, XCircle, Clock } from "lucide-react";

export const revalidate = 0;

export default async function AdminRunsPage() {
  const db = getDatabase();
  const runs = await db.prepare(
    "SELECT * FROM source_runs ORDER BY started_at DESC LIMIT 50"
  ).all<any>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Ingestion Telemetry & Run History</h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed logs of external API sync operations, rate limit behavior, and data updates.
        </p>
      </div>

      <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Run ID & Source</th>
                <th className="p-4">Started / Duration</th>
                <th className="p-4">Status</th>
                <th className="p-4">Fetched</th>
                <th className="p-4">Inserted</th>
                <th className="p-4">Updated</th>
                <th className="p-4">Duplicates</th>
                <th className="p-4">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {runs.results.map((run: any) => {
                const duration = run.completed_at
                  ? `${Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()))}ms`
                  : "...";

                return (
                  <tr key={run.id} className="hover:bg-slate-900/40">
                    <td className="p-4">
                      <div className="font-bold text-white font-mono">{run.source_id}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{run.id}</span>
                    </td>
                    <td className="p-4">
                      <div>{new Date(run.started_at).toLocaleString()}</div>
                      <span className="text-[10px] text-slate-500 font-mono">Duration: {duration}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          run.status === "success"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : run.status === "partial"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {run.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">{run.jobs_fetched}</td>
                    <td className="p-4 text-emerald-400 font-semibold">{run.jobs_inserted}</td>
                    <td className="p-4 text-slate-300">{run.jobs_updated}</td>
                    <td className="p-4 text-slate-400">{run.jobs_duplicates}</td>
                    <td className="p-4 max-w-xs text-[11px] text-rose-400 truncate">
                      {run.error_message || "—"}
                    </td>
                  </tr>
                );
              })}
              {runs.results.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    No run logs found in database.
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
