import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "tworooks_session";
const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "two-rooks-fallback-secret-minimum-32-chars-key"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isStudentRoute = pathname.startsWith("/app");
  const isCoachRoute = pathname.startsWith("/coach");
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isStudentRoute && !isCoachRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = payload.role as string;

    if (isAdminRoute && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/app", request.url));
    }

    if (isCoachRoute && role !== "COACH" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/app", request.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/app/:path*", "/coach/:path*", "/admin/:path*"],
};
