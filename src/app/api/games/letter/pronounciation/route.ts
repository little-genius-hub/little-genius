import GameModel from "@/db/models/GameModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        console.log("masukkkkkk")
        const pronounceProblems = await GameModel.collectionPronounce()
        console.log(pronounceProblems, "<<<<<<")
        return NextResponse.json(pronounceProblems)
    } catch (error) {
        console.log(error)
    }
}