import type { DeviceInfo } from "@/lib/device";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/server/activity";
import { z } from "zod";
import { privacySchema } from "@/schemas";

export async function getPrivacy(userId: string) {
  // Row is created at registration, but self-heal just in case.
  return prisma.privacySettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function updatePrivacy(
  userId: string,
  input: z.infer<typeof privacySchema>,
  device: DeviceInfo
) {
  const settings = await prisma.privacySettings.update({
    where: { userId },
    data: input,
  });
  await logActivity(userId, "PRIVACY_UPDATE", device);
  return settings;
}
