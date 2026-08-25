import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Building2, Sparkles, Globe, Mail, ArrowRight } from "lucide-react";

export default function EmployersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-6">
          <Building2 className="w-3.5 h-3.5" />
          <span>Employer Portal</span>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
          Direct Employer Job Posting is <span className="text-brand-600">Coming Soon</span>
        </h1>

        <p className="text-base text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Are you a licensed sponsor in the UK, USA, Australia, Canada, or New Zealand looking to recruit top-tier international engineers, healthcare professionals, or tech talent? Direct ATS feed syndication and verified employer posting will be available in our next release.
        </p>

        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-xl mx-auto text-left space-y-4">
          <h2 className="text-base font-bold text-slate-900">Want to connect your ATS feed now?</h2>
          <p className="text-xs text-slate-600">
            If your company currently uses Ashby, Workable, Greenhouse, or an XML job feed and offers visa sponsorship, contact our developer integration team to be indexed in our verified company registry.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Integration Team</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
