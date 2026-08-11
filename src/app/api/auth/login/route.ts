import { ApiError, handle, ok } from "@/lib/api";
import { setAuthCookies } from "@/lib/cookies";
import { parseDevice } from "@/lib/device";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { loginSchema } from "@/schemas";
import { login } from "@/server/services/auth";

export const POST = handle(async (req) => {
  // Throttle brute-force attempts: 5 tries per minute per IP.
  const limit = rateLimit(clientKey(req, "login"), 5, 60_000);
  if (!limit.ok) {
    throw new ApiError(
      `Too many login attempts. Try again in ${limit.retryAfterSec}s.`,
      429
    );
  }

  const body = loginSchema.parse(await req.json());
  const device = parseDevice(req.headers.get("user-agent"));

  const { user, tokens } = await login(body, device);
  await setAuthCookies(tokens.accessToken, tokens.refreshToken);

  return ok({ id: user.id, name: user.name, email: user.email });
});
