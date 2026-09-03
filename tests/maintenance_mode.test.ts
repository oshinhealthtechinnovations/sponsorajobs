import { describe, it, expect } from "vitest";
import { MAINTENANCE_CONFIG } from "@/config/maintenance";
import fs from "fs";
import path from "path";

describe("System Maintenance Mode & Payment Gateway Preparation", () => {
  it("should have maintenance configuration properly defined and deactivated for live deployment", () => {
    expect(MAINTENANCE_CONFIG.enabled).toBe(false);
    expect(MAINTENANCE_CONFIG.heading).toContain("Payment Systems");
    expect(MAINTENANCE_CONFIG.badge).toBeTruthy();
    expect(MAINTENANCE_CONFIG.supportEmail).toBe("support@sponsorajobs.com");
  });

  it("should preserve essential administration and operational routes", () => {
    const requiredPrefixes = ["/admin", "/api/admin", "/api/health", "/api/auth", "/api/waitlist", "/maintenance"];
    for (const prefix of requiredPrefixes) {
      expect(MAINTENANCE_CONFIG.allowedPathPrefixes).toContain(prefix);
    }
  });

  it("should have a dedicated, rich maintenance page component created", () => {
    const pagePath = path.resolve(process.cwd(), "app/maintenance/page.tsx");
    expect(fs.existsSync(pagePath)).toBe(true);
    const content = fs.readFileSync(pagePath, "utf-8");
    expect(content).toContain("Payment Systems");
    expect(content).toContain("Multi-Currency Gateway");
    expect(content).toContain("Bank-Grade Security");
    expect(content).toContain("Get Notified");
  });
});
