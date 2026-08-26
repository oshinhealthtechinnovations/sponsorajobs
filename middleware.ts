import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "sa_admin_session";

function isAuthorizedSession(cookieValue?: string, authHeader?: string | null): boolean {
  const configuredSecret = process.env.ADMIN_SECRET?.trim();
  if (!configuredSecret) return false;

  if (cookieValue && cookieValue.trim() === configuredSecret) {
    return true;
  }

  if (authHeader && authHeader === `Bearer ${configuredSecret}`) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // 1. Host Redirection: *.vercel.app -> custom production domain (301 Permanent Redirect)
  if (host.includes(".vercel.app")) {
    const canonicalBase = process.env.NEXT_PUBLIC_SITE_URL || "https://sponsorajobs.com";
    const cleanBase = canonicalBase.endsWith("/") ? canonicalBase.slice(0, -1) : canonicalBase;
    const targetUrl = new URL(`${cleanBase}${pathname}${request.nextUrl.search}`);

    const response = NextResponse.redirect(targetUrl, 301);
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  // 2. Admin Web Portal Protection Gatekeeper
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const authHeader = request.headers.get("authorization");

    if (!isAuthorizedSession(sessionCookie, authHeader)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);

      const redirectResponse = NextResponse.redirect(loginUrl, 307);
      redirectResponse.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      redirectResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return redirectResponse;
    }
  }

  // 3. Admin API Security Protection Gatekeeper
  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/auth") {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const authHeader = request.headers.get("authorization");

    if (!isAuthorizedSession(sessionCookie, authHeader)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Invalid or missing administrator credentials.",
        },
        {
          status: 401,
          headers: {
            "X-Robots-Tag": "noindex, nofollow, noarchive",
            "Cache-Control": "no-store",
          },
        }
      );
    }
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
