import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import errHandler from "./helpers/errHandler";
import { verifyToken } from "./helpers/jwt";

export async function middleware(request: NextRequest) {
  try {
    const authorization = request.cookies.get("Authorization");

    if (
      authorization &&
      (request.nextUrl.pathname.includes("/login") ||
        request.nextUrl.pathname.includes("/register"))
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      request.nextUrl.pathname.includes("/login") ||
      request.nextUrl.pathname.includes("/register")
    ) {
      return NextResponse.next();
    }

    const protectedRoutes = ["/games", "/stories"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    );

    if (isProtectedRoute && !authorization) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (authorization) {
      const [type, token] = authorization.value.split(" ");
      if (type !== "Bearer") {
        if (isProtectedRoute) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
      }

      try {
        const decoded = await verifyToken<{
          userId: string;
          name: string;
          email: string;
        }>(token);

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", decoded.userId);
        requestHeaders.set("x-user-name", decoded.name);
        requestHeaders.set("x-user-email", decoded.email);

        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });

        return response;
      } catch (err) {
        if (isProtectedRoute) {
          return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware error:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|manifest).*)"],
};
