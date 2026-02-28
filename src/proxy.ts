import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getUser } from "./services/auth";

const ALLOWED_ROLES = ["ADMIN", "SELLER", "CUSTOMER"];
const PUBLIC_ROUTES = ["/login", "/register", "/"];

const CUSTOMER_ONLY_PREFIXES = ["/cart", "/checkout", "/orders", "/orders-status"];
const SELLER_ONLY_PREFIXES = ["/seller", "/medicines"];
const ADMIN_ONLY_PREFIXES = ["/admin", "/users"];

const hasPathPrefix = (pathname: string, prefix: string) => {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
};

const isPublicRoute = (pathname: string) => {
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  return hasPathPrefix(pathname, "/shop");
};

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await getUser();

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${pathname}`, request.url),
    );
  }

  const role = (user.role || "").toUpperCase();

  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${pathname}`, request.url),
    );
  }

  const isCustomerOnlyRoute = CUSTOMER_ONLY_PREFIXES.some((prefix) => hasPathPrefix(pathname, prefix));
  if (isCustomerOnlyRoute && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isSellerOnlyRoute = SELLER_ONLY_PREFIXES.some((prefix) => hasPathPrefix(pathname, prefix));
  if (isSellerOnlyRoute && role !== "SELLER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isAdminOnlyRoute = ADMIN_ONLY_PREFIXES.some((prefix) => hasPathPrefix(pathname, prefix));
  if (isAdminOnlyRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: [
    "/dashboard",
    "/profile",
    "/cart",
    "/checkout",
    "/orders/:path*",
    "/orders-status",
    "/medicines",
    "/seller/:path*",
    "/admin/:path*",
    "/users",
  ],
};
