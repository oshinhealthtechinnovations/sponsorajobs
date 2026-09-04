"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertCircle, RotateCcw, Crown } from "lucide-react";
import { PaidUsersAdminClient, PaidSubscriber } from "@/components/PaidUsersAdminClient";
import { CandidateComplaint } from "@/lib/repositories/complaintRepository";

export default function AdminSubscribersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<PaidSubscriber[]>([]);
  const [complaints, setComplaints] = useState<CandidateComplaint[]>([]);
  const [telemetry, setTelemetry] = useState<any>({
    totalRevenueInr: 597,
    activeCount: 3,
    expiringCount: 0,
    openTicketsCount: 0,
    razorpayConnected: true,
    supabaseConnected: true,
    emailProvider: "Domain SMTP (mail.sponsorajobs.com)",
    emailQuotaRemaining: 100,
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        setSubscribers(json.data.subscribers || []);
        setComplaints(json.data.complaints || []);
        if (json.data.telemetry) {
          setTelemetry(json.data.telemetry);
        }
      } else {
        setError(json.error || "Failed to load subscriber data.");
      }
    } catch (err: any) {
      console.error("Error loading subscribers:", err);
      setError("Network or server error while connecting to subscriber database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Loading Paid Users & Activity...</h2>
          <p className="text-xs text-slate-400 mt-1">Connecting to Supabase and Razorpay telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center max-w-lg mx-auto space-y-4 my-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Error Connecting to Subscriber Monitor</h3>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
        </div>
        <button
          onClick={loadData}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <PaidUsersAdminClient
      subscribers={subscribers}
      complaints={complaints}
      telemetry={telemetry}
    />
  );
}
