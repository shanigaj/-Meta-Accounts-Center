import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { clearAuthCookies } from "@/lib/cookies";
import { parseDevice } from "@/lib/device";
import { logoutEverywhere } from "@/server/services/security";

export const POST = handle(async (req) => {
  const auth = await requireAuth();
  await logoutEverywhere(auth.sub, parseDevice(req.headers.get("user-agent")));
  await clearAuthCookies();
  return ok({ loggedOutEverywhere: true });
});
