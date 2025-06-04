import { NextResponse } from "next/server";
import { collectionProgress } from "@/db/models";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  if (!childId) {
    return NextResponse.json({ error: "Missing childId" }, { status: 400 });
  }

  const progres = await collectionProgress();
  const progressData = await progres
    .find({ childId: new ObjectId(childId), gameType: "pronunciation" })
    .toArray();

  return NextResponse.json({ progress: progressData });
}
