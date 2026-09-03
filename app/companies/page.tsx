import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompanyRepository } from "@/lib/repositories/companyRepository";
import Link from "next/link";
import {
  Building2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default async function CompaniesDirectoryPage() {
  const companyRepo = new CompanyRepository();
  const allCompanies = await companyRepo.getAll();

  // Show top 2 rows (6 companies) in free view
  const visibleCompanies = allCompanies.slice(0, 6);
  const lockedSample = allCompanies.slice(6, 12);
  const totalLockedCount = Math.max(470, allCompanies.length);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Verified Licensed Employers Registry</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Companies Hiring With Visa Sponsorship
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore multinational companies and vetted enterprises with active sponsorship licenses, official SOC quotas, and direct ATS feeds.
          </p>
        </div>

        {/* Top 2 Rows: 6 Visible Free Companies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {visibleCompanies.map((comp) => {
            const slug = comp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return (
              <div
                key={comp.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100/80 flex items-center justify-center font-black text-sky-700 text-base shadow-2xs">
                      {comp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{comp.name}</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </h2>
                      <span className="text-xs text-slate-500 font-semibold">
                        {comp.industry || "Enterprise"} • {comp.country_code || "Global"}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    Verified employer listing international positions with confirmed statutory visa sponsorship signals.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/company/${slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 group"
                  >
                    <span>View Company Profile & Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Locked Premium Employer Directory Section */}
        <div className="relative mt-10 rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-lg p-6 sm:p-12 text-center">
          {/* Blurred Background Preview of Locked Companies */}
          <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6 blur-[6px] opacity-25 pointer-events-none select-none">
            {lockedSample.map((comp) => (
              <div key={comp.id} className="p-6 rounded-3xl bg-slate-100 border border-slate-200 h-36">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-300" />
                  <div className="space-y-2">
                    <div className="w-24 h-3 bg-slate-300 rounded" />
                    <div className="w-16 h-2 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Premium Paywall Card Overlay */}
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Premium Employer Intelligence</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Unlock {totalLockedCount}+ Licensed Sponsors
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
                Free preview is limited to 2 rows. Upgrade to Candidate Pro to unlock complete directory access, licensed sponsor registry IDs, and direct HR application endpoints.
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left w-full max-w-lg py-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>470+ A-Rated Licensed Sponsors</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Official Home Office / USCIS Registry IDs</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct Employer ATS Application Links</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant Daily Visa Opportunity Alerts</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 w-full max-w-md">
              <Link
                href="/pricing"
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-sky-700 hover:from-sky-700 hover:to-cyan-700 text-white font-black text-base tracking-tight shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Zap className="w-5 h-5 text-amber-300" />
                <span>Unlock All Licensed Employers</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-[11px] text-slate-400 mt-2">
                Instant candidate dashboard activation · 100% verified direct ATS applications
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
