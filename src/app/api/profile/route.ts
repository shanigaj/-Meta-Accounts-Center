import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { parseDevice } from "@/lib/device";
import { updateProfileSchema } from "@/schemas";
import { getProfile, updateProfile } from "@/server/services/profile";

export const GET = handle(async () => {
  const auth = await requireAuth();
  return ok(await getProfile(auth.sub));
});

export const PATCH = handle(async (req) => {
  const auth = await requireAuth();
  const body = updateProfileSchema.parse(await req.json());
  const device = parseDevice(req.headers.get("user-agent"));
  return ok(await updateProfile(auth.sub, body, device));
});
