import { handle, fail, ok } from "@/lib/api";
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from "@/lib/cookies";
import { refresh } from "@/server/services/auth";
import { cookies } from "next/headers";

// Issues a fresh access token from the refresh cookie. The client calls this
// automatically on a 401 before giving up and redirecting to login.
export const POST = handle(async () => {
  const jar = await cookies();
  const token = jar.get(REFRESH_COOKIE)?.value;
  if (!token) {
    return fail("No refresh token.", 401);
  }

  const result = await refresh(token);
  if (!result) {
    await clearAuthCookies();
    return fail("Refresh token is invalid or expired.", 401);
  }

  // Reuse the same refresh token — it's still valid and its hash is what the
  // session row was stored against, so we don't rotate it here.
  await setAuthCookies(result.accessToken, token);
  return ok({ refreshed: true });
});
