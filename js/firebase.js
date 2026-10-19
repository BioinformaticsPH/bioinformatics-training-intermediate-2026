/* =================================================================
   js/firebase.js
   -----------------------------------------------------------------
   Thin singleton wrapper around the Firebase v10 modular SDK.
   The SDK is imported *dynamically* only when a real config is
   present, so the site stays fast (and works offline) while the
   placeholders are unfilled.
   ================================================================= */

import { firebaseConfig, firebaseEnabled } from "./firebase-config.js";

let app = null;
let auth = null;
let db = null;
let ready = false;
let initPromise = null;

/**
 * Initialise Firebase exactly once. Safe to call from anywhere;
 * returns a promise resolving to { app, auth, db, enabled }.
 */
export function initFirebase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (!firebaseEnabled) {
      console.warn(
        "[firebase] Config is missing or still contains placeholders — Firebase is disabled. " +
          "Add your project config in js/firebase-config.js. See README.md."
      );
      return { app, auth, db, enabled: false };
    }

    try {
      // Loaded on-demand from the import map declared in index.html.
      const { initializeApp } = await import("firebase/app");
      const { getAuth } = await import("firebase/auth");
      const { getFirestore } = await import("firebase/firestore");

      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
      ready = true;
      return { app, auth, db, enabled: true };
    } catch (err) {
      console.error("[firebase] Initialisation failed:", err);
      return { app, auth, db, enabled: false, error: err };
    }
  })();

  return initPromise;
}

/** Synchronous accessor — call initFirebase() (and await it) first. */
export function getFirebase() {
  return { app, auth, db, enabled: ready };
}

export { firebaseEnabled };
