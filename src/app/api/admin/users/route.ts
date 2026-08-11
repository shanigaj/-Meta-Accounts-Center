import { handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { listUsers } from "@/server/services/admin";

// Reserved for admins. requireAdmin throws 403 for regular users.
export const GET = handle(async () => {
  await requireAdmin();
  return ok(await listUsers());
});
