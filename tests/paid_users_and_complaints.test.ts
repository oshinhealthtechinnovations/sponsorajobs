import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { complaintRepository } from "@/lib/repositories/complaintRepository";
import { EmailService } from "@/lib/services/emailService";
import { POST as submitComplaintPOST, GET as userComplaintsGET } from "@/app/api/user/complaint/route";
import { GET as adminComplaintsGET, PATCH as adminComplaintsPATCH } from "@/app/api/admin/complaints/route";

describe("Paid VIP Users & Complaint System Tests", () => {
  beforeEach(() => {
    process.env.ADMIN_SECRET = "test_admin_secret_key_123";
  });

  it("1. should create, retrieve, and update complaints in ComplaintRepository", async () => {
    const complaint = await complaintRepository.createComplaint({
      userId: "usr_test_123",
      userEmail: "test_subscriber@example.com",
      userName: "John VIP",
      userPhone: "+919876543210",
      planLabel: "1 Month VIP (Candidate Pro)",
      category: "UNLOCK_ISSUE",
      subject: "Direct apply link not opening for London job",
      message: "When clicking the unlocked direct link, it leads to a 404 on the employer career site.",
      priority: "URGENT",
    });

    expect(complaint.id).toBeDefined();
    expect(complaint.ticketId).toMatch(/^VIP-TCK-\d{4}$/);
    expect(complaint.status).toBe("OPEN");
    expect(complaint.priority).toBe("URGENT");
    expect(complaint.userEmail).toBe("test_subscriber@example.com");

    // Fetch user complaints
    const userTickets = await complaintRepository.getComplaintsForUser("test_subscriber@example.com");
    expect(userTickets.some((t) => t.ticketId === complaint.ticketId)).toBe(true);

    // Update status to RESOLVED
    const updated = await complaintRepository.updateStatus(complaint.ticketId, "RESOLVED", "Link verified and corrected");
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe("RESOLVED");
    expect(updated?.adminNotes).toBe("Link verified and corrected");
    expect(updated?.resolvedAt).toBeDefined();
  });

  it("2. should trigger EmailService alert to admin with formatted VIP ticket metadata", async () => {
    const emailService = new EmailService();

    const alertResult = await emailService.sendAdminComplaintAlert({
      ticketId: "VIP-TCK-9999",
      userEmail: "vip_client@example.com",
      userName: "Alex VIP",
      userPhone: "+919867520424",
      planLabel: "1 Month VIP",
      category: "UNLOCK_ISSUE",
      subject: "URGENT: Application Issue",
      message: "Please help unlock the sponsor certificate details for Monzo role.",
      priority: "URGENT",
    });

    expect(alertResult.success).toBe(true);
    expect(alertResult.messageId).toBeDefined();

    const confirmResult = await emailService.sendCandidateComplaintConfirmation({
      ticketId: "VIP-TCK-9999",
      userEmail: "vip_client@example.com",
      userName: "Alex VIP",
      subject: "URGENT: Application Issue",
    });

    expect(confirmResult.success).toBe(true);
  });

  it("3. should handle candidate submission via /api/user/complaint endpoint", async () => {
    const req = new NextRequest("http://localhost:3000/api/user/complaint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "paying_customer@sponsorajobs.com",
        name: "Valued Subscriber",
        phone: "+919867520424",
        category: "PAYMENT",
        subject: "Invoice receipt for ₹199 plan",
        message: "Can you provide a GST compliant invoice receipt for my company reimbursement?",
        priority: "NORMAL",
      }),
    });

    const res = await submitComplaintPOST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.ticketId).toMatch(/^VIP-TCK-\d{4}$/);
    expect(json.complaint.userEmail).toBe("paying_customer@sponsorajobs.com");
  });

  it("4. should protect /api/admin/complaints and allow status updates when authenticated", async () => {
    // 1. Unauthenticated request
    const unauthReq = new NextRequest("http://localhost:3000/api/admin/complaints", {
      method: "GET",
    });
    const unauthRes = await adminComplaintsGET(unauthReq);
    expect(unauthRes.status).toBe(401);

    // 2. Authenticated request
    const authReq = new NextRequest("http://localhost:3000/api/admin/complaints", {
      method: "GET",
      headers: {
        Authorization: "Bearer test_admin_secret_key_123",
      },
    });
    const authRes = await adminComplaintsGET(authReq);
    expect(authRes.status).toBe(200);
    const authJson = await authRes.json();
    expect(authJson.success).toBe(true);
    expect(Array.isArray(authJson.data)).toBe(true);

    // 3. Patch status update
    if (authJson.data.length > 0) {
      const firstId = authJson.data[0].id;
      const patchReq = new NextRequest("http://localhost:3000/api/admin/complaints", {
        method: "PATCH",
        headers: {
          Authorization: "Bearer test_admin_secret_key_123",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: firstId,
          status: "RESOLVED",
          adminNotes: "Handled by support lead",
        }),
      });

      const patchRes = await adminComplaintsPATCH(patchReq);
      expect(patchRes.status).toBe(200);
      const patchJson = await patchRes.json();
      expect(patchJson.success).toBe(true);
      expect(patchJson.data.status).toBe("RESOLVED");
    }
  });
});
