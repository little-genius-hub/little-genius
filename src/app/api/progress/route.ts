import { NextResponse } from "next/server";

import { collectionProgress } from "@/db/models";
import { ObjectId } from "mongodb";
import { geminiService } from "@/lib/gemini";
import { db } from "@/db/config";

export async function POST(req: Request) {
  try {
    const completedLevel = await req.json();
    console.log("🚀 ~ POST ~ completedLevel:", completedLevel);

    if (!completedLevel) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const progres = await collectionProgress();

    const dataProgres = await progres.findOne({
      childId: new ObjectId(String(completedLevel.childId)),
      gameType: completedLevel.gameType,
      level: completedLevel.level,
    });
    console.log("🚀 ~ POST ~ dataProgres:", dataProgres);

    if (
      dataProgres &&
      dataProgres.childId.equals(
        new ObjectId(String(completedLevel.childId))
      ) &&
      dataProgres.gameType === completedLevel.gameType &&
      dataProgres.level === completedLevel.level
    ) {
      if (dataProgres.score < completedLevel.score) {
        await progres.updateOne(
          { _id: dataProgres._id },
          {
            $set: {
              ...completedLevel,
              childId: new ObjectId(String(completedLevel.childId)),
            },
          }
        );
      }
      return NextResponse.json({ success: true });
    }

    progres.insertOne({
      ...completedLevel,
      ["childId"]: new ObjectId(String(completedLevel.childId)),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const recentActivity = searchParams.get("recentActivity");
  if (!childId) {
    return NextResponse.json({ error: "Missing childId" }, { status: 400 });
  }

  const database = await db.getDb();
  const progressColl = database.collection("progress");
  let agg;

  if (recentActivity) {
    agg = [
      {
        $match: {
          childId: new ObjectId(`${childId}`),
        },
      },
      {
        $sort: {
          completedAt: -1,
        },
      },
      {
        $limit: 3,
      },
    ];
  } else {
    [
      {
        $match: {
          childId: new ObjectId(`${childId}`),
        },
      },
      {
        $sort: {
          gameType: 1,
        },
      },
    ];
  }

  const progressData = await progressColl.aggregate(agg).toArray();
  let timeSpent = 0;
  for (let i = 0; i < progressData.length; i++) {
    let progress = progressData[i];
    timeSpent += progress.timeSpent;
  }

  return NextResponse.json([progressData, timeSpent]);
}
