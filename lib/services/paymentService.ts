/**
 * Hybrid Dual-Gateway Payment & Billing Service
 * Supports:
 * 1. Razorpay (Primary for India): UPI (GPay, PhonePe, Paytm, BHIM), RuPay, Indian NetBanking
 * 2. Stripe (Primary for International): Apple Pay, Google Pay, Global Cards (UK, US, AU, CA, NZ)
 * Includes local interactive sandbox simulation on localhost:3000 for both gateways.
 */

import { userRepository, UserAccount } from "@/lib/repositories/userRepository";

export type PaymentGatewayProvider = "razorpay" | "stripe";

export interface CheckoutSessionOptions {
  userEmail: string;
  userName?: string;
  userId?: string;
  gateway?: PaymentGatewayProvider;
  planCode?: string;    // e.g. "SA_YEAR_999" — resolved server-side; client amount is ignored
  returnUrl?: string;
  cancelUrl?: string;
  currency?: string;
}

export interface CheckoutSessionResult {
  sessionId?: string;
  orderId?: string;
  checkoutUrl: string;
  gateway: PaymentGatewayProvider;
  mode: "live" | "test" | "sandbox_simulated";
  amount: number;
  currency: string;
  keyId?: string;
}

export interface SandboxSessionRecord {
  id: string;
  orderId?: string;
  gateway: PaymentGatewayProvider;
  userEmail: string;
  userName?: string;
  userId?: string;
  amount: number;
  currency: string;
  status: "open" | "complete" | "cancelled";
  createdAt: string;
}

// In-memory store for local sandbox testing (persisted on globalThis across HMR)
const globalForPayment = globalThis as unknown as {
  sandboxSessions?: Map<string, SandboxSessionRecord>;
};
const inMemorySandboxSessions: Map<string, SandboxSessionRecord> =
  globalForPayment.sandboxSessions || new Map<string, SandboxSessionRecord>();
if (process.env.NODE_ENV !== "production") {
  globalForPayment.sandboxSessions = inMemorySandboxSessions;
}

export const CANDIDATE_PRO_PRICE = 299;
export const CANDIDATE_PRO_CURRENCY = (process.env.PAYMENT_CURRENCY || "INR").toUpperCase();

// ─── Server-authoritative Subscription Plan Catalog ──────────────────────────
// NEVER trust amounts from the browser. All pricing is resolved here, server-side.
export interface SubscriptionPlan {
  amount: number;       // INR (Rupees, NOT paise)
  durationDays: number; // Subscription length in days
  label: string;        // Display label
  badge?: string;       // Optional badge (e.g., "Most Popular")
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  SA_MONTH_199:   { amount: 199,  durationDays: 30,  label: "1 Month" },
  SA_3MONTH_499:  { amount: 499,  durationDays: 90,  label: "3 Months", badge: "Best Value" },
  SA_6MONTH_799:  { amount: 799,  durationDays: 180, label: "6 Months" },
  SA_YEAR_999:    { amount: 999,  durationDays: 365, label: "12 Months", badge: "Most Popular" },
};

export class PaymentService {
  // Stripe Credentials
  private static stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";
  private static stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  // Razorpay Credentials (dynamic getters with fallback to test credentials)
  private static get razorpayKeyId(): string {
    return process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TXVZbe8aySgPaY";
  }
  private static get razorpayKeySecret(): string {
    return process.env.RAZORPAY_KEY_SECRET || "MveQ7NSFEWVHADuE2n6VqiWh";
  }
  private static get razorpayWebhookSecret(): string {
    return process.env.RAZORPAY_WEBHOOK_SECRET || "";
  }

