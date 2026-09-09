# Deploy Log: SIT Wordle API

## 2026-09-09, eerste productie-deploy (laptop, Vercel CLI 59.13.1)

Opdracht Thijmen: "deploy de backend naar vercel".

| Stap | Resultaat |
|------|-----------|
| Vercel team | walter-noot (WalterNoot), project sit-wordle-api, framework preset Next.js, Node 24.x |
| Env | GAME_SECRET gezet voor Production en Preview (secret lokaal bewaard in ~/.config/cloudly/sit-wordle.env, chmod 600, niet in git) |
| Staging (preview) | https://sit-wordle-ic7bmi3m2-walter-noot.vercel.app, status Ready. Preview staat achter Vercel Authentication (standaard), dus getest via `vercel curl`: /api/game/today geeft een getekend gameId voor 2026-09-09, /api/words/check werkt. Smoke met OIDC-header gaf een Trusted Sources tekstantwoord, daarom vercel curl |
| Productie | `vercel deploy --prod`, deployment https://sit-wordle-jhgsstmci-walter-noot.vercel.app, alias https://sit-wordle-api.vercel.app, status Ready |
| Smoke productie | `BASE_URL=https://sit-wordle-api.vercel.app node scripts/smoke.mjs`: 16/16 checks groen (envelope, CORS, preflight, today, practice, guess, ongeldig woord, vervalst gameId 404, 400's, words/check, scores, leaderboard) |
| Error scan | `vercel logs --level error --since 1h`: geen logs |
| Commit | scripts/smoke.mjs OIDC-header commit plus deze log, zie git log |

## 2026-09-09 17:35, tweede productie-deploy (T010 docs)
`vercel deploy --prod` na commit 5d5dcc0: deployment https://sit-wordle-l3l4qglkw-walter-noot.vercel.app, alias https://sit-wordle-api.vercel.app. Smoke tegen productie 18/18 inclusief /openapi.json en /docs. Rollback: vorige productie-deployment sit-wordle-jhgsstmci (commit 0f512a4 minus docs) via `vercel rollback`.

## Domein wordle.svsit.nl: OPEN
`vercel domains add wordle.svsit.nl sit-wordle-api` geeft 403 "Not authorized to use wordle.svsit.nl": svsit.nl is in een ander Vercel-team geclaimd (de SIT-site). Nameservers van svsit.nl staan bij Hostnet (ns01/ns02.hostnet.nl). Twee routes voor Thijmen:
1. Project verplaatsen naar het Vercel-team waar svsit.nl al staat (Settings > General > Transfer), daarna het subdomein toevoegen. Dan regelt Vercel de DNS-instructie voor Hostnet (CNAME wordle naar cname.vercel-dns.com of A 76.76.21.21).
2. Of in dit team domein-eigendom bewijzen met de TXT-record die Vercel bij het toevoegen via het dashboard toont (_vercel TXT op svsit.nl in Hostnet), daarna CNAME wordle naar cname.vercel-dns.com.
Tot dan is de live URL https://sit-wordle-api.vercel.app. API.md, README en de referentie-client verwijzen daarnaar.

Hostnet-stappen (uit helpdesk.hostnet.nl "DNS wijzigen", 9 sep): Mijn Hostnet > Diensten > bij svsit.nl het menu met 3 puntjes > DNS wijzigen > record toevoegen > opslaan. Records: CNAME met naam `wordle` en waarde `cname.vercel-dns.com`; plus de TXT `_vercel` die het Vercel-dashboard toont bij Project > Settings > Domains > Add (ownership verification, want svsit.nl is door een ander team geclaimd). Hostnet: CNAME alleen op subdomeinen, propagatie 2 tot 24 uur, "Versie terugzetten" rechtsboven als rollback. Via CLI lukt de domain add niet (403 zonder TXT, `vercel api` accepteert de body niet).

## Rollback
Vorige werkende productie: geen (eerste deploy). Bij problemen: `vercel rollback` naar een eerdere deployment of `vercel deploy --prod` vanaf een eerdere commit. GAME_SECRET niet wijzigen, anders verandert het woord van de dag en zijn uitgedeelde gameIds ongeldig.

## Monitoring
Geen drains of Sentry (Hobby-team, event-tool voor 1 middag). Op de dag: `vercel logs https://sit-wordle-api.vercel.app --follow` op de laptop van de host.
