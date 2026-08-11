import { prisma } from "@/lib/prisma";

// Admin-only view of every account. Deliberately excludes password hashes and
// only surfaces the fields an admin needs to see.
export function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { connectedAccounts: true, sessions: true } },
    },
  });
}
