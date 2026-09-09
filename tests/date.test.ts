import { describe, expect, test } from "vitest";
import { todayAmsterdam } from "@/lib/date";

describe("todayAmsterdam", () => {
  test("rolls over to the next day at 00:00 Amsterdam summer time (22:00 UTC)", () => {
    expect(todayAmsterdam(new Date("2026-09-10T22:30:00Z"))).toBe("2026-09-11");
    expect(todayAmsterdam(new Date("2026-09-10T21:30:00Z"))).toBe("2026-09-10");
  });

  test("uses the +1 offset in winter", () => {
    expect(todayAmsterdam(new Date("2026-01-10T23:30:00Z"))).toBe("2026-01-11");
    expect(todayAmsterdam(new Date("2026-01-10T22:30:00Z"))).toBe("2026-01-10");
  });

  test("returns YYYY-MM-DD", () => {
    expect(todayAmsterdam(new Date("2026-09-11T10:00:00Z"))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
