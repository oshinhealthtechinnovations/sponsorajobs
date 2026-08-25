import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Privacy Policy</h1>
        
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>Last updated: August 2026</p>
          
          <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            SponsorAJobs is primarily a public search and discovery platform. During standard browsing, we do not require user account registration, nor do we collect sensitive identity documents, passports, or immigration files.
          </p>

          <h2 className="text-base font-bold text-slate-900">2. Usage Telemetry & Analytics</h2>
          <p>
            We may use privacy-preserving analytics (such as Cloudflare Web Analytics) to observe search queries, popular categories, and aggregate page views. No personally identifiable data is shared with third parties.
          </p>

          <h2 className="text-base font-bold text-slate-900">3. Outbound Redirection</h2>
          <p>
            When clicking &ldquo;Apply on Original Source&rdquo;, you are redirected to the respective employer or applicant tracking system. That third party&apos;s privacy policy governs your application submission.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
