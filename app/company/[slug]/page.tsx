import React from "react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { CompanyRepository } from "@/lib/repositories/companyRepository";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { CompanyCareersButton } from "@/components/CompanyCareersButton";
import Link from "next/link";
import { Building2, Globe, ExternalLink, ArrowLeft, ShieldCheck } from "lucide-react";

export const revalidate = 3600;

interface CompanyProfilePageProps {
  params: {
    slug: string;
  };
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const companyRepo = new CompanyRepository();
  const company = await companyRepo.getBySlug(params.slug);

  if (!company) {
    notFound();
  }

  const jobRepo = new JobRepository();
  const searchResult = await jobRepo.search({
    company: company.name,
    limit: 50,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/companies"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all companies</span>
          </Link>
        </div>

        {/* Company Header Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-black text-brand-700 text-2xl">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {company.name}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>{company.industry || "Technology"}</span>
                  <span>•</span>
                  <span>Primary Country: {company.country_code}</span>
                </div>
              </div>
            </div>

            {company.website && (
              <CompanyCareersButton
                companyName={company.name}
                websiteUrl={company.website}
              />
            )}
          </div>

          {/* Section 53 notice: Never claim that the company officially sponsors every applicant unless supported by evidence */}
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              Sponsorship eligibility at {company.name} depends on the specific job vacancy, candidate qualifications, and prevailing immigration policies. Sponsorship signals shown are parsed on a per-job basis.
            </p>
          </div>
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Active Openings at {company.name} ({searchResult.total})
          </h2>

          {searchResult.jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResult.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
              No active listings found for {company.name} at this time.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
