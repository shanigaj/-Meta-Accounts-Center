import { ApiError } from "@/lib/api";
import type { DeviceInfo } from "@/lib/device";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/server/activity";
import type { Provider } from "@prisma/client";

export function listAccounts(userId: string) {
  return prisma.connectedAccount.findMany({
    where: { userId },
    orderBy: { connectedAt: "desc" },
  });
}

export async function connectAccount(
  userId: string,
  provider: Provider,
  providerUsername: string,
  device: DeviceInfo
) {
  const already = await prisma.connectedAccount.findUnique({
    where: { userId_provider: { userId, provider } },
  });
  if (already) {
    throw new ApiError(`Your ${provider.toLowerCase()} account is already connected.`, 409);
  }

  const account = await prisma.connectedAccount.create({
    data: { userId, provider, providerUsername },
  });
  await logActivity(userId, "ACCOUNT_CONNECTED", device);
  return account;
}

export async function removeAccount(userId: string, id: string, device: DeviceInfo) {
  // Scope the delete by userId so one user can't remove another's link.
  const result = await prisma.connectedAccount.deleteMany({
    where: { id, userId },
  });
  if (result.count === 0) {
    throw new ApiError("Connected account not found.", 404);
  }
  await logActivity(userId, "ACCOUNT_REMOVED", device);
}
