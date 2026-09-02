import { MetadataRoute } from "next";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { getDatabase } from "@/lib/db/client";
import { generateJobSlug } from "@/lib/seo/slugs";
import { blogRepository } from "@/lib/repositories/blogRepository";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // 1. Static Core Pages (Priority 1.0 - 0.7)
  const staticPages = [
    { url: `${baseUrl}`, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${baseUrl}/jobs`, priority: 0.9, changeFrequency: "hourly" as const },
    { url: `${baseUrl}/blog`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${baseUrl}/countries`, priority: 0.8, changeFrequency: "daily" as const },
    { url: `${baseUrl}/categories`, priority: 0.8, changeFrequency: "daily" as const },
    { url: `${baseUrl}/companies`, priority: 0.8, changeFrequency: "daily" as const },
    { url: `${baseUrl}/visa-sponsorship`, priority: 0.8, changeFrequency: "daily" as const },
    { url: `${baseUrl}/about`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/contact`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/privacy`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${baseUrl}/terms`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${baseUrl}/disclaimer`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${baseUrl}/employers`, priority: 0.6, changeFrequency: "monthly" as const },
  ];

  for (const p of staticPages) {
    entries.push({
      url: p.url,
      lastModified: now,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    });
  }

  // 2. Country Landing Hubs — canonical slug only (avoid duplicate code/slug URLs)
  for (const c of INITIAL_COUNTRIES) {
    entries.push({
      url: `${baseUrl}/jobs/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });
    entries.push({
      url: `${baseUrl}/visa-sponsorship/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // 3. Category Landing Hubs (9 categories)
  for (const cat of INITIAL_CATEGORIES) {
    entries.push({
      url: `${baseUrl}/categories/${cat.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  // 4. Programmatic Country + Category Matrix Hubs (45 pages) — slug only
  for (const c of INITIAL_COUNTRIES) {
    for (const cat of INITIAL_CATEGORIES) {
      entries.push({
        url: `${baseUrl}/jobs/${c.slug}/${cat.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  // 5. Verified Employer & Company Hubs
  try {
    const db = getDatabase();
    const companies = await db.prepare(
      "SELECT slug, updated_at FROM companies WHERE slug IS NOT NULL LIMIT 1000"
    ).all<{ slug: string; updated_at: string }>();

    for (const company of companies.results) {
      if (company.slug) {
        entries.push({
          url: `${baseUrl}/company/${company.slug}`,
          lastModified: new Date(company.updated_at || now),
          changeFrequency: "weekly",
          priority: 0.75,
        });
      }
    }
  } catch (err) {
    console.error("Error generating sitemap companies:", err);
  }

  // 6. Active Job Postings (Up to 5,000 active listings)
  try {
    const db = getDatabase();
    const jobs = await db.prepare(
      "SELECT id, title, city, country_code, updated_at FROM jobs WHERE status = 'active' AND (is_published IS NULL OR is_published = 1) AND (verification_status IS NULL OR verification_status != 'EXPIRED') LIMIT 5000"
    ).all<{ id: string; title: string; city: string; country_code: string; updated_at: string }>();

    for (const job of jobs.results) {
      const slug = generateJobSlug({
        id: job.id,
        title: job.title,
        city: job.city,
        country_code: job.country_code,
      });

      entries.push({
        url: `${baseUrl}/job/${slug}`,
        lastModified: new Date(job.updated_at || now),
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  } catch (err) {
    console.error("Error generating sitemap jobs:", err);
  }

  // 7. Dynamic SEO Blog Posts (Priority 0.85)
  try {
    const blogSlugs = await blogRepository.getAllPublishedSlugs();
    for (const post of blogSlugs) {
      entries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt || now),
        changeFrequency: "weekly",
        priority: 0.7, // Blog lower priority than job pages (was 0.85)
      });
    }
  } catch (err) {
    console.error("Error generating sitemap blog posts:", err);
  }

  return entries;
}

