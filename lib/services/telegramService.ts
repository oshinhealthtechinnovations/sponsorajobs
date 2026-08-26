/**
 * Telegram Bot Real-Time Notification & Operational Timeline Service
 * Sends instant alerts for website activity, user sign-ups, trial requests,
 * and automated cron job completion/pending timeline updates.
 */

export interface TelegramConfig {
  botToken?: string;
  chatId?: string;
  communityChannelId?: string;
}

export class TelegramService {
  private botToken: string;
  private chatId: string;
  private communityChannelId: string;

  constructor(config?: TelegramConfig) {
    this.botToken =
      config?.botToken !== undefined
        ? config.botToken
        : (process.env.TELEGRAM_BOT_TOKEN || "8728617267:AAHahZaci_FgFjRQpgmpyCZYV7D_gX3ZX40");
    this.chatId =
      config?.chatId !== undefined
        ? config.chatId
        : (process.env.TELEGRAM_CHAT_ID || "8569757426");
    this.communityChannelId =
      config?.communityChannelId !== undefined
        ? config.communityChannelId
        : (process.env.TELEGRAM_COMMUNITY_CHANNEL_ID || "8569757426");
  }

  /**
   * Check if Telegram integration is configured
   */
  isConfigured(): boolean {
    return Boolean(this.botToken && this.chatId);
  }

  /**
   * Send a raw HTML or text message to the configured Telegram chat or target group/channel
   */
  async sendMessage(
    text: string,
    options?: {
      targetChatId?: string;
      parseMode?: "HTML" | "Markdown";
      disableNotification?: boolean;
      disableWebPagePreview?: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const token = this.botToken || process.env.TELEGRAM_BOT_TOKEN;
    const destChatId =
      options?.targetChatId ||
      this.chatId ||
      process.env.TELEGRAM_CHAT_ID;

    if (!token || !destChatId) {
      // In dev or when not yet configured, log gracefully
      console.log(`[Telegram Log (Not Configured)]:\n${text}`);
      return { success: false, error: "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured" };
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: destChatId,
          text,
          parse_mode: options?.parseMode || "HTML",
          disable_web_page_preview: options?.disableWebPagePreview ?? true,
          disable_notification: options?.disableNotification || false,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        console.error("[Telegram Error]:", data);
        return { success: false, error: data.description || "Failed to send message" };
      }

      return { success: true };
    } catch (err: any) {
      console.error("[Telegram Dispatch Exception]:", err);
      return { success: false, error: err.message || "Network exception" };
    }
  }

  /**
   * 1. Notification: New User Registered with Promo Code
   */
  async notifyUserRegistered(user: {
    name: string;
    email: string;
    profession: string;
    promoCode: string;
  }): Promise<void> {
    const timeStr = new Date().toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC";
    const msg = `
🚀 <b>NEW CANDIDATE REGISTERED</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Name:</b> ${this.escape(user.name)}
💼 <b>Profession:</b> ${this.escape(user.profession)}
📧 <b>Email:</b> <code>${this.escape(user.email)}</code>
🎟️ <b>Promo Code:</b> <code>${this.escape(user.promoCode)}</code>
⏰ <b>Time:</b> ${timeStr}
✨ <b>Status:</b> 100% Verified & VIP Trial Active
━━━━━━━━━━━━━━━━━━━━
🌐 <a href="https://www.sponsorajobs.com">SponsorAJobs Live Portal</a>
`.trim();

    await this.sendMessage(msg);
  }

  /**
   * 2. Notification: New Free Trial Request Submitted
   */
  async notifyTrialRequested(trial: {
    name: string;
    email: string;
    profession: string;
  }): Promise<void> {
    const timeStr = new Date().toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC";
    const msg = `
🎁 <b>NEW FREE TRIAL ACCESS REQUEST</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Candidate:</b> ${this.escape(trial.name)}
💼 <b>Target Role:</b> ${this.escape(trial.profession)}
📧 <b>Email:</b> <code>${this.escape(trial.email)}</code>
⏰ <b>Received At:</b> ${timeStr}
💡 <b>Action:</b> Send referral code or approve in Admin Hub
━━━━━━━━━━━━━━━━━━━━
🔗 <a href="https://www.sponsorajobs.com/admin/alerts">Open Admin Requests Hub</a>
`.trim();

    await this.sendMessage(msg);
  }

  /**
   * 3. Notification: New Email Job Alert Subscription
   */
  async notifySubscriberJoined(sub: {
    email: string;
    country?: string;
    category?: string;
    keyword?: string;
    frequency?: string;
  }): Promise<void> {
    const msg = `
📬 <b>NEW JOB ALERT SUBSCRIBER</b>
━━━━━━━━━━━━━━━━━━━━
📧 <b>Subscriber:</b> <code>${this.escape(sub.email)}</code>
🌍 <b>Country:</b> ${this.escape(sub.country || "All Global")}
📂 <b>Category:</b> ${this.escape(sub.category || "All Industries")}
🔍 <b>Keywords:</b> ${this.escape(sub.keyword || "General")}
⏰ <b>Frequency:</b> ${this.escape(sub.frequency || "Daily")}
━━━━━━━━━━━━━━━━━━━━
🌐 <a href="https://www.sponsorajobs.com">SponsorAJobs Alerts</a>
`.trim();

    await this.sendMessage(msg);
  }

