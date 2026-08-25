import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompanyRepository } from "@/lib/repositories/companyRepository";
import Link from "next/link";
import { Building2, ArrowRight, Globe, ShieldCheck } from "lucide-react";

export default async function CompaniesDirectoryPage() {
  const companyRepo = new CompanyRepository();
  const companies = await companyRepo.getAll();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Verified Employers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Companies Hiring With Visa Sponsorship
          </h1>
          <p className="text-slate-600 text-base mt-2">
            Explore companies with verified sponsorship signals and direct career portal connections.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {companies.map((comp) => {
            const slug = comp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return (
              <div
                key={comp.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center font-bold text-brand-700 text-lg">
                      {comp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{comp.name}</h2>
                      <span className="text-xs text-slate-500">{comp.industry || "Enterprise"} • {comp.country_code}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    Verified employer listing international positions with sponsorship indicators.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/company/${slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <span>View Company Profile & Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
