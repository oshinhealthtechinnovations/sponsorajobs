import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("sa_user_session");
  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ success: false, user: null });
  }

  try {
    const user = JSON.parse(sessionCookie.value);
    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ success: false, user: null });
  }
}
