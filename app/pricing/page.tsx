"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Zap,
  CheckCircle2,
  Star,
  ChevronDown,
  Globe,
  FileText,
  Brain,
  BarChart3,
  Sparkles,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RazorpayCheckoutButton } from "@/components/RazorpayCheckoutButton";

// ─── Plan definitions (display only — server is source of truth for prices) ──
const PLANS = [
  {
    code: "SA_MONTH_199",
    label: "1 Month",
    amount: 199,
    perDay: "₹6.6/day",
    badge: null,
    highlight: false,
    description: "Try premium risk-free",
  },
  {
    code: "SA_3MONTH_499",
    label: "3 Months",
    amount: 499,
    perDay: "₹5.5/day",
    badge: "Best Value",
    highlight: false,
    description: "Perfect for active job seekers",
  },
  {
    code: "SA_6MONTH_799",
    label: "6 Months",
    amount: 799,
    perDay: "₹4.4/day",
    badge: null,
    highlight: false,
    description: "For serious career changers",
  },
  {
    code: "SA_YEAR_999",
    label: "12 Months",
    amount: 999,
    perDay: "₹2.7/day",
    badge: "Most Popular",
    highlight: true,
    description: "Best rate — full year access",
  },
];

const PREMIUM_FEATURES = [
  { icon: FileText, label: "CV Upload & Analysis", desc: "AI-scored against each job" },
  { icon: Brain, label: "CV → Job Match", desc: "Precise sponsorship fit score" },
  { icon: BarChart3, label: "Application Fit Score", desc: "Know before you apply" },
  { icon: Shield, label: "Eligibility Analysis", desc: "Visa route assessment" },
  { icon: Globe, label: "Sponsorship Intelligence", desc: "Employer visa track record" },
  { icon: Sparkles, label: "Advanced Career Analysis", desc: "Skills gap + growth path" },
];

const FREE_FEATURES = [
  "Browse unlimited verified jobs",
  "Search & filter by country, category, salary",
  "View full job details",
  "Employer profiles",
  "Basic sponsorship signals",
  "Salary insights",
  "Career tools preview",
  "Free alerts",
];

