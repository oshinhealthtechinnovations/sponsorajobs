import { NextRequest, NextResponse } from "next/server";
import { PaymentService, PaymentGatewayProvider } from "@/lib/services/paymentService";

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const body = await request.json().catch(() => ({}));

    // Derive user email from payload or active session cookie
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
