import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/services/emailService";
import { complaintRepository } from "@/lib/repositories/complaintRepository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = (body.name || "Candidate").trim();
    const email = (body.email || "").trim().toLowerCase();
    const topic = (body.topic || "General Question").trim();
    const message = (body.message || "").trim();
    const pageUrl = (body.pageUrl || "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address so we can reply to you." },
        { status: 400 }
      );
    }

    if (!message || message.length < 5) {
      return NextResponse.json(
        { success: false, error: "Please enter a message (at least 5 characters)." },
        { status: 400 }
      );
    }

    // 1. Log in internal ticket repo for tracking in Admin Console
    try {
      await complaintRepository.createComplaint({
        userEmail: email,
        userName: name,
        category: "OTHER",
        subject: `[Live Chat] ${topic}`,
        message,
        priority: "NORMAL",
      });
    } catch (repoErr) {
      console.warn("[SupportChatAPI] Non-blocking complaint log error:", repoErr);
    }

    // 2. Dispatch instant email alert directly to Gmail (oshinhealthtechinnovations@gmail.com) and admin
    const emailService = new EmailService();
    const dispatchResult = await emailService.sendVisitorChatNotification({
      name,
      email,
      topic,
      message,
      pageUrl,
    });

    // 3. Send automated receipt confirmation back to the candidate (non-blocking)
    emailService.sendVisitorChatConfirmation({ name, email, message }).catch((ackErr) => {
      console.warn("[SupportChatAPI] Visitor confirmation email notice:", ackErr);
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been sent to our team! We will reply to your email shortly.",
      dispatch: dispatchResult,
    });
  } catch (err: any) {
    console.error("[SupportChatAPI] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to deliver your message. Please try again or email support@sponsorajobs.com." },
      { status: 500 }
    );
  }
}
