import { answers } from "@/data/answers";
import { validWords } from "@/data/validWords";
import { WORD_LENGTH } from "@/lib/types";

const WORD_PATTERN = new RegExp(`^[a-z]{${WORD_LENGTH}}$`);
const VALID = new Set<string>([...validWords, ...answers]);

export function normalizeWord(word: string): string {
  return word.trim().toLowerCase();
}

export function isValidWord(word: string): boolean {
  const normalized = normalizeWord(word);
  return WORD_PATTERN.test(normalized) && VALID.has(normalized);
}

export function answerCount(): number {
  return answers.length;
}

export function answerAt(index: number): string {
  const word = answers[index];
  if (word === undefined) throw new RangeError(`answer index ${index} out of range`);
  return word;
}
