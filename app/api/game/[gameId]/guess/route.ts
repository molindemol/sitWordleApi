import { checkGuess } from "@/lib/checkGuess";
import { parseGameId, wordForPayload } from "@/lib/game";
import { rateLimited } from "@/lib/guard";
import { fail, isRecord, ok, preflight, readJson, withErrorHandling } from "@/lib/http";
import { WORD_LENGTH } from "@/lib/types";
import { isValidWord, normalizeWord } from "@/lib/words";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ gameId: string }> };

const GUESS_PATTERN = new RegExp(`^[a-z]{${WORD_LENGTH}}$`);

export function POST(request: Request, context: Context): Promise<Response> {
  return withErrorHandling(async () => {
    const limited = rateLimited(request);
    if (limited) return limited;

    const { gameId } = await context.params;
    const payload = parseGameId(gameId);
    if (!payload) return fail("unknown gameId, ask /api/game/today or /api/practice for a fresh one", 404);

    const body = await readJson(request);
    if (!isRecord(body) || typeof body.guess !== "string") return fail("body must be JSON like { \"guess\": \"apple\" }", 400);
    const guess = normalizeWord(body.guess);
    if (!GUESS_PATTERN.test(guess)) return fail(`guess must be exactly ${WORD_LENGTH} letters a-z`, 400);

    if (!isValidWord(guess)) return ok({ valid: false, result: null, solved: false });

    const answer = wordForPayload(payload);
    const result = checkGuess(guess, answer);
    return ok({ valid: true, result, solved: result.every((status) => status === "correct") });
  });
}

export function OPTIONS(): Response {
  return preflight();
}
