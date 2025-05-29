import { NewUser } from "@/types/auth";
import UserModel from "@/db/models/UserModel";
import errHandler from "@/helpers/errHandler";

interface Child {
  id?: string;
  name: string;
  age: number;
  grade: string;
  birthDate?: string;
}

interface RegisterRequest extends NewUser {
  children: Child[];
}

export async function POST(request: Request) {
  try {
    const userData: RegisterRequest = await request.json();
    
    // Create user with children array (initially empty from frontend)
    await UserModel.create({
      ...userData,
      children: userData.children || [], // Ensure children is always an array
    });
    
    return Response.json(
      { message: "User created successfully!" },
      { status: 201 }
    );
  } catch (err) {
    return errHandler(err);
  }
}
