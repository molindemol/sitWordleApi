import { afterEach, describe, expect, test, vi } from "vitest";
import { dailyGameId, dailyIndex, parseGameId, practiceGameId, signGameId, wordForPayload } from "@/lib/game";
import { answerAt, answerCount } from "@/lib/words";

const SECRET = "test-secret";

describe("dailyIndex", () => {
  test("is deterministic for the same date and secret", () => {
    expect(dailyIndex("2026-09-11", SECRET)).toBe(dailyIndex("2026-09-11", SECRET));
  });

  test("changes with the date and with the secret", () => {
    expect(dailyIndex("2026-09-11", SECRET)).not.toBe(dailyIndex("2026-09-12", SECRET));
    expect(dailyIndex("2026-09-11", SECRET)).not.toBe(dailyIndex("2026-09-11", "other"));
  });

  test("stays inside the answer list", () => {
    const index = dailyIndex("2026-09-11", SECRET);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(answerCount());
  });
});

describe("game ids", () => {
  afterEach(() => vi.unstubAllEnvs());

  test("sign and parse round-trip for daily and practice payloads", () => {
    const daily = { t: "daily" as const, d: "2026-09-11" };
    const practice = { t: "practice" as const, i: 42, n: "abc" };
    expect(parseGameId(signGameId(daily, SECRET), SECRET)).toEqual(daily);
    expect(parseGameId(signGameId(practice, SECRET), SECRET)).toEqual(practice);
  });

  test("rejects tampered payloads, wrong secrets and garbage", () => {
    const id = signGameId({ t: "practice", i: 1, n: "x" }, SECRET);
    const [payload, signature] = id.split(".");
    const forged = `${Buffer.from(JSON.stringify({ t: "practice", i: 2, n: "x" })).toString("base64url")}.${signature}`;
    expect(parseGameId(forged, SECRET)).toBeNull();
    expect(parseGameId(id, "other")).toBeNull();
    expect(parseGameId("garbage", SECRET)).toBeNull();
    expect(parseGameId(`${payload}.`, SECRET)).toBeNull();
    expect(parseGameId("", SECRET)).toBeNull();
  });

  test("rejects a correctly signed payload with the wrong shape", () => {
    const weird = signGameId({ t: "practice", i: -1, n: "x" }, SECRET);
    expect(parseGameId(weird, SECRET)).toBeNull();
  });

  test("dailyGameId resolves to the daily word, practiceGameId to its own index", () => {
    const dailyId = dailyGameId("2026-09-11", SECRET);
    const payload = parseGameId(dailyId, SECRET);
    expect(payload).not.toBeNull();
    expect(wordForPayload(payload!, SECRET)).toBe(answerAt(dailyIndex("2026-09-11", SECRET)));

    const { gameId, index } = practiceGameId(SECRET);
    expect(wordForPayload(parseGameId(gameId, SECRET)!, SECRET)).toBe(answerAt(index));
  });

  test("uses GAME_SECRET from the environment by default", () => {
    vi.stubEnv("GAME_SECRET", SECRET);
    expect(parseGameId(signGameId({ t: "daily", d: "2026-09-11" }), SECRET)).toEqual({ t: "daily", d: "2026-09-11" });
  });
});
