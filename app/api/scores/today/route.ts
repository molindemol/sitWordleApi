import { todayAmsterdam } from "@/lib/date";
import { rateLimited } from "@/lib/guard";
import { ok, preflight, withErrorHandling } from "@/lib/http";
import { scoreStore, topTen } from "@/lib/scores";

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return withErrorHandling(async () => {
    const limited = rateLimited(request);
    if (limited) return limited;
    const date = todayAmsterdam();
    const entries = scoreStore.listForDate(date);
    return ok(topTen(entries), { total: entries.length, date });
  });
}

export function OPTIONS(): Response {
  return preflight();
}
