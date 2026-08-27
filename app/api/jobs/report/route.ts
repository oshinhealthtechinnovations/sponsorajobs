import { NextRequest, NextResponse } from "next/server";
import { telegramService } from "@/lib/services/telegramService";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, jobTitle, companyName, reason, details, reporterEmail } = body;

    if (!jobId || !reason) {
      return NextResponse.json({ error: "Missing required report parameters" }, { status: 400 });
    }

    console.log(`[Job Quality Report] Job: ${jobId} (${jobTitle} @ ${companyName}) | Reason: ${reason} | Details: ${details || "None"} | Reporter: ${reporterEmail || "Anonymous"}`);

    // Broadcast to Admin Telegram
    await telegramService.sendMessage(`🚩 <b>USER DATA QUALITY REPORT</b>
━━━━━━━━━━━━━━━━━━━━
💼 <b>Job:</b> ${jobTitle} (${companyName})
🆔 <b>Job ID:</b> <code>${jobId}</code>
⚠️ <b>Reason:</b> <code>${reason}</code>
📝 <b>Details:</b> ${details || "None provided"}
📧 <b>Reporter:</b> ${reporterEmail || "Anonymous"}
⏰ <b>Timestamp:</b> ${new Date().toISOString()}
━━━━━━━━━━━━━━━━━━━━`);

    return NextResponse.json({ success: true, message: "Report received and queued for audit review" });
  } catch (err: any) {
    console.error("[Job Quality Report Error]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
