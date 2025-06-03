import { OAuth2Client } from "google-auth-library";

export const googleAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/google/callback`,
  scopes: [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ]
};

// Create a singleton OAuth2Client instance
export const oAuth2Client = new OAuth2Client(
  googleAuthConfig.clientId,
  googleAuthConfig.clientSecret,
  googleAuthConfig.redirectUri
);

export async function getGoogleUserInfo(accessToken: string) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching Google user info:", error);
    throw error;
  }
}
