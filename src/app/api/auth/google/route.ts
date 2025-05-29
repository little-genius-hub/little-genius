import { NextResponse } from "next/server"

export async function GET() {
  // For now, redirect back to home with a message
  // This will be replaced with actual Google OAuth implementation
  return NextResponse.redirect(new URL("/?auth=pending", process.env.NEXTAUTH_URL || "http://localhost:3000"))
}
