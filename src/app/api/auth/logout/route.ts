import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("Authorization");
    cookieStore.delete("currentChildId");
    
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (err) {
    return NextResponse.json(
      { message: "Error logging out" },
      { status: 500 }
    );
  }
}
