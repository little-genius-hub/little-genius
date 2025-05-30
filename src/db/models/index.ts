// Database models
// This is a placeholder file for database models

import { db } from "../mongoDb";

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

export function collectionProgress() {
  return db.collection("progress");
}
