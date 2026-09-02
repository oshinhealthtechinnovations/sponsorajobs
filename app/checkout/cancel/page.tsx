import React from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Checkout Not Completed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Your Order Was Cancelled
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            No charges were made to your account. You can continue browsing live vacancies for free or upgrade whenever you are ready.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-left space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Why International Candidates Choose Candidate Pro (₹299 INR):
          </h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-brand-600 font-bold">✓</span>
              <span>Direct application access to licensed Home Office and US H-1B sponsoring employers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-600 font-bold">✓</span>
              <span>Automated statutory salary check guaranteeing applications meet the £38,700 UK threshold.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brand-600 font-bold">✓</span>
              <span>14-day statutory money-back guarantee with zero risk.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            Review Pro Plans & Pricing
          </Link>
          <Link
            href="/jobs"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
          >
            Return to Job Search
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
