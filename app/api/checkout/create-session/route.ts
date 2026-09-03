import { NextRequest, NextResponse } from "next/server";
import { PaymentService, PaymentGatewayProvider, SUBSCRIPTION_PLANS } from "@/lib/services/paymentService";

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const body = await request.json().catch(() => ({}));

    // plan_code is the only trusted pricing signal — amount from client is IGNORED
    const planCode: string | undefined = body.plan_code || body.planCode;

    // Validate plan code if provided
    if (planCode && !SUBSCRIPTION_PLANS[planCode]) {
      return NextResponse.json(
        { success: false, error: `Unknown plan code: ${planCode}` },
        { status: 400 }
      );
    }

    // Derive user identity from payload or active session cookie
    let email = body.email;
    let name = body.name || "Candidate";
    let userId = body.userId;
    const gateway: PaymentGatewayProvider = body.gateway === "stripe" ? "stripe" : "razorpay";

    if (!email) {
      const sessionCookie = request.cookies.get("sa_user_session");
      if (sessionCookie) {
        try {
          const parsed = JSON.parse(sessionCookie.value);
          email = parsed.email;
          name = parsed.name || name;
          userId = parsed.id || userId;
        } catch {}
      }
    }

    if (!email) {
      // If no session or email provided, assign a guest candidate identifier
      email = body.guestEmail || `candidate_${Math.random().toString(36).substring(2, 8)}@sponsorajobs.com`;
    }

    const session = await PaymentService.createCheckoutSession(
      {
        userEmail: email,
        userName: name,
        userId,
        gateway,
        planCode,   // Server resolves price from planCode — client amount ignored
        currency: body.currency,
      },
      origin
    );

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (err: any) {
    console.error("[CheckoutAPI] Error creating checkout session:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize checkout session. Please try again.",
      },
      { status: 500 }
    );
  }
}
