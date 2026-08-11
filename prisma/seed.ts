import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// A demo account so the app has something to show on first run.
// Login with: demo@accounts.dev / Password123
async function main() {
  const email = "demo@accounts.dev";
  const passwordHash = await bcrypt.hash("Password123", 10);

  // Start from a clean slate for the demo user on every seed.
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email,
      phone: "+1 555 018 2244",
      dateOfBirth: new Date("1996-04-12"),
      passwordHash,
      role: "ADMIN",
      security: { create: { twoFactorEnabled: true, emailVerified: true } },
      privacy: {
        create: {
          profileVisibility: "FRIENDS",
          emailVisibility: "PRIVATE",
          phoneVisibility: "PRIVATE",
          personalizedAds: true,
          dataSharing: false,
        },
      },
      connectedAccounts: {
        create: [
          { provider: "FACEBOOK", providerUsername: "demo.user" },
          { provider: "INSTAGRAM", providerUsername: "demo_user" },
        ],
      },
      sessions: {
        create: [
          {
            refreshTokenHash: "seed-placeholder",
            deviceName: "Windows 10/11 Desktop",
            browser: "Chrome",
            os: "Windows 10/11",
            ipAddress: "103.42.18.77",
          },
          {
            refreshTokenHash: "seed-placeholder",
            deviceName: "iOS Phone",
            browser: "Safari",
            os: "iOS",
            ipAddress: "49.207.11.20",
            lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
          },
        ],
      },
    },
  });

  // A little activity history spread over the past few days.
  const now = Date.now();
  const hours = (h: number) => new Date(now - h * 60 * 60 * 1000);
  await prisma.activityLog.createMany({
    data: [
      { userId: user.id, type: "LOGIN", deviceName: "Windows 10/11 Desktop", browser: "Chrome", ipAddress: "103.42.18.77", createdAt: hours(1) },
      { userId: user.id, type: "PROFILE_UPDATE", deviceName: "Windows 10/11 Desktop", browser: "Chrome", ipAddress: "103.42.18.77", createdAt: hours(5) },
      { userId: user.id, type: "ACCOUNT_CONNECTED", deviceName: "iOS Phone", browser: "Safari", ipAddress: "49.207.11.20", createdAt: hours(28) },
      { userId: user.id, type: "TWO_FACTOR_TOGGLE", deviceName: "Windows 10/11 Desktop", browser: "Chrome", ipAddress: "103.42.18.77", createdAt: hours(30) },
      { userId: user.id, type: "PRIVACY_UPDATE", deviceName: "Windows 10/11 Desktop", browser: "Chrome", ipAddress: "103.42.18.77", createdAt: hours(50) },
      { userId: user.id, type: "PASSWORD_CHANGE", deviceName: "iOS Phone", browser: "Safari", ipAddress: "49.207.11.20", createdAt: hours(72) },
    ],
  });

  console.log(`Seeded demo user → ${email} / Password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
