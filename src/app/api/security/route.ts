import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { getSecurity } from "@/server/services/security";

export const GET = handle(async () => {
  const auth = await requireAuth();
  return ok(await getSecurity(auth.sub));
});
