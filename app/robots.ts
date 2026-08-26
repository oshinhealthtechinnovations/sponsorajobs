import { MetadataRoute } from "next";

export const runtime = "edge";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/_next/",
          "/*?*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
