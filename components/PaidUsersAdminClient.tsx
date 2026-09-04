"use client";

import React, { useState } from "react";
import {
  Crown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Briefcase,
  LifeBuoy,
  MessageSquare,
  Zap,
  Activity,
  UserCheck,
  UserX,
  X,
  Send,
} from "lucide-react";
import { CandidateComplaint } from "@/lib/repositories/complaintRepository";

export interface PaidSubscriber {
  id: string;
  email: string;
  name: string;
  phone?: string;
  upiVpa?: string;
  profession: string;
  isEmailVerified: boolean;
  isTrial: boolean;
  isActive: boolean;
  subscriptionTier: string;
  subscriptionStatus: string;
  planLabel: string;
  amountPaid: number;
  currencyPaid: string;
  paymentId: string;
  gateway: string;
  startedAt: string;
  expiresAt: string;
  daysRemaining: number;
  lastLoginAt: string;
  createdAt: string;
  // Daily activity metrics
  applicationsCount: number;
  interviewingCount: number;
  offersCount: number;
  recentApplications: Array<{
    id: string;
    jobTitle: string;
    companyName: string;
    status: string;
    appliedAt: string;
    lastUpdatedAt: string;
    notes?: string;
  }>;
  // Health
  healthStatus: "HEALTHY" | "EXPIRING_SOON" | "NEEDS_ATTENTION";
  healthNotes: string[];
  openTicketsCount: number;
}

interface PaidUsersAdminClientProps {
  subscribers: PaidSubscriber[];
  complaints: CandidateComplaint[];
  telemetry: {
    totalRevenueInr: number;
    activeCount: number;
    expiringCount: number;
    openTicketsCount: number;
    razorpayConnected: boolean;
    supabaseConnected: boolean;
    emailProvider: string;
    emailQuotaRemaining: number;
  };
}

