/* =================================================================
   js/qa.js
   -----------------------------------------------------------------
   Entry point for qa.html. Boots the shared site shell and then the
   participant Q&A feed with threaded replies.
   ================================================================= */

import { initSiteShell } from "./site.js";
import { initQuestions } from "./questions.js";

async function main() {
  await initSiteShell();
  await initQuestions();
}

main().catch((err) => console.error("[qa] fatal:", err));
