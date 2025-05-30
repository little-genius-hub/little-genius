import { NextResponse } from "next/server";

import { collectionProgress } from "@/db/models";

export async function POST(req: Request) {
  try {
    const completedLevel = await req.json();

    if (!completedLevel) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const result = await collectionProgress().insertOne(completedLevel);

    console.log("🚀 ~ POST ~ result:", result);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}
