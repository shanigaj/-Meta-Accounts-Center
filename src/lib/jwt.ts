import jwt from "jsonwebtoken";
import { env } from "./env";

export type AccessPayload = {
  sub: string; // user id
  sid: string; // session id
  role: "USER" | "ADMIN";
};

export function signAccessToken(payload: AccessPayload) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: `${env.accessTtlMin}m`,
  });
}

export function verifyAccessToken(token: string): AccessPayload | null {
  try {
    return jwt.verify(token, env.jwtAccessSecret) as AccessPayload;
  } catch {
    return null;
  }
}

// The refresh token only carries the session id. The matching secret is stored
// (hashed) in the DB, so a stolen access token alone can't mint new sessions.
export function signRefreshToken(sessionId: string) {
  return jwt.sign({ sid: sessionId }, env.jwtRefreshSecret, {
    expiresIn: `${env.refreshTtlDays}d`,
  });
}

export function verifyRefreshToken(token: string): { sid: string } | null {
  try {
    return jwt.verify(token, env.jwtRefreshSecret) as { sid: string };
  } catch {
    return null;
  }
}

// Single-purpose token used for the (mock) email verification link. Carries a
// `purpose` claim so it can't be swapped in for an access token.
export function signVerifyToken(userId: string) {
  return jwt.sign({ sub: userId, purpose: "verify-email" }, env.jwtAccessSecret, {
    expiresIn: "1d",
  });
}

export function verifyVerifyToken(token: string): { sub: string } | null {
  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as {
      sub: string;
      purpose?: string;
    };
    if (decoded.purpose !== "verify-email") return null;
    return { sub: decoded.sub };
  } catch {
    return null;
  }
}
