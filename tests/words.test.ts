import { describe, expect, test } from "vitest";
import { answerAt, answerCount, isValidWord, randomAnswerIndex } from "@/lib/words";

describe("words", () => {
  test("accepts real words in any case and rejects junk", () => {
    expect(isValidWord("apple")).toBe(true);
    expect(isValidWord("APPLE")).toBe(true);
    expect(isValidWord("aaaaa")).toBe(false);
    expect(isValidWord("app")).toBe(false);
    expect(isValidWord("appl3")).toBe(false);
  });

  test("every answer is a valid guess", () => {
    for (let i = 0; i < answerCount(); i += 97) expect(isValidWord(answerAt(i))).toBe(true);
    expect(answerCount()).toBeGreaterThan(5000);
  });

  test("randomAnswerIndex stays in range", () => {
    for (let i = 0; i < 50; i += 1) {
      const index = randomAnswerIndex();
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(answerCount());
    }
  });
});
