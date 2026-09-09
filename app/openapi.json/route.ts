import { CORS_HEADERS, preflight } from "@/lib/http";
import { openApiSpec } from "@/lib/openapi";

export const dynamic = "force-dynamic";

export function GET(): Response {
  return new Response(JSON.stringify(openApiSpec), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...CORS_HEADERS },
  });
}

export function OPTIONS(): Response {
  return preflight();
}
