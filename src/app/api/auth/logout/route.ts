import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { clearAuthCookies } from "@/lib/cookies";
import { parseDevice } from "@/lib/device";
import { logout } from "@/server/services/auth";

export const POST = handle(async (req) => {
  const auth = await requireAuth();
  await logout(auth.sid, auth.sub, parseDevice(req.headers.get("user-agent")));
  await clearAuthCookies();
  return ok({ loggedOut: true });
});
