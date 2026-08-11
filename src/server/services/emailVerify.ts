import { ApiError } from "@/lib/api";
import { signVerifyToken, verifyVerifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

// "Sends" a verification email. With no mail provider wired up we sign a token
// and log the link to the server console; the token is also returned so the
// demo UI can complete the flow without an inbox.
export async function requestVerification(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true },
  });

  const token = signVerifyToken(userId);
  console.info(
    `[verify-email] link (mock) for ${user.email}: /verify-email?token=${token}`
  );
  return { token };
}

// Confirms a token and flips emailVerified on. Idempotent — verifying twice is
// harmless.
export async function confirmVerification(token: string) {
  const decoded = verifyVerifyToken(token);
  if (!decoded) {
    throw new ApiError("This verification link is invalid or has expired.", 400);
  }

  await prisma.securitySettings.update({
    where: { userId: decoded.sub },
    data: { emailVerified: true },
  });
  return { verified: true };
}