  /**
   * 4. Notification: Automated Cron Ingestion Completed
   */
  async notifyCronIngestCompleted(data: {
    fetched: number;
    verified: number;
    expired: number;
    durationMs: number;
  }): Promise<void> {
    const durationSec = (data.durationMs / 1000).toFixed(1);
    const msg = `
🤖 <b>CRON: DAILY JOB INGESTION COMPLETED</b>
━━━━━━━━━━━━━━━━━━━━
📥 <b>Raw Jobs Scraped:</b> ${data.fetched}
🛡️ <b>Verified Visa Sponsors:</b> ${data.verified}
🧹 <b>Expired Stale Jobs:</b> ${data.expired}
⏱️ <b>Processing Duration:</b> ${durationSec}s
⚡ <b>Status:</b> ✅ Complete & Synced
━━━━━━━━━━━━━━━━━━━━
📊 <a href="https://www.sponsorajobs.com/admin">View System Dashboard</a>
`.trim();

    await this.sendMessage(msg);
  }

  /**
   * 5. Notification: Automated Cron Job Alerts Dispatched
   */
  async notifyCronAlertsDispatched(data: {
    totalSent: number;
    subscribersCount: number;
  }): Promise<void> {
    const msg = `
📧 <b>CRON: JOB ALERT EMAILS DISPATCHED</b>
━━━━━━━━━━━━━━━━━━━━
📬 <b>Emails Delivered:</b> ${data.totalSent}
👥 <b>Active Subscribers Scanned:</b> ${data.subscribersCount}
⚡ <b>Status:</b> ✅ Successfully Dispatched
━━━━━━━━━━━━━━━━━━━━
🌐 <a href="https://www.sponsorajobs.com">SponsorAJobs Email Engine</a>
`.trim();

    await this.sendMessage(msg);
  }

  /**
   * 6. Timeline Status Update ("Completed vs. Pending")
   */
  async sendTimelineReport(data: {
    completedItems: string[];
    pendingItems: string[];
    liveJobsCount: number;
    totalSubscribers: number;
  }): Promise<void> {
    const completedList = data.completedItems.map((item) => `  ✅ ${this.escape(item)}`).join("\n");
    const pendingList = data.pendingItems.map((item) => `  ⏳ ${this.escape(item)}`).join("\n");
    const timeStr = new Date().toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC";

    const msg = `
📊 <b>OPERATIONAL TIMELINE & SYSTEM STATUS</b>
━━━━━━━━━━━━━━━━━━━━
<b>📅 Report Time:</b> ${timeStr}
<b>💼 Live Verified Jobs:</b> ${data.liveJobsCount}
<b>👥 Total Subscribers:</b> ${data.totalSubscribers}

<b>🏆 COMPLETED AUTOMATED OPERATIONS:</b>
${completedList || "  None"}

<b>⏱️ UPCOMING / PENDING OPERATIONS:</b>
${pendingList || "  None"}
━━━━━━━━━━━━━━━━━━━━
🛡️ <a href="https://www.sponsorajobs.com/admin">Open Admin Control Center</a>
`.trim();

    await this.sendMessage(msg);
  }

  /**
   * 7. Daily Community Broadcast: Visa Sponsored Job Drop
   * Broadcasts top verified sponsorship jobs to Telegram Community Group/Channel
   */
  async broadcastDailyJobsDrop(data: {
    jobs: Array<{
      title: string;
      companyName: string;
      countryCode: string;
      salaryFormatted?: string;
      slug: string;
      sponsorshipStatus?: string;
    }>;
    channelId?: string;
    customNote?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const flagMap: Record<string, string> = {
      gb: "🇬🇧 UK",
      us: "🇺🇸 USA",
      au: "🇦🇺 Australia",
      ca: "🇨🇦 Canada",
      nz: "🇳🇿 NZ",
    };

    const jobEntries = data.jobs.slice(0, 5).map((job, idx) => {
      const flag = flagMap[job.countryCode.toLowerCase()] || `🌍 ${job.countryCode.toUpperCase()}`;
      const salary = job.salaryFormatted ? `\n💰 <b>Salary:</b> ${this.escape(job.salaryFormatted)}` : "";
      const sponsorBadge = job.sponsorshipStatus ? `\n🛡️ <b>Visa:</b> ${this.escape(job.sponsorshipStatus)}` : "";
      const jobUrl = `https://www.sponsorajobs.com/job/${encodeURIComponent(job.slug)}`;

      return `${idx + 1}. <b>${this.escape(job.title)}</b>\n🏢 <b>${this.escape(job.companyName)}</b> • ${flag}${salary}${sponsorBadge}\n👉 <a href="${jobUrl}">View & Apply on SponsorAJobs</a>`;
    }).join("\n\n");

    const msg = `
🌟 <b>TODAY'S VERIFIED VISA SPONSORSHIP JOB DROP</b>
━━━━━━━━━━━━━━━━━━━━
🎯 <b>Latest Verified Global Roles with Visa Sponsorship:</b>

${jobEntries || "Check out latest jobs on our live portal!"}

━━━━━━━━━━━━━━━━━━━━
💡 <i>Tip: Unlock VIP employer contacts & application guides using master invite code:</i> <code>sumit_raj_linkedin</code>
🌐 <b>Explore 640+ Visa Sponsored Jobs:</b> <a href="https://www.sponsorajobs.com">https://www.sponsorajobs.com</a>
`.trim();

    return await this.sendMessage(msg, {
      targetChatId: data.channelId || this.communityChannelId,
      disableWebPagePreview: false,
    });
  }

  private escape(str: string): string {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

export const telegramService = new TelegramService();
