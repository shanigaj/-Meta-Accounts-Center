import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { requestVerification } from "@/server/services/emailVerify";

export const POST = handle(async () => {
  const auth = await requireAuth();
  const { token } = await requestVerification(auth.sub);
  // In a real app we'd only email the link. For the mock we return the token so
  // the UI can simulate the click.
  return ok({ sent: true, token });
});
