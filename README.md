# Bioinformatics Training — Intermediate Plant Genome Bioinformatics Workshop 2026

A no-build, serverless workshop website (HTML5 + Tailwind CSS via CDN + vanilla ES modules)
with Firebase Google SSO. It has a landing page (`index.html`) and a dedicated **Participant Q&A
page** (`qa.html`) with a real-time question feed and threaded replies. All sessions are held
**entirely in person (face-to-face)** — there is no virtual/online delivery. Designed to be
deployed directly to **GitHub Pages** with no build step.

## Project structure

```
.
├── index.html              # Landing page: header, hero, training grid, dashboard, footer
├── qa.html                 # Participant Q&A: ask, filter, and reply in threads
├── .nojekyll               # Tells GitHub Pages to serve files as-is
├── css/
│   └── style.css           # Flat minimalist theme, components, a11y helpers
└── js/
    ├── firebase-config.js  # Firebase project config + Drive link IDs
    ├── firebase.js         # Lazy Firebase singleton (loaded only when configured)
    ├── auth.js             # Google SSO + reactive user store
    ├── site.js             # Shared shell (auth + header/profile) for every page
    ├── questions.js        # Firestore submit + feed + threaded replies + GAS fallback
    ├── ui.js               # Nav, accordions (schedule + FAQ), lists
    ├── app.js              # Entry point for index.html
    └── qa.js               # Entry point for qa.html
```

## Quick start

The Firebase project config in `js/firebase-config.js` is already filled in, so **Google sign-in**
and the **Firestore Q&A feed + replies** are live (they need network access to Google's servers).
No build step is required.

```bash
# from the project root
python3 -m http.server 5173
# open http://localhost:5173           (landing page)
# open http://localhost:5173/qa.html   (participant Q&A)
```

> **You must serve the site over HTTP(S).** Opening `index.html` directly (a `file://` URL)
> makes the browser block the ES modules with a CORS error, so every JavaScript-rendered section
> (schedule, materials, resources, FAQ, and the Q&A feed) appears **empty**. Always use a local
> server (as above) or the deployed GitHub Pages URL — never open the file by double-clicking it.

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
5. **Authentication → Settings → Authorized domains →** add your GitHub Pages host —
   for this repo `bioinformaticsph.github.io` (plus `localhost` for local dev).
   Without this, sign-in fails with `auth/unauthorized-domain`.
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
                       && request.resource.data.question.size() <= 500
                       && request.resource.data.email == request.auth.token.email
                       && (!("notifyByEmail" in request.resource.data)
                           || request.resource.data.notifyByEmail is bool);
         allow update, delete: if false;

         // Threaded replies — any signed-in participant may post;
         // authors may edit or delete only their own reply.
         match /replies/{replyId} {
           allow read: if true;
           allow create: if request.auth != null
                         && request.resource.data.message is string
                         && request.resource.data.message.size() >= 1
                         && request.resource.data.message.size() <= 500
                         && request.resource.data.email == request.auth.token.email;
           allow update, delete: if request.auth != null
                         && resource.data.email == request.auth.token.email;
         }
       }

        // Organizer announcements — must match INSTRUCTOR_EMAILS
        // in js/firebase-config.js (they are paired, see above).
        match /announcements/{docId} {
          allow read: if true;
          allow create, update, delete: if request.auth != null
                        && request.auth.token.email in [
                             "lhendrixbarboza@gmail.com",
                             "nikkiborj@gmail.com",
                             "vjmulat@gmail.com",
                             "bioinformaticsph@gmail.com"
                           ];
        }
     }
   }
   ```

   `js/firebase-config.js` auto-enables Firebase once `apiKey` no longer contains `YOUR_`.

**Question fields.** Each `questions` document stores `user`, `email`, `avatar`, `question`,
`category`, `notifyByEmail` and (legacy) `answer`:

| Field | Meaning |
| --- | --- |
| `category` | One of `QUESTION_CATEGORIES` (default `General`); drives the feed filter pills. |
| `email` | Must equal `request.auth.token.email` (enforced by the rules). |
| `notifyByEmail` | `true` when the author ticked **"Email me when someone replies"**. Consumed by the Apps Script poller (§3). |
| `answer` | Optional single instructor answer set via the Firebase console; shown beneath the question when present. |

There is no status pill: threads speak for themselves. The old `status` field (`pending` /
`answered`) is **legacy** — the app no longer writes it and nothing renders it; documents that
still carry it are harmless.

**Threaded replies.** Discussion lives in a subcollection,
`questions/{questionId}/replies/{replyId}`:

| Field | Meaning |
| --- | --- |
| `message` | Reply text (1–500 chars, capped by `REPLY_MAX_LENGTH`). |
| `user` / `email` / `avatar` | Author identity copied from the signed-in Google account. |
| `timestamp` | Server timestamp; replies are ordered oldest → newest. |

Any signed-in participant can post a reply; authors can edit or delete **their own** reply
(the rules above enforce this). Threads are loaded **lazily** the first time a question's
**Replies** control is expanded, then cached for the session. Replies reuse the same
anti-spam cooldown as questions (`QUESTION_COOLDOWN_MS`, shared `bi_train_last_question` key).
The legacy `status`/`answer` fields remain readable (e.g. answers set directly in the console)
but are no longer written by the app.

Adjust the pill list, the 150-char question truncation threshold, or the reply length via
`QUESTION_CATEGORIES`, `QUESTION_TRUNCATE_LENGTH`, and `REPLY_MAX_LENGTH` in
`js/firebase-config.js`.

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

In `js/firebase-config.js`, set the folder IDs in `DRIVE_LINKS`
(`slides`, `datasets`). Use the folder/file ID from the Drive share URL,
e.g. `https://drive.google.com/drive/folders/1AbC...XYZ`.
Ensure each item is shared as **“Anyone with the link → Viewer”**.

