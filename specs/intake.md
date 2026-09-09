# Intake: SIT Wordle API

Datum: 2026-09-09. Opdrachtgever: Thijmen Walter (SIT, studievereniging HBO-ICT HvA).

## Context
- Event: SIT Wordle Hackathon, vrijdag 11 september 2026, 12:00 tot 14:30, HvA. Draaiboek in Notion (https://app.notion.com/p/3d6be6edc1a9810bba3cd74172f834f5).
- Versie B van de hackathon: teams bouwen alleen de frontend, het geheime woord, de gokcontrole en het leaderboard zitten in een API van SIT.
- Startpakket voor de teams staat in de aparte repo sitHackathonWordle (API.md beschrijft het contract dat deze backend moet leveren).

## Vraag
Aparte repo met de backend, klaar voor Vercel deployment op wordle.svsit.nl. Opdracht letterlijk: "maak een aparte repo voor de backend maak het voor vercel deployment".

## Doelgroep
Hackathon-teams (studenten) die vanaf een lokaal geopend index.html of localhost fetch-calls doen. Crew toont het leaderboard op de beamer.

## Randvoorwaarden
- Deadline: vrijdag 11 sep 12:00, dus 2 dagen.
- Budget: 0 euro, Vercel free tier.
- Opslag: geen database (Thijmen, 9 sep: "doe zonder supabase maak het simpel"). Scores in het geheugen van de draaiende server. Op Vercel dus best-effort, lokaal op de laptop van de host stabiel.
- Deploy hoort niet bij deze sessie (Thijmen: "je hoeft niet meteen te deployen maak het gewoon"). Repo wordt Vercel-klaar opgeleverd.
- Contract staat vast in API.md van het startpakket: 6 endpoints, envelope { data, error, meta }.
- Woordenlijst gelijk aan het startpakket (tabatkins/wordle-list, 14.855 gokwoorden); antwoorden uit een kleinere lijst gangbare woorden zodat het raadbaar blijft.
- CORS open, rate limit 60 per minuut per IP.
- Geen UI, alleen JSON.

## Project type
Intern SIT event-tooling, headless API.

## Out of scope
Frontend, auth voor teams, admin-paneel, meertaligheid, i18n, analytics.