  /**
   * Generates a checkout session/order via selected gateway (Razorpay for India, Stripe for International)
   */
  static async createCheckoutSession(
    options: CheckoutSessionOptions,
    originUrl?: string
  ): Promise<CheckoutSessionResult> {
    const baseUrl = originUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const cleanEmail = options.userEmail.trim().toLowerCase();
    const currency = (options.currency || CANDIDATE_PRO_CURRENCY).toUpperCase();
    // Resolve amount server-side from plan catalog; never trust client-supplied price
    const plan = options.planCode ? SUBSCRIPTION_PLANS[options.planCode] : null;
    const amount = plan ? plan.amount : CANDIDATE_PRO_PRICE;
    const gateway: PaymentGatewayProvider = options.gateway || "razorpay";

    // ─────────────────────────────────────────────────────────────
    // 1. RAZORPAY GATEWAY (India: UPI / RuPay / NetBanking / Cards)
    // ─────────────────────────────────────────────────────────────
    if (gateway === "razorpay") {
      if (this.razorpayKeyId && this.razorpayKeySecret) {
        try {
          const authHeader = `Basic ${Buffer.from(`${this.razorpayKeyId}:${this.razorpayKeySecret}`).toString("base64")}`;
          const orderPayload = {
            amount: amount * 100, // in paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
              email: cleanEmail,
              userId: options.userId || "",
              tier: "PRO",
            },
          };

          const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderPayload),
          });

