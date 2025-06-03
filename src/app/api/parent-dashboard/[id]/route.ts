import { db } from "@/db/config";
import { geminiService } from "@/lib/gemini";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

//make a get endpoint to get progress by childId
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { language } = await req.json();
    const childId = params.id;

    console.log(language, "<<<< language");
    console.log(childId, "<<<< childId");

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

    return NextResponse.json(progressSum);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

//make a get endpoint to get progress by childId
export async function GET(req: Request, { params }: { params: { id: string } }) {
  console.log("masukkkkkk")
  const childId = params.id;
  // console.log(childId, "<<<< childId");

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
      'childId': new ObjectId(`${childId}`),
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