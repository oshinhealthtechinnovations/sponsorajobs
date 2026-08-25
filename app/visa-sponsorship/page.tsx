import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { INITIAL_COUNTRIES } from "@/config/countries";
import Link from "next/link";
import { ShieldCheck, ArrowRight, ExternalLink, HelpCircle } from "lucide-react";

export default function VisaSponsorshipHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Immigration Frameworks</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Visa Sponsorship Guides
          </h1>
          <p className="text-slate-600 text-base mt-2">
            Understand how work visas, employer sponsorship licenses, and legal immigration requirements work across our target countries.
          </p>
        </div>

        {/* Informational Guidance Overview */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs mb-10 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">What is Visa Sponsorship?</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Employer visa sponsorship occurs when a company legally petitions or issues an approved Certificate / LMIA / Nomination to allow an overseas worker to live and work legally in the destination country.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-1">1. Employer Eligibility</h3>
              <p className="text-xs text-slate-600">The employer must hold a government-approved sponsor licence or accredited status.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-1">2. Role Qualification</h3>
              <p className="text-xs text-slate-600">The role must meet minimum skill and salary thresholds defined by immigration law.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-1">3. Candidate Assessment</h3>
              <p className="text-xs text-slate-600">The applicant must meet English proficiency, experience, and background checks.</p>
            </div>
          </div>
        </div>

        {/* Country Specific Guides */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Country-Specific Visa Pathways</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_COUNTRIES.map((c) => (
              <Link
                key={c.code}
                href={`/visa-sponsorship/${c.slug}`}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-2">{c.flag}</div>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-brand-600 transition-colors">
                    {c.name} Visa Guide
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Explore Skilled Worker, CoS, H-1B, TSS 482, LMIA & AEWV requirements.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-semibold">
                  <span>Read Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
