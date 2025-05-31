import { SignJWT, jwtVerify, JWTPayload } from "jose";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signToken = async (payload: JWTPayload): Promise<string> => {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    // .setExpirationTime('1h')
    .sign(secret);
};

export const verifyToken = async <T>(token: string) => {
  try {
    console.log("Verifying token:", token?.slice(0, 20) + "...");
    console.log("JWT_SECRET exists:", !!JWT_SECRET);
    
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify<T>(token, secret);
    return payload;
  } catch (error) {
    console.error("JWT verification error:", error);
    throw error;
  }
};
