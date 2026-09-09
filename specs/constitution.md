# Constitution: SIT Wordle API

1. Het contract in sitHackathonWordle/API.md is de waarheid. Wijkt de backend af, dan wordt API.md in dezelfde sessie bijgewerkt.
2. Het geheime woord verlaat de server nooit. Geen endpoint, log of foutmelding lekt het woord.
3. Stateless waar het kan: het woord van de dag volgt uit datum plus GAME_SECRET, oefenspellen zitten versleuteld in het gameId. Alleen scores worden opgeslagen.
4. Elke response heeft de envelope { data, error, meta }. Fouten hebben een leesbare Engelse error-string voor studenten.
5. TypeScript strict, geen any, camelCase files, Vitest voor elke lib-functie en elke route.
6. Secrets alleen in env vars. Lokaal in .env.local (gitignored). Het enige secret is GAME_SECRET.
7. Simpelste dat goed werkt. Geen database, geen framework buiten Next.js route handlers.
8. Scores leven in het geheugen van de server. Dat is een bewuste keuze en staat in de README: op Vercel kan het leaderboard resetten bij een nieuwe instantie, lokaal draaien op de dag is de stabiele route.
