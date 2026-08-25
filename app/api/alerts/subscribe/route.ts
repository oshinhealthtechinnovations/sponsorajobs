import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface AlertSubscriptionPayload {
  email: string;
  role?: string;
  country?: string;
  category?: string;
  frequency?: "instant" | "daily" | "weekly";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AlertSubscriptionPayload;

    if (!body?.email || !body.email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    // Edge-safe in-memory / verification response
    const alertRecord = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      email: body.email.toLowerCase().trim(),
      role: body.role?.trim() || null,
      country: body.country || "all",
      category: body.category || "all",
      frequency: body.frequency || "daily",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Visa sponsorship job alerts successfully activated",
      alert: alertRecord,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
