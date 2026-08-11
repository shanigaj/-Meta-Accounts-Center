import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { getDashboard } from "@/server/services/dashboard";

export const GET = handle(async () => {
  const auth = await requireAuth();
  return ok(await getDashboard(auth.sub, auth.sid));
});
