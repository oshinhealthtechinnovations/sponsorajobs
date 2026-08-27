/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Section 56: Remove X-Powered-By
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.greenhouse.io" },
      { protocol: "https", hostname: "**.lever.co" },
      { protocol: "https", hostname: "**.workday.com" },
      { protocol: "https", hostname: "**.ashbyhq.com" },
      { protocol: "https", hostname: "**.recruitee.com" },
      { protocol: "https", hostname: "**.teamtailor.com" },
      { protocol: "https", hostname: "**.smartrecruiters.com" },
      { protocol: "https", hostname: "fonts.gstatic.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self' https: data:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "style-src 'self' 'unsafe-inline' https:",
              "font-src 'self' https: data:",
              "img-src 'self' https: data: blob: http:",
              "connect-src 'self' https: data: wss:",
              "frame-src 'self' https:",
              "frame-ancestors 'self' https:",
              "base-uri 'self'",
              "form-action 'self' https:",
            ].join("; "),
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
};

export default nextConfig;
