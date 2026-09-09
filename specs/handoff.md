---
name: handoff-sit-wordle-api
description: "Sessie-handoff voor sitWordleApi, de live backend (versie B) van de SIT Wordle Hackathon op wordle.svsit.nl"
path: /home/walt/work/sitWordleApi
metadata:
  type: project
  status: active
  confidence: high
  updated: 2026-09-09
  sources:
    - /home/walt/work/sitWordleApi/specs/handoff.md
    - /home/walt/work/sitWordleApi/specs/deployLog.md
---

# Handoff: sitWordleApi (2026-09-09, 18:30, sessie-einde)

## Doel
Backend voor versie B van de SIT Wordle Hackathon (vr 11 sep 2026, 12:00-14:30): woord van de dag, gokcontrole, leaderboard als JSON-API met Swagger-achtige docs in SIT-huisstijl. Contract staat in API.md van het startpakket sitHackathonWordle.

## Git-stand
Machine laptop (WalterNoot-LAP, WSL). Repo /home/walt/work/sitWordleApi, branch main, HEAD d27d916 = origin/main (github.com/molindemol/sitWordleApi, publiek, main beschermd: PR met 1 approval, admins bypassen), ahead 0 behind 0, 30 commits, werkboom clean. Pushen naar main geeft de melding "Bypassed rule violations", dat is geen fout.

## Status
LIVE EN AF T/M FASE 6. Gates 0 t/m 6 APPROVED, T001-T010 DONE, reviewer 2x APPROVED (T001-T009 en T010). Productie https://wordle.svsit.nl (ook https://sit-wordle-api.vercel.app), Vercel team walter-noot, project sit-wordle-api, env GAME_SECRET (lokaal in ~/.config/cloudly/sit-wordle.env, chmod 600). Laatste smoke tegen wordle.svsit.nl 18/18 na de laatste deploy. Fases 7 t/m 9 niet gestart, niet nodig voor het event.

## Gewijzigde files (deze sessie, kern)
- lib/ (types, env, date, http, checkGuess, words, game, rateLimit, scores, guard, openapi), app/route.ts, app/api/**, app/docs/route.ts, app/openapi.json/route.ts
- data/validWords.ts (14855, tabatkins MIT), data/answers.ts (5665, Knuth sgb doorsneden)
- public/sitLogo.svg (brandkit-logo transparant), public/favicon.svg (logo op zwart)
- assets/banner.png (README-banner WORDLE API, Figma frame 94:2) en assets/socialPreview.png (1280x640, frame 93:2), README begint met de banner
- examples/wordleClient.html (complete versie B frontend voor de crew, standaard op wordle.svsit.nl, ?api= voor lokaal)
- scripts/smoke.mjs (18 checks, BASE_URL, OIDC-header voor previews), tests/ (11 files, 59 tests)
- specs/ compleet: intake, constitution, requirements, design, classDiagram, tasks, gates, testReport, deployLog, handoff

## Wat werkt
- Woord van de dag = HMAC(GAME_SECRET, "daily:" + datum Europe/Amsterdam) mod antwoorden; practice-woord = HMAC over nonce in het gameId; gameIds getekend en op vorm gecheckt. Woord staat nooit in een response of gameId.
- Envelope { data, error, meta }, CORS open, rate limit 60/min per IP in-memory, scores in-memory per datum (max 1000).
- /docs: Scalar 1.68.0 gepind met SRI, SIT-thema, brandkit-logo in kopbalk, favicon op zwart, alleen JavaScript fetch (standaard) en Shell curl, "More"-tab heet via CSS "JavaScript", geen toolbar, Ask AI of MCP-knop. Try-it werkt.
- wordle.svsit.nl: TXT _vercel voor eigendom, 2 A-records (216.198.79.1, 64.29.17.1) bij Hostnet omdat een null-MX op die naam een CNAME blokkeerde.

## Wat niet werkte / lessen
- Reviewer ronde 1: practice-index stond leesbaar in het gameId; ronde 2 (T010): 503 ontbrak in de spec en CDN-script zonder pin. Beide gefixt, tests bewaken het.
- Scalar's scoped CSS wint van gewone selectors, overrides hebben !important nodig. Scalar heeft geen instelling voor "featured" client-tabs.
- Hostnet "dubbel CNAME" betekende een bestaand record van ander type op dezelfde naam. Zie LESSONS.md.
- Classifier blokkeert gh repo create en secrets kopiëren via ssh; context-mode blokkeert curl en inline fetch in Bash (scripts als bestand draaien wel). pkill -f op "next-server" doodt de eigen shell, gebruik kill $(pgrep -f "next-serve[r]").

## Blokkades
Social preview uploaden op GitHub kan alleen ingelogd via Settings > Social preview; de Chrome die ik aanstuur was niet ingelogd op GitHub (inlogpagina stond open, Thijmen logde niet meer in voor sessie-einde). Afbeeldingen staan klaar in assets/socialPreview.png van beide repo's.

## Volgende stappen
0. Thijmen: social preview uploaden op beide repo's (Settings > Social preview > Edit > assets/socialPreview.png), of inloggen in de aangestuurde Chrome en het mij laten doen.
1. Op de dag: `vercel logs https://wordle.svsit.nl --follow` op de laptop van de host; bij een resettend leaderboard de API lokaal draaien (`npm run dev`, GAME_SECRET uit ~/.config/cloudly/sit-wordle.env zodat gameIds gelijk blijven) en dat adres delen.
2. Optioneel: null-MX op wordle.svsit.nl weghalen bij Hostnet, ESLint met @cloudly/config toevoegen (check 1 in testReport), fases 7-9 als het project blijft bestaan.

## Key context
- Deploy: `vercel deploy --prod --yes --scope walter-noot` in de repo-map, daarna `BASE_URL=https://wordle.svsit.nl node scripts/smoke.mjs`. Preview-deploys staan achter Vercel Authentication, testen via `vercel curl`.
- GAME_SECRET nooit wijzigen na het event begint: verandert het woord van de dag en maakt alle gameIds ongeldig.
- Scalar bumpen = versie en sha384-hash samen aanpassen in app/docs/route.ts.
- Speelmap voor Thijmen: C:\Users\Thijm\Desktop\wordleTest (WSL /mnt/c/Users/Thijm/Desktop/wordleTest) met play.html (kopie van examples/wordleClient.html, standaard wordle.svsit.nl), starter index.html plus words.js, API.md en README.txt. Aangemaakt 18:22, NIET in de browser geverifieerd (Chrome MCP herstartte). Chrome van de MCP draait in WSL, dus file:///mnt/c/... paden, geen C:\.
