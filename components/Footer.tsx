"use client";

import React from "react";
import Link from "next/link";
import { JobAlertSignup } from "./JobAlertSignup";
import { ShieldCheck, Globe2, Briefcase } from "lucide-react";

const FOOTER_LINKS = {
  findJobs: {
    label: "Find Jobs",
    links: [
      { href: "/jobs/uk", label: "Jobs in UK" },
      { href: "/jobs/usa", label: "Jobs in USA" },
      { href: "/jobs/australia", label: "Jobs in Australia" },
      { href: "/jobs/canada", label: "Jobs in Canada" },
      { href: "/jobs/new-zealand", label: "Jobs in New Zealand" },
    ],
  },
  careerTools: {
    label: "Career Tools",
    links: [
      { href: "/tools/ats-checker", label: "Application Fit Checker" },
      { href: "/", label: "Eligibility Checker" },
      { href: "/", label: "Job Alerts" },
      { href: "/blog", label: "Career Paths" },
      { href: "/visa-sponsorship", label: "Sponsorship Intelligence" },
    ],
  },
  resources: {
    label: "Resources",
    links: [
      { href: "/blog?q=uk", label: "UK Career Guide" },
      { href: "/blog?q=australia", label: "Australia Career Guide" },
      { href: "/blog?q=canada", label: "Canada Career Guide" },
      { href: "/blog", label: "International Career Guides" },
    ],
  },
  company: {
    label: "SponsorAJobs",
    links: [
      { href: "/about", label: "About" },
      { href: "/trust", label: "How It Works" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
};

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-50 text-slate-600 border-t border-slate-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Brand + Mission */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 group w-fit cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-xs group-hover:bg-sky-600 transition-colors">
                SA
              </div>
              <div className="flex items-baseline">
                <span className="text-lg font-black tracking-tight text-slate-950 group-hover:text-sky-600 transition-colors">
                  SponsorAJobs
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 ml-0.5 mb-0.5" />
              </div>
            </Link>

            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              Find verified international vacancies with direct employer sponsorship intelligence (UK Tier 2 / CoS, USA H-1B, Australia TSS 482, Canada LMIA). 100% direct official ATS links.
            </p>

            {/* Trust badges */}
            <div className="flex flex-col gap-2.5 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-700">Licensed Employer Verification on every role</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="font-semibold text-slate-700">Algorithmic Sponsorship Signal Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="font-semibold text-slate-700">100% Direct official employer ATS links only</span>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.values(FOOTER_LINKS).map((section) => (
              <div key={section.label} className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {section.label}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-600 hover:text-sky-600 font-medium transition-colors cursor-pointer"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-slate-700">
              SponsorAJobs Inc. • 500 Delaware Ave, Suite 100, Wilmington, DE 19801, USA • +1 (302) 467-3188
            </p>
            <p className="text-slate-500 text-[11px]">
              &copy; {year} SponsorAJobs Inc. All job listings link directly to original employer postings. Not an immigration law firm.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 font-medium">
            <a href="mailto:support@sponsorajobs.com" className="text-sky-600 font-bold hover:underline">
              support@sponsorajobs.com
            </a>
            <span className="text-slate-300">·</span>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <span className="text-slate-300">·</span>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <span className="text-slate-300">·</span>
            <Link href="/disclaimer" className="hover:text-slate-900 transition-colors">Disclaimer</Link>
            <span className="text-slate-300">·</span>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
