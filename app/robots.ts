import { MetadataRoute } from "next";

export const runtime = "edge";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://sponsorajobs.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/_next/",
          "/*?*", // Prevent crawl waste on ephemeral search query combinations
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
