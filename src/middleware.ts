import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { loginLimiter, getClientIp } from "@/lib/rate-limit";

const PUBLIC_PATHS = [
  "/login",
  "/cadastro",
  "/esqueci-senha",
  "/redefinir-senha",
  "/api/auth",
  "/api/health",
  "/api/book",
  "/api/slug",
  "/api/cron",
  "/api/whatsapp",
  "/agendar",
];

/** Extensões estáticas permitidas (evita bypass via ".html" etc) */
const STATIC_EXT_RE = /\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff2?|ttf|eot|map|mp4|webm|ogg)$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit no login (NextAuth credentials)
  if (pathname === "/api/auth/callback/credentials" && request.method === "POST") {
    const ip = getClientIp(request);
    const result = loginLimiter.check(ip);
    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Muitas tentativas de login. Tente novamente em breve." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }
  }

  // Root path: always show LP
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals (regex segura, sem bypass via ponto)
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || STATIC_EXT_RE.test(pathname)) {
    return NextResponse.next();
  }

  // Check auth for protected routes
  const token = await getToken({ req: request });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
