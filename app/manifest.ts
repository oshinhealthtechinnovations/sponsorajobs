import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SponsorAJobs — Visa Sponsorship Jobs",
    short_name: "SponsorAJobs",
    description: "Search 9,300+ verified jobs with employer visa sponsorship across UK, USA, Australia, Canada, and New Zealand.",
    start_url: "/jobs",
    display: "standalone",
    background_color: "#071522",
    theme_color: "#0284c7",
    orientation: "portrait",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
