import { handle, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { listActivity } from "@/server/services/activity";
import type { ActivityType } from "@prisma/client";

const VALID_TYPES: ActivityType[] = [
  "LOGIN",
  "LOGOUT",
  "PASSWORD_CHANGE",
  "PROFILE_UPDATE",
  "ACCOUNT_CONNECTED",
  "ACCOUNT_REMOVED",
  "PRIVACY_UPDATE",
  "TWO_FACTOR_TOGGLE",
  "DEVICE_REMOVED",
];

export const GET = handle(async (req) => {
  const auth = await requireAuth();
  const url = new URL(req.url);

  const page = Number(url.searchParams.get("page") ?? 1);
  const typeParam = url.searchParams.get("type");
  const type = VALID_TYPES.includes(typeParam as ActivityType)
    ? (typeParam as ActivityType)
    : undefined;

  return ok(await listActivity(auth.sub, { page, type }));
});
