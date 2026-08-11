import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { listSessions } from "@/server/services/security";

// Devices are just the active sessions viewed through a different lens.
export const GET = handle(async () => {
  const auth = await requireAuth();
  return ok(await listSessions(auth.sub, auth.sid));
});
