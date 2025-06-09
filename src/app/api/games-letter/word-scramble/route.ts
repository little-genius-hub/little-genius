import { collectionWordScramble } from "@/db/models";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const language = searchParams.get("language") || "en";
  const level = parseInt(searchParams.get("level") || "1", 10);

  const wordScramble = await collectionWordScramble();

  const questions = await wordScramble
    .find({ language, level })
    .limit(10)
    .toArray();

  return NextResponse.json({ questions });
}
