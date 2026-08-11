import { prisma } from "@/lib/prisma";
import type { DeviceInfo } from "@/lib/device";
import type { ActivityType } from "@prisma/client";

// Central place to record something into the activity feed. Every service that
// mutates account state calls this so the history stays trustworthy.
export function logActivity(
  userId: string,
  type: ActivityType,
  device: DeviceInfo
) {
  return prisma.activityLog.create({
    data: {
      userId,
      type,
      deviceName: device.deviceName,
      browser: device.browser,
      ipAddress: device.ipAddress,
    },
  });
}
