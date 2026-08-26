import { describe, it, expect, beforeAll } from "vitest";
import { sanitizeHtml, sanitizeSearchQuery } from "../lib/security/sanitize";
import { RateLimiter } from "../lib/security/rateLimiter";
import { JobRepository } from "../lib/repositories/jobRepository";
import { runSeed } from "../scripts/seed";
import nextConfig from "../next.config.mjs";

describe("Phase 9: Security & Performance Hardening Tests (Sections 50-57, 108-112)", () => {
  beforeAll(async () => {
    await runSeed();
  });

  // 1. Security Headers in nextConfig (Section 56 & 108)
  describe("Security Headers Configuration (Section 56 & 108)", () => {
    it("should include strict security headers in Next.js config", async () => {
      expect(nextConfig.headers).toBeDefined();
      const headerConfigs = nextConfig.headers ? await nextConfig.headers() : [];
      expect(headerConfigs.length).toBeGreaterThan(0);

      const headers = headerConfigs[0].headers;
      const headerMap = new Map(headers.map((h: any) => [h.key, h.value]));

      expect(headerMap.get("X-Frame-Options")).toBe("DENY");
      expect(headerMap.get("X-Content-Type-Options")).toBe("nosniff");
      expect(headerMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
      expect(headerMap.get("Strict-Transport-Security")).toContain("max-age=63072000");
      expect(headerMap.get("Content-Security-Policy")).toContain("default-src 'self'");
    });
  });

  // 2. Rate Limiting Tests (Section 54 & 110)
  describe("Rate Limiting Engine (Section 54 & 110)", () => {
    it("should allow requests under the limit and block with 429 when threshold exceeded", () => {
      const limiter = new RateLimiter(5, 60000); // 5 reqs per minute
      const ip = "192.168.1.100";

      // First 5 requests must pass
      for (let i = 1; i <= 5; i++) {
        const res = limiter.check(ip);
        expect(res.allowed).toBe(true);
        expect(res.remaining).toBe(5 - i);
      }

      // 6th request must be blocked
      const blockedRes = limiter.check(ip);
      expect(blockedRes.allowed).toBe(false);
      expect(blockedRes.remaining).toBe(0);
      expect(blockedRes.resetTime).toBeGreaterThan(0);
    });
  });

  // 3. XSS & HTML Sanitization Tests (Section 55 & 111)
  describe("XSS & Input Sanitization (Section 55 & 111)", () => {
    it("should strip malicious script tags, iframes, and onerror event handlers", () => {
      const dirtyHtml = `
        <p>Great software engineering role with visa sponsorship.</p>
        <script>alert('XSS Attack!')</script>
        <img src="invalid.jpg" onerror="alert('hack')" />
        <iframe src="http://malicious.com"></iframe>
        <a href="javascript:stealCookies()">Click here</a>
      `;

      const clean = sanitizeHtml(dirtyHtml);
      expect(clean).not.toContain("<script>");
      expect(clean).not.toContain("alert('XSS Attack!')");
      expect(clean).not.toContain("onerror=");
      expect(clean).not.toContain("<iframe");
      expect(clean).not.toContain("javascript:stealCookies()");
      expect(clean).toContain("Great software engineering role");
    });

    it("should sanitize search keywords and truncate excessively long strings", () => {
      const dirtyQuery = "engineer%_--'\"" + "a".repeat(200);
      const clean = sanitizeSearchQuery(dirtyQuery);
      expect(clean.length).toBeLessThanOrEqual(100);
      expect(clean).not.toContain("%");
      expect(clean).not.toContain("_");
    });
  });

  // 4. SQL Injection Resilience Tests (Section 112)
  describe("SQL Injection Resilience (Section 112)", () => {
    it("should safely handle SQL injection strings in search queries via parameterized SQL", async () => {
      const repo = new JobRepository();
      const injectionPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE jobs; --",
        "admin'--",
        "UNION SELECT * FROM admin_action_log --",
      ];

      for (const payload of injectionPayloads) {
        const res = await repo.search({ q: payload });
        expect(res).toBeDefined();
        expect(res.jobs).toBeInstanceOf(Array);
        // Table should still be intact and parameterized without throwing
        expect(res.total).toBeLessThanOrEqual(100);
      }
    });
  });
});
