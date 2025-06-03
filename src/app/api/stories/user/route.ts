import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/helpers/auth";
import StoryModel from "@/db/models/StoryModel";

export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const stories = await StoryModel.findByUserId(user.userId);

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Error fetching user stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
});
