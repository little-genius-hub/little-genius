import { NextRequest, NextResponse } from 'next/server'
import { withAuthAndParams } from '@/helpers/auth'
import StoryModel from '@/db/models/StoryModel'

// GET /api/stories/[id] - Get a specific story by ID
export const GET = withAuthAndParams<{ id: string }>(async (
  request: NextRequest,
  { user, params }
) => {
  try {
    const storyId = params.id
    console.log(`Fetching story ${storyId} for user ${user.userId}`)
    
    const story = await StoryModel.findById(storyId)
    
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check if user owns this story (for generated stories)
    if (story.userId && story.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }
    
    return NextResponse.json({ story })
  } catch (error) {
    console.error('Error fetching story:', error)
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    )
  }
})

// PUT /api/stories/[id] - Update story (mark as read, toggle favorite, etc.)
export const PUT = withAuthAndParams<{ id: string }>(async (
  request: NextRequest,
  { user, params }
) => {
  try {
    const storyId = params.id
    const updateData = await request.json()
    
    console.log(`Updating story ${storyId} for user ${user.userId}`)
    
    const story = await StoryModel.findById(storyId)
    
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      )
    }

    // Update story with new data
    const updatedStory = await StoryModel.update(storyId, updateData)
    
    return NextResponse.json({ story: updatedStory })
  } catch (error) {
    console.error('Error updating story:', error)
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    )
  }
})
