import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import UserModel from "@/db/models/UserModel";
import { signToken } from "@/helpers/jwt";
import { generateUsername } from "@/helpers"; // Import from helpers index
import { oAuth2Client, getGoogleUserInfo } from "@/lib/google-auth";
import { hashPassword } from "@/helpers/bcrypt";

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code from the query parameters
    const url = new URL(request.url);
    const code = url.searchParams.get("code");    if (!code) {
      return NextResponse.redirect(
        new URL("/login?error=No authorization code", request.url)
      );
    }
    
    // Exchange the authorization code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    
    if (!tokens.access_token) {
      throw new Error("No access token received from Google");
    }
    
    // Get user information from Google
    const userData = await getGoogleUserInfo(tokens.access_token as string);

    // Check if the user with this email already exists
    const collection = await UserModel.collection();
    let user = await collection.findOne({ email: userData.email });

    let isNewUser = false;
    
    if (!user) {
      // User doesn't exist, create a new account
      isNewUser = true;
      
      // Generate a unique username
      const username = await generateUsername(userData.name);
      
      // Create a new user with Google information
      const newUser = {
        name: userData.name,
        username: username,
        email: userData.email,
        // Set a secure random password since login will be through Google
        password: hashPassword(Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)),
        googleId: userData.id,
        profilePicture: userData.picture,
        children: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(newUser);
      user = await collection.findOne({ _id: result.insertedId });
    } else {
      // User already exists, update Google ID if needed
      if (!user.googleId) {
        await collection.updateOne(
          { email: userData.email },
          { 
            $set: { 
              googleId: userData.id,
              profilePicture: userData.picture,
              updatedAt: new Date()
            }
          }
        );      }
    }
    
    // Generate JWT token
    if (!user) {
      throw new Error("User is null after processing");
    }
    
    const access_token = await signToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    });

    // Set the authentication cookie
    const cookieStore = await cookies();
    cookieStore.set("Authorization", `Bearer ${access_token}`, {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
      sameSite: "lax",
    });

    // Redirect to the appropriate page
    if (isNewUser) {
      // If it's a new user, redirect to profile page to complete profile
      return NextResponse.redirect(new URL("/profile?newUser=true", request.url));
    } else {
      // For existing users, redirect to homepage
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error) {
    console.error("Google authentication error:", error);
    return NextResponse.redirect(
      new URL("/login?error=Authentication failed", request.url)
    );
  }
}
