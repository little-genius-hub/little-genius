import { NextResponse } from "next/server"

export async function GET() {
  try {
    // For now, return null user since we haven't implemented full auth yet
    // This will be replaced with actual session checking later
    return NextResponse.json(null)
  } catch (error) {
    console.error("Session check failed:", error)
    return NextResponse.json(null)
  }
}
