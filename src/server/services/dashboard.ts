import { prisma } from "@/lib/prisma";
import { getProfile } from "./profile";

// One round of queries that feeds the whole dashboard overview so the client
// makes a single request instead of five.
export async function getDashboard(userId: string, currentSessionId: string) {
  const [user, security, accounts, sessions, recentActivity] = await Promise.all([
    getProfile(userId),
    prisma.securitySettings.findUnique({ where: { userId } }),
    prisma.connectedAccount.findMany({
      where: { userId },
      orderBy: { connectedAt: "desc" },
    }),
    prisma.session.findMany({
      where: { userId, isActive: true },
      orderBy: { lastActiveAt: "desc" },
    }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // A tiny heuristic "security score" so the overview has something to show.
  let score = 40;
  if (security?.twoFactorEnabled) score += 35;
  if (security?.emailVerified) score += 15;
  if (accounts.length > 0) score += 10;

  return {
    user,
    security: {
      twoFactorEnabled: security?.twoFactorEnabled ?? false,
      emailVerified: security?.emailVerified ?? false,
      score: Math.min(score, 100),
    },
    connectedAccounts: accounts,
    devices: sessions.map((s) => ({ ...s, refreshTokenHash: undefined, isCurrent: s.id === currentSessionId })),
    recentActivity,
  };
}
