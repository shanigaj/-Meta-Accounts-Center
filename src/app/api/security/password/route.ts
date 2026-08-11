import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { parseDevice } from "@/lib/device";
import { changePasswordSchema } from "@/schemas";
import { changePassword } from "@/server/services/security";

export const PATCH = handle(async (req) => {
  const auth = await requireAuth();
  const { currentPassword, newPassword } = changePasswordSchema.parse(await req.json());
  const device = parseDevice(req.headers.get("user-agent"));
  await changePassword(auth.sub, currentPassword, newPassword, device);
  return ok({ updated: true });
});
