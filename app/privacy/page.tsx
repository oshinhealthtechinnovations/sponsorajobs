import React from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | SponsorAJobs",
  description: "SponsorAJobs Privacy Policy. Learn how we collect, use, and protect your personal information when using our visa sponsorship job search platform.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Privacy Policy</h1>
            <p className="text-xs text-slate-500 mt-0.5">Last updated: August 2026</p>
          </div>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. Who We Are</h2>
            <p>
              SponsorAJobs (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is an independent job search aggregator platform operated by SponsorAJobs Inc. We are based in the United States and operate globally. Our platform aggregates publicly available job listings from employer websites and applicant tracking systems (ATS) to help job seekers find roles that include visa sponsorship.
            </p>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700 mt-2">
              <p><strong>Entity:</strong> SponsorAJobs Inc.</p>
              <p><strong>Registered Address:</strong> 500 Delaware Ave, Suite 100, Wilmington, DE 19801, USA</p>
              <p><strong>Support Telephone:</strong> +1 (302) 467-3188</p>
              <p><strong>Privacy Contact:</strong> privacy@sponsorajobs.com / support@sponsorajobs.com</p>
              <p><strong>Website:</strong> https://www.sponsorajobs.com</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. Information We Collect</h2>
            <p>We may collect the following types of personal data:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
              <li><strong>Email address</strong> — when you subscribe to job alerts or create an account.</li>
              <li><strong>Name and profession</strong> — if you register for a free account.</li>
              <li><strong>Search queries</strong> — keywords, country, and category preferences used in your job searches (stored anonymously in aggregate form only).</li>
              <li><strong>IP address</strong> — collected automatically for security, rate limiting, and fraud prevention purposes only. Not shared with third parties for marketing.</li>
              <li><strong>Cookies</strong> — session cookies to maintain login state. We do not use tracking or advertising cookies.</li>
            </ul>
            <p>We do <strong>not</strong> collect CV/resume files, passport details, immigration documents, or payment information.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
              <li>To send you visa sponsorship job alert emails based on your preferences.</li>
              <li>To authenticate your account and maintain your session securely.</li>
              <li>To improve the platform through aggregate, anonymised usage analysis.</li>
              <li>To notify you of important changes to our service.</li>
              <li>To detect and prevent fraud, abuse, and security breaches.</li>
            </ul>
            <p>We do <strong>not</strong> sell, rent, or share your personal data with third parties for commercial purposes.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Legal Basis for Processing (UK/EU Users)</h2>
            <p>For users in the United Kingdom and European Economic Area, our legal basis for processing your personal data is:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
              <li><strong>Contract performance</strong> — to provide the job alert service you signed up for.</li>
              <li><strong>Legitimate interests</strong> — for security, fraud prevention, and platform improvement.</li>
              <li><strong>Consent</strong> — for optional marketing communications, which you can withdraw at any time.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">5. Data Retention</h2>
            <p>We retain your email address and alert preferences for as long as your subscription is active. You can unsubscribe at any time using the link in any email we send. Account data is retained for 12 months of inactivity, after which it is permanently deleted.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">6. Third-Party Links & Outbound Redirects</h2>
            <p>
              When you click &ldquo;Apply on Original Source&rdquo; or &ldquo;Apply Now&rdquo;, you are redirected to the respective employer or ATS platform (e.g., Greenhouse, Lever, Workday). That third party&apos;s privacy policy governs your data once you leave our platform. We are not responsible for third-party data practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">7. Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS/TLS encryption, HTTP-only cookies, bcrypt-style password hashing, rate limiting, and security headers (HSTS, CSP, X-Frame-Options). While we take reasonable precautions, no internet service can guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">8. Your Rights (UK/EU GDPR)</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
              <li><strong>Access</strong> the personal data we hold about you.</li>
              <li><strong>Rectify</strong> inaccurate data.</li>
              <li><strong>Erase</strong> your data (&ldquo;right to be forgotten&rdquo;).</li>
              <li><strong>Object</strong> to processing.</li>
              <li><strong>Withdraw consent</strong> at any time.</li>
              <li><strong>Lodge a complaint</strong> with your local data protection authority (e.g., the UK ICO).</li>
            </ul>
            <p>To exercise any of these rights, email us at: <strong>privacy@sponsorajobs.com</strong> or <strong>support@sponsorajobs.com</strong></p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">9. Cookies Policy</h2>
            <p>We use the following cookies:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
              <li><strong>sa_user_session</strong> — an HTTP-only session cookie for authenticated users. Expires after 30 days.</li>
              <li><strong>sa_admin_session</strong> — an HTTP-only admin authentication cookie. Expires after 7 days.</li>
            </ul>
            <p>We do <strong>not</strong> use advertising cookies, Google Analytics tracking pixels, or any cross-site tracking technologies.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify subscribers of significant changes via email. Continued use of SponsorAJobs after any update constitutes your acceptance of the new policy.</p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
