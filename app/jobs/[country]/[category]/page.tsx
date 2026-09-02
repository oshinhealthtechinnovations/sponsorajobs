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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/jobs" className="hover:text-brand-600">Jobs</Link>
          <span>/</span>
          <Link href={`/jobs/${country.slug}`} className="hover:text-brand-600">{country.name}</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{category.name}</span>
        </div>

        {/* Hero Banner */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-black uppercase text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md mb-2 inline-block">
                {country.flag} {country.name}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {category.name} Visa Sponsorship Jobs in {country.name}
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                Explore {searchResult.total} verified {category.name.toLowerCase()} opportunities offering visa sponsorship signals in {country.name}.
              </p>
            </div>

            <Link
              href={`/jobs?country=${country.code.toLowerCase()}&category=${category.slug}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors shrink-0"
            >
              <span>Advanced Filter</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Matching Positions ({searchResult.total})
          </h2>

          {searchResult.jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResult.jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-sm text-slate-500">
              No matching active listings found for {category.name} in {country.name} at this time.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
