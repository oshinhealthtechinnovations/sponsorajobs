import React from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { CountryRepository } from "@/lib/repositories/countryRepository";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { INITIAL_CATEGORIES, getCategoryBySlug } from "@/config/categories";
import { getCountryBySlug, INITIAL_COUNTRIES } from "@/config/countries";
import { constructMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";
import Link from "next/link";
import { Globe, ArrowRight, ShieldCheck, Search } from "lucide-react";

export const revalidate = 1800;

// Pre-render all 5 country hubs at build time for instant TTFB
export async function generateStaticParams() {
  return INITIAL_COUNTRIES.map((c) => ({ country: c.slug }));
}

export async function generateMetadata({
  params,
}: CountryJobsPageProps): Promise<Metadata> {
  const countryConfig = getCountryBySlug(params.country);
  if (!countryConfig) return {};

  const countryRepo = new CountryRepository();
  const country = await countryRepo.getBySlug(params.country);
  if (!country) return {};

  const jobRepo = new JobRepository();
  const result = await jobRepo.search({
    country: country.code.toLowerCase(),
    limit: 1,
  });
  const jobCount = result.total;

  const title = countryConfig.seoTitle.replace(" | SponsorAJobs", "");
  const description =
    countryConfig.seoDescription ||
    `Find ${jobCount}+ verified visa sponsorship jobs in ${countryConfig.name}. Employer-sponsored positions updated daily for skilled worker visas.`;

  return constructMetadata({
    title,
    description,
    path: `/jobs/${countryConfig.slug}`,
    jobCount,
  });
}

interface CountryJobsPageProps {
  params: {
    country: string;
  };
}

// SVG Country Flags for high-definition cross-platform rendering
const CountryFlags: Record<string, React.ReactNode> = {
  gb: (
    <svg viewBox="0 0 60 30" className="w-10 h-7 rounded-lg shadow-2xs shrink-0 overflow-hidden border border-slate-200/60">
      <clipPath id="ch_gb"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="ch_gbt"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#ch_gb)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#ch_gbt)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  ),
  us: (
    <svg viewBox="0 0 60 30" className="w-10 h-7 rounded-lg shadow-2xs shrink-0 overflow-hidden border border-slate-200/60">
      <rect width="60" height="30" fill="#B22234" />
      <path d="M0,2.3h60M0,6.9h60M0,11.5h60M0,16.1h60M0,20.7h60M0,25.3h60" stroke="#fff" strokeWidth="2.3" />
      <rect width="24" height="16.1" fill="#3C3B6E" />
      <circle cx="12" cy="8" r="4" fill="#fff" opacity="0.9" />
    </svg>
  ),
  au: (
    <svg viewBox="0 0 60 30" className="w-10 h-7 rounded-lg shadow-2xs shrink-0 overflow-hidden border border-slate-200/60">
      <rect width="60" height="30" fill="#00008B" />
      <circle cx="45" cy="8" r="2" fill="#fff" />
      <circle cx="50" cy="14" r="1.5" fill="#fff" />
      <circle cx="42" cy="18" r="2" fill="#fff" />
      <circle cx="48" cy="24" r="2" fill="#fff" />
    </svg>
  ),
  ca: (
    <svg viewBox="0 0 60 30" className="w-10 h-7 rounded-lg shadow-2xs shrink-0 overflow-hidden border border-slate-200/60">
      <rect width="15" height="30" fill="#D80027" />
      <rect x="15" width="30" height="30" fill="#fff" />
      <rect x="45" width="15" height="30" fill="#D80027" />
      <path d="M30,7 L32,13 L38,12 L34,16 L37,21 L31,19 L30,23 L29,19 L23,21 L26,16 L22,12 L28,13 Z" fill="#D80027" />
    </svg>
  ),
  nz: (
    <svg viewBox="0 0 60 30" className="w-10 h-7 rounded-lg shadow-2xs shrink-0 overflow-hidden border border-slate-200/60">
      <rect width="60" height="30" fill="#00247D" />
      <circle cx="45" cy="7" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="50" cy="13" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="42" cy="18" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="47" cy="24" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
    </svg>
  ),
};

export default async function CountryJobsPage({ params }: CountryJobsPageProps) {
  const slugLower = (params.country || "").toLowerCase().trim();

  // If the user typed a category slug like /jobs/engineering or /jobs/healthcare, redirect seamlessly
  const isCategory = getCategoryBySlug(slugLower) || INITIAL_CATEGORIES.some((c) => c.slug === slugLower || c.subcategories?.some((s) => s.slug === slugLower));
  if (isCategory) {
    redirect(`/jobs?category=${slugLower}`);
  }

  const countryRepo = new CountryRepository();
  const country = await countryRepo.getBySlug(params.country);

  if (!country) {
    notFound();
  }

  const jobRepo = new JobRepository();
  const searchResult = await jobRepo.search({
    country: country.code.toLowerCase(),
    limit: 20,
  });

  const countryConfig = getCountryBySlug(params.country);
  const popularCities = countryConfig?.popularCities || [];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";
  const flagIcon = CountryFlags[country.code.toLowerCase()] || <span className="text-3xl">{country.flag}</span>;

  // BreadcrumbList JSON-LD for Google sitelink breadcrumbs
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "Jobs", url: `${baseUrl}/jobs` },
    { name: country.name, url: `${baseUrl}/jobs/${country.slug}` },
  ]);

  // ItemList JSON-LD so Google can see job titles directly on hub page
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Visa Sponsorship Jobs in ${country.name}`,
    description: countryConfig?.seoDescription || `Verified visa sponsorship jobs in ${country.name}`,
    url: `${baseUrl}/jobs/${country.slug}`,
    numberOfItems: searchResult.total,
    itemListElement: searchResult.jobs.slice(0, 10).map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/job/${job.id}`,
      name: job.title,
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-slate-900 font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* Elevated Country Hero Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_40px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-3.5">
                {flagIcon}
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    Visa Sponsorship Jobs in {country.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      {searchResult.total > 0 ? `${searchResult.total.toLocaleString()} Verified Active Positions` : "Live Verification Feed"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {country.seo_description || `Discover verified opportunities with statutory visa sponsorship pathways and direct employer ATS applications across ${country.name}.`}
              </p>
            </div>

            <Link
              href={`/visa-sponsorship/${country.slug}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 font-bold text-xs transition-all shadow-2xs shrink-0 self-start md:self-auto"
            >
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>{country.name} Visa Guide</span>
            </Link>
          </div>

          {/* Popular Cities in this country */}
          {popularCities.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1">Popular Cities:</span>
              {popularCities.map((city) => (
                <Link
                  key={city}
                  href={`/jobs?country=${country.code.toLowerCase()}&city=${encodeURIComponent(city)}`}
                  className="px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300 border border-slate-200/80 text-slate-700 text-xs font-bold transition-all shadow-2xs"
                >
                  {city}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Categories Grid in this Country */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Browse by Category in {country.name}
            </h2>
            <Link
              href="/categories"
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
            >
              <span>All 9 Sectors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {INITIAL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/jobs/${country.slug}/${cat.slug}`}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-300 hover:shadow-md text-slate-800 hover:text-sky-800 transition-all shadow-2xs flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="text-xs sm:text-sm font-bold truncate">{cat.name}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </div>

        {/* Job Listings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                Current Opportunities in {country.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing newest direct employer ATS vacancies with verified sponsorship signals.
              </p>
            </div>
            <Link
              href={`/jobs?country=${country.code.toLowerCase()}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 hover:text-sky-700 hover:border-sky-300 shadow-2xs transition-all"
            >
              <span>View All & Filter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {searchResult.jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {searchResult.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-sm font-bold text-slate-500 shadow-xs">
              No active listings found in {country.name} at this time.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
