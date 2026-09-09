import { beforeAll, describe, expect, test, vi } from "vitest";
import { GET as getRoot } from "@/app/route";
import { POST as postScore } from "@/app/api/scores/route";
import { GET as getScoresToday } from "@/app/api/scores/today/route";
import { GET as getToday } from "@/app/api/game/today/route";

let ipCounter = 0;
const req = (url: string, init: RequestInit = {}, ip = `10.1.0.${(ipCounter += 1)}`) =>
  new Request(`http://localhost${url}`, { ...init, headers: { "x-forwarded-for": ip, "content-type": "application/json", ...(init.headers ?? {}) } });

beforeAll(() => vi.stubEnv("GAME_SECRET", "scores-test-secret"));

describe("scores", () => {
  test("POST returns the rank, GET today lists sorted with meta.total", async () => {
    const first = await (await postScore(req("/api/scores", { method: "POST", body: JSON.stringify({ teamName: "Fast", guesses: 3, timeMs: 30000 }) }))).json();
    expect(first).toEqual({ data: { rank: 1 }, error: null, meta: null });
    const second = await (await postScore(req("/api/scores", { method: "POST", body: JSON.stringify({ teamName: "Slow", guesses: 3, timeMs: 90000 }) }))).json();
    expect(second.data.rank).toBe(2);
    const better = await (await postScore(req("/api/scores", { method: "POST", body: JSON.stringify({ teamName: "Lucky", guesses: 2, timeMs: 99999 }) }))).json();
    expect(better.data.rank).toBe(1);

    const response = await getScoresToday(req("/api/scores/today"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.map((s: { teamName: string }) => s.teamName)).toEqual(["Lucky", "Fast", "Slow"]);
    expect(body.meta.total).toBe(3);
    expect(body.meta.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("POST rejects a bad body with 400 and a field name", async () => {
    const response = await postScore(req("/api/scores", { method: "POST", body: JSON.stringify({ teamName: "x", guesses: 9, timeMs: 1 }) }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/guesses/);
  });
});

describe("rate limit", () => {
  test("the 61st request within a minute from one IP gets 429 with Retry-After", async () => {
    const ip = "10.9.9.9";
    for (let i = 0; i < 60; i += 1) expect((await getToday(req("/api/game/today", {}, ip))).status).toBe(200);
    const blocked = await getToday(req("/api/game/today", {}, ip));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
    expect((await blocked.json()).error).toMatch(/too many/i);
  });
});

describe("GET /", () => {
  test("lists the endpoints and the docs link", async () => {
    const body = await (await getRoot()).json();
    expect(body.data.name).toMatch(/Wordle/);
    expect(body.data.endpoints.length).toBeGreaterThanOrEqual(6);
    expect(body.data.docs).toBe("/docs");
    expect(body.data.starterKit).toContain("github.com/molindemol/sitHackathonWordle");
  });
});
