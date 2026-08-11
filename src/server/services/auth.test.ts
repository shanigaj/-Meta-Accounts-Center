import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the data layer and the activity logger so these tests stay in-memory.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    session: { create: vi.fn(), update: vi.fn() },
  },
}));
vi.mock("@/server/activity", () => ({ logActivity: vi.fn() }));

import { ApiError } from "@/lib/api";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { login, register } from "./auth";

const device = {
  deviceName: "Test Desktop",
  browser: "Chrome",
  os: "Windows 10/11",
  ipAddress: "127.0.0.1",
};

// Typed helpers over the mocked functions.
const findUnique = prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>;
const createUser = prisma.user.create as unknown as ReturnType<typeof vi.fn>;
const createSession = prisma.session.create as unknown as ReturnType<typeof vi.fn>;
const updateSession = prisma.session.update as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  createSession.mockResolvedValue({ id: "sess_1" });
  updateSession.mockResolvedValue({});
});

describe("register", () => {
  it("rejects an email that already exists with a 409", async () => {
    findUnique.mockResolvedValue({ id: "existing" });
    await expect(
      register({ name: "A", email: "a@x.com", password: "Password123" }, device)
    ).rejects.toMatchObject({ status: 409 });
  });

  it("creates a user and returns a token pair", async () => {
    findUnique.mockResolvedValue(null);
    createUser.mockResolvedValue({ id: "user_1", role: "USER" });

    const { user, tokens } = await register(
      { name: "A", email: "a@x.com", password: "Password123" },
      device
    );

    expect(user.id).toBe("user_1");
    expect(typeof tokens.accessToken).toBe("string");
    expect(typeof tokens.refreshToken).toBe("string");
  });
});

describe("login", () => {
  it("throws 401 when the user does not exist", async () => {
    findUnique.mockResolvedValue(null);
    await expect(
      login({ email: "missing@x.com", password: "whatever" }, device)
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("throws 401 on a wrong password", async () => {
    findUnique.mockResolvedValue({
      id: "user_1",
      role: "USER",
      passwordHash: await hashPassword("Password123"),
    });
    await expect(
      login({ email: "a@x.com", password: "wrong" }, device)
    ).rejects.toMatchObject({ status: 401 });
  });

  it("returns tokens on correct credentials", async () => {
    findUnique.mockResolvedValue({
      id: "user_1",
      role: "USER",
      passwordHash: await hashPassword("Password123"),
    });
    const { tokens } = await login(
      { email: "a@x.com", password: "Password123" },
      device
    );
    expect(tokens.accessToken).toBeTruthy();
  });
});
