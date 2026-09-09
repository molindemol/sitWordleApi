import type { Envelope } from "@/lib/types";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function jsonResponse<T>(body: Envelope<T>, status: number, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...CORS_HEADERS, ...extraHeaders },
  });
}

export function ok<T>(data: T, meta: Record<string, unknown> | null = null, status = 200): Response {
  return jsonResponse<T>({ data, error: null, meta }, status);
}

export function fail(error: string, status: number, extraHeaders: Record<string, string> = {}): Response {
  return jsonResponse<never>({ data: null, error, meta: null }, status, extraHeaders);
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first && first.length > 0 ? first : "unknown";
}

/** Route wrapper: logs unexpected errors server-side and returns a clean 500 envelope. */
export async function withErrorHandling(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    console.error("[sit-wordle-api]", error);
    return fail("Something went wrong on our side", 500);
  }
}
