import UserModel from "@/db/models/UserModel";

/**
 * Generates a unique username based on the user's name
 * @param name User's full name
 * @returns A unique username
 */
export async function generateUsername(name: string): Promise<string> {
  // Remove special characters and convert to lowercase
  let baseUsername = name
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, ".");
  
  // If the name is too short, add 'user' prefix
  if (baseUsername.length < 3) {
    baseUsername = `user.${baseUsername}`;
  }
  
  // Check if username already exists
  const collection = await UserModel.collection();
  let username = baseUsername;
  let counter = 1;
  
  // Try to find a unique username by adding numbers if necessary
  let usernameExists = await collection.findOne({ username });
  
  while (usernameExists) {
    username = `${baseUsername}${counter}`;
    usernameExists = await collection.findOne({ username });
    counter++;
  }
  
  return username;
}
