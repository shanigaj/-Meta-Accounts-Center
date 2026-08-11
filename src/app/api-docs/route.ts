// Serves a standalone Swagger UI page. The heavy Swagger bundle is loaded as a
// static asset from /public (see scripts/copy-swagger.mjs) instead of being
// pulled through the app's webpack build, which keeps builds fast.
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Accounts Center — API docs</title>
    <link rel="stylesheet" href="/swagger/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fafafa; }
      .topbar { display: flex; align-items: center; justify-content: space-between;
        padding: 12px 20px; background: #059669; color: #fff; font-family: system-ui, sans-serif; }
      .topbar a { color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; }
      .topbar a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <div class="topbar">
      <strong>Accounts Center — API</strong>
      <a href="/dashboard">← Back to app</a>
    </div>
    <div id="swagger-ui"></div>
    <script src="/swagger/swagger-ui-bundle.js" crossorigin></script>
    <script src="/swagger/swagger-ui-standalone-preset.js" crossorigin></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: "/api/openapi.json",
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "StandaloneLayout",
          docExpansion: "list",
          defaultModelsExpandDepth: -1,
        });
      };
    </script>
  </body>
</html>`;

export function GET() {
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
