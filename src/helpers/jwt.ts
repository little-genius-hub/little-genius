import { sign } from "jsonwebtoken";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signToken = (payload: object) =>
  sign(payload, JWT_SECRET, { expiresIn: "1h" });

export const verifyToken = async <T>(token: string) => {
  const secret = new TextEncoder().encode(JWT_SECRET);

  const { payload } = await jwtVerify<T>(token, secret);
  return payload;
};
