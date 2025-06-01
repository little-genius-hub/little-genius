import { NextResponse } from "next/server";

import { collectionProgress } from "@/db/models";
import { ObjectId } from "mongodb";

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
