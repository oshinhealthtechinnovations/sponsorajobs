import React from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { CategoryRepository } from "@/lib/repositories/categoryRepository";
import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";

export const metadata: Metadata = {
  title: "Job Categories with Visa Sponsorship | SponsorAJobs",
  description:
    "Browse all job sectors actively sponsoring international candidates — Engineering, IT, Healthcare, Finance, Construction, Logistics, Hospitality, Education, and Administration.",
  alternates: { canonical: `${BASE_URL}/categories` },
  openGraph: {
    title: "Job Categories with Visa Sponsorship | SponsorAJobs",
    description:
      "Explore 9 major job sectors offering employer visa sponsorship across UK, USA, Australia, Canada, and New Zealand.",
    url: `${BASE_URL}/categories`,
    siteName: "SponsorAJobs",
    type: "website",
  },
};

export default async function CategoriesDirectoryPage() {
  const catRepo = new CategoryRepository();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Specializations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Browse Jobs by Category
          </h1>
          <p className="text-slate-600 text-base mt-2">
            Explore industry sectors actively recruiting and sponsoring international candidates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{cat.name}</h2>
                <p className="text-xs text-slate-500 mb-4">{cat.seoDescription}</p>

                {cat.subcategories && cat.subcategories.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 mb-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Subcategories:
                    </span>
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/jobs?category=${sub.slug}`}
                        className="block text-xs text-slate-700 hover:text-brand-600 font-medium py-0.5"
                      >
                        • {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href={`/jobs?category=${cat.slug}`}
                  className="inline-flex items-center justify-between w-full px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors"
                >
                  <span>Explore {cat.name} Jobs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
