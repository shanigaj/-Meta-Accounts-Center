import { ApiError, handle, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { forgotPasswordSchema } from "@/schemas";

// Mock flow (per the brief). We look the user up but always respond the same
// way so the endpoint can't be used to probe which emails are registered. In a
// real build this is where we'd queue a reset email with a signed token.
export const POST = handle(async (req) => {
  const limit = rateLimit(clientKey(req, "forgot"), 5, 60_000);
  if (!limit.ok) {
    throw new ApiError(
      `Too many requests. Try again in ${limit.retryAfterSec}s.`,
      429
    );
  }

  const { email } = forgotPasswordSchema.parse(await req.json());

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (user) {
    const resetToken = `mock-reset-${user.id}-${Date.now()}`;
    console.info(`[forgot-password] reset link (mock) for ${email}: /reset?token=${resetToken}`);
  }

  return ok({
    message: "If an account exists for that email, a reset link has been sent.",
  });
});
