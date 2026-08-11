import { describe, expect, it } from "vitest";
import { toDateInput } from "./format";

describe("toDateInput", () => {
  it("formats an ISO string as yyyy-mm-dd", () => {
    expect(toDateInput("1996-04-12T00:00:00.000Z")).toBe("1996-04-12");
  });

  it("returns an empty string for null", () => {
    expect(toDateInput(null)).toBe("");
  });
});
