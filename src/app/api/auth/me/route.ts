import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { getProfile } from "@/server/services/profile";

// Who am I? Used by the client to hydrate auth state on load.
export const GET = handle(async () => {
  const auth = await requireAuth();
  const user = await getProfile(auth.sub);
  return ok(user);
});
