import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { cookies } from "next/headers";

export interface AuthenticatedUser {
  userId: string;
  name: string;
  email: string;
}

export const getAuthenticatedUser = async (
  request: NextRequest
): Promise<AuthenticatedUser> => {
  try {
    let token = request.headers.get("authorization");

    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7);
    } else {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get("Authorization");
      if (authCookie?.value && authCookie.value.startsWith("Bearer ")) {
        token = authCookie.value.slice(7);
      }
    }

    if (!token) {
      throw new Error("No authentication token provided");
    }

    const payload = await verifyToken<AuthenticatedUser>(token);

    if (!payload.userId) {
      throw new Error("Invalid token payload");
    }

    return payload;
  } catch (error) {
    throw new Error(
      "Authentication failed: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
};

export const withAuth = (
  handler: (
    request: NextRequest,
    context: { user: AuthenticatedUser }
  ) => Promise<Response>
) => {
  return async (request: NextRequest, context: any = {}) => {
    try {
      const user = await getAuthenticatedUser(request);
      return await handler(request, { ...context, user });
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error ? error.message : "Authentication required",
        },
        { status: 401 }
      );
    }
  };
};

export const withAuthAndParams = <T>(
  handler: (
    request: NextRequest,
    context: { user: AuthenticatedUser; params: T }
  ) => Promise<Response>
) => {
  return async (request: NextRequest, context: { params: T }) => {
    try {
      const user = await getAuthenticatedUser(request);
      return await handler(request, { user, params: context.params });
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error ? error.message : "Authentication required",
        },
        { status: 401 }
      );
    }
  };
};
