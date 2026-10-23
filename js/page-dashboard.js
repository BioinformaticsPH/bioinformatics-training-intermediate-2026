import { initSiteShell } from "./site.js";

async function main() {
  await initSiteShell();
}

main().catch((err) => console.error("[page-dashboard] fatal:", err));
