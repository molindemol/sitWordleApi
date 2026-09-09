import { afterEach, describe, expect, test, vi } from "vitest";
import { getGameSecret } from "@/lib/env";

describe("getGameSecret", () => {
  afterEach(() => vi.unstubAllEnvs());

  test("returns the configured secret", () => {
    vi.stubEnv("GAME_SECRET", "s3cret");
    expect(getGameSecret()).toBe("s3cret");
  });

  test("throws a clear error when GAME_SECRET is missing or empty", () => {
    vi.stubEnv("GAME_SECRET", "");
    expect(() => getGameSecret()).toThrow(/GAME_SECRET/);
  });
});
