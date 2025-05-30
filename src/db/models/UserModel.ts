import { NewUser, LoginUser } from "@/types/auth";
import { db } from "../config";
import { z } from "zod";
import { comparePassword, hashPassword } from "@/helpers/bcrypt";
import { signToken } from "@/helpers/jwt";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";

const UserSchema = z.object({
  name: z.string(),
  username: z.string().trim().min(1, "Username is required!"),
  email: z
    .string()
    .nonempty("Email is required!")
    .email("Invalid email format!"),
  password: z
    .string()
    .nonempty("Password is required!")
    .min(5, "Password must be at least 5 characters!"),
  children: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    age: z.number(),
    grade: z.string(), 
    birthDate: z.string().optional(),
  })).optional().default([]),
});

const LoginSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required!")
    .email("Invalid email format!"),
  password: z
    .string()
    .nonempty("Password is required!")
    .min(5, "Password must be at least 5 characters!"),
});

class UserModel {
  static async collection() {
    const database = await db.getDb();
    return database.collection("users");
  }

  static async create(user: NewUser) {
    UserSchema.parse(user);
    
    const collection = await this.collection();
    
    // Check if user already exists
    const existingUser = await collection.findOne({ 
      $or: [
        { email: user.email },
        { username: user.username }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === user.email) {
        throw { status: 400, message: "Email already exists!" };
      }
      if (existingUser.username === user.username) {
        throw { status: 400, message: "Username already exists!" };
      }
    }

    // Hash password and create user
    const hashedPassword = hashPassword(user.password);
    const newUser = {
      ...user,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newUser);
    return result;
  }

  static async login(user: LoginUser) {
    LoginSchema.parse(user);
    const collection = await this.collection();
    
    const existUser = await collection.findOne({ email: user.email });

    if (!existUser) throw { status: 404, message: "User not found!" };
    
    const isValid = comparePassword(user.password, existUser.password);
    if (!isValid) throw { status: 403, message: "Invalid password" };
    
    const access_token = signToken({
      userId: existUser._id,
      name: existUser.name,
      email: existUser.email,
    });

    const cookieStore = await cookies();
    cookieStore.set("Authorization", `Bearer ${access_token}`);

    return { access_token };
  }
  static async findById(id: string) {
    const collection = await this.collection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }
}

export default UserModel;
