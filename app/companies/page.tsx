import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompanyRepository } from "@/lib/repositories/companyRepository";
import { ShieldCheck } from "lucide-react";
import { CompaniesDirectoryList } from "@/components/CompaniesDirectoryList";

export const revalidate = 3600;

export default async function CompaniesDirectoryPage() {
  const companyRepo = new CompanyRepository();
  const allCompanies = await companyRepo.getAll();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Verified Licensed Employers Registry</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Companies Hiring With Visa Sponsorship
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore {allCompanies.length.toLocaleString()}+ multinational enterprises and vetted sponsors with active visa licenses, verified SOC quotas, and official career portals.
          </p>
        </div>

        {/* Directory List with Dynamic VIP Pro Unlocking */}
        <CompaniesDirectoryList allCompanies={allCompanies} />
      </main>

      <Footer />
    </div>
  );
}
