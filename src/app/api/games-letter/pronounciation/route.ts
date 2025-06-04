import { NextRequest, NextResponse } from "next/server";
import { collectionPronunciation, collectionProgress } from "@/db/models";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const language = searchParams.get("language") || "en";
  const level = parseInt(searchParams.get("level") || "1", 10);

  const pronunciation = await collectionPronunciation();
  const questions = await pronunciation
    .find({ language, level })
    .limit(10)
    .toArray();

  return NextResponse.json({ questions });
}
