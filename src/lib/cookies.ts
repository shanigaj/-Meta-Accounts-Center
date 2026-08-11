import { cookies } from "next/headers";
import { env } from "./env";

export const ACCESS_COOKIE = "ac_access";
export const REFRESH_COOKIE = "ac_refresh";

const baseOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: env.accessTtlMin * 60,
  });
  jar.set(REFRESH_COOKIE, refreshToken, {
    ...baseOptions,
    maxAge: env.refreshTtlDays * 24 * 60 * 60,
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}
