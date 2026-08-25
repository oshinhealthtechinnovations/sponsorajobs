import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SponsorAJobs — Visa Sponsorship Job Search Engine",
  description: "Discover verified employment opportunities with visa sponsorship, work-permit support, and employer sponsorship across UK, USA, Australia, Canada, and New Zealand.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
