// A tiny in-memory fixed-window rate limiter. Good enough for a single-instance
// demo; in production this would live in Redis so limits are shared across
// instances and survive restarts.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  existing.count += 1;
  const retryAfterSec = Math.ceil((existing.resetAt - now) / 1000);
  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfterSec };
  }
  return { ok: true, remaining: limit - existing.count, retryAfterSec };
}

// Best-effort client key from proxy headers, falling back to a constant so the
// limiter still works locally where no forwarding header is present.
export function clientKey(req: Request, scope: string): string {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}

// Opportunistically drop expired buckets so the map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 60_000).unref?.();
