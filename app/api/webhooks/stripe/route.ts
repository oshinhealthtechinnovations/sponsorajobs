import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/services/paymentService";

export async function POST(request: NextRequest) {
  try {
    const rawPayload = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    const isValid = await PaymentService.verifyWebhookSignature(rawPayload, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
    }

    let event: any;
    try {
      event = JSON.parse(rawPayload);
    } catch {
      return NextResponse.json({ error: "Malformed webhook payload." }, { status: 400 });
    }

    const result = await PaymentService.handleWebhookEvent(event);
    return NextResponse.json({ received: true, ...result });
  } catch (err: any) {
    console.error("[StripeWebhook] Error processing event:", err);
    return NextResponse.json({ error: "Internal webhook processing error." }, { status: 500 });
  }
}
