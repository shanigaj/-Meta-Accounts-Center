import { ApiError } from "@/lib/api";
import type { DeviceInfo } from "@/lib/device";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/server/activity";
import type { UpdateProfileInput } from "@/schemas";

// Fields we ever hand back to the client — passwordHash intentionally excluded.
const publicUser = {
  id: true,
  name: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
} as const;

export function getProfile(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: publicUser,
  });
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
  device: DeviceInfo
) {
  // Changing the email must not collide with someone else's account.
  if (input.email) {
    const clash = await prisma.user.findFirst({
      where: { email: input.email, NOT: { id: userId } },
      select: { id: true },
    });
    if (clash) {
      throw new ApiError("That email is already in use.", 409);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone === "" ? null : input.phone,
      avatarUrl: input.avatarUrl === "" ? null : input.avatarUrl,
      dateOfBirth:
        input.dateOfBirth === "" || input.dateOfBirth === undefined
          ? undefined
          : new Date(input.dateOfBirth),
    },
    select: publicUser,
  });

  await logActivity(userId, "PROFILE_UPDATE", device);
  return user;
}
