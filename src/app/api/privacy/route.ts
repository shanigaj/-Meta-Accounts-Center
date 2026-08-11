import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { parseDevice } from "@/lib/device";
import { privacySchema } from "@/schemas";
import { getPrivacy, updatePrivacy } from "@/server/services/privacy";

export const GET = handle(async () => {
  const auth = await requireAuth();
  return ok(await getPrivacy(auth.sub));
});

export const PATCH = handle(async (req) => {
  const auth = await requireAuth();
  const body = privacySchema.parse(await req.json());
  const device = parseDevice(req.headers.get("user-agent"));
  return ok(await updatePrivacy(auth.sub, body, device));
});
