import { NextResponse } from "next/server";

// Pages that require the user to be logged in
const protectedRoutes = ["/account", "/checkout", "/orders"];

// Pages that looged-in users shouldn't see (login, register)
const authRoutes = ["/login", "/register"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const refreshToken =
    request.cookies.get("refreshToken")?.value ||
    request.headers.get("x-refresh-token");

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
