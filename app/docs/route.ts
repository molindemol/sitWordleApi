export const dynamic = "force-dynamic";

// Interactive API reference in the SIT house style. Scalar renders the OpenAPI spec from
// /openapi.json, Swagger-style with a working "try it" panel, restyled with SIT colours and fonts.
// The CDN script is pinned to one version with an SRI hash. Bump both together: node scripts in the repo history
// or `curl -sL https://cdn.jsdelivr.net/npm/@scalar/api-reference@<v> | openssl dgst -sha384 -binary | openssl base64 -A`.
const PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SIT Wordle API docs</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800&family=JetBrains+Mono:wght@400;500;700&display=swap">
  <style>
    :root {
      --sit-bg: #09090b;
      --sit-panel: #16161a;
      --sit-border: #2a2a33;
      --sit-text: #fafafa;
      --sit-muted: #a1a1aa;
      --sit-gold: #f29e18;
      --sit-red: #ef4444;
      --sit-green: #22c55e;
      --sit-blue: #3b82f6;
      --scalar-custom-header-height: 64px;
    }
    html, body { margin: 0; background: var(--sit-bg); color: var(--sit-text); }
    .sit-header {
      position: sticky; top: 0; z-index: 10;
      height: 64px; box-sizing: border-box;
      display: flex; align-items: center; gap: 20px;
      padding: 0 24px;
      background: var(--sit-bg);
      border-bottom: 1px solid var(--sit-border);
      font-family: "JetBrains Mono", "Courier New", monospace;
    }
    .sit-mark { display: flex; align-items: center; text-decoration: none; }
    .sit-logo { height: 36px; width: auto; display: block; }
    .sit-divider { width: 1px; height: 28px; background: var(--sit-border); }
    .sit-title { font-family: "Big Shoulders Display", Impact, sans-serif; font-weight: 800; font-size: 26px; letter-spacing: 3px; text-transform: uppercase; }
    .sit-kicker { color: var(--sit-muted); font-size: 12px; margin-left: 4px; }
    .sit-links { margin-left: auto; display: flex; gap: 18px; font-size: 12px; }
    .sit-links a { color: var(--sit-muted); text-decoration: none; }
    .sit-links a:hover { color: var(--sit-gold); }
    .sit-rule { height: 3px; width: 100%; background: linear-gradient(90deg, var(--sit-gold) 0 25%, var(--sit-red) 25% 50%, var(--sit-green) 50% 75%, var(--sit-blue) 75%); }
    @media (max-width: 720px) { .sit-kicker, .sit-links { display: none; } }
    .fallback { color: var(--sit-muted); font-family: "JetBrains Mono", monospace; padding: 24px; }
    .fallback a { color: var(--sit-gold); }
  </style>
</head>
<body>
  <header class="sit-header">
    <a class="sit-mark" href="https://svsit.nl" aria-label="Study association SIT">
      <img class="sit-logo" src="/sitLogo.svg" alt="SIT logo" width="81" height="36">
    </a>
    <span class="sit-divider" aria-hidden="true"></span>
    <span class="sit-title">Wordle API</span>
    <span class="sit-kicker">// wordle hackathon &middot; fri 11 sep 2026</span>
    <nav class="sit-links">
      <a href="/openapi.json">openapi.json</a>
      <a href="https://github.com/molindemol/sitHackathonWordle">starter kit</a>
      <a href="https://github.com/molindemol/sitWordleApi">source</a>
    </nav>
  </header>
  <div class="sit-rule" aria-hidden="true"></div>
  <noscript><p class="fallback">SIT Wordle API. This page needs JavaScript. The raw spec is at <a href="/openapi.json">/openapi.json</a>.</p></noscript>
  <div id="app"></div>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.68.0" integrity="sha384-ayGz8N+NChlUEfR0zr5Zy3T6Q4lhcdiASJNoshS6+vxV56ZE300qfWNBjj9pqsLN" crossorigin="anonymous"></script>
  <script>
    Scalar.createApiReference("#app", {
      url: "/openapi.json",
      theme: "none",
      darkMode: true,
      forceDarkModeState: "dark",
      hideDarkModeToggle: true,
      hideClientButton: true,
      showToolbar: "never",
      defaultHttpClient: { targetKey: "js", clientKey: "fetch" },
      hiddenClients: {
        js: ["xhr", "axios", "ofetch", "jquery"],
        shell: ["httpie", "wget"],
        node: true, ruby: true, php: true, python: true, c: true, clojure: true, csharp: true, dart: true,
        go: true, http: true, java: true, kotlin: true, objc: true, ocaml: true, powershell: true, r: true,
        swift: true, rust: true, fsharp: true,
      },
      agent: { disabled: true },
      defaultOpenAllTags: true,
      metaData: { title: "SIT Wordle API docs" },
      customCss: \`
        .dark-mode, .light-mode {
          --scalar-background-1: #09090b;
          --scalar-background-2: #111114;
          --scalar-background-3: #16161a;
          --scalar-background-accent: rgba(242, 158, 24, 0.12);
          --scalar-color-1: #fafafa;
          --scalar-color-2: #c9c9d1;
          --scalar-color-3: #a1a1aa;
          --scalar-color-accent: #f29e18;
          --scalar-border-color: #2a2a33;
          --scalar-color-green: #22c55e;
          --scalar-color-red: #ef4444;
          --scalar-color-yellow: #f29e18;
          --scalar-color-blue: #3b82f6;
          --scalar-color-orange: #f29e18;
          --scalar-color-purple: #3b82f6;
          --scalar-sidebar-background-1: #09090b;
          --scalar-sidebar-color-1: #fafafa;
          --scalar-sidebar-color-2: #a1a1aa;
          --scalar-sidebar-border-color: #2a2a33;
          --scalar-sidebar-item-hover-background: #16161a;
          --scalar-sidebar-item-active-background: rgba(242, 158, 24, 0.14);
          --scalar-sidebar-color-active: #f29e18;
          --scalar-sidebar-search-background: #111114;
          --scalar-sidebar-search-border-color: #2a2a33;
          --scalar-button-1: #f29e18;
          --scalar-button-1-color: #1f1300;
          --scalar-button-1-hover: #ffb03a;
          --scalar-radius: 4px;
          --scalar-radius-lg: 6px;
          --scalar-radius-xl: 8px;
          --scalar-font: "JetBrains Mono", "Courier New", monospace;
          --scalar-font-code: "JetBrains Mono", "Courier New", monospace;
        }
        /* Scalar extras that students do not need */
        .dark-mode [class*="mcp"], .dark-mode a[href*="scalar.com/mcp"], .dark-mode .scalar-app-header, .dark-mode [class*="toolbar"] { display: none !important; }
        .dark-mode h1, .dark-mode h2, .dark-mode .section-header, .dark-mode .t-editor__heading, .dark-mode .introduction-section h1 {
          font-family: "Big Shoulders Display", Impact, sans-serif;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
      \`,
    });
  </script>
</body>
</html>`;

export function GET(): Response {
  return new Response(PAGE, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
