import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/services/paymentService";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    // Use Razorpay-specific HMAC-SHA256(rawBody, webhookSecret) — NOT the Stripe timestamp format
    const isValid = await PaymentService.verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid Razorpay webhook signature." }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const result = await PaymentService.handleWebhookEvent(event, "razorpay");

    return NextResponse.json({ received: true, ...result });
  } catch (err: any) {
    console.error("[RazorpayWebhook] Error handling webhook:", err);
    return NextResponse.json({ error: "Webhook processing error." }, { status: 500 });
  }
}
