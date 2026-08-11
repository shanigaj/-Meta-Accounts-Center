import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { parseDevice } from "@/lib/device";
import { connectAccountSchema } from "@/schemas";
import { connectAccount, listAccounts } from "@/server/services/accounts";

export const GET = handle(async () => {
  const auth = await requireAuth();
  return ok(await listAccounts(auth.sub));
});

export const POST = handle(async (req) => {
  const auth = await requireAuth();
  const { provider, providerUsername } = connectAccountSchema.parse(await req.json());
  const device = parseDevice(req.headers.get("user-agent"));
  return ok(await connectAccount(auth.sub, provider, providerUsername, device), 201);
});
