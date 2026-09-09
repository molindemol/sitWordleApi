import { describe, expect, test } from "vitest";
import { createScoreStore, rankFor, topTen, validateScoreInput } from "@/lib/scores";
import type { ScoreEntry } from "@/lib/types";

const entry = (teamName: string, guesses: number, timeMs: number, createdAt = 0): ScoreEntry => ({
  teamName,
  guesses,
  timeMs,
  gameDate: "2026-09-11",
  createdAt,
});

describe("validateScoreInput", () => {
  test("accepts a clean body and trims the team name", () => {
    const result = validateScoreInput({ teamName: "  Team A ", guesses: 3, timeMs: 12000 });
    expect(result).toEqual({ ok: true, value: { teamName: "Team A", guesses: 3, timeMs: 12000 } });
  });

  test("rejects missing, empty or too long team names", () => {
    expect(validateScoreInput({ guesses: 3, timeMs: 1 }).ok).toBe(false);
    expect(validateScoreInput({ teamName: "   ", guesses: 3, timeMs: 1 }).ok).toBe(false);
    expect(validateScoreInput({ teamName: "x".repeat(41), guesses: 3, timeMs: 1 }).ok).toBe(false);
  });

  test("rejects guesses outside 1..6 and negative or non-integer times", () => {
    expect(validateScoreInput({ teamName: "a", guesses: 0, timeMs: 1 }).ok).toBe(false);
    expect(validateScoreInput({ teamName: "a", guesses: 7, timeMs: 1 }).ok).toBe(false);
    expect(validateScoreInput({ teamName: "a", guesses: 2.5, timeMs: 1 }).ok).toBe(false);
    expect(validateScoreInput({ teamName: "a", guesses: 3, timeMs: -1 }).ok).toBe(false);
    expect(validateScoreInput({ teamName: "a", guesses: 3, timeMs: "fast" }).ok).toBe(false);
    expect(validateScoreInput(null).ok).toBe(false);
  });

  test("error messages name the field", () => {
    const result = validateScoreInput({ teamName: "a", guesses: 9, timeMs: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/guesses/);
  });
});

describe("ranking", () => {
  const board = [entry("slow", 3, 90_000), entry("fast", 3, 30_000), entry("lucky", 1, 200_000), entry("meh", 6, 1_000)];

  test("rankFor counts fewer guesses first, then faster time", () => {
    expect(rankFor(board, entry("lucky", 1, 200_000))).toBe(1);
    expect(rankFor(board, entry("fast", 3, 30_000))).toBe(2);
    expect(rankFor(board, entry("slow", 3, 90_000))).toBe(3);
    expect(rankFor(board, entry("meh", 6, 1_000))).toBe(4);
  });

  test("topTen sorts and caps at 10 without internal fields", () => {
    const many = Array.from({ length: 15 }, (_, i) => entry(`t${i}`, 6 - (i % 6), i * 10));
    const top = topTen(many);
    expect(top).toHaveLength(10);
    expect(top[0]?.guesses).toBe(1);
    expect(Object.keys(top[0] ?? {})).toEqual(["teamName", "guesses", "timeMs"]);
  });
});

describe("score store", () => {
  test("keeps entries per date and caps the size", () => {
    const store = createScoreStore(2);
    expect(store.add(entry("a", 3, 1))).toBe(true);
    expect(store.add(entry("b", 3, 1))).toBe(true);
    expect(store.add(entry("c", 3, 1))).toBe(false);
    expect(store.listForDate("2026-09-11")).toHaveLength(2);
    expect(store.listForDate("2026-09-12")).toHaveLength(0);
  });
});
