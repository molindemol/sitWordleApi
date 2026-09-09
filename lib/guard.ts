import { clientIp, fail } from "@/lib/http";
import { rateLimiter } from "@/lib/rateLimit";

/** Returns a 429 response when the caller is over the limit, otherwise null. */
export function rateLimited(request: Request): Response | null {
  const result = rateLimiter.check(clientIp(request));
  if (result.allowed) return null;
  return fail("Too many requests, slow down (60 per minute per IP)", 429, { "Retry-After": String(result.retryAfterSeconds) });
}
