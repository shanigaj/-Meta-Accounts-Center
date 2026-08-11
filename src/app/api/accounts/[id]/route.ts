import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { parseDevice } from "@/lib/device";
import { removeAccount } from "@/server/services/accounts";

export const DELETE = handle(async (req, { params }) => {
  const auth = await requireAuth();
  const { id } = await params;
  await removeAccount(auth.sub, id, parseDevice(req.headers.get("user-agent")));
  return ok({ removed: true });
});
