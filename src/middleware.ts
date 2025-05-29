// Middleware for Next.js application
// This file can be used to handle requests before they are completed
// For example, redirections, adding headers, or authentication checks

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // You can add your middleware logic here
  // Example: check authentication, redirect based on conditions, etc.
  return NextResponse.next()
}

// See "Matching Paths" below to learn more about how to specify which paths this middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
