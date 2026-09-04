import React from "react";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/services/adminAuth";
import { PaidUsersAdminClient, PaidSubscriber } from "@/components/PaidUsersAdminClient";
import { complaintRepository } from "@/lib/repositories/complaintRepository";
import { EmailService } from "@/lib/services/emailService";

export const revalidate = 0;

export const metadata = {
  title: "Paid VIP Subscribers & Activity Monitor — SponsorAJobs Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSubscribersPage() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    redirect("/admin/login");
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. Fetch Candidate Users from Supabase
  let rawUsers: any[] = [];
  let supabaseConnected = false;
  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/candidate_users?select=*&order=created_at.desc`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        cache: "no-store",
      });
      if (res.ok) {
        rawUsers = await res.json();
        supabaseConnected = true;
      }
    } catch (err) {
      console.error("[AdminSubscribers] Failed to load Supabase users:", err);
    }
  }

  // 2. Fetch Real Razorpay Payments
  let razorpayPayments: any[] = [];
  let razorpayConnected = false;
  const rzpKey = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const rzpSecret = process.env.RAZORPAY_KEY_SECRET;

  if (rzpKey && rzpSecret) {
    try {
      const auth = Buffer.from(`${rzpKey}:${rzpSecret}`).toString("base64");
      const res = await fetch("https://api.razorpay.com/v1/payments?count=50", {
        headers: { Authorization: `Basic ${auth}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        razorpayPayments = Array.isArray(data.items) ? data.items : [];
        razorpayConnected = true;
      }
    } catch (err) {
      console.error("[AdminSubscribers] Failed to fetch Razorpay payments:", err);
    }
  }

  // 3. Fetch Applications from Supabase
  let rawApplications: any[] = [];
  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/candidate_applications?select=*&order=last_updated_at.desc`,
        {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
          cache: "no-store",
        }
      );
      if (res.ok) {
        rawApplications = await res.json();
      }
    } catch (err) {
      console.error("[AdminSubscribers] Failed to load applications:", err);
    }
  }

  // 4. Fetch VIP Complaints
  const allComplaints = await complaintRepository.getAllComplaints();

  // 5. Index Razorpay payments by email, phone, and payment id
  const paymentByEmail = new Map<string, any>();
  const paymentById = new Map<string, any>();
  let totalRevenueInr = 0;

  for (const pay of razorpayPayments) {
    if (pay.status === "captured") {
      paymentById.set(pay.id, pay);
      if (pay.amount) {
        totalRevenueInr += pay.amount / 100;
      }
      if (pay.email) {
        paymentByEmail.set(pay.email.toLowerCase().trim(), pay);
      }
      if (pay.notes?.email) {
        paymentByEmail.set(pay.notes.email.toLowerCase().trim(), pay);
      }
    }
  }

  // 6. Aggregate Paid Subscribers
  const subscribersMap = new Map<string, PaidSubscriber>();

  for (const u of rawUsers) {
    const email = (u.email || "").toLowerCase().trim();
    const promo = u.promo_code || "";
    const isPro = promo.startsWith("PRO_SUB:") || Boolean(u.is_trial);

    // Also check if there's a captured payment associated with this email
    const directPayment = paymentByEmail.get(email);

    if (isPro || directPayment) {
      let subData: any = {};
      if (promo.startsWith("PRO_SUB:")) {
        try {
          subData = JSON.parse(promo.replace("PRO_SUB:", ""));
        } catch {}
      }

      const paymentId = subData.paymentId || directPayment?.id || "pay_verified";
      const paymentInfo = paymentById.get(paymentId) || directPayment;

      const startedAt = subData.startedAt || u.created_at || new Date().toISOString();
      const expiresAt =
        subData.expiresAt || new Date(new Date(startedAt).getTime() + 30 * 86400000).toISOString();

      const daysRemaining = Math.max(
        0,
        Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );

      // Contact & Phone resolution
      let phone = u.phone || "";
      let upiVpa = "";
      if (paymentInfo) {
        if (paymentInfo.contact) phone = paymentInfo.contact;
        if (paymentInfo.upi?.vpa) upiVpa = paymentInfo.upi.vpa;
        if (paymentInfo.vpa) upiVpa = paymentInfo.vpa;
      }

      // Friendly display name for guest or default accounts
      let displayName = u.name || "VIP Candidate";
      if (email === "void@razorpay.com") {
        displayName = `VIP Candidate (${phone || "UPI User"})`;
      }

      // User applications
      const userApps = rawApplications.filter(
        (a) => (a.user_id && a.user_id === u.id) || (a.user_email && a.user_email === email)
      );

      const interviewingCount = userApps.filter((a) => a.status === "INTERVIEWING").length;
      const offersCount = userApps.filter((a) => a.status === "OFFER").length;

      // User complaints
      const userComplaints = allComplaints.filter(
        (c) => c.userEmail === email || (c.userId && c.userId === u.id)
      );
      const openTicketsCount = userComplaints.filter((c) => c.status !== "RESOLVED").length;

      // Health status calculation
      let healthStatus: "HEALTHY" | "EXPIRING_SOON" | "NEEDS_ATTENTION" = "HEALTHY";
      const healthNotes: string[] = [];

      if (openTicketsCount > 0) {
        healthStatus = "NEEDS_ATTENTION";
        healthNotes.push(`${openTicketsCount} unresolved support ticket(s)`);
      } else if (daysRemaining <= 7 && daysRemaining > 0) {
        healthStatus = "EXPIRING_SOON";
        healthNotes.push(`Subscription expiring in ${daysRemaining} day(s)`);
      } else if (daysRemaining === 0) {
        healthStatus = "NEEDS_ATTENTION";
        healthNotes.push("Subscription expired");
      }

      if (!u.is_email_verified && email !== "void@razorpay.com") {
        healthNotes.push("Email not yet OTP-verified");
      }

      const resolvedAmount = typeof subData.amount === "number"
        ? subData.amount
        : (paymentInfo?.amount ? (paymentInfo.amount / 100) : 199);

      subscribersMap.set(email, {
        id: u.id || `usr_${Date.now()}`,
        email: u.email,
        name: displayName,
        phone,
        upiVpa,
        profession: u.profession || "Candidate",
        isEmailVerified: Boolean(u.is_email_verified),
        isTrial: Boolean(u.is_trial),
        isActive: u.is_active ?? true,
        subscriptionTier: "PRO",
        subscriptionStatus: subData.status || (daysRemaining > 0 ? "ACTIVE" : "EXPIRED"),
        planLabel: subData.planLabel || "1 Month VIP (Candidate Pro)",
        amountPaid: resolvedAmount,
        currencyPaid: subData.currency || "INR",
        paymentId,
        gateway: paymentInfo ? "Razorpay" : (subData.gateway || "Online Gateway"),
        startedAt,
        expiresAt,
        daysRemaining,
        lastLoginAt: u.last_login_at || u.created_at || new Date().toISOString(),
        createdAt: u.created_at || new Date().toISOString(),
        applicationsCount: userApps.length,
        interviewingCount,
        offersCount,
        recentApplications: userApps.slice(0, 10).map((a) => ({
          id: a.id,
          jobTitle: a.job_title || "Job Application",
          companyName: a.company_name || "Company",
          status: a.status || "APPLIED",
          appliedAt: a.applied_at || a.created_at,
          lastUpdatedAt: a.last_updated_at || a.applied_at,
          notes: a.notes,
        })),
        healthStatus,
        healthNotes,
        openTicketsCount,
      });
    }
  }

  const subscribers = Array.from(subscribersMap.values()).sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  // 7. Telemetry & Quota Status
  const emailService = new EmailService();
  const quota = emailService.getDailyQuotaStatus();
  const openTicketsTotal = Array.isArray(allComplaints)
    ? allComplaints.filter((c) => c.status !== "RESOLVED").length
    : 0;

  return (
    <PaidUsersAdminClient
      subscribers={subscribers}
      complaints={allComplaints || []}
      telemetry={{
        totalRevenueInr,
        activeCount: subscribers.filter((s) => s.daysRemaining > 0).length,
        expiringCount: subscribers.filter((s) => s.daysRemaining <= 7 && s.daysRemaining > 0).length,
        openTicketsCount: openTicketsTotal,
        razorpayConnected,
        supabaseConnected,
        emailProvider: quota.activeProvider === "resend" ? "Resend API" : "Gmail SMTP Relay",
        emailQuotaRemaining: quota.resendRemaining,
      }}
    />
  );
}
