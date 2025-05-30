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

    await UserModel.create({
      ...userData,
      children: userData.children || [],
    });

    return Response.json(
      { message: "User created successfully!" },
      { status: 201 }
    );
  } catch (err) {
    return errHandler(err);
  }
}
