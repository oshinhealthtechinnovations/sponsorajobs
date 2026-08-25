import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldAlert, CheckCircle2, HelpCircle } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Sponsorship & Legal Disclaimer
          </h1>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* As required by Section 67 & 114 */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium space-y-2">
            <p className="font-bold text-amber-950">Important Notice for All Job Seekers:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-900">
              <li>SponsorAJobs is a job discovery platform and search engine.</li>
              <li>Listing information comes from permitted external sources and public ATS feeds.</li>
              <li>Sponsorship signals are informational indicators derived from automated analysis.</li>
              <li>Candidates must verify visa sponsorship availability directly with the employer.</li>
              <li>SponsorAJobs does not guarantee employment, interviews, or visa approval.</li>
              <li>Immigration laws, salary thresholds, and occupation lists change frequently.</li>
              <li>Official government immigration portals should always be consulted.</li>
            </ul>
          </div>

          <h2 className="text-base font-bold text-slate-900">No Immigration or Legal Advice</h2>
          <p>
            The content provided on this website, including country visa guides and sponsorship confidence scores, is for general informational purposes only and does not constitute formal legal, immigration, or professional advice.
          </p>

          <h2 className="text-base font-bold text-slate-900">Third-Party Listings & Content Integrity</h2>
          <p>
            We aggregate job postings from third-party systems and public career pages. We make reasonable efforts to detect spam and expired listings, but we do not warrant the continuous accuracy or ongoing validity of third-party job listings.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
