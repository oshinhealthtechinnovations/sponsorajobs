import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Globe, ShieldCheck, Search, Users, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-3">
            <Globe className="w-3.5 h-3.5" />
            <span>Our Mission</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            About SponsorAJobs
          </h1>
          <p className="text-slate-600 text-base mt-2">
            Democratizing global career mobility through sponsorship intelligence.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">Why We Built SponsorAJobs</h2>
          <p>
            For millions of skilled international candidates, finding a job abroad isn&apos;t just about finding the right title or skills match—it is about finding an employer willing and legally authorized to sponsor a work visa.
          </p>
          <p>
            Traditional job boards fail international candidates by burying visa sponsorship constraints in thousands of lines of text or failing to distinguish between companies that sponsor and those requiring unrestricted local work authorization.
          </p>

          <h2 className="text-xl font-bold text-slate-900 pt-4 border-t border-slate-100">
            Our Sponsorship Intelligence Layer
          </h2>
          <p>
            SponsorAJobs is designed from the ground up as a job-search engine specialized in identifying, categorizing, and scoring sponsorship-related signals across the UK, USA, Australia, Canada, and New Zealand.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Source Agnostic</h3>
              <p className="text-xs text-slate-600">Aggregating vacancies across direct employer ATS feeds and permitted portals.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Transparent Evidence</h3>
              <p className="text-xs text-slate-600">Surfacing exact matching text snippets so candidates can verify terms instantly.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Zero Intermediary Fees</h3>
              <p className="text-xs text-slate-600">Directly linking job seekers to the original employer application process.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
