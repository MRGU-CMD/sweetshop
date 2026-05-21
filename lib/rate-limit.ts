const hits = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 60s
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) {
    if (v.resetAt < now) hits.delete(k);
  }
}, 60_000).unref();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
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

export function getRateLimitKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "127.0.0.1";
}
