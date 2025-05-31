import { db } from "../config";
import { ObjectId } from "mongodb";
import { GeneratedStory } from "@/lib/gemini";

interface StoryCreateData extends Omit<GeneratedStory, 'id'> {
  userId: string;
  isGenerated?: boolean;
}

interface StoryUpdateData {
  isRead?: boolean;
  isFavorite?: boolean;
  readAt?: Date;
  [key: string]: any;
}

class StoryModel {
  static async collection() {
    const database = await db.getDb();
    return database.collection("stories");
  }

  static async create(storyData: StoryCreateData) {
    const collection = await this.collection();
    
    const newStory = {
      ...storyData,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newStory);
    
    return {
      ...newStory,
      id: result.insertedId.toString(),
    };
  }

  static async findById(id: string) {
    const collection = await this.collection();
    
    let query;
    // Handle both ObjectId and string IDs
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { id: id };
    }
    
    const story = await collection.findOne(query);
    
    if (story) {
      return {
        ...story,
        id: story.id || story._id.toString(),
      };
    }
    
    return null;
  }

  static async findByUserId(userId: string) {
    const collection = await this.collection();
    
    const stories = await collection.find({ 
      userId: userId 
    }).sort({ createdAt: -1 }).toArray();
    
    return stories.map(story => ({
      ...story,
      id: story.id || story._id.toString(),
    }));
  }

  static async update(id: string, updateData: StoryUpdateData) {
    const collection = await this.collection();
    
    let query;
    // Handle both ObjectId and string IDs
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { id: id };
    }
    
    const result = await collection.updateOne(
      query,
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );    if (result.matchedCount === 0) {
      throw new Error('Story not found');
    }

    const updatedStory = await collection.findOne(query);
    
    if (!updatedStory) {
      throw new Error('Story not found after update');
    }
    
    return {
      ...updatedStory,
      id: updatedStory.id || updatedStory._id.toString(),
    };
  }

  static async findAll(filters: { userId?: string; category?: string; isGenerated?: boolean } = {}) {
    const collection = await this.collection();
    
    const query: any = {};
    
    if (filters.userId) {
      query.userId = filters.userId;
    }
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.isGenerated !== undefined) {
      query.isGenerated = filters.isGenerated;
    }
    
    const stories = await collection.find(query).sort({ createdAt: -1 }).toArray();
    
    return stories.map(story => ({
      ...story,
      id: story.id || story._id.toString(),
    }));
  }

  static async delete(id: string) {
    const collection = await this.collection();
    
    let query;
    // Handle both ObjectId and string IDs
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { id: id };
    }
    
    const result = await collection.deleteOne(query);
    
    if (result.deletedCount === 0) {
      throw new Error('Story not found');
    }
    
    return { success: true };
  }
}

export default StoryModel;