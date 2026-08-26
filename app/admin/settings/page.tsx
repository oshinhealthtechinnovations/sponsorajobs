import React from "react";
import { getFeatureFlags } from "@/config/features";
import { verifyAdminSession } from "@/lib/services/adminAuth";
import { redirect } from "next/navigation";
import { Settings, ShieldCheck, Cpu, Database, Flag } from "lucide-react";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    redirect("/admin/login");
  }

  const flags = getFeatureFlags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Configuration & Flags</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review centralized feature flags, threshold parameters, and environment controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature Flags (Section 136) */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Active Feature Flags</h2>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            {Object.entries(flags).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-mono text-slate-300">{key}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    val
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {val ? "ENABLED" : "DISABLED"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quality & Policy Thresholds (Section 125) */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white">Engine Parameters</h2>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-300">Stale Job Expiry Threshold</span>
              <span className="font-bold text-white">30 Days</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-300">Minimum Description Quality</span>
              <span className="font-bold text-white">20 Characters</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-300">Max Search Page Size</span>
              <span className="font-bold text-white">50 Results</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-300">SEO Index Minimum Job Threshold</span>
              <span className="font-bold text-white">5 Jobs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
