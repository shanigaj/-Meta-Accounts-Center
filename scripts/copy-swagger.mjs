// Copies the Swagger UI static assets into /public so the /api-docs page can
// load them locally (no CDN). Runs automatically on install via postinstall.
import { cpSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "node_modules", "swagger-ui-dist");
const to = join(root, "public", "swagger");

if (!existsSync(from)) {
  console.warn("[copy-swagger] swagger-ui-dist not installed yet — skipping.");
  process.exit(0);
}

mkdirSync(to, { recursive: true });
for (const file of [
  "swagger-ui.css",
  "swagger-ui-bundle.js",
  "swagger-ui-standalone-preset.js",
]) {
  cpSync(join(from, file), join(to, file));
}
console.log("[copy-swagger] Swagger UI assets copied to public/swagger");