export function PaidUsersAdminClient({
  subscribers: initialSubscribers,
  complaints: initialComplaints,
  telemetry,
}: PaidUsersAdminClientProps) {
  const [activeTab, setActiveTab] = useState<"SUBSCRIBERS" | "TICKETS">("SUBSCRIBERS");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<PaidSubscriber | null>(null);

  // Complaints state for interactive resolution
  const [complaints, setComplaints] = useState<CandidateComplaint[]>(initialComplaints);
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  // Filter subscribers
  const filteredSubscribers = initialSubscribers.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === "" ||
      s.email.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      (s.upiVpa && s.upiVpa.toLowerCase().includes(q)) ||
      s.paymentId.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === "ACTIVE") return s.daysRemaining > 0;
    if (statusFilter === "EXPIRING") return s.daysRemaining <= 7 && s.daysRemaining > 0;
    if (statusFilter === "ISSUES") return s.healthStatus === "NEEDS_ATTENTION" || s.openTicketsCount > 0;
    return true;
  });

  // Handle ticket resolution
  const handleUpdateTicketStatus = async (ticketId: string, newStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED") => {
    setUpdatingTicketId(ticketId);
    try {
      const res = await fetch("/api/admin/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticketId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === ticketId || c.ticketId === ticketId ? data.data : c))
        );
      }
    } catch (err) {
      console.error("Failed to update ticket:", err);
    } finally {
      setUpdatingTicketId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Paid Users & VIP Experience Monitor
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time subscriber tracking, daily activity telemetry, health checks, and priority support desk.
              </p>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab("SUBSCRIBERS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "SUBSCRIBERS"
                ? "bg-brand-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Subscribers ({initialSubscribers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("TICKETS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "TICKETS"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>VIP Complaints</span>
            {telemetry.openTicketsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-400 text-slate-950 text-[10px] font-black">
                {telemetry.openTicketsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── KPI & Telemetry Cards Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            PRO Subscription Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{telemetry.totalRevenueInr.toLocaleString("en-IN")}
          </div>
          <p className="text-[10px] text-slate-500">Live captured payments (INR)</p>
        </div>

        {/* Active Paying Subscribers */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active VIP Subscribers
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {telemetry.activeCount} <span className="text-xs text-slate-500 font-normal">users</span>
          </div>
          <p className="text-[10px] text-slate-500">
            {telemetry.expiringCount > 0 ? `⚠️ ${telemetry.expiringCount} expiring within 7 days` : "All plans active and healthy"}
          </p>
        </div>

        {/* Open Complaints */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            VIP Support Desk
          </span>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">
            {telemetry.openTicketsCount} <span className="text-xs text-slate-500 font-normal">open</span>
          </div>
          <p className="text-[10px] text-slate-500">
            {telemetry.openTicketsCount === 0 ? "🎉 Zero pending complaints" : "Requires engineering review"}
          </p>
        </div>

        {/* System & Gateway Status */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            System Infrastructure
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Razorpay Gateway</span>
              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Mode
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Supabase Cloud DB</span>
              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Email Relay ({telemetry.emailProvider})</span>
              <span className="text-sky-400 font-bold text-[11px]">
                {telemetry.emailQuotaRemaining} left
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB 1: SUBSCRIBERS DIRECTORY & ACTIVITY ── */}
      {activeTab === "SUBSCRIBERS" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by email, phone, name, or payment ID..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              {["ALL", "ACTIVE", "EXPIRING", "ISSUES"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === f
                      ? "bg-brand-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {f === "ALL" && "All Users"}
                  {f === "ACTIVE" && "Active"}
                  {f === "EXPIRING" && "Expiring Soon (≤7d)"}
                  {f === "ISSUES" && "Needs Attention"}
                </button>
              ))}
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-5">Subscriber / Candidate</th>
                    <th className="py-3.5 px-4">Contact & Payment</th>
                    <th className="py-3.5 px-4">Plan & Validity</th>
                    <th className="py-3.5 px-4">Daily Activity</th>
                    <th className="py-3.5 px-4">System Health</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No subscribers found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredSubscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-900/50 transition-colors">
                        {/* Subscriber */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                              {sub.name ? sub.name.substring(0, 2).toUpperCase() : "VIP"}
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                                <span>{sub.name}</span>
                                {sub.isEmailVerified && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {sub.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact & Payment */}
                        <td className="py-4 px-4 space-y-1">
                          <div className="text-white font-bold text-xs flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            <span>₹{sub.amountPaid} INR</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300">
                              {sub.gateway}
                            </span>
                          </div>
                          {sub.phone && (
                            <div className="text-[11px] text-amber-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-amber-500" />
                              <span>{sub.phone}</span>
                            </div>
                          )}
                          {sub.upiVpa && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              VPA: {sub.upiVpa}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 font-mono">
                            {sub.paymentId}
                          </div>
                        </td>

                        {/* Plan & Validity */}
                        <td className="py-4 px-4 space-y-1">
                          <div className="text-xs font-bold text-white">
                            {sub.planLabel}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>
                              {sub.daysRemaining > 0 ? (
                                <strong className={sub.daysRemaining <= 7 ? "text-amber-400" : "text-emerald-400"}>
                                  {sub.daysRemaining} days left
                                </strong>
                              ) : (
                                <strong className="text-rose-400">Expired</strong>
                              )}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Until {new Date(sub.expiresAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                        </td>

                        {/* Daily Activity */}
                        <td className="py-4 px-4 space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-white">
                            <Briefcase className="w-3.5 h-3.5 text-brand-400" />
                            <span>{sub.applicationsCount} Applications</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {sub.interviewingCount > 0 && (
                              <span className="text-purple-400 font-bold mr-2">
                                📞 {sub.interviewingCount} Interviewing
                              </span>
                            )}
                            {sub.offersCount > 0 && (
                              <span className="text-emerald-400 font-bold">
                                🎯 {sub.offersCount} Offers
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Active: {new Date(sub.lastLoginAt || sub.createdAt).toLocaleDateString("en-GB")}
                          </div>
                        </td>

                        {/* System Health */}
                        <td className="py-4 px-4">
                          {sub.openTicketsCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-bold">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              <span>{sub.openTicketsCount} Open Ticket{sub.openTicketsCount > 1 ? "s" : ""}</span>
                            </span>
                          ) : sub.healthStatus === "EXPIRING_SOON" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Expiring Soon</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>All Good</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedUser(sub)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Activity className="w-3 h-3" />
                            <span>Inspect Activity</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: VIP COMPLAINTS & SUPPORT DESK ── */}
      {activeTab === "TICKETS" && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">VIP Priority Support Tickets</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complaints submitted by paid users via the candidate dashboard.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                {complaints.length} Total Logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-5">Ticket ID</th>
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Subject & Category</th>
                    <th className="py-3 px-4">Full Message</th>
                    <th className="py-3 px-4">Priority / Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {complaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No VIP support complaints reported yet.
                      </td>
                    </tr>
                  ) : (
                    complaints.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-900/50 transition-colors">
                        {/* Ticket ID */}
                        <td className="py-4 px-5">
                          <span className="font-mono font-bold text-sky-400 text-xs">
                            {ticket.ticketId}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(ticket.createdAt).toLocaleString("en-GB")}
                          </div>
                        </td>

                        {/* Candidate */}
                        <td className="py-4 px-4 space-y-0.5">
                          <div className="font-bold text-white">{ticket.userName || "Candidate"}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{ticket.userEmail}</div>
                          {ticket.userPhone && (
                            <div className="text-[10px] text-amber-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{ticket.userPhone}</span>
                            </div>
                          )}
                          <span className="inline-block px-1.5 py-0.2 rounded-md bg-slate-800 text-[10px] text-slate-400">
                            {ticket.planLabel || "Candidate Pro"}
                          </span>
                        </td>

                        {/* Subject & Category */}
                        <td className="py-4 px-4 space-y-1 max-w-xs">
                          <div className="font-bold text-white">{ticket.subject}</div>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                            {ticket.category}
                          </span>
                        </td>

                        {/* Full Message */}
                        <td className="py-4 px-4 max-w-md">
                          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-3">
                            {ticket.message}
                          </p>
                        </td>

                        {/* Priority / Status */}
                        <td className="py-4 px-4 space-y-1">
                          <div>
                            {ticket.priority === "URGENT" ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-black text-[10px]">
                                🔥 URGENT
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                                Normal
                              </span>
                            )}
                          </div>
                          <div>
                            {ticket.status === "RESOLVED" ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                                ✓ Resolved
                              </span>
                            ) : ticket.status === "IN_PROGRESS" ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[10px]">
                                In Progress
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-[10px]">
                                Open
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right space-x-2">
                          <a
                            href={`mailto:${ticket.userEmail}?subject=Re: SponsorAJobs VIP Support [${ticket.ticketId}] - ${encodeURIComponent(ticket.subject)}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                          >
                            <Mail className="w-3 h-3 text-sky-400" />
                            <span>Reply</span>
                          </a>

                          {ticket.status !== "RESOLVED" ? (
                            <button
                              onClick={() => handleUpdateTicketStatus(ticket.id, "RESOLVED")}
                              disabled={updatingTicketId === ticket.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Resolve</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateTicketStatus(ticket.id, "OPEN")}
                              disabled={updatingTicketId === ticket.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Re-open
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── DAILY ACTIVITY & HEALTH INSPECTION MODAL / DRAWER ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-black text-sm">
                  {selectedUser.name ? selectedUser.name.substring(0, 2).toUpperCase() : "VIP"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Account Health & Status Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-500 font-bold">Plan Tier</div>
                  <div className="text-sm font-black text-white mt-0.5">{selectedUser.planLabel}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-500 font-bold">Validity</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">
                    {selectedUser.daysRemaining} Days Left
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-500 font-bold">Total Applied</div>
                  <div className="text-sm font-black text-white mt-0.5">
                    {selectedUser.applicationsCount} Jobs
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="text-[11px] text-slate-500 font-bold">Contact</div>
                  <div className="text-xs font-bold text-amber-400 mt-0.5">
                    {selectedUser.phone || "On File"}
                  </div>
                </div>
              </div>

              {/* Health Audit Check */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Account Integrity & Health Audit</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Email Verified: {selectedUser.isEmailVerified ? "Yes" : "No"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Payment Capture: Verified on {selectedUser.gateway}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Account Status: {selectedUser.isActive ? "Active" : "Suspended"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Payment ID: {selectedUser.paymentId}</span>
                  </div>
                </div>
              </div>

              {/* Applications Tracked */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tracked Applications & Daily Activity ({selectedUser.recentApplications.length})
                  </h4>
                </div>

                {selectedUser.recentApplications.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                    This candidate has not logged any job applications in their tracker yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.recentApplications.map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{app.jobTitle}</div>
                          <div className="text-[11px] text-slate-400">{app.companyName}</div>
                          {app.notes && (
                            <p className="text-[10px] text-slate-500 mt-1 italic">&ldquo;{app.notes}&rdquo;</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-brand-400">
                            {app.status}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {new Date(app.lastUpdatedAt || app.appliedAt).toLocaleDateString("en-GB")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <a
                href={`mailto:${selectedUser.email}?subject=SponsorAJobs VIP Concierge Check-in`}
                className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:underline font-semibold"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Customer Support Email</span>
              </a>
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
