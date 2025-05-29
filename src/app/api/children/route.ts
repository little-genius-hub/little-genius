import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, age, preferredLanguage } = body

    // For now, create a mock child profile
    // This will be replaced with actual database operations
    const newChild = {
      id: `child_${Date.now()}`,
      name,
      age,
      preferredLanguage,
      avatar: null,
      progress: {
        numbers: {
          level: 1,
          subLevel: 1,
          totalScore: 0,
          completedLevels: [],
        },
        letters: {
          level: 1,
          subLevel: 1,
          totalScore: 0,
          completedLevels: [],
        },
        stories: {
          readStories: [],
          favoriteStories: [],
        },
      },
      achievements: [],
      createdAt: new Date(),
    }

    return NextResponse.json(newChild)
  } catch (error) {
    console.error("Failed to create child:", error)
    return NextResponse.json({ error: "Failed to create child" }, { status: 500 })
  }
}
