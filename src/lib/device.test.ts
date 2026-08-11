import { describe, expect, it } from "vitest";
import { parseDevice } from "./device";

const CHROME_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const SAFARI_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const EDGE_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36 Edg/120.0";

describe("parseDevice", () => {
  it("detects a Chrome desktop on Windows", () => {
    const d = parseDevice(CHROME_WIN);
    expect(d.browser).toBe("Chrome");
    expect(d.os).toBe("Windows 10/11");
    expect(d.deviceName).toBe("Windows 10/11 Desktop");
  });

  it("detects Safari on an iPhone as a phone", () => {
    const d = parseDevice(SAFARI_IPHONE);
    expect(d.browser).toBe("Safari");
    expect(d.os).toBe("iOS");
    expect(d.deviceName).toContain("Phone");
  });

  it("prefers Edge over Chrome when both appear in the UA", () => {
    expect(parseDevice(EDGE_WIN).browser).toBe("Edge");
  });

  it("produces a stable mock IP for the same user agent", () => {
    expect(parseDevice(CHROME_WIN).ipAddress).toBe(parseDevice(CHROME_WIN).ipAddress);
  });

  it("falls back gracefully on a null user agent", () => {
    const d = parseDevice(null);
    expect(d.browser).toBe("Unknown Browser");
    expect(d.os).toBe("Unknown OS");
  });
});
