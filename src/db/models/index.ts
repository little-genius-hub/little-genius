import { db } from "../config";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
}

export async function collectionProgress() {
  const database = await db.getDb();
  return database.collection("progress");
}
