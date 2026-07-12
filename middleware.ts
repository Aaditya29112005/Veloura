import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Decodes a JWT token without cryptographic verification (safe for Edge runtime)
// Server-side API endpoints will enforce full cryptographic validation
function decodeJwt(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) {
      base64 += "=".repeat(4 - pad);
    }
    
    // Polyfill atob/decodeURIComponent for Unicode support
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const user = token ? decodeJwt(token) : null;

  // Define route protections
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedRoute = pathname.startsWith("/checkout") || pathname.startsWith("/orders");
  const isAdminRoute = pathname.startsWith("/admin");

  // If trying to access checkout/orders and not logged in, redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access admin and not admin, redirect to home
  if (isAdminRoute) {
    if (!user || user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Config to match routes
export const config = {
  matcher: [
    "/checkout/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
  ],
};
