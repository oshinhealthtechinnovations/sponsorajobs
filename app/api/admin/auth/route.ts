import { NextRequest, NextResponse } from "next/server";
import { getAdminSecret, ADMIN_COOKIE_CONFIG } from "@/lib/services/adminAuth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, action } = body;

    // Handle logout
    if (action === "logout") {
      const response = NextResponse.json({ success: true, message: "Logged out." });
      response.cookies.delete(ADMIN_COOKIE_CONFIG.name);
      return response;
    }

    const serverSecret = getAdminSecret();

    if (!secret || secret !== serverSecret) {
      return NextResponse.json({ success: false, error: "Invalid admin secret key." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, message: "Authentication successful." });
    response.cookies.set(ADMIN_COOKIE_CONFIG.name, serverSecret, ADMIN_COOKIE_CONFIG.options);
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
