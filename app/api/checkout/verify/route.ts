import { NextRequest, NextResponse } from "next/server";
import { PaymentService, PaymentGatewayProvider } from "@/lib/services/paymentService";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id") || request.nextUrl.searchParams.get("order_id");
  const gateway = (request.nextUrl.searchParams.get("gateway") || "razorpay") as PaymentGatewayProvider;
  const paymentId = request.nextUrl.searchParams.get("payment_id") || undefined;
  const signature = request.nextUrl.searchParams.get("signature") || undefined;

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "Missing session_id or order_id parameter." },
      { status: 400 }
    );
  }

  return verifyAndRespond(sessionId, { gateway, paymentId, signature });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const sessionId = body.session_id || body.sessionId || body.order_id || body.orderId;
  const gateway = (body.gateway || "razorpay") as PaymentGatewayProvider;
  const paymentId = body.payment_id || body.paymentId;
  const signature = body.signature || body.razorpay_signature;

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "Missing session_id or order_id in request body." },
      { status: 400 }
    );
  }

  return verifyAndRespond(sessionId, { gateway, paymentId, signature });
}

async function verifyAndRespond(identifier: string, details?: {
  gateway?: PaymentGatewayProvider;
  paymentId?: string;
  signature?: string;
}) {
  try {
    const result = await PaymentService.verifyPayment(identifier, details);

    if (!result.verified || !result.user) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Payment verification failed.",
        },
        { status: 400 }
      );
    }

    const sessionPayload = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      profession: result.user.profession,
      promoCodeUsed: result.user.promoCodeUsed,
      isEmailVerified: true,
      subscriptionTier: result.user.subscriptionTier || "PRO",
      subscriptionStatus: result.user.subscriptionStatus || "ACTIVE",
      amountPaid: result.user.amountPaid || 299,
      currencyPaid: result.user.currencyPaid || "INR",
      proExpiresAt: result.user.proExpiresAt,
      createdAt: result.user.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      message: "Payment successfully verified and Candidate Pro pass activated!",
      user: sessionPayload,
      session: result.session,
    });

    // Set updated session cookie with 365-day expiration for Pro candidates
    response.cookies.set("sa_user_session", JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("[VerifyCheckoutAPI] Error verifying session:", err);
    return NextResponse.json(
      { success: false, error: "Internal error verifying payment session." },
      { status: 500 }
    );
  }
}
