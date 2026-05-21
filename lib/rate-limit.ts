import { kv } from "@vercel/kv";

// In-memory fallback when KV is unavailable (local dev without KV configured)
const hits = new Map<string, { count: number; resetAt: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) {
    if (v.resetAt < now) hits.delete(k);
  }
}, 60_000).unref();

function localRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

export async function rateLimit(key: string, max: number, windowMs: number): Promise<boolean> {
  try {
    const now = Date.now();
    const windowKey = `ratelimit:${key}`;

    const entry = await kv.get<{ count: number; resetAt: number }>(windowKey);

    if (!entry || entry.resetAt < now) {
      await kv.set(windowKey, { count: 1, resetAt: now + windowMs }, { px: windowMs });
      return true;
    }

    if (entry.count >= max) return false;

    const remainingPx = entry.resetAt - now;
    await kv.set(windowKey, { count: entry.count + 1, resetAt: entry.resetAt }, { px: remainingPx });
    return true;
  } catch {
    return localRateLimit(key, max, windowMs);
  }
}

export function getRateLimitKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "127.0.0.1";
}
