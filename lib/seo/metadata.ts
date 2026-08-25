import { Metadata } from "next";

const BASE_URL = "https://sponsorajobs.com";

interface MetadataOptions {
  title: string;
  description: string;
  path: string;
  jobCount?: number;
  image?: string;
  noIndex?: boolean;
}

/**
 * Generate standardized, canonicalized metadata with thin-content protection (Section 44, 45, 140)
 */
export function constructMetadata({
  title,
  description,
  path,
  jobCount,
  image = "/og-image.png",
  noIndex = false,
}: MetadataOptions): Metadata {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${BASE_URL}${cleanPath.toLowerCase()}`;

  // Section 140: Thin content safeguard — do not index pages with < 5 jobs
  const shouldNoIndex = noIndex || (jobCount !== undefined && jobCount < 5);

  return {
    title: `${title} | SponsorAJobs`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !shouldNoIndex,
      follow: true,
      googleBot: {
        index: !shouldNoIndex,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${title} | SponsorAJobs`,
      description,
      url: canonicalUrl,
      siteName: "SponsorAJobs",
      images: [
        {
          url: image.startsWith("http") ? image : `${BASE_URL}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | SponsorAJobs`,
      description,
      images: [image.startsWith("http") ? image : `${BASE_URL}${image}`],
    },
  };
}
