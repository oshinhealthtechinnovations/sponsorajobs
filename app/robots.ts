import { MetadataRoute } from "next";

export const runtime = "edge";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/jobs",
          "/jobs/*",
          "/job/*",
          "/countries",
          "/categories",
          "/categories/*",
          "/companies",
          "/company/*",
          "/visa-sponsorship",
          "/visa-sponsorship/*",
          "/about",
          "/contact",
          "/disclaimer",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/_next/*",
        ],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/_next/*",
          "/*?*", // Prevent crawl waste on dynamic query strings
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      "https://sponsorajobs.com/sitemap.xml",
      "https://sponsorajobs.vercel.app/sitemap.xml",
    ],
  };
}
