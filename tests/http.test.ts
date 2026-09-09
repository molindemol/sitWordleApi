import { describe, expect, test } from "vitest";
import { clientIp, fail, ok, preflight, readJson } from "@/lib/http";

describe("http helpers", () => {
  test("ok wraps data in the envelope with CORS headers", async () => {
    const response = ok({ hello: "world" });
    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(await response.json()).toEqual({ data: { hello: "world" }, error: null, meta: null });
  });

  test("ok passes meta through", async () => {
    const body = await ok([1, 2], { total: 2 }).json();
    expect(body.meta).toEqual({ total: 2 });
  });

  test("fail sets data null, the error string and the status", async () => {
    const response = fail("guess must be exactly 5 letters a-z", 400);
    expect(response.status).toBe(400);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(await response.json()).toEqual({ data: null, error: "guess must be exactly 5 letters a-z", meta: null });
  });

  test("fail accepts extra headers such as Retry-After", () => {
    const response = fail("too many requests", 429, { "Retry-After": "12" });
    expect(response.headers.get("Retry-After")).toBe("12");
  });

  test("preflight answers 204 with the CORS methods", () => {
    const response = preflight();
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("POST");
    expect(response.headers.get("Access-Control-Allow-Headers")).toContain("Content-Type");
  });

  test("readJson returns the parsed object or null on broken JSON", async () => {
    const good = new Request("http://x/api", { method: "POST", body: JSON.stringify({ guess: "apple" }) });
    const bad = new Request("http://x/api", { method: "POST", body: "{not json" });
    expect(await readJson(good)).toEqual({ guess: "apple" });
    expect(await readJson(bad)).toBeNull();
  });

  test("clientIp takes the first x-forwarded-for entry and falls back to unknown", () => {
    const withHeader = new Request("http://x/", { headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } });
    expect(clientIp(withHeader)).toBe("1.2.3.4");
    expect(clientIp(new Request("http://x/"))).toBe("unknown");
  });
});
