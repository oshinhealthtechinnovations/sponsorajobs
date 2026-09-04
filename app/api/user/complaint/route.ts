import { NextRequest, NextResponse } from "next/server";
import { complaintRepository, ComplaintCategory, ComplaintPriority } from "@/lib/repositories/complaintRepository";
import { EmailService } from "@/lib/services/emailService";
import { userRepository } from "@/lib/repositories/userRepository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    let email = (body.email || "").trim().toLowerCase();
    let name = body.name || "";
    let userId = body.userId || "";
    let planLabel = body.planLabel || "";

    // 1. Validate session cookie if email not provided or to augment info
    const sessionCookie = request.cookies.get("sa_user_session");
    if (sessionCookie?.value) {
      try {
        const parsed = JSON.parse(sessionCookie.value);
        if (!email && parsed.email) {
          email = parsed.email.trim().toLowerCase();
        }
        if (!name && parsed.name) {
          name = parsed.name;
        }
        if (!userId && parsed.id) {
          userId = parsed.id;
        }
        if (!planLabel && parsed.planLabel) {
          planLabel = parsed.planLabel;
        }
      } catch {}
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid candidate email address is required." },
        { status: 400 }
      );
    }

    const subject = (body.subject || "").trim();
    const message = (body.message || "").trim();

    if (!subject || subject.length < 3) {
      return NextResponse.json(
        { success: false, error: "Please provide a descriptive subject (min 3 characters)." },
        { status: 400 }
      );
    }

    if (!message || message.length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide detailed information about your issue (min 10 characters)." },
        { status: 400 }
      );
    }

    const category = (body.category || "OTHER") as ComplaintCategory;
    const priority = (body.priority === "URGENT" ? "URGENT" : "NORMAL") as ComplaintPriority;
    const userPhone = body.phone || body.userPhone || "";

    // If planLabel not in session, fetch from userRepository
    if (!planLabel) {
      const user = await userRepository.findByEmail(email).catch(() => null);
      if (user) {
        planLabel = user.planLabel || (user.subscriptionTier === "PRO" ? "Candidate Pro" : "Free Tier");
      }
    }

    // 2. Persist to repository
    const complaint = await complaintRepository.createComplaint({
      userId,
      userEmail: email,
      userName: name,
      userPhone,
      planLabel,
      category,
      subject,
      message,
      priority,
    });

    // 3. Trigger immediate Admin Email Alert + Candidate Confirmation in background
    const emailService = new EmailService();
    Promise.all([
      emailService.sendAdminComplaintAlert(complaint).catch((err) => {
        console.error("[ComplaintAPI] Failed sending admin email ping:", err);
      }),
      emailService.sendCandidateComplaintConfirmation(complaint).catch((err) => {
        console.error("[ComplaintAPI] Failed sending candidate confirmation:", err);
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Your VIP support ticket ${complaint.ticketId} has been logged. Our priority team has been notified via email.`,
      ticketId: complaint.ticketId,
      complaint,
    });
  } catch (err: any) {
    console.error("[ComplaintAPI] Error creating complaint:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while logging your ticket." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("sa_user_session");
    let email = request.nextUrl.searchParams.get("email");

    if (!email && sessionCookie?.value) {
      try {
        const parsed = JSON.parse(sessionCookie.value);
        email = parsed.email;
      } catch {}
    }

    if (!email) {
      return NextResponse.json({ success: true, data: [] });
    }

    const tickets = await complaintRepository.getComplaintsForUser(email);
    return NextResponse.json({ success: true, data: tickets });
  } catch (err: any) {
    console.error("[ComplaintAPI] Error fetching tickets:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve support tickets." },
      { status: 500 }
    );
  }
}
