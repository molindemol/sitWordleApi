import { beforeAll, describe, expect, test, vi } from "vitest";
import { GET as getToday, OPTIONS as optionsToday } from "@/app/api/game/today/route";
import { POST as postGuess } from "@/app/api/game/[gameId]/guess/route";
import { POST as postPractice } from "@/app/api/practice/route";
import { GET as getWordCheck } from "@/app/api/words/check/route";
import { parseGameId, wordForPayload } from "@/lib/game";

const SECRET = "route-test-secret";
let ipCounter = 0;
const req = (url: string, init: RequestInit = {}) =>
  new Request(`http://localhost${url}`, { ...init, headers: { "x-forwarded-for": `10.0.0.${(ipCounter += 1)}`, "content-type": "application/json", ...(init.headers ?? {}) } });
const guessCtx = (gameId: string) => ({ params: Promise.resolve({ gameId }) });

beforeAll(() => vi.stubEnv("GAME_SECRET", SECRET));

describe("GET /api/game/today", () => {
  test("returns a signed daily gameId without the word", async () => {
    const response = await getToday(req("/api/game/today"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(body.error).toBeNull();
    expect(body.data.wordLength).toBe(5);
    expect(body.data.maxGuesses).toBe(6);
    expect(body.data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(JSON.stringify(body)).not.toContain("word\":");
    const payload = parseGameId(body.data.gameId, SECRET);
    expect(payload).toEqual({ t: "daily", d: body.data.date });
  });

  test("OPTIONS preflight works", () => {
    expect(optionsToday().status).toBe(204);
  });
});

describe("POST /api/practice", () => {
  test("returns a practice gameId that resolves to a word", async () => {
    const body = await (await postPractice(req("/api/practice", { method: "POST" }))).json();
    const payload = parseGameId(body.data.gameId, SECRET);
    expect(payload?.t).toBe("practice");
    expect(wordForPayload(payload!, SECRET)).toMatch(/^[a-z]{5}$/);
    expect(body.data).toEqual({ gameId: body.data.gameId, wordLength: 5, maxGuesses: 6 });
  });
});

describe("POST /api/game/{gameId}/guess", () => {
  async function practiceGame() {
    const body = await (await postPractice(req("/api/practice", { method: "POST" }))).json();
    const gameId: string = body.data.gameId;
    return { gameId, word: wordForPayload(parseGameId(gameId, SECRET)!, SECRET) };
  }

  test("colours a valid guess and reports solved on the right word", async () => {
    const { gameId, word } = await practiceGame();
    const wrong = await (await postGuess(req(`/api/game/${gameId}/guess`, { method: "POST", body: JSON.stringify({ guess: "apple" }) }), guessCtx(gameId))).json();
    expect(wrong.data.valid).toBe(true);
    expect(wrong.data.result).toHaveLength(5);
    expect(wrong.data.solved).toBe(word === "apple");

    const right = await (await postGuess(req(`/api/game/${gameId}/guess`, { method: "POST", body: JSON.stringify({ guess: word.toUpperCase() }) }), guessCtx(gameId))).json();
    expect(right.data).toEqual({ valid: true, result: ["correct", "correct", "correct", "correct", "correct"], solved: true });
  });

  test("a word that is not in the list is valid false with result null, still HTTP 200", async () => {
    const { gameId } = await practiceGame();
    const response = await postGuess(req(`/api/game/${gameId}/guess`, { method: "POST", body: JSON.stringify({ guess: "aaaaa" }) }), guessCtx(gameId));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { valid: false, result: null, solved: false }, error: null, meta: null });
  });

  test("rejects a missing or malformed guess with 400", async () => {
    const { gameId } = await practiceGame();
    const noGuess = await postGuess(req(`/api/game/${gameId}/guess`, { method: "POST", body: JSON.stringify({}) }), guessCtx(gameId));
    expect(noGuess.status).toBe(400);
    expect((await noGuess.json()).error).toMatch(/guess/);
    const tooShort = await postGuess(req(`/api/game/${gameId}/guess`, { method: "POST", body: JSON.stringify({ guess: "app" }) }), guessCtx(gameId));
    expect(tooShort.status).toBe(400);
    const notJson = await postGuess(req(`/api/game/${gameId}/guess`, { method: "POST", body: "nope" }), guessCtx(gameId));
    expect(notJson.status).toBe(400);
  });

  test("rejects a forged or unknown gameId with 404", async () => {
    const response = await postGuess(req("/api/game/forged.id/guess", { method: "POST", body: JSON.stringify({ guess: "apple" }) }), guessCtx("forged.id"));
    expect(response.status).toBe(404);
    expect((await response.json()).error).toMatch(/gameId/);
  });
});

describe("GET /api/words/check", () => {
  test("answers valid true or false and 400 without a word", async () => {
    expect((await (await getWordCheck(req("/api/words/check?word=apple"))).json()).data).toEqual({ valid: true });
    expect((await (await getWordCheck(req("/api/words/check?word=aaaaa"))).json()).data).toEqual({ valid: false });
    expect((await getWordCheck(req("/api/words/check"))).status).toBe(400);
  });
});
