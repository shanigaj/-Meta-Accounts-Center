import bcrypt from "bcryptjs";
import { ApiError } from "@/lib/api";
import type { DeviceInfo } from "@/lib/device";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/server/activity";
import type { LoginInput, RegisterInput } from "@/schemas";

export type TokenPair = { accessToken: string; refreshToken: string };

// Creates a session row, then mints the token pair bound to that session id.
// The refresh token is stored hashed so a DB leak alone can't reissue tokens.
async function startSession(
  userId: string,
  role: "USER" | "ADMIN",
  device: DeviceInfo
): Promise<TokenPair> {
  const session = await prisma.session.create({
    data: {
      userId,
      refreshTokenHash: "",
      deviceName: device.deviceName,
      browser: device.browser,
      os: device.os,
      ipAddress: device.ipAddress,
    },
  });

  const refreshToken = signRefreshToken(session.id);
  await prisma.session.update({
    where: { id: session.id },
    data: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) },
  });

  const accessToken = signAccessToken({ sub: userId, sid: session.id, role });
  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput, device: DeviceInfo) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existing) {
    throw new ApiError("An account with this email already exists.", 409);
  }

  // Create the user together with default privacy/security rows so the rest of
  // the app can assume they always exist.
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      privacy: { create: {} },
      security: { create: {} },
    },
  });

  const tokens = await startSession(user.id, user.role, device);
  await logActivity(user.id, "LOGIN", device);
  return { user, tokens };
}

export async function login(input: LoginInput, device: DeviceInfo) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Same generic message whether the email is unknown or the password is wrong
  // so we don't leak which emails have accounts.
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new ApiError("Incorrect email or password.", 401);
  }

  const tokens = await startSession(user.id, user.role, device);
  await logActivity(user.id, "LOGIN", device);
  return { user, tokens };
}

// Ends the current session (soft delete keeps it out of the active list).
export async function logout(sessionId: string, userId: string, device: DeviceInfo) {
  await prisma.session.updateMany({
    where: { id: sessionId, userId },
    data: { isActive: false },
  });
  await logActivity(userId, "LOGOUT", device);
}

// Exchanges a valid refresh token for a fresh access token, keeping the same
// session alive. Returns null when the token is invalid or revoked.
export async function refresh(
  refreshToken: string
): Promise<{ accessToken: string; role: "USER" | "ADMIN"; sessionId: string } | null> {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) return null;

  const session = await prisma.session.findUnique({
    where: { id: decoded.sid },
    include: { user: { select: { role: true } } },
  });
  if (!session || !session.isActive) return null;

  const matches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
  if (!matches) return null;

  await prisma.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  });

  const accessToken = signAccessToken({
    sub: session.userId,
    sid: session.id,
    role: session.user.role,
  });
  return { accessToken, role: session.user.role, sessionId: session.id };
}
