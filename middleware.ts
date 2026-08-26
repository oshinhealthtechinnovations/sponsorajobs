import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // If traffic hits *.vercel.app, permanently redirect (301) to custom production domain
  if (host.includes(".vercel.app")) {
    const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";
    const cleanBase = canonicalBase.endsWith("/") ? canonicalBase.slice(0, -1) : canonicalBase;
    const targetUrl = new URL(`${cleanBase}${request.nextUrl.pathname}${request.nextUrl.search}`);

    const response = NextResponse.redirect(targetUrl, 301);
    // Tell crawlers explicitly never to index the vercel.app preview/deployment domain
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images, favicon
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
