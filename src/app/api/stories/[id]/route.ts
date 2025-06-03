import { NextRequest, NextResponse } from "next/server";
import { withAuthAndParams } from "@/helpers/auth";
import StoryModel from "@/db/models/StoryModel";

export const GET = withAuthAndParams<{ id: string }>(
  async (request: NextRequest, { user, params }) => {
    try {
      const storyId = params.id;
      const story = await StoryModel.findById(storyId);

      if (!story) {
        return NextResponse.json({ error: "Story not found" }, { status: 404 });
      }

      if ((story as any).userId && (story as any).userId !== user.userId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }

      return NextResponse.json({ story });
    } catch (error) {
      console.error("Error fetching story:", error);
      return NextResponse.json(
        { error: "Failed to fetch story" },
        { status: 500 }
      );
    }
  }
);

export const PUT = withAuthAndParams<{ id: string }>(
  async (request: NextRequest, { user, params }) => {
    try {
      const storyId = params.id;
      const updateData = await request.json();
      const story = await StoryModel.findById(storyId);

      if (!story) {
        return NextResponse.json({ error: "Story not found" }, { status: 404 });
      }

      const updatedStory = await StoryModel.update(storyId, updateData);

      return NextResponse.json({ story: updatedStory });
    } catch (error) {
      console.error("Error updating story:", error);
      return NextResponse.json(
        { error: "Failed to update story" },
        { status: 500 }
      );
    }
  }
);