### 3. Reply email notifications (Google Apps Script, free)

The Ask &amp; discuss composer on `qa.html` offers a tick — **"Email me when someone replies
to my question"**. It stores `notifyByEmail: true` on the question; a free Apps Script with a
**time-based trigger** then polls Firestore every 5 minutes and mails the author when a new
reply appears. Nothing on the site needs `GAS_URL` for this — the script reads Firestore
directly over its REST API (your rules allow public reads).

**Setup (once):**

1. <https://script.google.com> → **New project** → rename it (e.g. `bi-train-qna-notify`) →
   delete the default `myFunction` stub and paste the `Code.gs` below.
2. **Project Settings** (gear, left rail) → **Script properties** → add both, then **Save**:

   | Property | Value |
   | --- | --- |
   | `FIREBASE_PROJECT_ID` | `bi-intermediate-training` |
   | `FIREBASE_API_KEY` | the `apiKey` in `js/firebase-config.js` (public — it ships with the page) |

3. Toolbar function dropdown → select **`install()`** → **Run**.
   - First run asks to authorize: *Review permissions* → your Google account →
     **"Google hasn't verified this app"** → **Advanced → Go to … (unsafe)** → **Allow**.
     (Scopes: outbound HTTP, Gmail, script triggers.)
   - It throws on purpose if the script properties are missing — add them and re-run.
   - It creates the `notifyReplies` trigger, **only when the project has none**; to re-create
     a trigger, delete the old one under **Triggers** first.
4. Left rail → **Triggers** (clock icon): confirm `notifyReplies` · *Time-driven* ·
   *Every 5 minutes*.
5. Run **`testNotify()`** once → **View → Executions** should log `notifyReplies OK`.
6. Publish the **updated rules** from §1 (the create rule now checks `email` and
   `notifyByEmail`) — otherwise posts are rejected.

To hide the tick, set `REPLY_NOTIFY_EMAIL = false` in `js/firebase-config.js`.

