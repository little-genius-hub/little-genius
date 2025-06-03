import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/helpers/auth";
import { geminiService } from "@/lib/gemini";
import StoryModel from "@/db/models/StoryModel";

export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const { language = "id" } = await request.json();

    if (!["en", "id"].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be "en" or "id"' },
        { status: 400 }
      );
    }

    const generatedStory = await geminiService.generateStory(
      language as "en" | "id"
    );

    const savedStory = await StoryModel.create({
      ...generatedStory,
      userId: user.userId,
      isGenerated: true,
    });

    return NextResponse.json({ story: savedStory });
  } catch (error) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { error: "Failed to generate story. Please try again." },
      { status: 500 }
    );
  }
});
