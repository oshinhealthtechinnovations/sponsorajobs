import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Terms of Service</h1>

        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>Last updated: August 2026</p>

          <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using SponsorAJobs.com, you agree to comply with and be bound by these Terms of Service.
          </p>

          <h2 className="text-base font-bold text-slate-900">2. Nature of Service</h2>
          <p>
            SponsorAJobs is an information aggregator and search engine. We do not act as an employer, recruiter, immigration lawyer, or visa issuing authority. All job applications are conducted directly between candidates and employers.
          </p>

          <h2 className="text-base font-bold text-slate-900">3. Intellectual Property & Fair Use</h2>
          <p>
            All trademarks, logos, and job descriptions displayed remain the intellectual property of their respective owners. Listing signals are derived via fair automated inspection for informational discovery.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
