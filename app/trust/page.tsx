import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { constructMetadata } from "@/lib/seo/metadata";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Globe2,
  Layers,
  Search,
  ArrowRight,
  HelpCircle,
  Clock,
  Building2,
  Lock,
} from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Trust Center & Job Verification Methodology | SponsorAJobs",
  description:
    "Learn how SponsorAJobs verifies international visa sponsorship jobs, cross-checks employer registries, and audits direct ATS application endpoints.",
  path: "/trust",
});

export default function TrustCenterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero-Guesswork Data Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Trust Center & Verification Methodology
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            How SponsorAJobs verifies international opportunities, audits employer sponsorship licenses, and ensures 100% direct application provenance.
          </p>
        </div>

        {/* Verification Pipeline Overview */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl mb-12 space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              The 12-Point Publishing Gate
            </span>
            <h2 className="text-2xl font-bold font-display">
              Discovered Job &ne; Verified Job &ne; Published Job
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              A job never becomes public merely because an API or crawler discovered it. Every candidate requisition must clear our dual network verification and legal registry check before entering the live index.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Direct ATS Audit</h4>
              <p className="text-slate-400 leading-relaxed">
                Live HTTP verification that the URL leads directly to an active job requisition, rejecting expired postings and homepages.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Registry Match</h4>
              <p className="text-slate-400 leading-relaxed">
                Cross-checking the hiring organization against government licensed sponsor databases (UK Home Office, USCIS, IRCC).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-white text-sm">Evidence Extraction</h4>
              <p className="text-slate-400 leading-relaxed">
                Scanning the requisition text for explicit visa phrasing, relocation support, or statutory exclusion statements.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Status Taxonomy */}
        <div className="space-y-6 mb-12">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Sponsorship Status Taxonomy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Verified Sponsorship</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The job description contains explicit phrasing offering visa sponsorship, Certificate of Sponsorship (CoS), H-1B transfer, or relocation assistance.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Sponsorship Signal Detected</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The employer has an active track record of sponsoring work permits and corporate mobility in this jurisdiction.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
                <span className="w-3 h-3 rounded-full bg-sky-500" />
                <span>Sponsor-Licensed Employer</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The employer is listed on official national sponsor registries, but the specific role&rsquo;s eligibility depends on candidate salary and qualifications.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                <span className="w-3 h-3 rounded-full bg-slate-400" />
                <span>Unconfirmed / Under Review</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Requisitions where sponsorship details are not explicitly mentioned in the public listing.
              </p>
            </div>
          </div>
        </div>

        {/* What We Do NOT Guarantee (Legal Transparency) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-3 mb-12">
          <div className="flex items-center gap-2.5 font-bold text-amber-900 text-base">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Important Legal Transparency & Disclaimers</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            SponsorAJobs is an independent employment intelligence platform. We verify job posting text, employer registry records, and live application URLs. We do not issue visas, guarantee employer hiring decisions, or guarantee government visa approvals. Final visa eligibility is determined solely by immigration authorities and licensed sponsoring employers based on individual candidate merit and statutory salary thresholds.
          </p>
        </div>

        {/* CTA to Search */}
        <div className="text-center pt-4">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/25 transition-all"
          >
            <span>Explore Verified Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
