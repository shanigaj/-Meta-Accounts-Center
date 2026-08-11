import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("Password123");
    expect(hash).not.toBe("Password123"); // never store plaintext
    expect(await verifyPassword("Password123", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Password123");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });
});
