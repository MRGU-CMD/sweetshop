import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "https://192.org.cn",
  "https://www.192.org.cn",
  "https://sweetshop.vercel.app",
];

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".vercel.app")) return true;
  if (
    process.env.NODE_ENV === "development" &&
    origin.startsWith("http://localhost:")
  )
    return true;
  return false;
}

function extractOrigin(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

function getOrigin(headers: Headers): string | null {
  const origin = headers.get("origin");
  if (origin) return origin;
  const referer = headers.get("referer");
  if (referer) return extractOrigin(referer);
  return null;
}

export function middleware(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  // Only protect API routes — NextAuth handles its own CSRF
  if (!pathname.startsWith("/api/")) return NextResponse.next();
  if (pathname.startsWith("/api/auth/")) return NextResponse.next();

  const origin = getOrigin(request.headers);

  // Block if no origin/referer header on mutation requests
  if (!origin || !isAllowedOrigin(origin)) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
