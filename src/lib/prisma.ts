import { PrismaClient } from "@prisma/client";

// Reuse a single client across hot reloads in dev, otherwise Next will spin up
// a new connection pool on every change and eventually exhaust the database.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
