import { isRecord } from "@/lib/http";
import { MAX_GUESSES, MAX_TEAM_NAME_LENGTH, type ScoreEntry, type ScoreInput } from "@/lib/types";

export type ScoreValidation = { ok: true; value: ScoreInput } | { ok: false; error: string };

export function validateScoreInput(body: unknown): ScoreValidation {
  if (!isRecord(body)) return { ok: false, error: "body must be a JSON object with teamName, guesses and timeMs" };
  const teamName = typeof body.teamName === "string" ? body.teamName.trim() : "";
  if (teamName.length === 0) return { ok: false, error: "teamName is required" };
  if (teamName.length > MAX_TEAM_NAME_LENGTH) return { ok: false, error: `teamName must be at most ${MAX_TEAM_NAME_LENGTH} characters` };
  const { guesses, timeMs } = body;
  if (!Number.isInteger(guesses) || (guesses as number) < 1 || (guesses as number) > MAX_GUESSES) {
    return { ok: false, error: `guesses must be a whole number from 1 to ${MAX_GUESSES}` };
  }
  if (!Number.isInteger(timeMs) || (timeMs as number) < 0) return { ok: false, error: "timeMs must be a whole number of milliseconds, 0 or more" };
  return { ok: true, value: { teamName, guesses: guesses as number, timeMs: timeMs as number } };
}

export function compareScores(a: ScoreEntry, b: ScoreEntry): number {
  return a.guesses - b.guesses || a.timeMs - b.timeMs || a.createdAt - b.createdAt;
}

/** 1-based position: one more than the number of entries that beat this one. */
export function rankFor(entries: readonly ScoreEntry[], entry: ScoreEntry): number {
  const better = entries.filter((other) => other !== entry && compareScores(other, entry) < 0).length;
  return better + 1;
}

export function topTen(entries: readonly ScoreEntry[]): ScoreInput[] {
  return [...entries]
    .sort(compareScores)
    .slice(0, 10)
    .map(({ teamName, guesses, timeMs }) => ({ teamName, guesses, timeMs }));
}

export function createScoreStore(maxPerDate = 1000) {
  const byDate = new Map<string, ScoreEntry[]>();
  return {
    /** Returns false when the day is full; the entry is then dropped. */
    add(entry: ScoreEntry): boolean {
      const list = byDate.get(entry.gameDate) ?? [];
      if (list.length >= maxPerDate) return false;
      byDate.set(entry.gameDate, [...list, entry]);
      return true;
    },
    listForDate(date: string): ScoreEntry[] {
      return byDate.get(date) ?? [];
    },
  };
}

/** One store per server process. Scores live in memory, see README for what that means on Vercel. */
export const scoreStore = createScoreStore();
