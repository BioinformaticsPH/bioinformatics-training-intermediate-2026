/* =================================================================
   js/page-schedule.js
   Entry point for schedule.html
   ================================================================= */

import { initSiteShell } from "./site.js";
import { initUI } from "./ui.js";

async function main() {
  await initSiteShell();
  // initUI already renders schedule, materials, resources, faq and sets up UI
  // but we only need schedule on this page - it's safe to call
  // initUI is idempotent in that it queries elements; if missing, functions return early
  initUI();
}

main().catch((err) => console.error("[page-schedule] fatal:", err));
