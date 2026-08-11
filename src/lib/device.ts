// Lightweight user-agent sniffing. Good enough to label a session in the UI
// without pulling in a full parser dependency. IP is mocked per the brief.

export type DeviceInfo = {
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
};

function detectOs(ua: string): string {
  if (/windows nt 10/i.test(ua)) return "Windows 10/11";
  if (/windows/i.test(ua)) return "Windows";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/mac os x/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown OS";
}

function detectBrowser(ua: string): string {
  // Order matters — Edge and Chrome both mention "Chrome" in their UA string.
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua)) return "Opera";
  if (/firefox\//i.test(ua)) return "Firefox";
  if (/chrome\//i.test(ua)) return "Chrome";
  if (/safari\//i.test(ua)) return "Safari";
  return "Unknown Browser";
}

function detectDevice(ua: string, os: string): string {
  if (/mobile|android|iphone/i.test(ua)) return `${os} Phone`;
  if (/ipad|tablet/i.test(ua)) return `${os} Tablet`;
  return `${os} Desktop`;
}

// A stable-ish fake IP so the demo looks believable across a session.
function mockIp(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) & 0xffffff;
  const a = 49 + (h % 150);
  const b = (h >> 3) % 255;
  const c = (h >> 6) % 255;
  const d = (h >> 9) % 255;
  return `${a}.${b}.${c}.${d}`;
}

export function parseDevice(userAgent: string | null): DeviceInfo {
  const ua = userAgent ?? "";
  const os = detectOs(ua);
  const browser = detectBrowser(ua);
  return {
    os,
    browser,
    deviceName: detectDevice(ua, os),
    ipAddress: mockIp(ua || "unknown"),
  };
}