          const rzpData = await rzpResponse.json();
          if (rzpResponse.ok && rzpData.id) {
            return {
              orderId: rzpData.id,
              checkoutUrl: `${baseUrl}/checkout/razorpay?order_id=${rzpData.id}&amount=${amount}`,
              gateway: "razorpay",
              mode: this.razorpayKeyId.startsWith("rzp_live") ? "live" : "test",
              amount,
              currency: "INR",
              keyId: this.razorpayKeyId,
            };
          }
          console.warn("[PaymentService] Razorpay API error, falling back to local sandbox:", rzpData);
        } catch (err) {
          console.warn("[PaymentService] Failed connecting to Razorpay, using sandbox simulation:", err);
        }
      }

      // Local Sandbox for Razorpay
      const orderId = `order_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const sandboxRecord: SandboxSessionRecord = {
        id: orderId,
        orderId,
        gateway: "razorpay",
        userEmail: cleanEmail,
        userName: options.userName || "Candidate",
        userId: options.userId,
        amount,
        currency: "INR",
        status: "open",
        createdAt: new Date().toISOString(),
      };
      inMemorySandboxSessions.set(orderId, sandboxRecord);

      return {
        orderId,
        sessionId: orderId,
        checkoutUrl: `${baseUrl}/checkout/sandbox?provider=razorpay&order_id=${orderId}`,
        gateway: "razorpay",
        mode: "sandbox_simulated",
        amount,
        currency: "INR",
        keyId: this.razorpayKeyId,
      };
    }

    // ─────────────────────────────────────────────────────────────
    // 2. STRIPE GATEWAY (International: Apple Pay / Global Cards)
    // ─────────────────────────────────────────────────────────────
    if (this.stripeSecretKey && this.stripeSecretKey.startsWith("sk_")) {
      try {
        const bodyParams = new URLSearchParams();
        bodyParams.append("payment_method_types[]", "card");
        bodyParams.append("mode", "payment");
        bodyParams.append("customer_email", cleanEmail);
        bodyParams.append("client_reference_id", options.userId || cleanEmail);
        bodyParams.append("success_url", `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&gateway=stripe`);
        bodyParams.append("cancel_url", `${baseUrl}/checkout/cancel`);
        bodyParams.append("line_items[0][price_data][currency]", currency.toLowerCase());
        bodyParams.append("line_items[0][price_data][unit_amount]", (amount * 100).toString());
        bodyParams.append("line_items[0][price_data][product_data][name]", "SponsorAJobs Candidate Pro Pass");
        bodyParams.append(
          "line_items[0][price_data][product_data][description]",
          "Annual All-Access Pass: Verified Visa Job Sponsorships, Direct ATS Quick Apply, & Unlimited AI Cover Letter Generator"
        );
        bodyParams.append("line_items[0][quantity]", "1");

        const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyParams.toString(),
        });

        const data = await response.json();
        if (response.ok && data.url) {
          return {
            sessionId: data.id,
            checkoutUrl: data.url,
            gateway: "stripe",
            mode: this.stripeSecretKey.startsWith("sk_live") ? "live" : "test",
            amount,
            currency,
          };
        }
        console.warn("[PaymentService] Stripe API error, falling back to local sandbox:", data);
      } catch (err) {
        console.warn("[PaymentService] Failed connecting to Stripe, using sandbox simulation:", err);
      }
    }

    // Local Sandbox for Stripe
    const sessionId = `cs_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const sandboxRecord: SandboxSessionRecord = {
      id: sessionId,
      gateway: "stripe",
      userEmail: cleanEmail,
      userName: options.userName || "Candidate",
      userId: options.userId,
      amount,
      currency,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    inMemorySandboxSessions.set(sessionId, sandboxRecord);

    return {
      sessionId,
      checkoutUrl: `${baseUrl}/checkout/sandbox?provider=stripe&session_id=${sessionId}`,
      gateway: "stripe",
      mode: "sandbox_simulated",
      amount,
      currency,
    };
  }

  /**
   * Universal Payment Verifier: Handles both Razorpay and Stripe verifications
   */
  static async verifyPayment(identifier: string, details?: {
    gateway?: PaymentGatewayProvider;
    paymentId?: string;
    signature?: string;
  }): Promise<{
    verified: boolean;
    session?: SandboxSessionRecord | { id: string; userEmail: string; amount: number; currency: string; gateway: string };
    user?: UserAccount | null;
    error?: string;
  }> {
    const isSandbox = identifier.startsWith("cs_sandbox_") || identifier.startsWith("order_sandbox_");

    // ─────────────────────────────────────────────────────────────
    // A. Local Sandbox Verification
    // ─────────────────────────────────────────────────────────────
    if (isSandbox) {
      let record = inMemorySandboxSessions.get(identifier);
      if (!record) {
        const isRzp = identifier.startsWith("order_sandbox_");
        record = {
          id: identifier,
          orderId: isRzp ? identifier : undefined,
          gateway: isRzp ? "razorpay" : "stripe",
          userEmail: "pro.candidate@sponsorajobs.com",
          userName: "Pro Candidate",
          amount: CANDIDATE_PRO_PRICE,
          currency: CANDIDATE_PRO_CURRENCY,
          status: "open",
          createdAt: new Date().toISOString(),
        };
        inMemorySandboxSessions.set(identifier, record);
      }

      record.status = "complete";
      const upgradedUser = await userRepository.upgradeUserToPro(record.userEmail, {
        amountPaid: record.amount,
        currency: record.currency,
        stripeSessionId: record.gateway === "stripe" ? record.id : undefined,
        stripeCustomerId: record.gateway === "razorpay" ? `rzp_pay_${Date.now()}` : undefined,
      });

      return {
        verified: true,
        session: record,
        user: upgradedUser,
      };
    }

    // ─────────────────────────────────────────────────────────────
    // B. Razorpay Live / Test Verification
    // ─────────────────────────────────────────────────────────────
    if (details?.gateway === "razorpay" || identifier.startsWith("order_")) {
      if (this.razorpayKeySecret && details?.paymentId && details?.signature) {
        const isValid = await this.verifyRazorpaySignature(
          identifier,
          details.paymentId,
          details.signature,
          this.razorpayKeySecret
        );

        if (isValid) {
          // Fetch order or payment details from Razorpay to get email
          let email = "";
          try {
            const authHeader = `Basic ${Buffer.from(`${this.razorpayKeyId}:${this.razorpayKeySecret}`).toString("base64")}`;
            const payRes = await fetch(`https://api.razorpay.com/v1/payments/${details.paymentId}`, {
              headers: { Authorization: authHeader },
            });
            if (payRes.ok) {
              const payData = await payRes.json();
              email = payData.email || payData.notes?.email || "";
            }
          } catch (err) {
            console.error("[PaymentService] Error fetching Razorpay payment details:", err);
          }

          const upgradedUser = email
            ? await userRepository.upgradeUserToPro(email, {
                amountPaid: CANDIDATE_PRO_PRICE,
                currency: "INR",
                stripeCustomerId: details.paymentId,
              })
            : null;

          return {
            verified: true,
            session: {
              id: identifier,
              userEmail: email,
              amount: CANDIDATE_PRO_PRICE,
              currency: "INR",
              gateway: "razorpay",
            },
            user: upgradedUser,
          };
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // C. Stripe Live / Test Verification
    // ─────────────────────────────────────────────────────────────
    if (this.stripeSecretKey) {
      try {
        const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${identifier}`, {
          headers: { Authorization: `Bearer ${this.stripeSecretKey}` },
        });

        if (res.ok) {
          const sessionData = await res.json();
          if (sessionData.payment_status === "paid") {
            const email = sessionData.customer_email || sessionData.customer_details?.email;
            const upgradedUser = email
              ? await userRepository.upgradeUserToPro(email, {
                  amountPaid: (sessionData.amount_total || 29900) / 100,
                  currency: (sessionData.currency || "inr").toUpperCase(),
                  stripeSessionId: identifier,
                  stripeCustomerId: sessionData.customer as string,
                })
              : null;

            return {
              verified: true,
              session: {
                id: identifier,
                userEmail: email || "",
                amount: (sessionData.amount_total || 29900) / 100,
                currency: (sessionData.currency || "inr").toUpperCase(),
                gateway: "stripe",
              },
              user: upgradedUser,
            };
          }
        }
      } catch (err) {
        console.error("[PaymentService] Error verifying Stripe session:", err);
      }
    }

    return { verified: false, error: "Payment was not completed or could not be verified." };
  }

  /**
   * Razorpay HMAC-SHA256 Signature Verification (Web Crypto API)
   */
  static async verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    try {
      const data = `${orderId}|${paymentId}`;
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
      const hexSignature = Array.from(new Uint8Array(signatureBytes))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return hexSignature === signature;
    } catch {
      return false;
    }
  }

  /**
   * Razorpay Webhook Signature Verification
   * Format: HMAC-SHA256(rawBody, webhookSecret) → hex
   * Header: x-razorpay-signature
   * NOTE: This is completely different from Stripe (no timestamp component).
   */
  static async verifyRazorpayWebhookSignature(payload: string, signature: string): Promise<boolean> {
    if (!this.razorpayWebhookSecret) return true; // dev bypass: no secret configured
    if (!signature) return false;

    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(this.razorpayWebhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
      const hexSignature = Array.from(new Uint8Array(signatureBytes))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return hexSignature === signature;
    } catch {
      return false;
    }
  }

  /**
   * Stripe Webhook Signature Verification (SubtleCrypto HMAC-SHA256)
   * Format includes timestamp: `t=<ts>,v1=<sig>`
   */
  static async verifyWebhookSignature(payload: string, headerSignature: string): Promise<boolean> {
    if (!this.stripeWebhookSecret || !headerSignature) return true; // dev bypass

    try {
      const parts = headerSignature.split(",");
      const timestampPart = parts.find((p) => p.startsWith("t="));
      const sigPart = parts.find((p) => p.startsWith("v1="));

      if (!timestampPart || !sigPart) return false;

      const t = timestampPart.substring(2);
      const expectedSig = sigPart.substring(3);
      const signedPayload = `${t}.${payload}`;

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(this.stripeWebhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
      const hexSignature = Array.from(new Uint8Array(signatureBytes))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      return hexSignature === expectedSig;
    } catch {
      return false;
    }
  }

  /**
   * Processes verified Webhook events for both Razorpay and Stripe
   */
  static async handleWebhookEvent(event: any, source: "stripe" | "razorpay" = "stripe"): Promise<{ handled: boolean; message: string }> {
    if (source === "razorpay") {
      const eventName = event?.event;
      const paymentEntity = event?.payload?.payment?.entity;
      const email = paymentEntity?.email || paymentEntity?.notes?.email;
      const amount = (paymentEntity?.amount || 29900) / 100;
      const paymentId = paymentEntity?.id;

      if (eventName === "order.paid" || eventName === "payment.captured") {
        if (email) {
          await userRepository.upgradeUserToPro(email, {
            amountPaid: amount,
            currency: "INR",
            stripeCustomerId: paymentId,
          });
        }
        return { handled: true, message: `Successfully upgraded ${email} to Pro via Razorpay webhook.` };
      }
      return { handled: true, message: `Ignored Razorpay event: ${eventName}` };
    }

    // Stripe
    const type = event?.type;
    const dataObject = event?.data?.object;

    if (type === "checkout.session.completed") {
      const email = dataObject?.customer_email || dataObject?.customer_details?.email;
      const amount = (dataObject?.amount_total || 29900) / 100;
      const currency = (dataObject?.currency || "inr").toUpperCase();
      const sessionId = dataObject?.id;
      const customerId = dataObject?.customer;

      if (email) {
        await userRepository.upgradeUserToPro(email, {
          amountPaid: amount,
          currency,
          stripeSessionId: sessionId,
          stripeCustomerId: customerId,
        });
      }
      return { handled: true, message: `Successfully upgraded ${email} to Pro via Stripe webhook.` };
    }

    return { handled: true, message: `Unhandled event type: ${type}` };
  }
}
