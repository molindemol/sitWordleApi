import { describe, expect, test } from "vitest";
import { checkGuess } from "@/lib/checkGuess";

describe("checkGuess (two passes, like real Wordle)", () => {
  test("marks the whole row correct on the right word", () => {
    expect(checkGuess("paars", "paars")).toEqual(["correct", "correct", "correct", "correct", "correct"]);
  });

  test("double letter in the guess only gets one present when the answer has the letter once", () => {
    expect(checkGuess("appel", "paars")).toEqual(["present", "present", "absent", "absent", "absent"]);
  });

  test("handles doubles on both sides", () => {
    expect(checkGuess("aabbb", "abbba")).toEqual(["correct", "present", "correct", "correct", "present"]);
  });

  test("green letters are removed before yellow ones are counted", () => {
    expect(checkGuess("eerie", "there")).toEqual(["present", "absent", "present", "absent", "correct"]);
  });

  test("is case-insensitive", () => {
    expect(checkGuess("APPLE", "apple")).toEqual(["correct", "correct", "correct", "correct", "correct"]);
  });

  test("throws when the lengths differ", () => {
    expect(() => checkGuess("app", "apple")).toThrow();
  });
});
