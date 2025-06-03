import { geminiService } from "@/lib/gemini";
import { NextResponse } from "next/server";

//make a get endpoint to get progress by childId
export async function POST(req: Request) {
  const { language, childId } = await req.json();
  console.log(language, "<<<< language");
  console.log(childId, "<<<< childId");
  try {
    // const { searchParams } = new URL(req.url);
    // const childId = searchParams.get("childId");
    // const language = searchParams.get("language");
    console.log(language, "<<<< language");
    // const gameType = searchParams.get("gameType");

    if (!childId) {
      return NextResponse.json(
        { error: "Child ID is required" },
        { status: 400 }
      );
    }

    const progressSum = await geminiService.generateProgress(
      language as "en" | "id",
      childId
    );
    // console.log(progressSum, "<<<< progressSum");
    return NextResponse.json(progressSum);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}