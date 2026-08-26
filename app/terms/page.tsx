import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | SponsorAJobs",
  description: "SponsorAJobs Terms of Service. Read our usage terms for the visa sponsorship job search platform.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Terms of Service</h1>
            <p className="text-xs text-slate-500 mt-0.5">Last updated: August 2026</p>
          </div>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using SponsorAJobs.com (&ldquo;the Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), you agree to comply with and be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, please do not use our platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. Nature of Service</h2>
            <p>
              SponsorAJobs is an independent job search aggregator and information platform. We automatically collect publicly available job listings and apply algorithmic analysis to identify potential visa sponsorship signals. We do <strong>not</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
              <li>Act as an employer, staffing agency, or recruitment firm.</li>
              <li>Guarantee employment, visa approval, or immigration outcomes.</li>
              <li>Provide legal immigration advice or represent any government authority.</li>
              <li>Verify or endorse specific employers or their hiring practices.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Sponsorship Disclaimer</h2>
            <p>
              Sponsorship classification signals (e.g., &ldquo;Strong&rdquo;, &ldquo;Moderate&rdquo;, &ldquo;Possible&rdquo;) are derived from automated analysis of public job text. They are provided for informational and discovery purposes <strong>only</strong> and do <strong>not</strong> constitute a guarantee that any employer will offer visa sponsorship. Always verify sponsorship availability directly with the employer before applying.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. User Responsibilities</h2>
            <p>You agree to use SponsorAJobs only for lawful purposes and in accordance with these Terms. You must not:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
              <li>Scrape, crawl, or automate access to the platform without our written consent.</li>
              <li>Submit false information during registration or while using alert services.</li>
              <li>Attempt to bypass any security measures, rate limits, or access controls.</li>
              <li>Use the platform to spam, phish, or defraud other users or employers.</li>
              <li>Reverse-engineer, copy, or distribute proprietary scoring logic or data.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">5. Account Registration</h2>
            <p>
              Account access is restricted to users with a valid referral/promo code from an authorised SponsorAJobs partner or community. By registering, you confirm that all information provided is accurate and that you will maintain the security of your password. You are responsible for all activity under your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">6. Intellectual Property</h2>
            <p>
              All trademarks, logos, and job descriptions displayed on SponsorAJobs remain the intellectual property of their respective owners. SponsorAJobs&apos; proprietary sponsorship scoring model, design system, and codebase are the intellectual property of Oshin Health Tech Innovations. Job descriptions are used under fair use for the purpose of informational aggregation and indexing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">7. Limitation of Liability</h2>
            <p>
              SponsorAJobs is provided &ldquo;as is&rdquo; without warranties of any kind. To the fullest extent permitted by law, Oshin Health Tech Innovations shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from use of the platform, including but not limited to reliance on job data, failed job applications, or immigration decisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">8. Third-Party Links</h2>
            <p>
              Our platform links to external employer websites and ATS systems. We do not control these external sites and are not responsible for their content, privacy policies, or availability. Your use of third-party sites is at your own risk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">9. Modifications to Terms</h2>
            <p>
              We reserve the right to update these Terms at any time. Significant changes will be communicated to subscribers via email. Continued use of SponsorAJobs after changes take effect constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">10. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">11. Contact</h2>
            <p>For questions about these Terms, contact us at: <strong>oshinhealthtechinnovations@gmail.com</strong></p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
