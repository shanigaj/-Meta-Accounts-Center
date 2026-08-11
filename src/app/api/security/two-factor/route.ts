import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { parseDevice } from "@/lib/device";
import { twoFactorSchema } from "@/schemas";
import { toggleTwoFactor } from "@/server/services/security";

export const PATCH = handle(async (req) => {
  const auth = await requireAuth();
  const { enabled } = twoFactorSchema.parse(await req.json());
  const device = parseDevice(req.headers.get("user-agent"));
  return ok(await toggleTwoFactor(auth.sub, enabled, device));
});
