import { LoginUser } from "@/types/auth";
import UserModel from "@/db/models/UserModel";
import errHandler from "@/helpers/errHandler";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("🚀 ~ POST ~ request:");
    const user: LoginUser = await request.json();
    const access_token = await UserModel.login(user);

    // Set the token as a secure cookie
    const cookieStore = await cookies();
    cookieStore.set("Authorization", `Bearer ${access_token}`, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Allow client-side access for our cookie utilities
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true, message: "Login successful" });
  } catch (err) {
    return errHandler(err);
  }
}
