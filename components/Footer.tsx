import React from "react";
import Link from "next/link";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";
import {
  ShieldCheck,
  Globe,
  Sparkles,
  Heart,
  ArrowUpRight,
  Send,
  Building2,
  FileCheck,
  CheckCircle2,
} from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 text-slate-300 mt-auto">
      {/* Upper Footer Highlights */}
      <div className="border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Algorithmic Signal Parsing</h4>
                <p className="text-xs text-slate-400 mt-0.5">Deterministic visa keyword & CoS detection.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Direct Employer Links</h4>
                <p className="text-xs text-slate-400 mt-0.5">Apply directly on original verified ATS boards.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">5 Global Jurisdictions</h4>
                <p className="text-xs text-slate-400 mt-0.5">UK, USA, Australia, Canada, & New Zealand.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Free For Job Seekers</h4>
                <p className="text-xs text-slate-400 mt-0.5">No hidden charges or mandatory fees.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Purpose */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-brand-700 text-white flex items-center justify-center font-black text-sm shadow-md">
                SA
              </div>
              <span className="text-xl font-bold text-white font-display">
                Sponsor<span className="text-brand-400">A</span>Jobs
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              SponsorAJobs is an immigration-intelligence job discovery engine helping global software engineers, civil engineers, healthcare professionals, and technical specialists locate verified employer visa sponsorship opportunities worldwide.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Indexed & updated daily with active feeds</span>
            </div>
          </div>

          {/* Target Countries */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-display">
              Target Countries
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              {INITIAL_COUNTRIES.map((c) => (
                <li key={c.code}>
                  <Link
                    href={`/jobs/${c.slug}`}
                    className="hover:text-brand-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>{c.flag}</span>
                    <span>Jobs in {c.name}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link href="/countries" className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1">
                  <span>View all destinations</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Visa Guides */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-display">
              Visa Sponsorship Guides
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/visa-sponsorship/uk" className="hover:text-brand-400 transition-colors">
                  UK Skilled Worker & CoS Guide
                </Link>
              </li>
              <li>
                <Link href="/visa-sponsorship/usa" className="hover:text-brand-400 transition-colors">
                  USA H-1B & Green Card Guide
                </Link>
              </li>
              <li>
                <Link href="/visa-sponsorship/australia" className="hover:text-brand-400 transition-colors">
                  Australia TSS 482 & 186 Guide
                </Link>
              </li>
              <li>
                <Link href="/visa-sponsorship/canada" className="hover:text-brand-400 transition-colors">
                  Canada LMIA & Express Entry
                </Link>
              </li>
              <li>
                <Link href="/visa-sponsorship/new-zealand" className="hover:text-brand-400 transition-colors">
                  NZ AEWV & Green List Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-display">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/about" className="hover:text-brand-400 transition-colors">About Us</Link></li>
              <li><Link href="/disclaimer" className="hover:text-brand-400 transition-colors">Sponsorship Disclaimer</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-brand-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-brand-400 transition-colors">Contact Support</Link></li>
              <li><Link href="/employers" className="hover:text-brand-400 transition-colors">Employer Job Posting</Link></li>
              <li><Link href="/admin" className="hover:text-brand-400 transition-colors flex items-center gap-1"><span>Admin Console</span></Link></li>
            </ul>
          </div>
        </div>

        {/* Informational Disclaimer Notice */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-400 text-center md:text-left">
            <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
            <span>
              Disclaimer: SponsorAJobs is an independent search aggregator. Sponsorship signals are extracted from public job text and do not constitute legal advice.
            </span>
          </div>
          <p className="shrink-0 text-slate-400">
            © {new Date().getFullYear()} SponsorAJobs.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
