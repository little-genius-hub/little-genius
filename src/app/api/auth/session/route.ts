import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/helpers/jwt";
import UserModel from "@/db/models/UserModel";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authorization = cookieStore.get("Authorization");

    if (!authorization) {
      return NextResponse.json(null);
    }

    const [type, token] = authorization.value.split(" ");
    if (type !== "Bearer") {
      return NextResponse.json(null);
    }

    const decoded = await verifyToken<{
      userId: string;
      name: string;
      email: string;
    }>(token);

    const userData = await UserModel.findById(decoded.userId);
    if (!userData) {
      return NextResponse.json(null);
    }

    const userResponse = {
      id: userData._id,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      children: userData.children || [],
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("Session check failed:", error);
    return NextResponse.json(null);
  }
}
