import { ApiError, handle, ok } from "@/lib/api";
import { setAuthCookies } from "@/lib/cookies";
import { parseDevice } from "@/lib/device";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { registerSchema } from "@/schemas";
import { register } from "@/server/services/auth";

export const POST = handle(async (req) => {
  // Cap sign-ups from a single IP to slow down bulk account creation.
  const limit = rateLimit(clientKey(req, "register"), 5, 60_000);
  if (!limit.ok) {
    throw new ApiError(
      `Too many attempts. Try again in ${limit.retryAfterSec}s.`,
      429
    );
  }

  const body = registerSchema.parse(await req.json());
  const device = parseDevice(req.headers.get("user-agent"));

  const { user, tokens } = await register(body, device);
  await setAuthCookies(tokens.accessToken, tokens.refreshToken);

  return ok({ id: user.id, name: user.name, email: user.email }, 201);
});
