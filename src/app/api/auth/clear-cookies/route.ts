import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear all auth-related cookies
    cookieStore.delete("Authorization");
    cookieStore.delete("currentChildId");
    
    return NextResponse.json({ success: true, message: "Cookies cleared" });
  } catch (error) {
    console.error("Error clearing cookies:", error);
    return NextResponse.json({ success: false, message: "Failed to clear cookies" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST method to clear cookies" });
}
