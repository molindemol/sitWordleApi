export type LetterStatus = "correct" | "present" | "absent";

export type DailyPayload = { t: "daily"; d: string };
export type PracticePayload = { t: "practice"; n: string };
export type GamePayload = DailyPayload | PracticePayload;

export type Envelope<T> = {
  data: T | null;
  error: string | null;
  meta: Record<string, unknown> | null;
};

export type ScoreInput = { teamName: string; guesses: number; timeMs: number };
export type ScoreEntry = ScoreInput & { gameDate: string; createdAt: number };

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
export const MAX_TEAM_NAME_LENGTH = 40;
