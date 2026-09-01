import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SubscriberPopup } from "@/components/SubscriberPopup";
import { AuthGateModal } from "@/components/AuthGateModal";
import { AppliedVerificationModal } from "@/components/AppliedVerificationModal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SponsorAJobs — Visa Sponsorship Jobs UK, USA, Australia, Canada, NZ",
    template: "%s | SponsorAJobs",
  },
  description:
    "Find verified jobs with visa sponsorship across UK, USA, Australia, Canada, and New Zealand. 12,000+ IT jobs, Civil Engineering jobs, Nursing jobs and more with employer sponsorship. Updated daily.",
  keywords: [
    "visa sponsorship jobs",
    "jobs with visa sponsorship uk",
    "civil engineer jobs visa sponsorship",
    "software engineer visa sponsorship uk",
    "h1b sponsorship jobs",
    "uk skilled worker visa jobs",
    "australia tss 482 jobs",
    "canada lmia jobs",
    "it jobs visa sponsorship",
    "nurse jobs sponsorship uk",
    "work permit jobs 2025",
  ],
  authors: [{ name: "SponsorAJobs", url: SITE_URL }],
  creator: "SponsorAJobs",
  publisher: "SponsorAJobs",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      process.env.GOOGLE_SITE_VERIFICATION ||
      "gbhpP0atE9XYLcUC8nipiJXNuQ74JPyUqKQBDF8mFH0",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    alternateLocale: ["en_US", "en_AU", "en_CA", "en_NZ"],
    url: SITE_URL,
    siteName: "SponsorAJobs",
    title: "SponsorAJobs — Find Jobs With Visa Sponsorship Worldwide",
    description:
      "Discover 12,000+ verified jobs with visa sponsorship across UK, USA, Australia, Canada, and New Zealand. Daily updated IT, Engineering, Healthcare and more.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SponsorAJobs — Visa Sponsorship Job Search Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SponsorAJobs — Visa Sponsorship Jobs Worldwide",
    description:
      "Find verified jobs with employer visa sponsorship across UK, USA, Australia, Canada, and New Zealand. Updated daily.",
    images: [`${SITE_URL}/og-image.png`],
    creator: "@sponsorajobs",
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "jobs",
};

// JSON-LD Structured Data
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SponsorAJobs",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Visa sponsorship job search engine helping global talent find international employment with employer sponsorship.",
  sameAs: [
    "https://twitter.com/sponsorajobs",
    "https://linkedin.com/company/sponsorajobs",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SponsorAJobs",
  url: SITE_URL,
  description: "Find jobs with visa sponsorship across UK, USA, Australia, Canada, and New Zealand.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/jobs?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Google Site Verification */}
        <meta name="google-site-verification" content="gbhpP0atE9XYLcUC8nipiJXNuQ74JPyUqKQBDF8mFH0" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-slate-50 text-slate-900">
        {children}
        <SubscriberPopup />
        <AuthGateModal />
        <AppliedVerificationModal />
      </body>
    </html>
  );
}