```js
/* Apps Script — Code.gs  (Bioinformatics Training Q&A)
   1. notifyReplies()  time trigger: polls Firestore for new replies to
                       questions whose author ticked the email option.
   2. doPost()         optional Sheet fallback, used only when GAS_URL is
                       filled in AND Firestore is unavailable.
*/
var SITE_URL = 'https://bioinformaticsph.github.io/bioinformatics-training-intermediate-2026/qa.html';
var SEEN_KEY = 'seenReplies';
var SEEN_MAX = 400;

function install() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('FIREBASE_PROJECT_ID') || !props.getProperty('FIREBASE_API_KEY')) {
    throw new Error('Set FIREBASE_PROJECT_ID and FIREBASE_API_KEY script properties first.');
  }
  if (!props.getProperty(SEEN_KEY)) props.setProperty(SEEN_KEY, '[]');
  if (ScriptApp.getProjectTriggers().length === 0) {
    ScriptApp.newTrigger('notifyReplies').timeBased().everyMinutes(5).create();
  }
}

function firestore_(path) {
  var props = PropertiesService.getScriptProperties();
  var url = 'https://firestore.googleapis.com/v1/projects/' +
            props.getProperty('FIREBASE_PROJECT_ID') +
            '/databases/(default)/documents/' + path +
            '?pageSize=200&key=' + props.getProperty('FIREBASE_API_KEY');
  var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) {
    throw new Error('Firestore ' + res.getResponseCode() + ': ' + res.getContentText());
  }
  return JSON.parse(res.getContentText()) || { documents: [] };
}

function text_(f) {
  if (!f) return '';
  if (f.stringValue !== undefined) return f.stringValue;
  if (f.booleanValue !== undefined) return String(f.booleanValue);
  if (f.timestampValue !== undefined) return f.timestampValue;
  if (f.integerValue !== undefined) return String(f.integerValue);
  return '';
}

function notifyReplies() {
  var props = PropertiesService.getScriptProperties();
  var seen = [];
  try { seen = JSON.parse(props.getProperty(SEEN_KEY) || '[]'); } catch (e) { seen = []; }
  var known = {};
  seen.forEach(function (p) { known[p] = true; });

  var changed = false;
  (firestore_('questions').documents || []).forEach(function (doc) {
    var f = doc.fields || {};
    var to = text_(f.email);
    if (f.notifyByEmail === undefined || f.notifyByEmail.booleanValue !== true || !to) return;

    var qid = doc.name.split('/').pop();
    var question = text_(f.question);
    var asker = text_(f.user);
    var replies;
    try { replies = firestore_('questions/' + qid + '/replies').documents || []; }
    catch (e) { Logger.log('replies ' + qid + ': ' + e); return; }

    replies.forEach(function (r) {
      if (known[r.name]) return;
      var rf = r.fields || {};
      var from = text_(rf.email);
      if (from && from.toLowerCase() === to.toLowerCase()) return; // own reply

      var body = 'Hi ' + (asker || 'there') + ',\n\n' +
        text_(rf.user) + ' replied to your question on the workshop Q&A page.\n\n' +
        'Your question:\n' + question + '\n\n' +
        'Reply:\n' + text_(rf.message) + '\n\n' +
        'Read and reply: ' + SITE_URL;
      try { MailApp.sendEmail(to, 'New reply to your question — Bioinformatics Training Q&A', body); }
      catch (e) { Logger.log('email failed ' + r.name + ': ' + e); }

      known[r.name] = true; seen.push(r.name); changed = true;
    });
  });

  if (changed) {
    if (seen.length > SEEN_MAX) seen = seen.slice(seen.length - SEEN_MAX);
    props.setProperty(SEEN_KEY, JSON.stringify(seen));
  }
}

function testNotify() { notifyReplies(); Logger.log('notifyReplies OK'); }

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('questions');
  sheet.appendRow([new Date(), data.user, data.email, data.question]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

**Optional — the Sheet fallback (`GAS_URL`).** `doPost` (job 2) only matters if you want
questions mirrored to a spreadsheet when Firestore is unavailable; it never touches replies:

1. **Deploy → New deployment →** (gear) **Web app** → *Execute as*: **Me**,
   *Who has access*: **Anyone** → **Deploy** → copy the `/exec` URL.
2. Paste it into `GAS_URL` (`js/firebase-config.js`) and push. (Unused otherwise — the email
   feature reads Firestore directly.)

**Verify end to end.** From one Google account, post a question with the tick on; from a
second account, reply. The email arrives in ≤ ~5 minutes (the very first scheduled run can
take up to ~1 hour), sent from the script owner's Gmail. Failures show up under
**View → Executions**.

**Quotas (free tier).** `MailApp` 100 recipients/day · `UrlFetchApp` 20,000 fetches/day ·
6-minute max run · trigger every 5 minutes · at most `SEEN_MAX = 400` reply paths kept in
the `seenReplies` script property (the dedupe list).

**Troubleshooting.**

| Symptom | Fix |
| --- | --- |
| `install()` throws *Set FIREBASE_PROJECT_ID…* | Add both script properties (step 2) and re-run. |
| No trigger under **Triggers** | Re-run `install()`; if a stale trigger exists, delete it first — `install()` only creates one when the project has none. |
| `Firestore 401 / 403 / 404` in Executions | Wrong `FIREBASE_API_KEY` / `FIREBASE_PROJECT_ID`, or the Firestore database was never created. |
| No email arrives | Check the question really has `notifyByEmail: true`, that the replier isn't the author (self-replies are skipped), and read the Executions log; already-mailed replies sit in `seenReplies`. |
| *"Google hasn't verified this app"* persists | Expected for a personal script — re-authorize with **Advanced → Go to (unsafe)**. |
| Reply posted, email late | Scheduled runs can lag up to ~1 hour on the first pass; `testNotify()` forces a manual run. |

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
| Per-day requirements | `reqs` array in each `SCHEDULE` entry (`js/ui.js`) |
| Workshop 1 Recap / Train the Trainers | `#recap` / `#trainers` sections in `index.html` |
| Materials / Drive links | `MATERIALS` in `js/ui.js` + `DRIVE_LINKS` in `js/firebase-config.js` |
| Resources | `RESOURCES` in `js/ui.js` |
| FAQs | `FAQS` in `js/ui.js` |
| Participant Q&A page | `qa.html` + the `#qa` section inside it (header/footer are duplicated by design) |
| Q&A feed, threads & reply UI | `js/questions.js` |
| Validation, anti-spam & reply limits | `QUESTION_*` / `REPLY_*` constants in `js/firebase-config.js` |
| Organizer allowlist & announcements | `INSTRUCTOR_EMAILS` / `ANNOUNCEMENT_*` in `js/firebase-config.js` |
| Brand colours | `tailwind.config` in `index.html` + `qa.html` + `:root` in `css/style.css` |

## Accessibility & performance

- Semantic landmarks, skip link, `aria-expanded` accordions, `aria-live` regions, keyboard-operable.
- Visible focus rings and full `prefers-reduced-motion` support.
- No build step, three CDN requests, and a lightweight flat-green hero (zero image payload).
- Firebase SDK is imported **lazily** — never downloaded until a real config is present.
