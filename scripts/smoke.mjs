// End-to-end smoke test against a running server. Fails loudly when a response
// does not match the contract in sitHackathonWordle/API.md.
// Usage: BASE_URL=http://localhost:3000 node scripts/smoke.mjs

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
let failures = 0;

function check(label, condition, detail = "") {
  if (condition) {
    console.log(`ok   ${label}`);
  } else {
    failures += 1;
    console.log(`FAIL ${label} ${detail}`);
  }
}

async function call(method, path, body) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Origin: "http://localhost:5500" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = response.status === 204 ? null : await response.json();
  return { status: response.status, headers: response.headers, json };
}

function isEnvelope(json) {
  return json !== null && typeof json === "object" && "data" in json && "error" in json && "meta" in json;
}

async function main() {
  const root = await call("GET", "/");
  check("GET / is an envelope with endpoints", isEnvelope(root.json) && Array.isArray(root.json.data.endpoints));
  check("CORS header present", root.headers.get("access-control-allow-origin") === "*");

  const preflight = await fetch(`${BASE}/api/game/today`, { method: "OPTIONS", headers: { Origin: "http://localhost:5500", "Access-Control-Request-Method": "GET" } });
  check("OPTIONS preflight is 204 with methods", preflight.status === 204 && (preflight.headers.get("access-control-allow-methods") ?? "").includes("POST"));

  const today = await call("GET", "/api/game/today");
  check("GET /api/game/today", today.status === 200 && isEnvelope(today.json) && today.json.data.wordLength === 5 && today.json.data.maxGuesses === 6, JSON.stringify(today.json));
  check("today has no word field", !("word" in (today.json?.data ?? {})));
  const dailyId = today.json?.data?.gameId;

  const practice = await call("POST", "/api/practice");
  check("POST /api/practice", practice.status === 200 && typeof practice.json?.data?.gameId === "string");
  const practiceId = practice.json?.data?.gameId;

  const guess = await call("POST", `/api/game/${practiceId}/guess`, { guess: "apple" });
  check("POST guess apple is valid with 5 statuses", guess.status === 200 && guess.json.data.valid === true && Array.isArray(guess.json.data.result) && guess.json.data.result.length === 5, JSON.stringify(guess.json));
  check("statuses use correct/present/absent", (guess.json?.data?.result ?? []).every((s) => ["correct", "present", "absent"].includes(s)));

  const junk = await call("POST", `/api/game/${dailyId}/guess`, { guess: "aaaaa" });
  check("POST guess aaaaa is valid false, result null, HTTP 200", junk.status === 200 && junk.json.data.valid === false && junk.json.data.result === null);

  const forged = await call("POST", "/api/game/forged.gameid/guess", { guess: "apple" });
  check("forged gameId gives 404 with error", forged.status === 404 && typeof forged.json.error === "string" && forged.json.data === null);

  const badBody = await call("POST", `/api/game/${dailyId}/guess`, { nope: 1 });
  check("missing guess gives 400", badBody.status === 400 && badBody.json.data === null);

  const wordOk = await call("GET", "/api/words/check?word=apple");
  const wordNo = await call("GET", "/api/words/check?word=aaaaa");
  const wordMissing = await call("GET", "/api/words/check");
  check("GET /api/words/check", wordOk.json?.data?.valid === true && wordNo.json?.data?.valid === false && wordMissing.status === 400);

  const team = `smoke-${Date.now()}`;
  const score = await call("POST", "/api/scores", { teamName: team, guesses: 3, timeMs: 45000 });
  check("POST /api/scores returns a rank", score.status === 200 && Number.isInteger(score.json?.data?.rank) && score.json.data.rank >= 1, JSON.stringify(score.json));
  const badScore = await call("POST", "/api/scores", { teamName: team, guesses: 9, timeMs: 1 });
  check("POST /api/scores rejects guesses 9 with 400", badScore.status === 400);

  const board = await call("GET", "/api/scores/today");
  check("GET /api/scores/today lists max 10 with meta.total", board.status === 200 && Array.isArray(board.json.data) && board.json.data.length <= 10 && Number.isInteger(board.json.meta?.total));
  check("our score is on the board", board.json.data.some((row) => row.teamName === team));

  console.log(failures === 0 ? "\nsmoke: all checks passed" : `\nsmoke: ${failures} check(s) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("smoke: could not reach the server:", error.message);
  process.exit(1);
});
