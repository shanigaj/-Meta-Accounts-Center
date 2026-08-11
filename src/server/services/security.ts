import { ApiError } from "@/lib/api";
import type { DeviceInfo } from "@/lib/device";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/server/activity";

export async function getSecurity(userId: string) {
  const settings = await prisma.securitySettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
  const activeSessions = await prisma.session.count({
    where: { userId, isActive: true },
  });
  return { ...settings, activeSessions };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  device: DeviceInfo
) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new ApiError("Your current password is incorrect.", 400);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });
  await logActivity(userId, "PASSWORD_CHANGE", device);
}

export async function toggleTwoFactor(
  userId: string,
  enabled: boolean,
  device: DeviceInfo
) {
  const settings = await prisma.securitySettings.update({
    where: { userId },
    data: { twoFactorEnabled: enabled },
  });
  await logActivity(userId, "TWO_FACTOR_TOGGLE", device);
  return settings;
}

// Active sessions, current one flagged so the UI can label "This device".
export async function listSessions(userId: string, currentSessionId: string) {
  const sessions = await prisma.session.findMany({
    where: { userId, isActive: true },
    orderBy: { lastActiveAt: "desc" },
  });
  return sessions.map((s) => ({
    ...s,
    refreshTokenHash: undefined, // never expose this
    isCurrent: s.id === currentSessionId,
  }));
}

export async function revokeSession(
  userId: string,
  sessionId: string,
  device: DeviceInfo
) {
  const result = await prisma.session.updateMany({
    where: { id: sessionId, userId, isActive: true },
    data: { isActive: false },
  });
  if (result.count === 0) {
    throw new ApiError("Session not found or already signed out.", 404);
  }
  await logActivity(userId, "DEVICE_REMOVED", device);
}

// Signs out every session for the user, including the current one.
export async function logoutEverywhere(userId: string, device: DeviceInfo) {
  await prisma.session.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });
  await logActivity(userId, "LOGOUT", device);
}
