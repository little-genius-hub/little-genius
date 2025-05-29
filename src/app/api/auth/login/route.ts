import { LoginUser } from "@/types/auth";
import UserModel from "@/db/models/UserModel";
import errHandler from "@/helpers/errHandler";

export async function POST(request: Request) {
  try {
    const user: LoginUser = await request.json();
    const access_token = await UserModel.login(user);

    return Response.json(access_token);
  } catch (err) {
    return errHandler(err);
  }
}
