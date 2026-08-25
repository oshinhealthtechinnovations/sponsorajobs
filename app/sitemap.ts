import { MetadataRoute } from "next";
import { getDatabase } from "@/lib/db/client";
import { INITIAL_COUNTRIES } from "@/config/countries";
import { INITIAL_CATEGORIES } from "@/config/categories";

export const runtime = "edge";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://sponsorajobs.com";
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // 1. Static Core Pages (Priority 1.0 - 0.7)
  const staticPages = [
    { url: `${baseUrl}`, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${baseUrl}/jobs`, priority: 0.9, changeFrequency: "hourly" as const },
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

  // 2. Country Landing Hubs (5 countries by slug and ISO code)
  for (const c of INITIAL_COUNTRIES) {
    entries.push({
      url: `${baseUrl}/jobs/${c.code.toLowerCase()}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });
    entries.push({
      url: `${baseUrl}/jobs/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    });
    entries.push({
      url: `${baseUrl}/visa-sponsorship/${c.code.toLowerCase()}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });
    entries.push({
      url: `${baseUrl}/visa-sponsorship/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  // 3. Category Landing Hubs
  for (const cat of INITIAL_CATEGORIES) {
    entries.push({
      url: `${baseUrl}/categories/${cat.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  // 4. Programmatic Country + Category Matrix Hubs (5 * 9 = 45 pages)
  for (const c of INITIAL_COUNTRIES) {
    for (const cat of INITIAL_CATEGORIES) {
      entries.push({
        url: `${baseUrl}/jobs/${c.code.toLowerCase()}/${cat.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
      entries.push({
        url: `${baseUrl}/jobs/${c.slug}/${cat.slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.75,
      });
    }
  }

  // 5. Active Job Postings
  try {
    const db = getDatabase();
    const jobs = await db.prepare(
      "SELECT id, updated_at FROM jobs WHERE status = 'active' ORDER BY updated_at DESC LIMIT 5000"
    ).all<{ id: string; updated_at: string }>();

    for (const job of jobs.results) {
      entries.push({
        url: `${baseUrl}/job/${job.id}`,
        lastModified: new Date(job.updated_at || now),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (err) {
    console.error("Error fetching jobs for sitemap:", err);
  }

  return entries;
}
