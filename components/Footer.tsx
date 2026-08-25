import React from "react";
import Link from "next/link";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                SA
              </div>
              <span className="text-lg font-bold text-slate-900">
                Sponsor<span className="text-brand-600">A</span>Jobs
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Algorithmic visa-sponsorship job discovery engine helping global talent find international employment opportunities across the UK, USA, Australia, Canada, and New Zealand.
            </p>
          </div>

          {/* Target Countries */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Explore Countries
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              {INITIAL_COUNTRIES.map((c) => (
                <li key={c.code}>
                  <Link href={`/jobs/${c.slug}`} className="hover:text-brand-600 transition-colors flex items-center gap-1.5">
                    <span>{c.flag}</span>
                    <span>Jobs in {c.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Visa Guides */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Visa Guides
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/visa-sponsorship/uk" className="hover:text-brand-600 transition-colors">
                  UK Skilled Worker & CoS Guide
                </Link>
              </li>
              <li>
                <Link href="/visa-sponsorship/usa" className="hover:text-brand-600 transition-colors">
                  US H-1B & Green Card Guide
                </Link>
              </li>
              <li>
                <Link href="/visa-sponsorship/australia" className="hover:text-brand-600 transition-colors">
                  Australia TSS 482 & 186 Guide
                </Link>
              </li>
              <li>
                <Link href="/visa-sponsorship/canada" className="hover:text-brand-600 transition-colors">
                  Canada LMIA & Work Permit Guide
                </Link>
              </li>
              <li>
                <Link href="/visa-sponsorship/new-zealand" className="hover:text-brand-600 transition-colors">
                  NZ AEWV & Green List Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link href="/about" className="hover:text-brand-600 transition-colors">About Us</Link></li>
              <li><Link href="/disclaimer" className="hover:text-brand-600 transition-colors">Sponsorship Disclaimer</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-brand-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-brand-600 transition-colors">Contact Support</Link></li>
              <li><Link href="/employers" className="hover:text-brand-600 transition-colors">For Employers</Link></li>
            </ul>
          </div>
        </div>

        {/* Informational Disclaimer Notice */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Sponsorship signals are detected from public listings and must be verified directly with the employer.</span>
          </div>
          <p>© {new Date().getFullYear()} SponsorAJobs.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
