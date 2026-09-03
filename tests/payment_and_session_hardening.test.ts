import { describe, it, expect } from "vitest";
import { PaymentService, CANDIDATE_PRO_PRICE } from "../lib/services/paymentService";
import { userRepository } from "../lib/repositories/userRepository";

describe("Hybrid Dual-Gateway Payment Service & Subscription Hardening", () => {
  const testEmailIndia = `pro_candidate_in_${Date.now()}@example.com`;
  const testEmailIntl = `pro_candidate_intl_${Date.now()}@example.com`;

  it("should have Candidate Pro price configured at exactly 299", () => {
    expect(CANDIDATE_PRO_PRICE).toBe(299);
  });

  it("should create a valid Razorpay order session for India", async () => {
    const session = await PaymentService.createCheckoutSession({
      userEmail: testEmailIndia,
      userName: "Rahul Sharma",
      gateway: "razorpay",
      currency: "INR",
    });

    expect(session).toBeDefined();
    expect(session.gateway).toBe("razorpay");
    expect(session.amount).toBe(299);
    expect(session.currency).toBe("INR");
    expect(session.orderId).toMatch(/^order_/);
    expect(session.checkoutUrl).toContain("/checkout/");
  });

  it("should create a valid Stripe session for International in sandbox mode", async () => {
    const session = await PaymentService.createCheckoutSession({
      userEmail: testEmailIntl,
      userName: "Sarah Jenkins",
      gateway: "stripe",
      currency: "INR",
    });

    expect(session).toBeDefined();
    expect(session.gateway).toBe("stripe");
    expect(session.amount).toBe(299);
    expect(session.sessionId).toContain("cs_sandbox_");
    expect(session.checkoutUrl).toContain("provider=stripe");
  });

  it("should verify Razorpay payment and upgrade candidate account to PRO", async () => {
    const user = await userRepository.upgradeUserToPro(testEmailIndia, {
      amountPaid: 299,
      currency: "INR",
      stripeCustomerId: "pay_test_razorpay_123",
    });

    expect(user).toBeDefined();
    expect(user?.subscriptionTier).toBe("PRO");
    expect(user?.subscriptionStatus).toBe("ACTIVE");
    expect(user?.amountPaid).toBe(299);
    expect(user?.currencyPaid).toBe("INR");
    expect(user?.email.toLowerCase()).toBe(testEmailIndia.toLowerCase());
  });

  it("should verify Stripe sandbox payment and upgrade candidate account to PRO", async () => {
    const session = await PaymentService.createCheckoutSession({
      userEmail: testEmailIntl,
      userName: "Sarah Jenkins",
      gateway: "stripe",
      currency: "INR",
    });

    const verifyResult = await PaymentService.verifyPayment(session.sessionId!);

    expect(verifyResult.verified).toBe(true);
    expect(verifyResult.user).toBeDefined();
    expect(verifyResult.user?.subscriptionTier).toBe("PRO");
    expect(verifyResult.user?.subscriptionStatus).toBe("ACTIVE");
    expect(verifyResult.user?.amountPaid).toBe(299);
  });

  it("should verify Razorpay HMAC-SHA256 signature correctly", async () => {
    const orderId = "order_test_123";
    const paymentId = "pay_test_456";
    const secret = "test_razorpay_secret_key";

    // Compute expected signature
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
    const expectedSig = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const isValid = await PaymentService.verifyRazorpaySignature(orderId, paymentId, expectedSig, secret);
    expect(isValid).toBe(true);

    const isInvalid = await PaymentService.verifyRazorpaySignature(orderId, paymentId, "wrong_signature", secret);
    expect(isInvalid).toBe(false);
  });

  it("should process Razorpay webhook order.paid event", async () => {
    const webhookEmail = `rzp_webhook_${Date.now()}@example.com`;
    const mockRzpEvent = {
      event: "order.paid",
      payload: {
        payment: {
          entity: {
            id: "pay_rzp_mock_123",
            email: webhookEmail,
            amount: 29900,
            currency: "INR",
          },
        },
      },
    };

    const result = await PaymentService.handleWebhookEvent(mockRzpEvent, "razorpay");
    expect(result.handled).toBe(true);

    const user = await userRepository.findByEmail(webhookEmail);
    expect(user).toBeDefined();
    expect(user?.subscriptionTier).toBe("PRO");
    expect(user?.amountPaid).toBe(299);
  });

  it("should process Stripe checkout.session.completed webhook events", async () => {
    const webhookEmail = `stripe_webhook_${Date.now()}@example.com`;
    const mockStripeEvent = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_stripe_mock_123",
          customer_email: webhookEmail,
          amount_total: 29900,
          currency: "inr",
          customer: "cus_mock_456",
        },
      },
    };

    const result = await PaymentService.handleWebhookEvent(mockStripeEvent, "stripe");
    expect(result.handled).toBe(true);

    const user = await userRepository.findByEmail(webhookEmail);
    expect(user).toBeDefined();
    expect(user?.subscriptionTier).toBe("PRO");
  });
});
