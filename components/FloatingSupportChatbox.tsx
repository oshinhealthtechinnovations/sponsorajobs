"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  HelpCircle,
  RefreshCw,
  Globe2,
} from "lucide-react";

const QUICK_TOPICS = [
  "🇬🇧 UK Skilled Worker Sponsorship",
  "🇺🇸 US H-1B / E-3 / Tech Visa",
  "🇦🇺 Australia TSS 482 / 186",
  "💳 VIP Pass & Apply Link Unlock",
  "📄 CV Optimization & ATS Scoring",
  "❓ General Question",
];

export function FloatingSupportChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-fill logged in user email if available
  useEffect(() => {
    try {
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sa_user_session="));
      if (match) {
        const val = decodeURIComponent(match.split("=")[1]);
        const parsed = JSON.parse(val);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.name) setName(parsed.name);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address so we can reply.");
      return;
    }
    if (!message.trim() || message.trim().length < 5) {
      setError("Please type your question (at least 5 characters).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic: topic || "General Question",
          message: message.trim(),
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setMessage("");
      } else {
        setError(json.error || "Failed to send message. Please try again.");
      }
    } catch (err: any) {
      console.error("[Chatbox] Submit error:", err);
      setError("Network error. Please try again or email support@sponsorajobs.com.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setMessage("");
    setError(null);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-5 right-5 z-50">
        {!isOpen && (
          <button
            onClick={() => {
              setIsOpen(true);
              setHasInteracted(true);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 text-white shadow-xl shadow-brand-600/30 hover:shadow-brand-600/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
            aria-label="Open support chat"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />
            </div>
            <span className="text-xs font-bold tracking-tight pr-1">
              Ask a Question
            </span>
          </button>
        )}
      </div>

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-[410px] max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>SponsorAJobs Helpdesk</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Live
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Ask any question &bull; Instant email reply</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 overflow-y-auto max-h-[calc(90vh-130px)] space-y-4">
            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Question Delivered!</h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
                    We've pinged our support team directly. A confirmation has been sent to{" "}
                    <strong className="text-sky-300">{email}</strong>. We will reply to you shortly!
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Ask Another Question
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Intro message bubble */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  👋 <strong>Hello!</strong> Have a question about visa sponsorship rules, finding verified employers, or unlocking job apply links? Send your question below!
                </div>

                {/* Quick topic pills */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Suggested Topics:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TOPICS.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTopic(t)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          topic === t
                            ? "bg-brand-600/30 border-brand-500 text-brand-300 font-bold shadow-xs"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Your Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Name input (optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Your Name <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Alex"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Question Textarea */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Your Question <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    ref={textareaRef}
                    required
                    rows={3}
                    placeholder="How can we help you today? (e.g. Do you have visa-sponsored roles in Civil Engineering?)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-xs text-white placeholder-slate-500 outline-none resize-none transition-all"
                  />
                </div>

                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending to team...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Question to Support</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-500 text-center">
                  Replies are delivered directly to your inbox &bull; No spam guaranteed.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
