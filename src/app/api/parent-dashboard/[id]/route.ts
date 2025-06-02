import { db } from "@/db/config";
import { GeminiService, geminiService } from "@/lib/gemini";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

//make a get endpoint to get progress by childId
export async function POST({childId}: {childId: string}, req: Request) {
  const { language } = await req.json();
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

//make a get endpoint to get progress by childId
export async function GET({childId}: { childId: string }) {
  // const { searchParams } = new URL(req.url);
  // const childId = searchParams.get("childId");
  // const language = searchParams.get("language");

  if (!childId) {
    return NextResponse.json(
      { error: "Child ID is required" },
      { status: 400 }
    );
  }

  try {
    const agg = [
  {
    '$match': {
      'childId': new ObjectId('683ac993efea9a2e2976732a')
    }
  }, {
    '$sort': {
      'createdAt': -1
    }
  }
]
    const database = await db.getDb()
    const progressCollection = database.collection("parent_dashboard")
    const progressAnalytics = await progressCollection.aggregate(agg).toArray();
    return NextResponse.json(progressAnalytics[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}