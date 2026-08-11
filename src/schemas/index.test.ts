import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  connectAccountSchema,
  loginSchema,
  registerSchema,
} from "./index";

describe("registerSchema", () => {
  it("accepts valid input and lowercases the email", () => {
    const result = registerSchema.parse({
      name: "Jordan Rivera",
      email: "Jordan@Example.com",
      password: "Password123",
    });
    expect(result.email).toBe("jordan@example.com");
  });

  it("rejects a short password", () => {
    const result = registerSchema.safeParse({
      name: "Jordan",
      email: "j@x.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(
      loginSchema.safeParse({ email: "not-an-email", password: "x" }).success
    ).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("rejects when the new password matches the current one", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "Password123",
      newPassword: "Password123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a different, valid new password", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "Password123",
        newPassword: "NewPassword456",
      }).success
    ).toBe(true);
  });
});

describe("connectAccountSchema", () => {
  it("only allows known providers", () => {
    expect(
      connectAccountSchema.safeParse({ provider: "TWITTER", providerUsername: "x" })
        .success
    ).toBe(false);
    expect(
      connectAccountSchema.safeParse({ provider: "FACEBOOK", providerUsername: "me" })
        .success
    ).toBe(true);
  });
});
