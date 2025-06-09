import { NextResponse } from "next/server";
import { oAuth2Client, googleAuthConfig } from "@/lib/google-auth";

// This is the endpoint that redirects to Google's OAuth page
export async function GET() {
  try {
    // Generate the authentication URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: googleAuthConfig.scopes,
      prompt: "consent",
    });

    // Redirect to Google's authentication page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error generating Google auth URL:", error);
    return NextResponse.redirect(
      new URL("/login?error=Authentication failed", 
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000")
    );
  }
}
