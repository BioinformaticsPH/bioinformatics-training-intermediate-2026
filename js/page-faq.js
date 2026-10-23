import { initSiteShell } from "./site.js";
import { initUI } from "./ui.js";

async function main() {
  await initSiteShell();
  initUI();
}

main().catch((err) => console.error("[page-faq] fatal:", err));
