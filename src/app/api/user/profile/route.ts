import { NextResponse, NextRequest } from "next/server";
import { withAuth } from "@/helpers/auth";
import UserModel from "@/db/models/UserModel";
import { ObjectId } from "mongodb";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const userData = await UserModel.findById(user.userId);

    if (!userData) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userProfile = {
      id: userData._id.toString(),
      name: userData.name,
      username: userData.username,
      email: userData.email,
      googleId: userData.googleId,
      profilePicture: userData.profilePicture,
      children: userData.children || [],
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };

    return Response.json(userProfile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request: NextRequest, { user }) => {
  try {
    const userData = await request.json();
    const { name, username } = userData;

    if (!name || !username) {
      return Response.json(
        { error: "Name and username are required" },
        { status: 400 }
      );
    }

    // Check for username uniqueness if changing username
    const collection = await UserModel.collection();
    const existingUser = await collection.findOne({ 
      username, 
      _id: { $ne: new ObjectId(user.userId) } 
    });

    if (existingUser) {
      return Response.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(user.userId) },
      {
        $set: {
          name,
          username,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
});
