import { cookies } from "next/headers";
import { ApiError } from "./api";
import { ACCESS_COOKIE } from "./cookies";
import { verifyAccessToken, type AccessPayload } from "./jwt";
import { prisma } from "./prisma";

// Reads the access cookie, verifies it and confirms the session is still
// active. Throws 401 when anything is off — callers can rely on a valid auth
// context after this resolves.
export async function requireAuth(): Promise<AccessPayload> {
  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  if (!token) {
    throw new ApiError("You are not signed in.", 401);
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    throw new ApiError("Session expired. Please sign in again.", 401);
  }

  // A "logout from all devices" action flips isActive off; honour that even
  // though the access token itself is still within its short lifetime.
  const session = await prisma.session.findUnique({
    where: { id: payload.sid },
    select: { isActive: true },
  });
  if (!session || !session.isActive) {
    throw new ApiError("This session is no longer active.", 401);
  }

  return payload;
}

// For endpoints reserved to admins (used by the RBAC bonus).
export async function requireAdmin(): Promise<AccessPayload> {
  const auth = await requireAuth();
  if (auth.role !== "ADMIN") {
    throw new ApiError("Admin access required.", 403);
  }
  return auth;
}
