export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

const PRUNE_AT = 5_000;

export function createRateLimiter(limit = 60, windowMs = 60_000) {
  const hits = new Map<string, number[]>();

  function prune(now: number): void {
    for (const [key, stamps] of hits) {
      const fresh = stamps.filter((t) => t > now - windowMs);
      if (fresh.length === 0) hits.delete(key);
      else hits.set(key, fresh);
    }
  }

  return {
    check(key: string, now: number = Date.now()): RateLimitResult {
      if (hits.size > PRUNE_AT) prune(now);
      const recent = (hits.get(key) ?? []).filter((t) => t > now - windowMs);
      if (recent.length >= limit) {
        const oldest = recent[0] ?? now;
        hits.set(key, recent);
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
      }
      hits.set(key, [...recent, now]);
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

/** One limiter per server process. On Vercel that means per instance, which is fine for a hackathon room. */
export const rateLimiter = createRateLimiter();
