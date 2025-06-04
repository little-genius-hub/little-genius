// Database models
// This is a placeholder file for database models

import { db } from "../config";

/**
 * Example User model
 */
export interface User {
  id: string;
  name: string;
  email: string;
  // Add more fields as needed
}

/**
 * Example Game model
 */
export interface Game {
  id: string;
  title: string;
  description: string;
  // Add more fields as needed
}

export async function collectionProgress() {
  const database = await db.getDb();
  return database.collection("progress");
}

export async function collectionWordScramble() {
  const database = await db.getDb();
  return database.collection("word_scramble_questions");
}
