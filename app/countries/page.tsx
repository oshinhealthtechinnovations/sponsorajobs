import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { CountryRepository } from "@/lib/repositories/countryRepository";
import { CountriesDirectoryClient } from "@/components/CountriesDirectoryClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Target Visa Sponsorship Countries | UK, US, Australia, Canada, NZ",
  description:
    "Explore verified work-permit, skilled worker, and immigration sponsorship pathways across 5 primary jurisdictions. Compare statutory minimum salaries, PR routes, and live licensed sponsor vacancies.",
};

export default async function CountriesDirectoryPage() {
  const countryRepo = new CountryRepository();

  const countsRecord: Record<string, number> = {};
  await Promise.all(
    INITIAL_COUNTRIES.map(async (c) => {
      try {
        const count = await countryRepo.getJobCountByCountry(c.code);
        countsRecord[c.code] = count;
      } catch {
        countsRecord[c.code] = 0;
      }
    })
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <CountriesDirectoryClient initialCounts={countsRecord} />
      </main>

      <Footer />
    </div>
  );
}
