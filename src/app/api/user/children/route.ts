import { NextRequest } from "next/server";
import { withAuth } from "@/helpers/auth";
import UserModel from "@/db/models/UserModel";
import { ObjectId } from "mongodb";

// GET /api/user/children - Get all children for the authenticated user
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const userData = await UserModel.findById(user.userId);
    
    if (!userData) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ children: userData.children || [] });
  } catch (error) {
    console.error("Error fetching children:", error);
    return Response.json({ error: "Failed to fetch children" }, { status: 500 });
  }
});

// POST /api/user/children - Add a new child for the authenticated user
export const POST = withAuth(async (request: NextRequest, { user }) => {  try {
    const childData = await request.json();
    const { name, age, grade, birthDate, preferredLanguage } = childData;

    if (!name || !age || !grade) {
      return Response.json(
        { error: "Name, age, and grade are required" },
        { status: 400 }
      );
    }   
    const newChild = {
      id: new ObjectId().toString(),
      name,
      age: parseInt(age),
      grade,
      birthDate: birthDate || null,
      preferredLanguage: preferredLanguage || "en",
      progress: {
        numbers: {
          level: 1,
          subLevel: 1,
          totalScore: 0,
          completedLevels: []
        },
        letters: {
          level: 1,
          subLevel: 1,
          totalScore: 0,
          completedLevels: []
        },
        stories: {
          readStories: [],
          favoriteStories: []
        }
      },
      achievements: [],
      createdAt: new Date()
    };

    // Get current user and update children array
    const collection = await UserModel.collection();    const result = await collection.updateOne(
      { _id: new ObjectId(user.userId) },
      { 
        $push: { children: newChild } as any,
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(newChild, { status: 201 });
  } catch (error) {
    console.error("Error creating child:", error);
    return Response.json({ error: "Failed to create child" }, { status: 500 });
  }
});

// PUT /api/user/children - Update all children at once
export const PUT = withAuth(async (request: NextRequest, { user }) => {
  try {
    const { children } = await request.json();

    if (!Array.isArray(children)) {
      return Response.json(
        { error: "Children must be an array" },
        { status: 400 }
      );
    }

    // Update user's children array in database
    const collection = await UserModel.collection();
    const result = await collection.updateOne(
      { _id: new ObjectId(user.userId) },
      { 
        $set: { 
          children: children,
          updatedAt: new Date() 
        }
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ message: "Children updated successfully" });
  } catch (error) {
    console.error("Error updating children:", error);
    return Response.json({ error: "Failed to update children" }, { status: 500 });
  }
});
