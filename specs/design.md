# Design: SIT Wordle API

## Architectuur
Next.js 15 App Router, alleen route handlers (Node runtime), TypeScript strict. Geen pagina's, geen UI, geen database. Deploy op Vercel als serverless functions. Scores in een in-memory store per serverproces.

```
Client (index.html, fetch) --> /api/* route handlers --> lib/* (pure functies) --> in-memory scores
```

Figma, designSystem.md, animations.md en componentMap.md: n.v.t. (headless JSON-API).

## Stateless spel
- Woord van de dag: `index = HMAC_SHA256(GAME_SECRET, "daily:" + date) mod answers.length`. Date = YYYY-MM-DD in Europe/Amsterdam.
- gameId = base64url(JSON payload) + "." + base64url(HMAC_SHA256(GAME_SECRET, payloadB64)).
  - daily payload: `{ "t": "daily", "d": "2026-09-11" }`
  - practice payload: `{ "t": "practice", "n": <random nonce> }`, index = `HMAC_SHA256(GAME_SECRET, "practice:" + nonce) mod answers.length`. De index staat dus nooit in het gameId (reviewer-bevinding 9 sep).
- Guess-route verifieert de handtekening (timing-safe), leest het payload en herleidt het woord. Onbekend of vervalst gameId: 404.

## Gokcontrole (twee passen)
1. Pass 1: gelijk op dezelfde plek = correct, streep die letter uit een kopie van het antwoord.
2. Pass 2: voor elke niet-correcte letter: zit hij nog in de kopie, dan present en wegstrepen, anders absent.
Voorbeeld: guess "appel" op "paars" geeft [present, present, absent, absent, absent].

## Endpoints

| Method | Path | Request | data | Fouten |
|---|---|---|---|---|
| GET | / | - | { name, endpoints[], docs } | - |
| GET | /api/game/today | - | { gameId, date, wordLength, maxGuesses } | - |
| POST | /api/game/{gameId}/guess | { guess: string } | { valid, result: LetterStatus[] or null, solved } | 400 body/guess, 404 gameId |
| GET | /api/words/check?word= | query word | { valid } | 400 word ontbreekt |
| POST | /api/scores | { teamName, guesses, timeMs } | { rank } | 400 validatie |
| GET | /api/scores/today | - | [{ teamName, guesses, timeMs }] (max 10) | - |
| POST | /api/practice | - | { gameId, wordLength, maxGuesses } | - |
| OPTIONS | alle | - | leeg 204 met CORS headers | - |

Envelope: `{ data, error, meta }`. meta is null behalve bij scores/today: `{ total, date }`.

## Types (lib/types.ts)
```ts
type LetterStatus = "correct" | "present" | "absent";
type GamePayload = { t: "daily"; d: string } | { t: "practice"; i: number; n: string };
type Envelope<T> = { data: T | null; error: string | null; meta: Record<string, unknown> | null };
type ScoreInput = { teamName: string; guesses: number; timeMs: number };
type ScoreEntry = ScoreInput & { gameDate: string; createdAt: number };
```

## Modules
- lib/env.ts: leest GAME_SECRET (verplicht, duidelijke fout als hij mist).
- lib/http.ts: `ok(data, meta?)`, `fail(error, status)`, CORS headers, `preflight()`, `readJson(request)`, `clientIp(request)`.
- lib/date.ts: `todayAmsterdam(now = new Date())`.
- lib/words.ts: `isValidWord`, `answerAt(index)`, `answerCount`, `randomAnswerIndex`.
- lib/game.ts: `dailyIndex(date)`, `signGameId(payload)`, `parseGameId(id)`, `wordForPayload`.
- lib/checkGuess.ts: `checkGuess(guess, answer): LetterStatus[]`.
- lib/rateLimit.ts: `checkRateLimit(ip, now)` sliding window 60/min, Map per instantie.
- lib/scores.ts: `createScoreStore()` (Map per datum, max 1000 per dag), `rankFor(entries, input)`, `topTen(entries)`, `validateScoreInput`.
- data/validWords.ts, data/answers.ts: gegenereerde arrays.

## Class diagram (specs/classDiagram.md)
Zie classDiagram.md.

## API-docs (T010)
- lib/openapi.ts: de OpenAPI 3.1 spec als TypeScript-object (info, servers met de live URL, 6 endpoints plus root, schema's Envelope, LetterStatus, GameInfo, GuessResult, Score). Eén bron, geen generator.
- app/openapi.json/route.ts: GET geeft de spec als application/json met CORS.
- app/docs/route.ts: GET geeft een HTML-pagina in SIT-huisstijl (Thijmen 9 sep: "maak het sit design achtige swagger page voor endpoints"): vaste kopbalk met het echte SIT-logo "On Dark" uit de Figma brandkit (public/sitLogo.svg, geexporteerd uit de banner-groep 85:2 in het promo-bestand, achtergrondvlakken gestript; ook favicon), op verzoek Thijmen 9 sep in plaats van een CSS-woordmerk, titel in Big Shoulders Display, JetBrains Mono voor de rest, achtergrond #09090B. Daaronder Scalar API Reference (CDN) op /openapi.json met een custom CSS-thema in dezelfde kleuren (accent goud, radius 4px, geen client-knop). Scalar rendert OpenAPI net als Swagger UI maar strakker en met een werkende try-it. Codevoorbeelden alleen JavaScript fetch (standaard) en Shell curl, alle andere talen verborgen (Thijmen 9 sep: studenten gebruiken geen Ruby). Fonts via Google Fonts, geen system fonts.
- GET / verwijst in `docs` naar /docs.

## State
Module-level singletons voor scoreStore en rateLimit. Per Vercel-instantie apart, verdwijnen bij cold start. Gedocumenteerd in README.

## Error handling
Elke route: try/catch rond alles, onbekende fout wordt `fail("Something went wrong on our side", 500)` en `console.error` server-side. Validatiefouten geven een concrete zin: "guess must be exactly 5 letters a-z".

## Caching
Geen. `export const dynamic = "force-dynamic"` op elke route zodat Vercel niets cachet.

## Rate limit
Sliding window per IP (x-forwarded-for eerste waarde) in een Map. 60 per 60 s. Bij overschrijding 429 met `Retry-After`.
