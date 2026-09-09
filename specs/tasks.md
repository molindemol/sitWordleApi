# Tasks: SIT Wordle API

Elke taak max 30 min. Status: TODO, DOING, DONE, BLOCKED.

## Setup
- [x] T001 Projectscaffold. package.json (next, react, react-dom, typescript, vitest), tsconfig strict, next.config.ts, vitest.config.ts, .gitignore, .env.example, data/validWords.ts en data/answers.ts gegenereerd uit de woordlijsten. AC: `npm install` slaagt, `npx tsc --noEmit` 0 errors op de lege scaffold, data-files exporteren arrays van 14.855 en 5.665 woorden. _Boundary: root config, data/_ _Depends: -_ 15 min.

## Core
- [x] T002 Basis-lib: lib/types.ts, lib/env.ts (GAME_SECRET), lib/date.ts (todayAmsterdam), lib/http.ts (envelope, CORS, preflight, readJson, clientIp). AC: tests voor todayAmsterdam rond middernacht (UTC 22:30 op 10 sep = 11 sep in Amsterdam), ok/fail geven envelope plus CORS headers, readJson geeft null bij kapotte JSON, env throw zonder GAME_SECRET. _Boundary: lib/types.ts, lib/env.ts, lib/date.ts, lib/http.ts, tests/_ _Depends: T001_ 25 min.
- [x] T003 lib/checkGuess.ts twee-passen. AC (TDD, RED eerst): "appel" op "paars" geeft [present, present, absent, absent, absent]; "paars" op "paars" alles correct; "aabbb" op "abbba" klopt; "eerie" op "there"; uppercase input wordt lowercased. _Boundary: lib/checkGuess.ts, tests/_ _Depends: T001_ 20 min.
- [x] T004 lib/words.ts en lib/game.ts. AC: isValidWord true voor "apple", false voor "aaaaa" en "app"; dailyIndex deterministisch voor dezelfde datum plus secret en anders voor andere datum; signGameId en parseGameId round-trip; gewijzigd payload of handtekening geeft null; wordForPayload daily geeft answerAt(dailyIndex). _Boundary: lib/words.ts, lib/game.ts, tests/_ _Depends: T002_ 30 min.
- [x] T005 lib/rateLimit.ts en lib/scores.ts. AC: 60 calls ok, 61e binnen 60 s geweigerd met retryAfter, na 60 s weer ok; validateScoreInput weigert lege of te lange teamName, guesses buiten 1..6, negatieve timeMs; rankFor geeft 1 voor beste, ties op guesses beslist timeMs; topTen sorteert en kapt af; store max 1000 per datum. _Boundary: lib/rateLimit.ts, lib/scores.ts, tests/_ _Depends: T002_ 30 min.

## Routes
- [x] T006 Spelroutes: app/api/game/today, app/api/practice, app/api/words/check, app/api/game/[gameId]/guess (plus OPTIONS). AC: handler-tests met Request-objecten: today geeft gameId dat parseGameId accepteert; guess met geldig gameId en "apple" geeft valid true en 5 statussen; ongeldig woord geeft valid true false en result null met 200; vervalst gameId 404; body zonder guess 400; words/check zonder word 400; alle responses hebben Access-Control-Allow-Origin *. _Boundary: app/api/game/**, app/api/practice/**, app/api/words/**, tests/_ _Depends: T003, T004, T005_ 30 min.
- [x] T007 Scoreroutes en root: app/api/scores, app/api/scores/today, app/route.ts. AC: POST geldig geeft rank 1 daarna 2 voor slechtere score; GET today geeft max 10 gesorteerd met meta.total; ongeldige body 400; GET / lijst endpoints. Rate limit op alle api-routes via 1 helper, 429 getest. _Boundary: app/api/scores/**, app/route.ts, lib/http.ts (guard helper), tests/_ _Depends: T005, T006_ 30 min.

## Content en deploy-klaar
- [x] T008 README (Engels, zelfde stijl als sitHackathonWordle: wat het is, endpoints, lokaal draaien, Vercel deploy met GAME_SECRET, beperking in-memory scores, lokaal draaien op de dag), scripts/smoke.mjs die alle endpoints tegen een draaiende server aanroept en faalt bij afwijking van het contract. AC: smoke groen tegen `next dev`. _Boundary: README.md, scripts/_ _Depends: T007_ 25 min.

## Test
- [x] T009 Testfase: tsc, vitest met coverage, next build, smoke tegen `next start`, review-verdict door verse reviewer. Output specs/testReport.md. _Boundary: specs/testReport.md_ _Depends: T008_ 30 min.

## Implementation Notes
(vullen tijdens het werk)
- T001: `next build` herschrijft tsconfig.json (jsx react-jsx, include .next/dev/types). Geaccepteerd en gecommit, anders past Next het bij elke build opnieuw aan.
- T003: RED bewezen met "Cannot find package @/lib/checkGuess" voor alle 8 lib-testbestanden, daarna 39 groen. Routes: RED met 2 falende bestanden, daarna 51 groen.
- T004: gameId-payload wordt na de handtekening ook op vorm gecheckt (index binnen de antwoordenlijst), anders kan een geldig getekende maar rare payload answerAt laten throwen.
- T007: rate limit zit als 1 helper (lib/guard.ts) in elke api-route, niet in middleware, zodat de 429 ook de envelope en CORS headers heeft.
- T008: smoke.mjs draait tegen elke BASE_URL, ook straks tegen Vercel.
- T009: reviewer vond het practice-index lek dat de unit-tests misten (tests checkten handtekening, niet de leesbaarheid van het payload). Les: bij getekende tokens altijd een test die het payload decodeert en de velden opsomt.
