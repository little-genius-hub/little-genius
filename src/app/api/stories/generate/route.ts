import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/helpers/auth'
import { geminiService } from '@/lib/gemini'
import StoryModel from '@/db/models/StoryModel'

// POST /api/stories/generate - Generate a new story using Gemini AI
export const POST = withAuth(async (request: NextRequest, { user }) => {
  try {
    const { language = 'id' } = await request.json()
    
    if (!['en', 'id'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be "en" or "id"' },
        { status: 400 }
      )
    }

    console.log(`Generating story in ${language} for user ${user.userId}`)
    
    // Generate story using Gemini AI
    const generatedStory = await geminiService.generateStory(language as 'en' | 'id')
    
    // Save story to database
    const savedStory = await StoryModel.create({
      ...generatedStory,
      userId: user.userId,
      isGenerated: true
    })
    
    console.log('Story saved to database:', savedStory.id)
    
    return NextResponse.json({ story: savedStory })
  } catch (error) {
    console.error('Error generating story:', error)
    return NextResponse.json(
      { error: 'Failed to generate story. Please try again.' },
      { status: 500 }
    )
  }
})
