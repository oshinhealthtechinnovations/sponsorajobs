import { describe, it, expect, vi } from "vitest";
import { TelegramService } from "../lib/services/telegramService";

describe("Telegram Real-Time Notification & Timeline Service", () => {
  it("should initialize cleanly and check configuration status", () => {
    const unconfigured = new TelegramService({ botToken: "", chatId: "" });
    expect(unconfigured.isConfigured()).toBe(false);

    const configured = new TelegramService({ botToken: "12345:mock_token", chatId: "987654321" });
    expect(configured.isConfigured()).toBe(true);
  });

  it("should format candidate registration notification with promo code", async () => {
    const service = new TelegramService();
    const spy = vi.spyOn(service, "sendMessage").mockResolvedValue({ success: true });

    await service.notifyUserRegistered({
      name: "Alex Smith",
      email: "alex.smith@example.com",
      profession: "Senior Civil Engineer",
      promoCode: "sumit_raj_linkedin",
    });

    expect(spy).toHaveBeenCalledOnce();
    const sentMsg = spy.mock.calls[0][0];
    expect(sentMsg).toContain("NEW CANDIDATE REGISTERED");
    expect(sentMsg).toContain("Alex Smith");
    expect(sentMsg).toContain("Senior Civil Engineer");
    expect(sentMsg).toContain("sumit_raj_linkedin");
  });

  it("should format free trial request notification", async () => {
    const service = new TelegramService();
    const spy = vi.spyOn(service, "sendMessage").mockResolvedValue({ success: true });

    await service.notifyTrialRequested({
      name: "David Miller",
      email: "david@example.com",
      profession: "Registered Nurse",
    });

    expect(spy).toHaveBeenCalledOnce();
    const sentMsg = spy.mock.calls[0][0];
    expect(sentMsg).toContain("NEW FREE TRIAL ACCESS REQUEST");
    expect(sentMsg).toContain("David Miller");
    expect(sentMsg).toContain("Registered Nurse");
  });

  it("should format daily operational timeline report with completed and pending tasks", async () => {
    const service = new TelegramService();
    const spy = vi.spyOn(service, "sendMessage").mockResolvedValue({ success: true });

    await service.sendTimelineReport({
      completedItems: [
        "Ingested 648 Active Sponsored Jobs",
        "Deterministic SEO Scoring Active",
      ],
      pendingItems: [
        "Next ATS Ingestion Cron at 02:00 UTC",
        "Next Subscriber Alert Digest at 08:00 UTC",
      ],
      liveJobsCount: 648,
      totalSubscribers: 12,
    });

    expect(spy).toHaveBeenCalledOnce();
    const sentMsg = spy.mock.calls[0][0];
    expect(sentMsg).toContain("OPERATIONAL TIMELINE & SYSTEM STATUS");
    expect(sentMsg).toContain("COMPLETED AUTOMATED OPERATIONS");
    expect(sentMsg).toContain("UPCOMING / PENDING OPERATIONS");
    expect(sentMsg).toContain("Ingested 648 Active Sponsored Jobs");
    expect(sentMsg).toContain("Next ATS Ingestion Cron at 02:00 UTC");
  });

  it("should format daily community job drop broadcast correctly", async () => {
    const service = new TelegramService();
    const spy = vi.spyOn(service, "sendMessage").mockResolvedValue({ success: true });

    await service.broadcastDailyJobsDrop({
      jobs: [
        {
          title: "Senior Full Stack Engineer",
          companyName: "Revolut",
          countryCode: "gb",
          salaryFormatted: "£90,000 / year",
          slug: "senior-full-stack-engineer-revolut",
          sponsorshipStatus: "Direct Visa Sponsorship / CoS",
        },
      ],
    });

    expect(spy).toHaveBeenCalledOnce();
    const sentMsg = spy.mock.calls[0][0];
    expect(sentMsg).toContain("TODAY'S VERIFIED VISA SPONSORSHIP JOB DROP");
    expect(sentMsg).toContain("Senior Full Stack Engineer");
    expect(sentMsg).toContain("Revolut");
    expect(sentMsg).toContain("🇬🇧 UK");
    expect(sentMsg).toContain("Exclusive Candidate Access");
  });
});
