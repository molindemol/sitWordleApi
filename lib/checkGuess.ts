import type { LetterStatus } from "@/lib/types";

/**
 * Wordle colouring in two passes: first mark exact matches and strike them from
 * a copy of the answer, then hand out "present" only for letters still left in
 * that copy. This is what makes double letters come out right.
 */
export function checkGuess(guess: string, answer: string): LetterStatus[] {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  if (g.length !== a.length) throw new Error(`guess and answer must have the same length (${g.length} vs ${a.length})`);

  const result: LetterStatus[] = new Array<LetterStatus>(g.length).fill("absent");
  const remaining: (string | null)[] = [...a];

  for (let i = 0; i < g.length; i += 1) {
    if (g[i] === a[i]) {
      result[i] = "correct";
      remaining[i] = null;
    }
  }

  for (let i = 0; i < g.length; i += 1) {
    if (result[i] === "correct") continue;
    const found = remaining.indexOf(g[i] ?? "");
    if (found !== -1) {
      result[i] = "present";
      remaining[found] = null;
    }
  }

  return result;
}
