import { handle, ok } from "@/lib/api";
import { z } from "zod";
import { confirmVerification } from "@/server/services/emailVerify";

const schema = z.object({ token: z.string().min(1) });

// Public on purpose — the token itself is the proof of ownership, mirroring how
// a real email-link confirmation works.
export const POST = handle(async (req) => {
  const { token } = schema.parse(await req.json());
  return ok(await confirmVerification(token));
});
