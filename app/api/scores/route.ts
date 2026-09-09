import { todayAmsterdam } from "@/lib/date";
import { rateLimited } from "@/lib/guard";
import { fail, ok, preflight, readJson, withErrorHandling } from "@/lib/http";
import { rankFor, scoreStore, validateScoreInput } from "@/lib/scores";

export const dynamic = "force-dynamic";

export function POST(request: Request): Promise<Response> {
  return withErrorHandling(async () => {
    const limited = rateLimited(request);
    if (limited) return limited;

    const validation = validateScoreInput(await readJson(request));
    if (!validation.ok) return fail(validation.error, 400);

    const gameDate = todayAmsterdam();
    const entry = { ...validation.value, gameDate, createdAt: Date.now() };
    if (!scoreStore.add(entry)) return fail("the leaderboard for today is full", 503);
    return ok({ rank: rankFor(scoreStore.listForDate(gameDate), entry) });
  });
}

export function OPTIONS(): Response {
  return preflight();
}
