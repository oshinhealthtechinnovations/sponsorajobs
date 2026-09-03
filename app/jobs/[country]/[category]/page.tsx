import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JobCard } from "@/components/JobCard";
import { CountryRepository } from "@/lib/repositories/countryRepository";
import { CategoryRepository } from "@/lib/repositories/categoryRepository";
import { JobRepository } from "@/lib/repositories/jobRepository";
import { INITIAL_COUNTRIES, getCountryBySlug } from "@/config/countries";
import { INITIAL_CATEGORIES, getCategoryBySlug } from "@/config/categories";
import { constructMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const revalidate = 1800;

// Pre-render all 45 country×category combinations at build time
export async function generateStaticParams() {
  const params: { country: string; category: string }[] = [];
  for (const c of INITIAL_COUNTRIES) {
    for (const cat of INITIAL_CATEGORIES) {
      params.push({ country: c.slug, category: cat.slug });
    }
  }
  return params;
}

interface CategoryCountryJobsPageProps {
  params: {
    country: string;
    category: string;
  };
}

export async function generateMetadata({
  params,
}: CategoryCountryJobsPageProps): Promise<Metadata> {
  const countryConfig = getCountryBySlug(params.country);
  const categoryConfig = getCategoryBySlug(params.category);
  if (!countryConfig || !categoryConfig) return {};

  const countryRepo = new CountryRepository();
  const categoryRepo = new CategoryRepository();
  const country = await countryRepo.getBySlug(params.country);
  const category = await categoryRepo.getBySlug(params.category);
  if (!country || !category) return {};

  const jobRepo = new JobRepository();
  const result = await jobRepo.search({
    country: country.code.toLowerCase(),
    category: category.slug,
    limit: 1,
  });
  const jobCount = result.total;

  const title = `${category.name} Visa Sponsorship Jobs in ${countryConfig.name}`;
  const description =
    categoryConfig.seoDescription?.replace("Browse", `Find ${jobCount}+`) ||
    `Find ${jobCount}+ verified ${category.name.toLowerCase()} jobs with visa sponsorship in ${countryConfig.name}. Updated daily with employer-sponsored opportunities.`;

  return constructMetadata({
    title,
    description,
    path: `/jobs/${countryConfig.slug}/${category.slug}`,
    jobCount,
  });
}

// SVG Country Flags for high-definition cross-platform rendering
const CountryFlags: Record<string, React.ReactNode> = {
  gb: (
    <svg viewBox="0 0 60 30" className="w-8 h-5 rounded-md shadow-2xs shrink-0 overflow-hidden border border-slate-200/60 inline-block mr-1.5">
      <clipPath id="cc_gb"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
      <clipPath id="cc_gbt"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
      <g clipPath="url(#cc_gb)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#cc_gbt)" stroke="#C8102E" strokeWidth="4"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
      </g>
    </svg>
  ),
  us: (
    <svg viewBox="0 0 60 30" className="w-8 h-5 rounded-md shadow-2xs shrink-0 overflow-hidden border border-slate-200/60 inline-block mr-1.5">
      <rect width="60" height="30" fill="#B22234" />
      <path d="M0,2.3h60M0,6.9h60M0,11.5h60M0,16.1h60M0,20.7h60M0,25.3h60" stroke="#fff" strokeWidth="2.3" />
      <rect width="24" height="16.1" fill="#3C3B6E" />
      <circle cx="12" cy="8" r="4" fill="#fff" opacity="0.9" />
    </svg>
  ),
  au: (
    <svg viewBox="0 0 60 30" className="w-8 h-5 rounded-md shadow-2xs shrink-0 overflow-hidden border border-slate-200/60 inline-block mr-1.5">
      <rect width="60" height="30" fill="#00008B" />
      <circle cx="45" cy="8" r="2" fill="#fff" />
      <circle cx="50" cy="14" r="1.5" fill="#fff" />
      <circle cx="42" cy="18" r="2" fill="#fff" />
      <circle cx="48" cy="24" r="2" fill="#fff" />
    </svg>
  ),
  ca: (
    <svg viewBox="0 0 60 30" className="w-8 h-5 rounded-md shadow-2xs shrink-0 overflow-hidden border border-slate-200/60 inline-block mr-1.5">
      <rect width="15" height="30" fill="#D80027" />
      <rect x="15" width="30" height="30" fill="#fff" />
      <rect x="45" width="15" height="30" fill="#D80027" />
      <path d="M30,7 L32,13 L38,12 L34,16 L37,21 L31,19 L30,23 L29,19 L23,21 L26,16 L22,12 L28,13 Z" fill="#D80027" />
    </svg>
  ),
  nz: (
    <svg viewBox="0 0 60 30" className="w-8 h-5 rounded-md shadow-2xs shrink-0 overflow-hidden border border-slate-200/60 inline-block mr-1.5">
      <rect width="60" height="30" fill="#00247D" />
      <circle cx="45" cy="7" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="50" cy="13" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="42" cy="18" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
      <circle cx="47" cy="24" r="1.8" fill="#C8102E" stroke="#fff" strokeWidth="0.6" />
    </svg>
  ),
};

export default async function CategoryCountryJobsPage({ params }: CategoryCountryJobsPageProps) {
  const countryRepo = new CountryRepository();
  const categoryRepo = new CategoryRepository();
  const jobRepo = new JobRepository();

  const country = await countryRepo.getBySlug(params.country);
  const category = await categoryRepo.getBySlug(params.category);

  if (!country || !category) {
    notFound();
  }

  const searchResult = await jobRepo.search({
    country: country.code.toLowerCase(),
    category: category.slug,
    limit: 20,
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";
  const flagSvg = CountryFlags[country.code.toLowerCase()] || <span className="mr-1.5">{country.flag}</span>;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: baseUrl },
    { name: "Jobs", url: `${baseUrl}/jobs` },
    { name: country.name, url: `${baseUrl}/jobs/${country.slug}` },
    { name: category.name, url: `${baseUrl}/jobs/${country.slug}/${category.slug}` },
  ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} Visa Sponsorship Jobs in ${country.name}`,
    url: `${baseUrl}/jobs/${country.slug}/${category.slug}`,
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/jobs" className="hover:text-sky-700">Jobs</Link>
          <span className="text-slate-300">/</span>
          <Link href={`/jobs/${country.slug}`} className="hover:text-sky-700 flex items-center">
            {country.name}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold">{category.name}</span>
        </div>

        {/* Hero Banner Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_40px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-bold uppercase tracking-wider">
                {flagSvg}
                <span>{country.name} · {category.name} Sector</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
                {category.name} Visa Sponsorship Jobs in {country.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Explore {searchResult.total > 0 ? `${searchResult.total.toLocaleString()} verified` : "verified"} {category.name.toLowerCase()} opportunities offering statutory visa sponsorship signals and direct ATS applications in {country.name}.
              </p>
            </div>

            <Link
              href={`/jobs?country=${country.code.toLowerCase()}&category=${category.slug}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white font-black text-xs shadow-xs hover:shadow-md transition-all shrink-0 self-start md:self-auto group"
            >
              <span>Refine Search & Filters</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              Matching Positions ({searchResult.total})
            </h2>
          </div>

          {searchResult.jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {searchResult.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-sm font-bold text-slate-500 shadow-xs">
              No matching active listings found for {category.name} in {country.name} at this time.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
