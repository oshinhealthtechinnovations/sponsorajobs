import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getJobs, POST as postJobs } from "../app/api/admin/jobs/route";
import { GET as getSources, POST as postSources } from "../app/api/admin/sources/route";
import { GET as getAlerts } from "../app/api/admin/alerts/route";
import { POST as authPost } from "../app/api/admin/auth/route";
import { getAdminSecret } from "../lib/services/adminAuth";
import robots from "../app/robots";

describe("Hardened Security & Admin Console Lockdown Suite", () => {
  const validSecret = getAdminSecret();

  // 1. Unauthenticated API access MUST return 401
  it("should reject unauthenticated GET /api/admin/jobs with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/jobs");
    const res = await getJobs(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated POST /api/admin/jobs with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/jobs", {
      method: "POST",
      body: JSON.stringify({ action: "update_status", jobId: "test", status: "active" }),
    });
    const res = await postJobs(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated GET /api/admin/sources with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/sources");
    const res = await getSources(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated POST /api/admin/sources with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/sources", {
      method: "POST",
      body: JSON.stringify({ action: "toggle", sourceId: "test", active: true }),
    });
    const res = await postSources(req);
    expect(res.status).toBe(401);
  });

  it("should reject unauthenticated GET /api/admin/alerts with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/alerts");
    const res = await getAlerts(req);
    expect(res.status).toBe(401);
  });

  // 2. Authenticated API access with Bearer token MUST succeed
  it("should allow authenticated GET /api/admin/jobs with valid Bearer token", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/jobs", {
      headers: { authorization: `Bearer ${validSecret}` },
    });
    const res = await getJobs(req);
    expect(res.status).toBe(200);
  });

  // 3. Auth route password validation
  it("should authenticate with correct admin secret and set session cookie", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: validSecret }),
    });
    const res = await authPost(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(res.cookies.get("sa_admin_session")).toBeDefined();
  });

  it("should reject invalid admin secret with 401", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.100" },
      body: JSON.stringify({ secret: "wrong_password_attempt" }),
    });
    const res = await authPost(req);
    expect(res.status).toBe(401);
  });

  // 4. Robots.txt Disallow Verification
  it("should explicitly disallow /admin and /api in robots.txt", () => {
    const robotsData = robots();
    const rules = Array.isArray(robotsData.rules) ? robotsData.rules[0] : robotsData.rules;
    const disallowed = Array.isArray(rules?.disallow) ? rules.disallow : [rules?.disallow];

    expect(disallowed.some((d) => d && d.includes("/admin"))).toBe(true);
    expect(disallowed.some((d) => d && d.includes("/api"))).toBe(true);
  });
});
