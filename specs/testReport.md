# Test Report: SIT Wordle API

Datum: 2026-09-09. Machine: laptop (WalterNoot-LAP, WSL, Node 24.16, Next 16.3.4, Vitest 5.0.0). Commit: 3af2b6e.

## De 12 checks

| # | Check | Resultaat | Bewijs |
|---|-------|-----------|--------|
| 1 | Lint + anti-slop | n.v.t. geconfigureerd, handmatig | Geen emoji, geen UI, camelCase files, geen any. ESLint niet opgezet: headless API zonder frontend, TypeScript strict dekt de rest. Bewuste keuze, zie opmerking onderaan |
| 2 | Types | GROEN | `npx tsc --noEmit` 0 errors (strict, noUncheckedIndexedAccess) |
| 3 | Unit tests | GROEN | `vitest run --coverage`: 10 files, 51 tests, statements 88,47 procent, branches 89,7, functions 87,09, lines 92,26 |
| 4 | E2E | GROEN | `scripts/smoke.mjs` tegen `next start -p 3100`: 16/16 checks, plus 61 requests van 1 IP: 60 keer 200, 1 keer 429 |
| 5 | Build | GROEN | `next build`: Compiled successfully, 7 dynamic routes (ƒ), geen warnings |
| 6 | Lighthouse + SEO | n.v.t. | Geen HTML-pagina's |
| 7 | Security | GROEN | Reviewer adversarieel: daily gameId niet te vervalsen (HMAC, timingSafeEqual), geen crash-pad gevonden met kapotte JSON of verkeerde types, geen woord in response of error. Gevonden lek (practice-index leesbaar in het payload) gefixt in 3af2b6e, unit-test bewaakt het. Secrets alleen in env, .env.local gitignored. Geen npm audit gedraaid (geen network in sandbox voor audit), dependencies alleen next, react, vitest |
| 8 | Accessibility | n.v.t. | Geen UI |
| 9 | Bundle size | n.v.t. | Server-only route handlers, geen client bundle |
| 10 | Mobile | n.v.t. | Geen UI |
| 11 | Error scenarios | GROEN | Getest: kapotte JSON (400), ontbrekend veld (400), te kort woord (400), niet-bestaand woord (200 met valid false), vervalst gameId (404), ontbrekende query (400), rate limit (429 met Retry-After), lege leaderboard (lege array met total 0), volle dag (503, unit) |
| 12 | i18n | n.v.t. | Engelse API-teksten, 1 taal bewust |

## Review
- Ronde 1 (verse feature-dev:code-reviewer): CHANGES_REQUESTED, 1 issue (practice gameId droeg de antwoordindex in leesbare base64, samen met de publieke answers.ts is dat het woord). Alle andere adversariële pogingen hielden stand.
- Fix: practice-index volgt nu uit HMAC(secret, "practice:" + nonce), payload bevat alleen t en n. Test toegevoegd die het payload decodeert en de keys controleert.
- Ronde 2: zie onderaan (her-verdict van dezelfde reviewer).

## Opmerkingen
- Check 1: ESLint met @cloudly/config staat niet in dit project. Reden: 2 dagen tot het event, geen frontend, en tsc strict plus de reviewer dekten de codekwaliteit. Bij een volgende ronde toevoegen.
- Coverage onder 100 op app/api/practice en app/api/scores komt door de rate-limit en 503 takken in de routes die alleen op lib-niveau getest zijn.

## Her-verdict ronde 2
Reviewer herspeelde de exploit (practice gameId decoderen zonder secret): payload bevat nu alleen t en n, index alleen te herleiden met HMAC(secret, "practice:" + n). Verdict:

```
VERDICT: APPROVED
BOUNDARY_VIOLATIONS: none
RED_PHASE_VERIFIED: yes
ISSUES: none
```

Doc-nit (randomAnswerIndex nog in classDiagram.md) direct opgeruimd.

## Addendum T010 (docs, 9 sep 17:30)
- tsc 0 errors, vitest 59/59 (nieuwe tests: spec 3.1 met 7 paths, 200 met envelope per operation, 503 op scores, live server, /openapi.json JSON met CORS, /docs HTML met fonts, gepind Scalar-script met SRI), next build schoon (routes /docs en /openapi.json).
- Smoke uitgebreid met /openapi.json en /docs: lokaal 18/18, productie https://sit-wordle-api.vercel.app 18/18.
- Chrome op next start: SIT-kop gerenderd, sidebar 7 operaties, geen console-fouten (favicon inline zodat de 404 weg is), gepind script geladen met integrity, try-it op GET /api/game/today gaf 200 met gameId en wordLength.
- Reviewer: ronde 1 CHANGES_REQUESTED (2 issues), ronde 2 APPROVED.
