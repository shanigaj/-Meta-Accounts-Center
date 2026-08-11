import { describe, expect, it } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./jwt";

describe("jwt", () => {
  it("round-trips an access token payload", () => {
    const token = signAccessToken({ sub: "user_1", sid: "sess_1", role: "USER" });
    const decoded = verifyAccessToken(token);
    expect(decoded?.sub).toBe("user_1");
    expect(decoded?.sid).toBe("sess_1");
    expect(decoded?.role).toBe("USER");
  });

  it("rejects a tampered access token", () => {
    const token = signAccessToken({ sub: "user_1", sid: "sess_1", role: "USER" });
    expect(verifyAccessToken(token + "x")).toBeNull();
  });

  it("round-trips a refresh token", () => {
    const token = signRefreshToken("sess_42");
    expect(verifyRefreshToken(token)?.sid).toBe("sess_42");
  });

  it("does not accept a refresh token as an access token", () => {
    // Different secrets → cross-verification must fail.
    const refresh = signRefreshToken("sess_1");
    expect(verifyAccessToken(refresh)).toBeNull();
  });
});
