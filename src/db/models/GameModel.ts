import { db } from "../config";

export default class GameModel {
  static async collectionPronounce() {
    const database = await db.getDb();
    return database.collection("pronounce").find().toArray();
  }
}
