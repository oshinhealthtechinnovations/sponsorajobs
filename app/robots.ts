import { MetadataRoute } from "next";


export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/jobs",
          "/jobs/",
          "/job/",
          "/companies",
          "/company/",
          "/countries",
          "/categories",
          "/blog",
          "/blog/",
          "/visa-sponsorship/",
          "/about",
          "/contact",
          "/employers",
          "/tools/",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/_next/",
          "/dashboard",
          "/dashboard/",
          "/saved-jobs",
          "/cv-job-match",
          // Block thin filter combinations that have no SEO value
          "/*?*sort=*&*",
          "/*?*source=*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
