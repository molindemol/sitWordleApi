# Requirements: SIT Wordle API

## User stories (MoSCoW)

### Must
- US01 Als team wil ik GET /api/game/today aanroepen en { gameId, date, wordLength: 5, maxGuesses: 6 } krijgen zonder het woord, zodat iedereen dezelfde puzzel speelt.
- US02 Als team wil ik POST /api/game/{gameId}/guess met { guess } aanroepen en { valid, result, solved } terugkrijgen, waarbij result per letter "correct", "present" of "absent" is en dubbele letters kloppen zoals in echte Wordle.
- US03 Als team wil ik GET /api/words/check?word=apple aanroepen en { valid } krijgen, voor het schud-effect.
- US04 Als team wil ik POST /api/scores met { teamName, guesses, timeMs } aanroepen en { rank } krijgen voor het spel van vandaag.
- US05 Als crew wil ik GET /api/scores/today aanroepen en de top 10 van vandaag krijgen (teamName, guesses, timeMs), gesorteerd op guesses en dan timeMs.
- US06 Als team wil ik POST /api/practice aanroepen en een oefenspel met een willekeurig woord krijgen, zodat ik meer dan 1 potje kan testen.
- US07 Als team wil ik dat elke response { data, error, meta } is, met data null bij een fout en een leesbare Engelse foutmelding.
- US08 Als team wil ik vanaf file:// of localhost kunnen fetchen (CORS open voor alle origins, preflight OPTIONS werkt).
- US09 Als SIT wil ik dat het geheime woord nooit naar de client gaat en dat een gameId niet te vervalsen is.
- US10 Als SIT wil ik dat de deploy op Vercel werkt met 1 env var (GAME_SECRET) en verder niets.

### Should
- US11 Rate limit 60 requests per minuut per IP, antwoord 429 met envelope.
- US12 GET / geeft een JSON-overzicht van de endpoints met link naar API.md.
- US13 Scores staan in het geheugen van de server (geen database). README legt uit dat het leaderboard op Vercel kan resetten en dat lokaal draaien op de dag de stabiele route is.

### Should (toegevoegd 9 sep, Thijmen: "kan je die docs mooi maken zoals swagger")
- US15 Als team wil ik op GET /docs een interactieve API-referentie zien (Swagger-achtig, OpenAPI 3.1) met alle endpoints, request- en responsevoorbeelden en een try-it knop, zodat ik niet in een markdown-bestand hoef te zoeken.
- US16 Als tooling wil ik GET /openapi.json kunnen ophalen als geldige OpenAPI 3.1 spec.

### Could
- US14 Ongeldige gok: result null, valid false, HTTP 200 (geen error, want het is normaal spelverloop).

### Won't
- Auth voor teams, admin-UI, meerdere woordlengtes, statistieken per speler, websockets, i18n.

## Non-functional requirements

| NFR | Target |
|-----|--------|
| Performance | p95 < 300 ms per request op Vercel (Node runtime, geen cold-start optimalisatie nodig); guess-check O(5) |
| Security | Woord alleen server-side; gameId HMAC-SHA256 getekend met GAME_SECRET; input via Zod-achtige handmatige validatie (lengte, a-z); service role key alleen server-side; geen stack traces in responses; rate limit tegen brute force (60/min) |
| Accessibility | n.v.t., geen UI |
| Browser support | fetch vanuit laatste 2 versies Chrome, Firefox, Safari, Edge; CORS headers op elke response inclusief errors |
| Mobile | n.v.t. |
| i18n | Engels in API-teksten, woorden Engels |
| Error handling | Elke route try/catch; 400 bij ongeldige input, 404 bij onbekend gameId, 429 bij rate limit, 500 bij onverwachte fout |
| Data | Scores in het servergeheugen, per datum; geen persoonsgegevens behalve een vrij gekozen teamnaam (max 40 tekens); geen backup, event-data; max 1000 scores per dag tegen geheugengroei |
| Tijdzone | "Vandaag" is de datum in Europe/Amsterdam |

## Success criteria
- Alle 6 endpoints plus GET / geven de envelope terug, geverifieerd met een lokale E2E-run (curl of node) tegen next dev.
- checkGuess("appel" op "paars") geeft twee-passen-resultaat met maar 1 present p, unit-getest.
- Vervalst gameId geeft 404 met error.
- Vitest groen, tsc 0 errors, next build slaagt, coverage lib > 80%.
- Vercel-klaar: geen filesystem writes, alleen in-memory state (scores en rate limit) met gedocumenteerde beperking.

## Clarifications
- Antwoordenlijst: Knuth sgb-words doorsneden met de wordle-list, zodat elk antwoord ook een geldige gok is. Reden: gangbaardere woorden dan de volle 14.855.
- Score bij meerdere inzendingen van hetzelfde team: elke inzending telt apart, geen dedup. Simpel en transparant op de beamer.
- Practice-spellen tellen niet mee voor scores; POST /api/scores gaat altijd over het dagelijkse spel.
- Rate limit is per Vercel-instantie in-memory. Goed genoeg voor 30 studenten; Vercel Firewall is de harde grens als het nodig is.
- Geen Supabase (Thijmen, 9 sep: "doe zonder supabase maak het simpel"). Scores in-memory; op de dag draait de host de API lokaal als het leaderboard betrouwbaar moet zijn.
- Deploy is niet onderdeel van deze sessie (Thijmen, 9 sep: "je hoeft niet meteen te deployen"). Repo wordt Vercel-klaar opgeleverd met README-instructies.
