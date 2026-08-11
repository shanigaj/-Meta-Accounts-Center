import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { clearAuthCookies } from "@/lib/cookies";
import { parseDevice } from "@/lib/device";
import { revokeSession } from "@/server/services/security";

export const DELETE = handle(async (req, { params }) => {
  const auth = await requireAuth();
  const { id } = await params;
  await revokeSession(auth.sub, id, parseDevice(req.headers.get("user-agent")));
  if (id === auth.sid) {
    await clearAuthCookies();
  }
  return ok({ removed: true, wasCurrent: id === auth.sid });
});