export default function PricingPage() {
  const [user, setUser] = useState<any>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  const faqs = [
    {
      q: "Is job browsing still free?",
      a: "Yes — 100% free, forever. Browse jobs, search, filter, view full details, and use basic sponsorship signals with no subscription. Premium unlocks the analytical intelligence layer.",
    },
    {
      q: "Which payment methods are accepted?",
      a: "All UPI apps (GPay, PhonePe, Paytm, BHIM), Debit/Credit cards, Net Banking, and wallets via Razorpay — India's most trusted payment gateway.",
    },
    {
      q: "Is my payment secure?",
      a: "Razorpay is PCI-DSS Level 1 compliant. We never store card details. Payment signature is verified server-side before any premium access is granted.",
    },
    {
      q: "What if my payment fails?",
      a: "Nothing is charged if payment fails. Your account remains free. You can try again anytime.",
    },
    {
      q: "Can I cancel or get a refund?",
      a: "Subscriptions are non-refundable after activation. Contact support@sponsorajobs.com for exceptional cases.",
    },
    {
      q: "What happens when my plan expires?",
      a: "Your account stays active with full free-tier access. All your saved data is preserved. Renew anytime to restore premium.",
    },
  ];

  return (
    <>
      <Navbar />
      <main
        style={{
          background: "linear-gradient(180deg, #071522 0%, #0a1f35 40%, #071522 100%)",
          minHeight: "100vh",
        }}
      >
        {/* Back link */}
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to jobs
          </Link>
        </div>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 pt-12 pb-8 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
            style={{
              background: "rgba(25,203,224,0.12)",
              border: "1px solid rgba(25,203,224,0.3)",
              color: "#19CBE0",
            }}
          >
            <Zap size={12} />
            Free Discovery · Premium Intelligence
          </div>

          <h1
            className="text-4xl md:text-5xl font-extrabold mb-4"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              background: "linear-gradient(135deg, #ffffff 0%, #19CBE0 60%, #19C98B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            SponsorAJobs Premium
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Job discovery is free. Premium unlocks the intelligence layer — CV analysis, eligibility
            scoring, sponsorship intelligence, and career path AI.
          </p>

          {user?.subscriptionTier === "PRO" && (
            <div
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: "rgba(25,201,139,0.15)",
                border: "1px solid rgba(25,201,139,0.35)",
                color: "#19C98B",
              }}
            >
              <CheckCircle2 size={16} />
              You&apos;re already on Premium — thank you!
            </div>
          )}
        </section>

        {/* Pricing Cards */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.code}
                className="relative rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: plan.highlight
                    ? "linear-gradient(145deg, rgba(25,203,224,0.15) 0%, rgba(25,201,139,0.08) 100%)"
                    : "rgba(255,255,255,0.04)",
                  border: plan.highlight
                    ? "1.5px solid rgba(25,203,224,0.45)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: plan.highlight ? "0 0 40px -10px rgba(25,203,224,0.25)" : "none",
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div
                    className="absolute top-0 left-0 right-0 py-1.5 text-center text-xs font-bold tracking-wide"
                    style={{
                      background: plan.highlight
                        ? "linear-gradient(90deg, #19CBE0, #19C98B)"
                        : "rgba(25,203,224,0.2)",
                      color: plan.highlight ? "#071522" : "#19CBE0",
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className={`p-6 flex flex-col flex-1 ${plan.badge ? "pt-10" : ""}`}>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
                    {plan.label}
                  </p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-extrabold text-white">
                      ₹{plan.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mb-1">{plan.perDay}</p>
                  <p className="text-slate-400 text-xs mb-6">{plan.description}</p>

                  {/* Feature checklist */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {PREMIUM_FEATURES.slice(0, 4).map((f) => (
                      <li key={f.label} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                        {f.label}
                      </li>
                    ))}
                    {plan.highlight && (
                      <>
                        {PREMIUM_FEATURES.slice(4).map((f) => (
                          <li key={f.label} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                            {f.label}
                          </li>
                        ))}
                      </>
                    )}
                  </ul>

                  {/* CTA */}
                  {user?.subscriptionTier === "PRO" ? (
                    <div className="text-xs text-slate-500 text-center py-3 border border-slate-700 rounded-xl">
                      Currently Active
                    </div>
                  ) : (
                    <RazorpayCheckoutButton
                      planCode={plan.code}
                      planLabel={`SponsorAJobs Premium — ${plan.label}`}
                      amount={plan.amount}
                      userEmail={user?.email}
                      userName={user?.name}
                      onSuccess={({ paymentId }) => {
                        console.log("[Pricing] Payment success:", paymentId);
                        // Optionally redirect to dashboard
                        setTimeout(() => (window.location.href = "/dashboard"), 2000);
                      }}
                      className={
                        plan.highlight
                          ? "text-[#071522] font-bold"
                          : "text-white border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20"
                      }
                      style={
                        plan.highlight
                          ? {
                              background: "linear-gradient(135deg, #19CBE0 0%, #19C98B 100%)",
                              boxShadow: "0 4px 20px -5px rgba(25,203,224,0.4)",
                            }
                          : undefined
                      }
                    >
                      <Zap size={15} />
                      Get {plan.label} — ₹{plan.amount.toLocaleString("en-IN")}
                    </RazorpayCheckoutButton>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {[
              { icon: Shield, text: "Razorpay Secured" },
              { icon: Lock, text: "PCI-DSS Compliant" },
              { icon: CheckCircle2, text: "Server-verified Payments" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-slate-400 text-xs">
                <Icon size={14} className="text-cyan-500" />
                {text}
              </div>
            ))}
          </div>
        </section>

        {/* Free vs Premium comparison */}
        <section
          className="max-w-4xl mx-auto px-4 py-16"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2
            className="text-2xl font-bold text-center text-white mb-10"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            What&apos;s Free vs. What&apos;s Premium
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Free — Always
              </p>
              <ul className="space-y-3">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={14} className="text-slate-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(25,203,224,0.06)",
                border: "1px solid rgba(25,203,224,0.2)",
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "#19CBE0" }}
              >
                Premium Intelligence
              </p>
              <ul className="space-y-3">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-start gap-2 text-sm text-slate-300">
                    <f.icon size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">{f.label}</strong>
                      <span className="text-slate-400"> — {f.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          className="max-w-3xl mx-auto px-4 py-12"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2
            className="text-2xl font-bold text-center text-white mb-8"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Frequently Asked Questions
          </h2>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className="text-slate-400 shrink-0 transition-transform duration-200"
                    style={{ transform: faqOpen === i ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-slate-400 text-sm mb-6">
            Start free. Upgrade when you&apos;re ready.{" "}
            <Link href="/jobs" className="text-cyan-400 hover:underline">
              Browse jobs now →
            </Link>
          </p>
          <p className="text-slate-600 text-xs">
            By subscribing you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-400">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-slate-400">
              Privacy Policy
            </Link>
            . Payments processed by Razorpay. Secure & encrypted.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
