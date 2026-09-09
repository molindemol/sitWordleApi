import { practiceGameId } from "@/lib/game";
import { rateLimited } from "@/lib/guard";
import { ok, preflight, withErrorHandling } from "@/lib/http";
import { MAX_GUESSES, WORD_LENGTH } from "@/lib/types";

export const dynamic = "force-dynamic";

export function POST(request: Request): Promise<Response> {
  return withErrorHandling(async () => {
    const limited = rateLimited(request);
    if (limited) return limited;
    const { gameId } = practiceGameId();
    return ok({ gameId, wordLength: WORD_LENGTH, maxGuesses: MAX_GUESSES });
  });
}

export function OPTIONS(): Response {
  return preflight();
}
