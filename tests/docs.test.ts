import { beforeAll, describe, expect, test, vi } from "vitest";
import { GET as getDocs } from "@/app/docs/route";
import { GET as getSpec } from "@/app/openapi.json/route";
import { GET as getRoot } from "@/app/route";
import { openApiSpec } from "@/lib/openapi";

const EXPECTED_PATHS = ["/", "/api/game/today", "/api/game/{gameId}/guess", "/api/words/check", "/api/scores", "/api/scores/today", "/api/practice"];

beforeAll(() => vi.stubEnv("GAME_SECRET", "docs-test-secret"));

describe("OpenAPI spec", () => {
  test("is OpenAPI 3.1 with exactly the contract paths", () => {
    expect(openApiSpec.openapi).toMatch(/^3\.1\./);
    expect(Object.keys(openApiSpec.paths).sort()).toEqual([...EXPECTED_PATHS].sort());
  });

  test("every operation documents a 200 response with the envelope", () => {
    for (const [path, methods] of Object.entries(openApiSpec.paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        expect(operation.summary, `${method} ${path}`).toBeTruthy();
        const ok = operation.responses["200"];
        expect(ok, `${method} ${path} has no 200`).toBeTruthy();
        const schema = ok!.content["application/json"].schema;
        expect(JSON.stringify(schema)).toContain("Envelope");
      }
    }
  });

  test("documents the full leaderboard 503 on POST /api/scores", () => {
    expect(openApiSpec.paths["/api/scores"]?.post?.responses["503"]).toBeTruthy();
  });

  test("pins the Scalar script with an integrity hash", async () => {
    const html = await (await getDocs()).text();
    expect(html).toMatch(/@scalar\/api-reference@\d+\.\d+\.\d+"/);
    expect(html).toContain('integrity="sha384-');
    expect(html).toContain('crossorigin="anonymous"');
  });

  test("lists the live server", () => {
    expect(openApiSpec.servers.map((s) => s.url)).toContain("https://sit-wordle-api.vercel.app");
  });
});

describe("GET /openapi.json and GET /docs", () => {
  test("serves the spec as JSON with CORS", async () => {
    const response = await getSpec();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    const body = await response.json();
    expect(body.openapi).toBe(openApiSpec.openapi);
  });

  test("serves an HTML page that loads /openapi.json", async () => {
    const response = await getDocs();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    const html = await response.text();
    expect(html).toContain("/openapi.json");
    expect(html).toContain("<script");
    expect(html).toContain("SIT Wordle API");
    expect(html).toContain("Big Shoulders Display");
    expect(html).toContain("JetBrains Mono");
  });

  test("root points to /docs", async () => {
    const body = await (await getRoot()).json();
    expect(body.data.docs).toBe("/docs");
  });
});
