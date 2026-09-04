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
  Search,
  ChevronDown,
  ChevronUp,
  Zap,
  Crown,
  ArrowRight,
  ShieldCheck,
  Flame,
} from "lucide-react";
import { CHAT_FAQ_DATABASE, ChatFaqItem } from "@/lib/data/chatFaqDatabase";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "apply", label: "🔓 Apply Links" },
  { key: "visa", label: "🌍 Visa Rules" },
  { key: "vip", label: "👑 VIP Pass" },
  { key: "cv", label: "📄 AI CV & ATS" },
  { key: "pricing", label: "💳 Payments" },
];

export function FloatingSupportChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("unlock-apply-links");

  // Contact Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    if (isOpen && activeTab === "contact" && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen, activeTab]);

  const handleOpenProGate = (featureName: string = "VIP Candidate Pass") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-pro-gate", {
          detail: { featureName },
        })
      );
    }
  };

  const filteredFaqs = CHAT_FAQ_DATABASE.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      item.question.toLowerCase().includes(q) ||
      item.shortAnswer.toLowerCase().includes(q) ||
      item.detailedAnswer.toLowerCase().includes(q) ||
      item.categoryLabel.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

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
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 text-white shadow-xl shadow-brand-600/30 hover:shadow-brand-600/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
            aria-label="Open support chat and instant answers"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black tracking-tight leading-tight">
                Ask a Question
              </span>
              <span className="text-[10px] text-sky-200 font-medium leading-tight">
                Instant Answers &bull; 24/7
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-[440px] max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 via-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>SponsorAJobs Concierge</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Instant
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Visa FAQs &bull; Direct Support</p>
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

          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 bg-slate-950 border-b border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab("faq")}
              className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                activeTab === "faq"
                  ? "border-amber-400 text-amber-300 bg-slate-900/60"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Answers (FAQ)</span>
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`py-2.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-b-2 ${
                activeTab === "contact"
                  ? "border-brand-500 text-brand-300 bg-slate-900/60"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-brand-400" />
              <span>Message Team</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-5 overflow-y-auto max-h-[calc(90vh-140px)] space-y-4">
            {activeTab === "faq" ? (
              <div className="space-y-3.5">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search visa questions, apply links, prices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-400 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setSelectedCategory(c.key)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === c.key
                          ? "bg-amber-400/15 border-amber-400/40 text-amber-300 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-2.5">
                  {filteredFaqs.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400">No matching questions found.</p>
                      <button
                        onClick={() => setActiveTab("contact")}
                        className="text-xs text-brand-400 hover:underline font-bold"
                      >
                        Ask our team directly &rarr;
                      </button>
                    </div>
                  ) : (
                    filteredFaqs.map((faq) => {
                      const isExpanded = expandedFaqId === faq.id;
                      return (
                        <div
                          key={faq.id}
                          className={`rounded-2xl border transition-all overflow-hidden ${
                            isExpanded
                              ? "bg-slate-950/90 border-slate-700 shadow-md"
                              : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <button
                            onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                            className="w-full p-3.5 text-left flex items-start justify-between gap-2.5 cursor-pointer"
                          >
                            <span className="text-xs font-bold text-white leading-snug">
                              {faq.question}
                            </span>
                            <span className="p-1 rounded-md bg-slate-800 text-slate-400 shrink-0">
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-slate-900 animate-in fade-in duration-150">
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {faq.detailedAnswer}
                              </p>

                              {/* Conversion Motivator Card */}
                              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-slate-900 border border-amber-500/30 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                    <Flame className="w-2.5 h-2.5 text-amber-400" />
                                    <span>{faq.promoBadge || "Candidate Pro"}</span>
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400">₹6.6/day</span>
                                </div>

                                <div>
                                  <h4 className="text-xs font-black text-white">
                                    {faq.promoTitle}
                                  </h4>
                                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                                    {faq.promoDescription}
                                  </p>
                                </div>

                                <button
                                  onClick={() => handleOpenProGate(faq.promoTitle)}
                                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
                                >
                                  <span>{faq.promoCtaText}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Hand-off Footer */}
                <div className="pt-2 border-t border-slate-800 text-center">
                  <p className="text-[11px] text-slate-400">
                    Have a unique or complex situation?{" "}
                    <button
                      onClick={() => setActiveTab("contact")}
                      className="text-brand-400 hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Message our team directly</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              /* Contact Form Tab */
              <div>
                {success ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Question Delivered!</h4>
                      <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
                        We've forwarded your inquiry directly to our support leads. A confirmation has been sent to{" "}
                        <strong className="text-sky-300">{email}</strong>. We will reply to your inbox shortly!
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Ask Another Question
                      </button>
                      <button
                        onClick={() => setActiveTab("faq")}
                        className="text-xs text-amber-400 hover:underline font-bold"
                      >
                        &larr; View Instant Answers & FAQ
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      💬 <strong>Direct Helpdesk:</strong> Our executive team monitors all incoming questions. Your message is dispatched instantly to our leads.
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Your Email <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-brand-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
                        />
                      </div>
                    </div>

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
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-brand-500 text-xs text-white placeholder-slate-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Your Question <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        ref={textareaRef}
                        required
                        rows={3}
                        placeholder="How can we help? (e.g. Can I get a UK Skilled Worker visa as a civil engineer from India?)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-brand-500 text-xs text-white placeholder-slate-500 outline-none resize-none transition-all"
                      />
                    </div>

                    {error && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Dispatching to team...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Question to Support</span>
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-slate-500 text-center">
                      Replies are delivered directly to your inbox &bull; No spam.
                    </p>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
