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
      { href: "/pricing", label: "Pricing & Plans" },
      { href: "/trust", label: "How It Works" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/refund-policy", label: "Refund Policy" },
    ],
  },
};

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#071522] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Brand + Mission */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-black text-sm tracking-wider border border-white/20">
                SA
              </div>
              <div className="flex items-baseline">
                <span className="text-lg font-black tracking-tight text-white">SponsorAJobs</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#19CBE0] ml-0.5 mb-0.5" />
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Find international jobs you can actually apply for. Search verified opportunities with sponsorship signals, employer verification and direct application links.
            </p>

            {/* Trust badges */}
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Employer Verification on every listing</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-3.5 h-3.5 text-[#19CBE0] shrink-0" />
                <span>Sponsorship Signal Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Direct employer application links only</span>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.values(FOOTER_LINKS).map((section) => (
              <div key={section.label} className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  {section.label}
                </h4>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-500 hover:text-white transition-colors"
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
        <div className="mt-14 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 text-center sm:text-left">
            &copy; {year} SponsorAJobs. All job listings link to original employer postings.
            Not a visa advisory or immigration legal service.
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-600">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
            <span>·</span>
            <Link href="/disclaimer" className="hover:text-slate-400 transition-colors">Disclaimer</Link>
            <span>·</span>
            <Link href="/contact" className="hover:text-slate-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
