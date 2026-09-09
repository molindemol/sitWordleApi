import { ok, preflight, withErrorHandling } from "@/lib/http";

export const dynamic = "force-dynamic";

const ENDPOINTS = [
  { method: "GET", path: "/api/game/today", does: "today's game without the word" },
  { method: "POST", path: "/api/game/{gameId}/guess", does: "check a guess, body { guess }" },
  { method: "GET", path: "/api/words/check?word=apple", does: "is this a real word" },
  { method: "POST", path: "/api/scores", does: "save a score, body { teamName, guesses, timeMs }" },
  { method: "GET", path: "/api/scores/today", does: "top 10 of today" },
  { method: "POST", path: "/api/practice", does: "start a practice game with a random word" },
];

export function GET(): Promise<Response> {
  return withErrorHandling(async () =>
    ok({
      name: "SIT Wordle API",
      endpoints: ENDPOINTS,
      docs: "/docs",
      starterKit: "https://github.com/molindemol/sitHackathonWordle",
    }),
  );
}

export function OPTIONS(): Response {
  return preflight();
}
