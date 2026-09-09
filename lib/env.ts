export function getGameSecret(): string {
  const secret = process.env.GAME_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error("GAME_SECRET is not set. Add it to .env.local (see .env.example) or to the Vercel project settings.");
  }
  return secret;
}
