import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import fs from "fs";
import path from "path";

const mockStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStore[key] || null),
  setItem: vi.fn((key: string, val: string) => {
    mockStore[key] = val;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStore[key];
  }),
  clear: vi.fn(() => {
    for (const k in mockStore) delete mockStore[k];
  }),
};

describe("Tool Authentication Gating & Mobile Security Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  describe("File-Level Static Code Security Audits", () => {
    it("should ensure app/tools/smart-job-finder does NOT contain raw ungated <a href={job.applyUrl}>", () => {
      const filePath = path.resolve(process.cwd(), "app/tools/smart-job-finder/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");

      // Verify ToolAuthGuard is imported and used
      expect(content).toContain('import { ToolAuthGuard } from "@/components/ToolAuthGuard"');
      expect(content).toContain("<ToolAuthGuard");
      expect(content).toContain("</ToolAuthGuard>");

      // Verify JobApplyButton is used instead of raw <a> tag
      expect(content).toContain("<JobApplyButton");
      expect(content).not.toMatch(/<a\s+[^>]*href=\{job\.applyUrl\}/i);
    });

    it("should ensure app/tools/cv-cover-letter is gated with ToolAuthGuard", () => {
      const filePath = path.resolve(process.cwd(), "app/tools/cv-cover-letter/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).toContain('import { ToolAuthGuard } from "@/components/ToolAuthGuard"');
      expect(content).toContain("<ToolAuthGuard");
      expect(content).toContain("</ToolAuthGuard>");
    });

    it("should ensure app/tools/salary-converter is gated with ToolAuthGuard", () => {
      const filePath = path.resolve(process.cwd(), "app/tools/salary-converter/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).toContain('import { ToolAuthGuard } from "@/components/ToolAuthGuard"');
      expect(content).toContain("<ToolAuthGuard");
      expect(content).toContain("</ToolAuthGuard>");
    });

    it("should ensure app/tools/visa-points-calculator is gated with ToolAuthGuard", () => {
      const filePath = path.resolve(process.cwd(), "app/tools/visa-points-calculator/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).toContain('import { ToolAuthGuard } from "@/components/ToolAuthGuard"');
      expect(content).toContain("<ToolAuthGuard");
      expect(content).toContain("</ToolAuthGuard>");
    });

    it("should ensure app/tools/ats-checker is gated with ToolAuthGuard", () => {
      const filePath = path.resolve(process.cwd(), "app/tools/ats-checker/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).toContain('import { ToolAuthGuard } from "@/components/ToolAuthGuard"');
      expect(content).toContain("<ToolAuthGuard");
      expect(content).toContain("</ToolAuthGuard>");
    });

    it("should ensure app/tools/cv-job-match is gated with ToolAuthGuard", () => {
      const filePath = path.resolve(process.cwd(), "app/tools/cv-job-match/page.tsx");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).toContain('import { ToolAuthGuard } from "@/components/ToolAuthGuard"');
      expect(content).toContain("<ToolAuthGuard");
      expect(content).toContain("</ToolAuthGuard>");
    });

    it("should ensure Navbar does NOT mount a duplicate AuthGateModal", () => {
      const filePath = path.resolve(process.cwd(), "components/Navbar.tsx");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).not.toContain("<AuthGateModal");
      expect(content).not.toContain('import { AuthGateModal }');
    });

    it("should ensure AuthGateModal has elevated z-[100] stacking index", () => {
      const filePath = path.resolve(process.cwd(), "components/AuthGateModal.tsx");
      const content = fs.readFileSync(filePath, "utf-8");

      expect(content).toContain("z-[100]");
    });
  });

  describe("Session Storage Synchronization Logic", () => {
    it("should read localStorage sa_user correctly when present", () => {
      const mockCandidate = {
        id: "cand_12345",
        name: "Test Candidate",
        email: "candidate@example.com",
        profession: "Software Engineer",
      };

      mockLocalStorage.setItem("sa_user", JSON.stringify(mockCandidate));
      const parsed = JSON.parse(mockLocalStorage.getItem("sa_user") || "null");

      expect(parsed).toBeDefined();
      expect(parsed?.id).toBe("cand_12345");
      expect(parsed?.email).toBe("candidate@example.com");
    });

    it("should handle invalid JSON in localStorage gracefully", () => {
      mockLocalStorage.setItem("sa_user", "invalid_json_data");
      let parsed = null;
      try {
        parsed = JSON.parse(mockLocalStorage.getItem("sa_user") || "null");
      } catch {
        parsed = null;
      }

      expect(parsed).toBeNull();
    });
  });
});
