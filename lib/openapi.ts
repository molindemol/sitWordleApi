import { MAX_GUESSES, MAX_TEAM_NAME_LENGTH, WORD_LENGTH } from "@/lib/types";

const LIVE_URL = "https://sit-wordle-api.vercel.app";

type Schema = Record<string, unknown>;
type Operation = {
  summary: string;
  description?: string;
  tags: string[];
  parameters?: Schema[];
  requestBody?: Schema;
  responses: Record<string, { description: string; content: { "application/json": { schema: Schema; example?: unknown } } }>;
};
type Paths = Record<string, Record<string, Operation>>;

const envelope = (dataRef: string): Schema => ({
  allOf: [{ $ref: "#/components/schemas/Envelope" }, { type: "object", properties: { data: { $ref: dataRef } } }],
});

const errorResponse = (description: string, example: string) => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorEnvelope" }, example: { data: null, error: example, meta: null } } },
});

const rateLimited = errorResponse("Too many requests from this IP (60 per minute). Retry-After header says how long to wait.", "Too many requests, slow down (60 per minute per IP)");

const paths: Paths = {
  "/": {
    get: {
      summary: "List the endpoints",
      tags: ["Meta"],
      responses: {
        "200": { description: "Overview", content: { "application/json": { schema: envelope("#/components/schemas/Overview") } } },
      },
    },
  },
  "/api/game/today": {
    get: {
      summary: "Today's game, without the word",
      description: "Everyone gets the same word today (Europe/Amsterdam date). Keep the gameId, you need it for every guess.",
      tags: ["Game"],
      responses: {
        "200": {
          description: "Game info",
          content: {
            "application/json": {
              schema: envelope("#/components/schemas/GameInfo"),
              example: { data: { gameId: "eyJ0IjoiZGFpbHkiLCJkIjoiMjAyNi0wOS0xMSJ9.signature", date: "2026-09-11", wordLength: WORD_LENGTH, maxGuesses: MAX_GUESSES }, error: null, meta: null },
            },
          },
        },
        "429": rateLimited,
      },
    },
  },
  "/api/practice": {
    post: {
      summary: "Start a practice game with a random word",
      description: "Practice games do not count for the leaderboard. Start as many as you like.",
      tags: ["Game"],
      responses: {
        "200": {
          description: "Practice game info",
          content: {
            "application/json": {
              schema: envelope("#/components/schemas/PracticeInfo"),
              example: { data: { gameId: "eyJ0IjoicHJhY3RpY2UiLCJuIjoiYWJjMTIzIn0.signature", wordLength: WORD_LENGTH, maxGuesses: MAX_GUESSES }, error: null, meta: null },
            },
          },
        },
        "429": rateLimited,
      },
    },
  },
  "/api/game/{gameId}/guess": {
    post: {
      summary: "Check a guess",
      description:
        "Send a five-letter word. You get a status per letter: correct (green), present (yellow) or absent (grey). A word that is not in the list is not an error: valid is false and result is null.",
      tags: ["Game"],
      parameters: [{ name: "gameId", in: "path", required: true, schema: { type: "string" }, description: "From /api/game/today or /api/practice" }],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/GuessRequest" }, example: { guess: "apple" } } },
      },
      responses: {
        "200": {
          description: "Guess result",
          content: {
            "application/json": {
              schema: envelope("#/components/schemas/GuessResult"),
              example: { data: { valid: true, result: ["present", "absent", "absent", "present", "absent"], solved: false }, error: null, meta: null },
            },
          },
        },
        "400": errorResponse("Missing or malformed guess", `guess must be exactly ${WORD_LENGTH} letters a-z`),
        "404": errorResponse("Unknown or forged gameId", "unknown gameId, ask /api/game/today or /api/practice for a fresh one"),
        "429": rateLimited,
      },
    },
  },
  "/api/words/check": {
    get: {
      summary: "Is this a real word",
      description: "Handy for a shake animation before you spend a guess.",
      tags: ["Words"],
      parameters: [{ name: "word", in: "query", required: true, schema: { type: "string" }, example: "apple" }],
      responses: {
        "200": { description: "Validity", content: { "application/json": { schema: envelope("#/components/schemas/WordCheck"), example: { data: { valid: true }, error: null, meta: null } } } },
        "400": errorResponse("Missing word", "add ?word=apple to the URL"),
        "429": rateLimited,
      },
    },
  },
  "/api/scores": {
    post: {
      summary: "Save a score for today's game",
      description: "Only for the daily game. The rank is your position on today's board at this moment.",
      tags: ["Scores"],
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/ScoreRequest" }, example: { teamName: "Team Rocket", guesses: 3, timeMs: 84000 } } },
      },
      responses: {
        "200": { description: "Rank", content: { "application/json": { schema: envelope("#/components/schemas/Rank"), example: { data: { rank: 2 }, error: null, meta: null } } } },
        "400": errorResponse("Invalid body", `guesses must be a whole number from 1 to ${MAX_GUESSES}`),
        "429": rateLimited,
        "503": errorResponse("Today's leaderboard is full (1000 scores), the score was not saved", "the leaderboard for today is full"),
      },
    },
  },
  "/api/scores/today": {
    get: {
      summary: "Top 10 of today",
      description: "Sorted by fewest guesses, then fastest time. meta.total is the number of scores today.",
      tags: ["Scores"],
      responses: {
        "200": {
          description: "Leaderboard",
          content: {
            "application/json": {
              schema: envelope("#/components/schemas/Leaderboard"),
              example: { data: [{ teamName: "Team Rocket", guesses: 3, timeMs: 84000 }], error: null, meta: { total: 1, date: "2026-09-11" } },
            },
          },
        },
        "429": rateLimited,
      },
    },
  },
};

