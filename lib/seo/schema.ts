import { JobRecord } from "../types/database";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";

export type JobSchemaInput = Partial<JobRecord> & {
  title: string;
  description: string;
  country_code: string;
  company_name?: string;
  company_website?: string;
  company_logo_url?: string;
};

/**
 * Google JobPosting JSON-LD Schema Generator
 * Reference: Section 46 & Google Search Central specifications
 */
export function generateJobPostingSchema(job: JobSchemaInput): Record<string, any> {
  const publishedDate = job.published_at
    ? new Date(job.published_at).toISOString()
    : new Date().toISOString();

  // Expiration date (30 days from publish date by default if not set)
  const validThroughDate = new Date(
    new Date(publishedDate).getTime() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const isRemote = job.remote_type === "REMOTE";

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description_clean || job.description,
    identifier: {
      "@type": "PropertyValue",
      name: "SponsorAJobs",
      value: job.id || "job_id",
    },
    datePosted: publishedDate,
    validThrough: validThroughDate,
    employmentType: job.employment_type || "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name || "Verified Employer",
      sameAs: job.company_website || undefined,
      logo: job.company_logo_url || `${BASE_URL}/logo.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city || undefined,
        addressRegion: job.region || undefined,
        addressCountry: job.country_code,
      },
    },
    directApply: true,
    url: `${BASE_URL}/job/${job.id || ""}`,
  };

  // Remote & Telecommute specs
  if (isRemote) {
    schema.jobLocationType = "TELECOMMUTE";
    schema.applicantLocationRequirements = {
      "@type": "Country",
      name: job.country_code,
    };
  }

  // Base Salary specs
  if (job.salary_min || job.salary_max) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salary_currency || "USD",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salary_min || job.salary_max,
        maxValue: job.salary_max || job.salary_min,
        unitText: "YEAR",
      },
    };
  }

  return schema;
}

/**
 * BreadcrumbList JSON-LD Schema Generator
 */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

/**
 * Organization & WebSite SearchAction Schema Generator
 */
export function generateWebsiteSchema(): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "SponsorAJobs",
        description: "Verified Visa Sponsorship Job Search Engine for UK, US, Australia, Canada, and New Zealand.",
        potentialAction: {
          "@type": "SearchAction",
          target: `${BASE_URL}/jobs?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "SponsorAJobs",
        url: BASE_URL,
        logo: `${BASE_URL}/logo.png`,
      },
    ],
  };
}

/**
 * BlogPosting JSON-LD Schema Generator for Google Rich Article Results
 */
export function generateBlogPostingSchema(post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  authorName?: string;
  featuredImageUrl?: string;
  categoryName?: string;
}): Record<string, any> {
  const postUrl = `${BASE_URL}/blog/${post.slug}`;
  const imageUrl = post.featuredImageUrl?.startsWith("http")
    ? post.featuredImageUrl
    : `${BASE_URL}/og-image.png`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    headline: post.title,
    description: post.excerpt,
    image: [imageUrl],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: post.authorName || "SponsorAJobs Research Team",
      url: `${BASE_URL}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "SponsorAJobs",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    articleSection: post.categoryName || "Visa Guides",
    inLanguage: "en-US",
  };
}

/**
 * FAQPage JSON-LD Schema Generator for Google SERP Accordion Rich Results
 */
export function generateFaqSchema(
  faqs: { question: string; answer: string }[]
): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

