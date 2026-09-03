/**
 * Maintenance Mode Configuration
 * When enabled, public traffic is served the maintenance screen while
 * administrators, APIs, and authorized sessions can continue working.
 */
export const MAINTENANCE_CONFIG = {
  // Set to true to activate maintenance mode across public routes
  enabled: true,

  // UI Information
  badge: "Payment Gateway Upgrade Active",
  heading: "We're Upgrading Our Payment Systems",
  subtitle:
    "SponsorAJobs is undergoing scheduled maintenance while we integrate our secure, multi-currency payment infrastructure. Candidate sponsorship verification and applications will resume shortly!",
  estimatedCompletion: "Shortly",
  supportEmail: "support@sponsorajobs.com",

  // Whitelisted path prefixes that bypass maintenance mode
  allowedPathPrefixes: [
    "/admin",
    "/api/admin",
    "/api/health",
    "/api/auth",
    "/api/waitlist",
    "/api/checkout",       // Razorpay order creation + verification APIs
    "/api/webhooks",       // Razorpay webhook receiver (Razorpay's servers must reach this)
    "/maintenance",
    "/_next",
    "/favicon.ico",
  ],
};
