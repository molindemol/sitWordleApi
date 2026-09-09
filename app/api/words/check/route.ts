import { rateLimited } from "@/lib/guard";
import { fail, ok, preflight, withErrorHandling } from "@/lib/http";
import { isValidWord } from "@/lib/words";

export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return withErrorHandling(async () => {
    const limited = rateLimited(request);
    if (limited) return limited;
    const word = new URL(request.url).searchParams.get("word");
    if (!word) return fail("add ?word=apple to the URL", 400);
    return ok({ valid: isValidWord(word) });
  });
}

export function OPTIONS(): Response {
  return preflight();
}
