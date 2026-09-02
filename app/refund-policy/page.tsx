import React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Refund & Cancellation Policy | SponsorAJobs",
  description:
    "Statutory refund and cancellation terms for Candidate Pro subscriptions and digital services on SponsorAJobs.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        {/* Header */}
        <div className="space-y-3 border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Customer Protection & Statutory Guarantee</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
            Refund & Cancellation Policy
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: September 2026 &middot; Compliant with UK Consumer Rights & Global Merchant Standards
          </p>
        </div>

        {/* Core Terms Container */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-black">
                1
              </span>
              <span>14-Day Money-Back Guarantee</span>
            </h2>
            <p>
              At SponsorAJobs, we want you to be completely confident in your visa sponsorship search. If you purchase the <strong>Candidate Pro Pass (₹299 INR)</strong> and find that the verified employer contacts, direct ATS links, or AI tools do not meet your expectations, you are entitled to a <strong>full 100% refund within 14 calendar days</strong> of your initial transaction.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-black">
                2
              </span>
              <span>How to Request a Refund</span>
            </h2>
            <p>
              To initiate a refund under our 14-day guarantee, simply submit an email request to our support desk:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div>
                <strong>Support Email:</strong>{" "}
                <a href="mailto:auth@sponsorajobs.com" className="text-brand-600 font-semibold underline">
                  auth@sponsorajobs.com
                </a>{" "}
                /{" "}
                <a href="mailto:oshinhealthtechinnovations@gmail.com" className="text-brand-600 font-semibold underline">
                  oshinhealthtechinnovations@gmail.com
                </a>
              </div>
              <div>
                <strong>Required Details:</strong> Your registered account email address and your order or checkout session reference.
              </div>
              <div>
                <strong>Response Window:</strong> Our billing team acknowledges all refund inquiries within 24 business hours.
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-black">
                3
              </span>
              <span>Processing Timeline & Payment Methods</span>
            </h2>
            <p>
              Once approved, your refund will be processed immediately via our payment processor (Stripe). Funds will be credited back to the original payment card or method (Visa, Mastercard, American Express, Apple Pay, Google Pay) within <strong>5 to 10 standard business days</strong>, depending on your card issuer’s clearing cycles.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-black">
                4
              </span>
              <span>Subscription Renewals & Cancellation</span>
            </h2>
            <p>
              Candidate Pro passes are granted on a fixed-term basis (1 year). If an auto-renewing subscription tier is selected at checkout, you may cancel renewal at any time via your account settings or by contacting our team. Cancellation stops any subsequent billing charges while retaining your active Pro status until the end of your current paid billing period.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-black">
                5
              </span>
              <span>Statutory Consumer Rights</span>
            </h2>
            <p>
              Nothing in this policy limits or excludes your statutory legal rights under the UK Consumer Rights Act 2015, the Consumer Contracts Regulations 2013, or applicable consumer protection laws in your jurisdiction.
            </p>
          </section>

          {/* Operating Entity Notice */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p>
              <strong>Operating Entity:</strong> SponsorAJobs &middot; Oshin Healthtech Innovations.
            </p>
            <p>
              For legal and privacy inquiries, please also review our{" "}
              <Link href="/terms" className="text-brand-600 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-brand-600 underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
