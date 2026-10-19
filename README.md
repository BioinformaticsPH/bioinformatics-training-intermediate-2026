# BI_TRAIN — Intermediate Plant Genome Bioinformatics Workshop 2026

A single-page, serverless workshop website (HTML5 + Tailwind CSS via CDN + vanilla ES modules)
with Firebase Google SSO and a real-time participant Q&A feed. All sessions are held
**entirely in person (face-to-face)** — there is no virtual/online delivery. Designed to be
deployed directly to **GitHub Pages** with no build step.

## Project structure

```
.
├── index.html              # Markup: header, hero, 2x2 training grid, dashboard, footer
├── .nojekyll               # Tells GitHub Pages to serve files as-is
├── css/
│   └── style.css           # Flat minimalist theme, components, a11y helpers
└── js/
    ├── firebase-config.js  # Firebase project config + Drive link IDs
    ├── firebase.js         # Lazy Firebase singleton (loaded only when configured)
    ├── auth.js             # Google SSO + reactive user store
    ├── questions.js        # Firestore submit + onSnapshot feed + GAS fallback
    ├── ui.js               # Nav, accordions (schedule + FAQ), lists
    └── app.js              # Entry point / orchestration
```

## Quick start

The Firebase project config in `js/firebase-config.js` is already filled in, so **Google sign-in**
and the **Firestore Q&A feed** are live (they need network access to Google's servers). No build
step is required.

```bash
# from the project root
python3 -m http.server 5173
# open http://localhost:5173
```

> **You must serve the site over HTTP(S).** Opening `index.html` directly (a `file://` URL)
> makes the browser block `js/app.js` with a CORS error, so every JavaScript-rendered section
> (schedule, materials, resources, FAQ and Q&A) appears **empty**. Always use a local server
> (as above) or the deployed GitHub Pages URL — never open the file by double-clicking it.

## Going live — checklist

Everything you must change is commented with `CHANGE ME` / `YOUR_...` in the source.

### 1. Firebase (Google SSO + Firestore)

> This deployment already points at the **`bi-intermediate-training`** Firebase project, and its
> web config is filled into `js/firebase-config.js`. The steps below document the console setup
> (and how to point the site at your **own** project).

1. Create a project at <https://console.firebase.google.com>.
2. **Add a Web App** (`</>`) and copy its config.
3. Paste the values into `js/firebase-config.js` → `firebaseConfig` (`measurementId` is not used):
   ```js
   export const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.firebasestorage.app",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef"
   };
   ```
4. **Authentication → Sign-in method →** enable **Google**.
5. **Authentication → Settings → Authorized domains →** add `lhbarboza-dags.github.io`
   (and `localhost` if it is not already listed).
6. **Firestore Database →** create a database, then add these rules:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /questions/{docId} {
         allow read: if true;
         allow create: if request.auth != null
                       && request.resource.data.question is string
                       && request.resource.data.question.size() >= 10
                       && request.resource.data.question.size() <= 500;
         allow update, delete: if false;
       }

       // Organizer announcements — replace the emails with your
       // INSTRUCTOR_EMAILS list from js/firebase-config.js.
       match /announcements/{docId} {
         allow read: if true;
         allow create, update, delete: if request.auth != null
                       && request.auth.token.email in [
                            "organizer1@example.org",
                            "organizer2@example.org"
                          ];
       }
     }
   }
   ```

   `js/firebase-config.js` auto-enables Firebase once `apiKey` no longer contains `YOUR_`.

**Question fields & moderation.** Each `questions` document stores `user`, `email`, `avatar`,
`question`, `category`, `status` and an optional `answer`:

| Field | Meaning |
| --- | --- |
| `category` | One of `QUESTION_CATEGORIES` (default `General`); drives the feed filter pills. |
| `status` | `pending` (default) or `answered`. May be omitted — an `answer` also marks it answered. |
| `answer` | Optional instructor reply; shown beneath the question when present. |

To mark a question answered, edit the document in the **Firebase console** and set
`status: "answered"` (and optionally add an `answer` string). The app only **reads** these
fields, so the security rules above (`allow update, delete: if false`) can stay unchanged.
Adjust the pill list or the 150-char truncation threshold via `QUESTION_CATEGORIES` and
`QUESTION_TRUNCATE_LENGTH` in `js/firebase-config.js`.

### 1b. Organizer announcements

The **Organizer Announcements** banner (below the hero) broadcasts live notices from a
separate `announcements` collection — `{ message, author, email, pinned, createdAt }` — so
no existing data is migrated. The newest document with `pinned: true` shows as the live
banner; every other notice appears in the reverse-chronological **Announcement History**.

Enable the in-page composer for organizers by listing their Google emails in
`INSTRUCTOR_EMAILS` (in `js/firebase-config.js`) **and** in the `announcements` rules block
above. The client list only controls who *sees* the composer — the rules are what actually
restrict writes, so both must match. When Firebase is disabled, the widget shows the static
`ANNOUNCEMENT_FALLBACK` notice instead.

> **Cost:** this stack runs on Firebase's free **Spark** plan. Google sign-in is no-cost and the
> Firestore free tier (50K reads / 20K writes / 20K deletes per day, 1 GiB storage) is far more
> than a workshop needs, so **no billing account is required**.

### 2. Google Drive material links

In `js/firebase-config.js`, replace every `YOUR_DRIVE_ID` in `DRIVE_LINKS`
(`slides`, `datasets`, `labNotebooks`). Use the folder/file ID from the Drive share URL,
e.g. `https://drive.google.com/drive/folders/1AbC...XYZ`.
Ensure each item is shared as **“Anyone with the link → Viewer”**.

### 3. (Optional) Google Apps Script fallback

If you prefer a Google Sheet over Firestore, deploy an Apps Script Web App and paste its `/exec`
URL into `GAS_URL`. `questions.js` uses it automatically when Firestore is unavailable.

```js
// Apps Script — Code.gs
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('questions');
  sheet.appendRow([new Date(), data.user, data.email, data.question]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Deploy to GitHub Pages

```bash
git add .
git commit -m "Add plant genome bioinformatics workshop site"
git push origin main
```

Then **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`**.
The `.nojekyll` file ensures `js/` and `css/` are served unchanged.

## Editing content

| What | Where |
| --- | --- |
| Schedule (Day 0–4 curriculum) | `SCHEDULE` array in `js/ui.js` |
| Materials / Drive links | `MATERIALS` in `js/ui.js` + `DRIVE_LINKS` in `js/firebase-config.js` |
| Resources | `RESOURCES` in `js/ui.js` |
| FAQs | `FAQS` in `js/ui.js` |
| Validation & anti-spam | `QUESTION_*` constants in `js/firebase-config.js` |
| Organizer allowlist & announcements | `INSTRUCTOR_EMAILS` / `ANNOUNCEMENT_*` in `js/firebase-config.js` |
| Brand colours | `tailwind.config` in `index.html` + `:root` in `css/style.css` |

## Accessibility & performance

- Semantic landmarks, skip link, `aria-expanded` accordions, `aria-live` regions, keyboard-operable.
- Visible focus rings and full `prefers-reduced-motion` support.
- No build step, three CDN requests, and a lightweight flat-green hero (zero image payload).
- Firebase SDK is imported **lazily** — never downloaded until a real config is present.
