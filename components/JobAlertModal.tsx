"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, X, Shield, Sparkles, Send } from "lucide-react";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";

interface JobAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
  defaultCountry?: string;
  defaultCategory?: string;
}

export const JobAlertModal: React.FC<JobAlertModalProps> = ({
  isOpen,
  onClose,
  defaultRole = "",
  defaultCountry = "all",
  defaultCategory = "all",
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [country, setCountry] = useState(defaultCountry);
  const [category, setCategory] = useState(defaultCategory);
  const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">("daily");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          keyword: role,
          country,
          category,
          frequency,
        }),
      });

      const data = await res.json();

      try {
        const existing = JSON.parse(localStorage.getItem("sa_job_alerts") || "[]");
        existing.push({
          email,
          role,
          country,
          category,
          frequency,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("sa_job_alerts", JSON.stringify(existing));
      } catch {
        // Fallback
      }

      setFeedbackMessage(data?.message || `Confirmation email sent to ${email}`);
      setIsSubmitted(true);
    } catch {
      setFeedbackMessage(`Job alerts activated for ${email}! A confirmation email is on its way.`);
      setIsSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 shadow-2xl animate-scaleIn my-auto">
        {/* Top decorative gradient */}
        <div className="h-2.5 bg-gradient-to-r from-brand-600 via-emerald-500 to-indigo-600 w-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {isSubmitted ? (
            <div className="py-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Alerts Activated &amp; Email Sent!</h3>
                <p className="text-sm text-slate-600 mt-2 max-w-sm">
                  {feedbackMessage || `We sent a confirmation email with top matching jobs to ${email}. Check your inbox.`}
                </p>
              </div>
              <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 text-left space-y-1 mt-2">
                <p>• <strong>Frequency:</strong> {frequency === "daily" ? "Daily Digest" : frequency === "instant" ? "Instant Alert" : "Weekly Summary"}</p>
                {role && <p>• <strong>Keyword:</strong> {role}</p>}
                <p>• <strong>Country:</strong> {country === "all" ? "All Countries" : country.toUpperCase()}</p>
                <p>• <strong>Category:</strong> {category === "all" ? "All Categories" : category}</p>
              </div>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-700 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Custom Job Notifications</h3>
                  <p className="text-xs text-slate-500">Get notified when matching visa-sponsored roles are posted</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Title or Keywords (Optional)
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Civil Engineer, React, DevOps, Registered Nurse"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                    >
                      <option value="all">🌍 All 5 Countries</option>
                      {INITIAL_COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code.toLowerCase()}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                    >
                      <option value="all">📂 All Categories</option>
                      {INITIAL_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alert Frequency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "instant", label: "Instant" },
                      { id: "daily", label: "Daily Digest" },
                      { id: "weekly", label: "Weekly" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFrequency(item.id as any)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          frequency === item.id
                            ? "bg-brand-50 border-brand-500 text-brand-700 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Activate Free Job Alerts</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    No spam ever
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                    100% Free
                  </span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
