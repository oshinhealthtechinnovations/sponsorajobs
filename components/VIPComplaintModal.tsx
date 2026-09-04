"use client";

import React, { useState } from "react";
import {
  LifeBuoy,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ComplaintCategory } from "@/lib/repositories/complaintRepository";

interface VIPComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

export function VIPComplaintModal({ isOpen, onClose, user }: VIPComplaintModalProps) {
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("UNLOCK_ISSUE");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; ticketId?: string; message: string } | null>(null);

  // Sync state if user prop changes
  React.useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/user/complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || user?.email,
          name: user?.name,
          phone,
          planLabel: user?.planLabel || "Candidate Pro",
          category,
          subject,
          message,
          priority,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult({
          success: true,
          ticketId: data.ticketId,
          message: data.message || "Your complaint has been submitted directly to the engineering team.",
        });
        setSubject("");
        setMessage("");
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to submit support ticket. Please try again.",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  VIP Priority Support & Complaint Desk
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-extrabold uppercase">
                  VIP Fast-Track
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Instant engineer notification • Direct SLA response window
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {result?.success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-sm font-bold">
                  {result.ticketId}
                </span>
                <h4 className="text-xl font-black text-white mt-3">
                  Complaint Successfully Escalated!
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                  Our core support team has been pinged immediately on high-priority email. A confirmation email with ticket reference ID has also been sent to{" "}
                  <strong className="text-sky-400">{email || user?.email}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-slate-400 font-semibold">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span>Expected Response Time: Within 2–4 Hours</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Our engineers are actively investigating. You may also reply directly to the confirmation email with any additional screenshots.
                </p>
              </div>

              <button
                onClick={() => {
                  setResult(null);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Done / Return to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {result && !result.success && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{result.message}</span>
                </div>
              )}

              {/* User Email & Phone info row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Your Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Category selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Issue Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "UNLOCK_ISSUE", label: "🔓 Job Apply / Unlock" },
                    { id: "CV_SCORING", label: "📄 CV AI Scoring" },
                    { id: "APP_TRACKER", label: "📊 Application Tracker" },
                    { id: "PAYMENT", label: "💳 Payment / Plan" },
                    { id: "BUG_FEEDBACK", label: "🐛 Bug / Glitch" },
                    { id: "OTHER", label: "💬 General Complaint" },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id as ComplaintCategory)}
                      className={`px-3 py-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                        category === cat.id
                          ? "bg-brand-600/20 border-brand-500 text-white shadow-xs"
                          : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Cannot unlock direct apply link for London Software role"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-brand-500"
                />
              </div>

              {/* Detailed Message */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Detailed Complaint / Issue Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe exactly what happened, which job URL or feature was affected, and how we can assist you..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-brand-500 leading-relaxed resize-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Include as much detail as possible to help our developers resolve this without back-and-forth.
                </p>
              </div>

              {/* Priority Flag */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Zap className={`w-4 h-4 ${priority === "URGENT" ? "text-rose-400" : "text-slate-500"}`} />
                  <div>
                    <span className="text-xs font-bold text-white">Emergency / Blocking Issue</span>
                    <p className="text-[10px] text-slate-400">Pages the engineer on call immediately</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPriority(priority === "URGENT" ? "NORMAL" : "URGENT")}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer border ${
                    priority === "URGENT"
                      ? "bg-rose-600 text-white border-rose-500"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {priority === "URGENT" ? "🔥 URGENT" : "Normal"}
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Transmitting Ticket...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Complaint & Alert Lead</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
