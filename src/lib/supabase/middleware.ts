import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "./constants";

/**
 * Lightweight session check for Edge middleware.
 *
 * The Edge runtime cannot use Node.js dns.lookup, so we cannot patch DNS to route
 * Supabase requests through Cloudflare IPs. Instead, we check for the presence of
 * the auth session cookie (set by the browser client after login/signup via the
 * /api/supabase proxy). The actual session JWT validation happens in the Node.js
 * runtime (server.ts) where dns-fix.ts is applied.
 *
 * This is the recommended pattern for ISP/corporate network environments where
 * the auth provider's DNS resolution is unreliable from the Edge runtime.
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const isProtectedPath =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/create") ||
    pathname.startsWith("/editor") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/planner") ||
    pathname.startsWith("/slide-qa");

  const isAuthPath = pathname.startsWith("/login") || pathname.startsWith("/signup");

  // Check if any chunk of the auth cookie or local session cookie exists
  const hasSession = request.cookies.getAll().some(
    (c) =>
      c.name === AUTH_COOKIE_NAME ||
      c.name.startsWith(AUTH_COOKIE_NAME + ".") ||
      c.name === "slidecraft_session" ||
      c.name === "slidecraft_auth"
  );

  if (!hasSession && isProtectedPath) {
    const redirectUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      redirectUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (hasSession && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
