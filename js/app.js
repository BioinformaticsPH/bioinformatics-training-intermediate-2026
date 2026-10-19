/* =================================================================
   js/app.js
   -----------------------------------------------------------------
   Entry point for index.html. Boots the shared site shell and then
   starts the organizer announcements widget. The Q&A engine lives on
   its own page — see qa.html / js/qa.js.
   ================================================================= */

import { initSiteShell } from "./site.js";
import { initAnnouncements } from "./announcements.js";

async function main() {
  await initSiteShell();
  await initAnnouncements();
}

main().catch((err) => console.error("[app] fatal:", err));