export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "SIT Wordle API",
    version: "1.0.0",
    description:
      "Backend for the SIT Wordle Hackathon. The secret word never leaves the server: you send guesses, the API returns the colours. Every response has the shape `{ data, error, meta }`. CORS is open, so you can call it from an index.html on your disk. No API key needed.\n\nStarter kit and rules: https://github.com/molindemol/sitHackathonWordle",
  },
  servers: [{ url: LIVE_URL, description: "Production" }, { url: "http://localhost:3000", description: "Local (npm run dev)" }],
  tags: [
    { name: "Game", description: "Get a game, send guesses" },
    { name: "Words", description: "Word list checks" },
    { name: "Scores", description: "Leaderboard for today's game" },
    { name: "Meta", description: "About the API" },
  ],
  paths,
  components: {
    schemas: {
      Envelope: {
        type: "object",
        required: ["data", "error", "meta"],
        properties: {
          data: { description: "The payload, null on an error" },
          error: { type: ["string", "null"], description: "A sentence you can show, null on success" },
          meta: { type: ["object", "null"], description: "Extra info such as totals, usually null" },
        },
      },
      ErrorEnvelope: {
        type: "object",
        required: ["data", "error", "meta"],
        properties: { data: { type: "null" }, error: { type: "string" }, meta: { type: "null" } },
      },
      Overview: {
        type: "object",
        properties: { name: { type: "string" }, endpoints: { type: "array", items: { type: "object" } }, docs: { type: "string" }, starterKit: { type: "string" } },
      },
      GameInfo: {
        type: "object",
        required: ["gameId", "date", "wordLength", "maxGuesses"],
        properties: {
          gameId: { type: "string", description: "Signed id, opaque, use it as is" },
          date: { type: "string", format: "date", example: "2026-09-11" },
          wordLength: { type: "integer", const: WORD_LENGTH },
          maxGuesses: { type: "integer", const: MAX_GUESSES },
        },
      },
      PracticeInfo: {
        type: "object",
        required: ["gameId", "wordLength", "maxGuesses"],
        properties: { gameId: { type: "string" }, wordLength: { type: "integer", const: WORD_LENGTH }, maxGuesses: { type: "integer", const: MAX_GUESSES } },
      },
      GuessRequest: {
        type: "object",
        required: ["guess"],
        properties: { guess: { type: "string", minLength: WORD_LENGTH, maxLength: WORD_LENGTH, pattern: `^[a-zA-Z]{${WORD_LENGTH}}$`, example: "apple" } },
      },
      LetterStatus: { type: "string", enum: ["correct", "present", "absent"], description: "correct = green, present = yellow, absent = grey" },
      GuessResult: {
        type: "object",
        required: ["valid", "result", "solved"],
        properties: {
          valid: { type: "boolean", description: "false when the word is not in the list" },
          result: { type: ["array", "null"], items: { $ref: "#/components/schemas/LetterStatus" }, minItems: WORD_LENGTH, maxItems: WORD_LENGTH },
          solved: { type: "boolean" },
        },
      },
      WordCheck: { type: "object", required: ["valid"], properties: { valid: { type: "boolean" } } },
      ScoreRequest: {
        type: "object",
        required: ["teamName", "guesses", "timeMs"],
        properties: {
          teamName: { type: "string", minLength: 1, maxLength: MAX_TEAM_NAME_LENGTH },
          guesses: { type: "integer", minimum: 1, maximum: MAX_GUESSES },
          timeMs: { type: "integer", minimum: 0, description: "Milliseconds from first key to solved" },
        },
      },
      Rank: { type: "object", required: ["rank"], properties: { rank: { type: "integer", minimum: 1 } } },
      Score: {
        type: "object",
        required: ["teamName", "guesses", "timeMs"],
        properties: { teamName: { type: "string" }, guesses: { type: "integer" }, timeMs: { type: "integer" } },
      },
      Leaderboard: { type: "array", items: { $ref: "#/components/schemas/Score" }, maxItems: 10 },
    },
  },
} as const satisfies { openapi: string; paths: Paths; servers: { url: string; description?: string }[] } & Record<string, unknown>;
