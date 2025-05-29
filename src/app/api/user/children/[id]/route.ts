import { NextRequest } from "next/server";
import { withAuthAndParams } from "@/helpers/auth";
import UserModel from "@/db/models/UserModel";
import { ObjectId } from "mongodb";

// PUT /api/user/children/[id] - Update specific child
export const PUT = withAuthAndParams<{ id: string }>(async (
  request: NextRequest,
  { user, params }
) => {
  try {
    const childId = params.id;
    const childData = await request.json();
    const { name, age, grade, birthDate } = childData;

    // Validate required fields
    if (!name || !age || !grade) {
      return Response.json(
        { error: "Name, age, and grade are required" },
        { status: 400 }
      );
    }

    // Update child in user's children array
    const collection = await UserModel.collection();
    const result = await collection.updateOne(
      { 
        _id: new ObjectId(user.userId),
        "children.id": childId
      },
      { 
        $set: { 
          "children.$.name": name,
          "children.$.age": parseInt(age),
          "children.$.grade": grade,
          "children.$.birthDate": birthDate || null,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "Child not found or not owned by user" }, { status: 404 });
    }

    const updatedChild = {
      id: childId,
      name,
      age: parseInt(age),
      grade,
      birthDate: birthDate || null,
    };

    return Response.json(updatedChild);
  } catch (error) {
    console.error("Error updating child:", error);
    return Response.json({ error: "Failed to update child" }, { status: 500 });
  }
});

// DELETE /api/user/children/[id] - Delete specific child
export const DELETE = withAuthAndParams<{ id: string }>(async (
  request: NextRequest,
  { user, params }
) => {
  try {
    const childId = params.id;

    // Remove child from user's children array
    const collection = await UserModel.collection();    const result = await collection.updateOne(
      { _id: new ObjectId(user.userId) },
      { 
        $pull: { children: { id: childId } } as any,
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      return Response.json({ error: "Child not found" }, { status: 404 });
    }

    return Response.json({ message: "Child deleted successfully" });
  } catch (error) {
    console.error("Error deleting child:", error);
    return Response.json({ error: "Failed to delete child" }, { status: 500 });
  }
});
