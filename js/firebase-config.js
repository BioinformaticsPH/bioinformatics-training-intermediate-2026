/* =================================================================
   js/firebase-config.js
   -----------------------------------------------------------------
   CENTRAL CONFIGURATION FOR THE WHOLE SITE.
   Fill in the placeholders below, then deploy to GitHub Pages.
   Nothing here is secret by itself — Firebase web config is public,
   but you protect your data with Firestore Security Rules.
   ================================================================= */

/* -----------------------------------------------------------------
   1) FIREBASE CONFIG
   -----------------------------------------------------------------
   HOW TO GET THESE VALUES:
     1. Go to https://console.firebase.google.com/ → create a project.
     2. Add a Web App (</> icon) to the project.
     3. Copy the firebaseConfig object into the block below.
     4. Enable Authentication → Sign-in method → Google.
     5. Create a Firestore database (start in production mode).

   GitHub Pages domain note: add your site's domain under
   Authentication → Settings → Authorized domains
   (e.g. yourname.github.io).
   ----------------------------------------------------------------- */
export const firebaseConfig = {
  apiKey: "AIzaSyDIpo1NewXV4RDJ7F_FpS7w2Cko2Xhd0TY",
  authDomain: "bi-intermediate-training.firebaseapp.com",
  projectId: "bi-intermediate-training",
  storageBucket: "bi-intermediate-training.firebasestorage.app",
  messagingSenderId: "156416689241",
  appId: "1:156416689241:web:163ce44d4b2a14378f9d48"
};

/* -----------------------------------------------------------------
   2) GOOGLE APPS SCRIPT FALLBACK (optional)
   -----------------------------------------------------------------
   If you would rather store questions in a Google Sheet instead of
   Firestore, deploy a Google Apps Script Web App ("Anyone" access)
   and paste its /exec URL here. questions.js will fall back to it
   automatically when Firestore is disabled or fails.
   ----------------------------------------------------------------- */
export const GAS_URL = "https://script.google.com/macros/s/YOUR_GAS_DEPLOYMENT_ID/exec";

/* -----------------------------------------------------------------
   3) MATERIAL / RESOURCE LINKS
   -----------------------------------------------------------------
   CHANGE THESE GOOGLE DRIVE URLS.
   Each value is the folder/file ID from the Drive share URL,
   e.g. https://drive.google.com/drive/folders/1AbC...XYZ
   These are rendered by js/ui.js.
   ----------------------------------------------------------------- */
export const DRIVE_LINKS = {
  slides:   "https://drive.google.com/drive/folders/1PYw-S-grrh1-WHqFdYubmMdF5rU-8-b1",
  datasets: "https://drive.google.com/drive/folders/1CsiwowDHBifkZS-NQnoJwhUAR5zKlL7E"
};

/* -----------------------------------------------------------------
   4) FEATURE FLAGS
   -----------------------------------------------------------------
   `firebaseEnabled` is derived from the config: it is true once the
   `apiKey` no longer contains a `YOUR_` placeholder. When it is false,
   Google sign-in and Firestore are unavailable and a clear error is
   shown instead of any silent fallback.
   ----------------------------------------------------------------- */
export const firebaseEnabled = !/YOUR_/.test(firebaseConfig.apiKey);
export const gasEnabled = !/YOUR_GAS/.test(GAS_URL);

/* Firestore collection name for participant questions */
export const QUESTIONS_COLLECTION = "questions";

/* Threaded replies live in a subcollection: questions/{id}/replies/{id}.
   Any signed-in participant may post; authors may edit/delete their own. */
export const REPLIES_SUBCOLLECTION = "replies";
export const REPLY_MAX_LENGTH = 500;

/* Validation / anti-spam settings */
export const QUESTION_MIN_LENGTH = 10;
export const QUESTION_MAX_LENGTH = 500;
export const QUESTION_COOLDOWN_MS = 30 * 1000; // 30s between submissions

/* Category pills for the Recent Questions filter bar. Participants pick one
   when submitting; questions without a category fall back to "General". */
export const QUESTION_CATEGORIES = ["Day 0", "Day 1", "Day 2", "Day 3", "Day 4", "Technical", "General"];

/* Questions longer than this are collapsed behind a Show more / Show less
   toggle in the feed. */
export const QUESTION_TRUNCATE_LENGTH = 150;

/* -----------------------------------------------------------------
   ORGANIZER ANNOUNCEMENTS
   -----------------------------------------------------------------
   Live broadcasts shown in a banner below the hero. Stored in their
   own Firestore collection — no change to existing collections.

   INSTRUCTOR_EMAILS is the organizer allowlist. It controls who sees
   the in-page composer, but it is NOT security: the same email list
   must be written into the Firestore rules (see README.md) to actually
   restrict writes.
   ----------------------------------------------------------------- */
export const ANNOUNCEMENTS_COLLECTION = "announcements";
export const ANNOUNCEMENT_MAX_LENGTH = 280;
export const ANNOUNCEMENTS_LIMIT = 20;
export const INSTRUCTOR_EMAILS = [
  "lhendrixbarboza@gmail.com",
  "nikkiborj@gmail.com",
  "vjmulat@gmail.com"
];

/* Shown in the banner when Firebase/Firestore is unavailable so the
   widget stays visible during local development. */
export const ANNOUNCEMENT_FALLBACK = {
  message:
    "Welcome to the Intermediate Plant Genome Bioinformatics Workshop — watch this space for live organiser updates.",
  author: "Organizers"
};
