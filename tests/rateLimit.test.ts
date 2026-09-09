import { describe, expect, test } from "vitest";
import { createRateLimiter } from "@/lib/rateLimit";

describe("rate limiter (60 per minute, sliding window)", () => {
  test("allows 60 calls and blocks the 61st with a Retry-After", () => {
    const limiter = createRateLimiter(60, 60_000);
    const start = 1_000_000;
    for (let i = 0; i < 60; i += 1) expect(limiter.check("ip", start + i).allowed).toBe(true);
    const blocked = limiter.check("ip", start + 100);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  test("lets the client back in once the window has passed", () => {
    const limiter = createRateLimiter(2, 1_000);
    expect(limiter.check("ip", 0).allowed).toBe(true);
    expect(limiter.check("ip", 10).allowed).toBe(true);
    expect(limiter.check("ip", 20).allowed).toBe(false);
    expect(limiter.check("ip", 1_001).allowed).toBe(true);
  });

  test("keeps clients apart", () => {
    const limiter = createRateLimiter(1, 1_000);
    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("b", 0).allowed).toBe(true);
    expect(limiter.check("a", 1).allowed).toBe(false);
  });
});
