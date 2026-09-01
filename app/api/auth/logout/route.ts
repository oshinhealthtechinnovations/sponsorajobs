import { NextRequest, NextResponse } from "next/server";


export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Successfully logged out.",
  });

  response.cookies.delete("sa_user_session");
  return response;
}
