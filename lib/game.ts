import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getGameSecret } from "@/lib/env";
import type { GamePayload } from "@/lib/types";
import { answerAt, answerCount } from "@/lib/words";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function hmac(secret: string, message: string): Buffer {
  return createHmac("sha256", secret).update(message).digest();
}

function indexFor(secret: string, message: string): number {
  return hmac(secret, message).readUIntBE(0, 6) % answerCount();
}

/** Deterministic answer index for a date: same date plus same secret is always the same word. */
export function dailyIndex(date: string, secret: string = getGameSecret()): number {
  return indexFor(secret, `daily:${date}`);
}

/** Practice words follow from the nonce plus the secret, so the game id never carries the answer index. */
export function practiceIndex(nonce: string, secret: string = getGameSecret()): number {
  return indexFor(secret, `practice:${nonce}`);
}

export function signGameId(payload: GamePayload, secret: string = getGameSecret()): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = hmac(secret, encoded).toString("base64url");
  return `${encoded}.${signature}`;
}

function isGamePayload(value: unknown): value is GamePayload {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if (record.t === "daily") return typeof record.d === "string" && DATE_PATTERN.test(record.d);
  if (record.t === "practice") return typeof record.n === "string" && record.n.length > 0 && record.n.length <= 32;
  return false;
}

/** Returns the payload when the signature checks out and the shape is right, otherwise null. */
export function parseGameId(gameId: string, secret: string = getGameSecret()): GamePayload | null {
  const parts = gameId.split(".");
  if (parts.length !== 2) return null;
  const [encoded, signature] = parts as [string, string];
  if (encoded.length === 0 || signature.length === 0) return null;

  const expected = hmac(secret, encoded);
  const given = Buffer.from(signature, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  try {
    const payload: unknown = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    return isGamePayload(payload) ? payload : null;
  } catch {
    return null;
  }
}

export function wordForPayload(payload: GamePayload, secret: string = getGameSecret()): string {
  return payload.t === "daily" ? answerAt(dailyIndex(payload.d, secret)) : answerAt(practiceIndex(payload.n, secret));
}

export function dailyGameId(date: string, secret: string = getGameSecret()): string {
  return signGameId({ t: "daily", d: date }, secret);
}

export function practiceGameId(secret: string = getGameSecret()): { gameId: string; index: number } {
  const nonce = randomBytes(9).toString("base64url");
  return { gameId: signGameId({ t: "practice", n: nonce }, secret), index: practiceIndex(nonce, secret) };
}
