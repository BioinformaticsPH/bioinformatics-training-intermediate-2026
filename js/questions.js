/* =================================================================
   js/questions.js
   -----------------------------------------------------------------
   The Q&A engine:
     • renders the Recent Questions feed
     • subscribes to Firestore in real time (onSnapshot)
     • validates + rate-limits submissions (anti-spam)
     • falls back to a Google Apps Script endpoint when Firestore is off
   ================================================================= */

import { getFirebase } from "./firebase.js";
import { getCurrentUser, onUserChange } from "./auth.js";
import { showToast, escapeHtml } from "./ui.js";
import {
  QUESTIONS_COLLECTION,
  QUESTION_MIN_LENGTH,
  QUESTION_MAX_LENGTH,
  QUESTION_COOLDOWN_MS,
  QUESTION_CATEGORIES,
  QUESTION_TRUNCATE_LENGTH,
  GAS_URL,
  gasEnabled
} from "./firebase-config.js";

const COOLDOWN_KEY = "bi_train_last_question";

let unsubscribeFeed = null;

/* Feed state — the full snapshot is cached so the topic filter can be
   applied client-side without re-fetching. */
let allItems = [];
let activeCategory = "All";

/* ------------------------- Feed rendering ---------------------- */

function initialsAvatar(name = "?") {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
         <rect width='64' height='64' rx='32' fill='#0B3C23'/>
         <text x='50%' y='53%' text-anchor='middle' dominant-baseline='middle'
               font-family='sans-serif' font-size='26' fill='white'>${initials}</text>
       </svg>`
    )
  );
}

function timeAgo(ts) {
  if (!ts) return "just now";
  const then = typeof ts === "number" ? ts : ts.toDate?.()?.getTime?.() || Date.now();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function categoryBadge(q) {
  return `<span class="inline-flex items-center rounded-full border border-sage px-2 py-0.5 text-[0.68rem] font-medium text-charcoal-soft">${escapeHtml(q.category || "General")}</span>`;
}

function isAnswered(q) {
  return q.status === "answered" || (typeof q.answer === "string" && q.answer.trim().length > 0);
}

function statusBadge(q) {
  return isAnswered(q)
    ? `<span class="inline-flex items-center gap-1 rounded-full bg-leaf/20 px-2 py-0.5 text-[0.68rem] font-semibold text-forest"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Answered</span>`
    : `<span class="inline-flex items-center gap-1 rounded-full bg-sage-100 px-2 py-0.5 text-[0.68rem] font-semibold text-charcoal-soft"><i class="fa-regular fa-clock" aria-hidden="true"></i> Pending</span>`;
}

function questionBody(q) {
  const text = q.question || "";
  const full = escapeHtml(text);
  if (text.length <= QUESTION_TRUNCATE_LENGTH) {
    return `<p class="mt-1 break-words text-sm text-charcoal-soft">${full}</p>`;
  }
  const short = escapeHtml(text.slice(0, QUESTION_TRUNCATE_LENGTH).trimEnd()) + "&hellip;";
  return `
    <p class="mt-1 break-words text-sm text-charcoal-soft">
      <span class="q-short">${short}</span>
      <span class="q-full qa-full hidden">${full}</span>
    </p>
    <button type="button" class="qa-toggle" aria-expanded="false">
      <span class="qa-toggle-label">Show more</span>
      <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
    </button>`;
}

function answerBlock(q) {
  if (typeof q.answer !== "string" || !q.answer.trim()) return "";
  return `
    <div class="qa-answer">
      <span class="font-semibold text-forest"><i class="fa-solid fa-reply mr-1" aria-hidden="true"></i>Instructor:</span>
      ${escapeHtml(q.answer)}
    </div>`;
}

function feedItem(q) {
  const name = q.user || "Participant";
  const avatar = q.avatar || initialsAvatar(name);
  return `
    <li class="question-item">
      <img class="question-avatar" src="${avatar}" alt="" />
      <div class="min-w-0 flex-1">
        <p class="flex items-center gap-2 text-sm">
          <span class="truncate font-semibold text-forest">${escapeHtml(name)}</span>
          <span class="shrink-0 text-xs text-charcoal-soft/70">${escapeHtml(timeAgo(q.timestamp))}</span>
        </p>
        <p class="mt-1 flex flex-wrap items-center gap-1.5">${categoryBadge(q)}${statusBadge(q)}</p>
        ${questionBody(q)}
        ${answerBlock(q)}
      </div>
    </li>`;
}

function renderFilters() {
  const bar = document.getElementById("qa-filters");
  if (!bar) return;
  if (!allItems.length) {
    bar.innerHTML = "";
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");
  const cats = ["All", ...QUESTION_CATEGORIES];
  bar.innerHTML = cats
    .map(
      (c) =>
        `<button type="button" class="qa-filter" data-category="${escapeHtml(c)}" aria-pressed="${c === activeCategory}">${escapeHtml(c)}</button>`
    )
    .join("");
}

function renderFiltered() {
  const feed = document.getElementById("question-feed");
  if (!feed) return;

  const items =
    activeCategory === "All"
      ? allItems
      : allItems.filter((q) => (q.category || "General") === activeCategory);

  if (!items.length) {
    const filtered = allItems.length > 0;
    feed.innerHTML = `
      <li class="rounded-xl border border-dashed border-sage-100 bg-sage-50/50 px-4 py-6 text-center">
        <span class="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-full bg-leaf/15 text-leaf-dark">
          <i class="fa-regular fa-comments text-lg" aria-hidden="true"></i>
        </span>
        <p class="text-sm font-semibold text-forest">${filtered ? "No questions in this topic" : "No questions yet"}</p>
        <p class="mt-1 text-xs text-charcoal-soft">${
          filtered
            ? `Nothing filed under &ldquo;${escapeHtml(activeCategory)}&rdquo; yet &mdash; try another topic.`
            : "Have a question during the lab? Drop it here for the instructors!"
        }</p>
      </li>`;
    return;
  }

  feed.innerHTML = items.map(feedItem).join("");
}

function renderFeed(items) {
  allItems = items;
  renderFilters();
  renderFiltered();
}

function prependFeedItem(q) {
  allItems = [q, ...allItems];
  renderFilters();
  renderFiltered();
}

/* ------------------- Firestore realtime subscribe -------------- */

async function subscribeFirestore(db) {
  const { collection, query, orderBy, limit, onSnapshot } = await import("firebase/firestore");

  const q = query(collection(db, QUESTIONS_COLLECTION), orderBy("timestamp", "desc"), limit(20));

  unsubscribeFeed = onSnapshot(
    q,
    (snap) => renderFeed(snap.docs.map((d) => d.data())),
    (err) => {
      console.error("[questions] snapshot error:", err);
      showToast("Could not load the question feed.", "error");
    }
  );
}

/* ------------------------- Auth wiring ------------------------- */

function applyAuthState(user) {
  const signedOut = document.getElementById("qa-signedout");
  const toggles = [
    { el: signedOut, show: !user }
  ];
  const composer = document.getElementById("qa-composer");
  const chip = document.getElementById("qa-user-chip");
  const input = document.getElementById("question-input");
  const select = document.getElementById("question-category");
  const submit = document.getElementById("submit-question");
  const hint = document.getElementById("qa-hint");

  toggles.forEach(({ el, show }) => el?.classList.toggle("hidden", !show));
  if (signedOut) signedOut.classList.toggle("flex", !user);

  if (user) {
    chip?.classList.remove("hidden");
    chip?.classList.add("flex");
    if (input) input.disabled = false;
    if (select) select.disabled = false;
    if (submit) submit.disabled = false;
    if (hint) hint.textContent = "Signed in";
    const av = document.getElementById("qa-avatar");
    const un = document.getElementById("qa-username");
    if (av) av.src = user.photoURL || initialsAvatar(user.displayName);
    if (un) un.textContent = user.displayName || user.email;
  } else {
    chip?.classList.add("hidden");
    chip?.classList.remove("flex");
    if (input) {
      input.disabled = true;
      input.value = "";
    }
    if (select) select.disabled = true;
    if (submit) submit.disabled = true;
    if (hint) hint.textContent = "Sign in to post";
    updateCharCount();
  }
  void composer;
}

/* ------------------------- Submission -------------------------- */

const COUNTER_NEUTRAL = "text-xs text-charcoal-soft";
const COUNTER_WARN = "text-xs font-semibold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5";
const COUNTER_MAX = "text-xs font-semibold text-red-600 bg-red-50 rounded-full px-2 py-0.5";

function updateCharCount() {
  const input = document.getElementById("question-input");
  const counter = document.getElementById("char-count");
  if (!input || !counter) return;
  const len = input.value.length;
  counter.textContent = `${len} / ${QUESTION_MAX_LENGTH}`;
  if (len >= QUESTION_MAX_LENGTH) counter.className = COUNTER_MAX;
  else if (len >= QUESTION_MAX_LENGTH * 0.9) counter.className = COUNTER_WARN;
  else counter.className = COUNTER_NEUTRAL;
}

let feedbackTimer = null;
function showFeedback(message = "Your question has been posted!") {
  const el = document.getElementById("qa-feedback");
  if (!el) return;
  const text = el.querySelector("span");
  if (text) text.textContent = message;
  el.classList.remove("hidden");
  el.classList.add("flex");
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    el.classList.add("hidden");
    el.classList.remove("flex");
  }, 4000);
}

function cooldownRemaining() {
  const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
  return Math.max(0, QUESTION_COOLDOWN_MS - (Date.now() - last));
}

async function handleSubmit() {
  const user = getCurrentUser();
  const input = document.getElementById("question-input");
  const btn = document.getElementById("submit-question");
  if (!input || !btn) return;

  if (!user) {
    showToast("Please sign in with your participant Google account to post a question.", "error");
    return;
  }

  const text = input.value.trim();
  if (text.length < QUESTION_MIN_LENGTH) {
    showToast(`Question must be at least ${QUESTION_MIN_LENGTH} characters.`, "error");
    return;
  }
  if (text.length > QUESTION_MAX_LENGTH) {
    showToast(`Question must be under ${QUESTION_MAX_LENGTH} characters.`, "error");
    return;
  }

  const wait = cooldownRemaining();
  if (wait > 0) {
    showToast(`Please wait ${Math.ceil(wait / 1000)}s before posting again.`, "error");
    return;
  }

  const payload = {
    user: user.displayName || "Participant",
    email: user.email || "",
    avatar: user.photoURL || "",
    question: text,
    category: document.getElementById("question-category")?.value || "General",
    status: "pending"
  };

  btn.disabled = true;
  const originalLabel = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i><span>Submitting…</span>`;

  try {
    const { db, enabled } = getFirebase();

    if (enabled && db) {
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      await addDoc(collection(db, QUESTIONS_COLLECTION), {
        ...payload,
        timestamp: serverTimestamp()
      });
      // The onSnapshot listener renders the new item automatically.
    } else if (gasEnabled) {
      await fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() })
      });
      prependFeedItem({ ...payload, timestamp: Date.now() });
    } else {
      showToast("Live Q&A is currently unavailable. Please try again later.", "error");
      return;
    }

    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
    input.value = "";
    updateCharCount();
    showFeedback();
    showToast("Question submitted successfully!", "success");
  } catch (err) {
    console.error("[questions] submit failed:", err);
    showToast("Something went wrong submitting your question. Please try again.", "error");
  } finally {
    btn.disabled = !getCurrentUser();
    btn.innerHTML = originalLabel;
  }
}

/* --------------------------- EVENTS ---------------------------- */

function populateCategoryOptions() {
  const select = document.getElementById("question-category");
  if (!select) return;
  select.innerHTML = QUESTION_CATEGORIES.map(
    (c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`
  ).join("");
  select.value = "General";
}

/* Delegated handler so toggles keep working after innerHTML re-renders. */
function onFeedClick(e) {
  const btn = e.target.closest(".qa-toggle");
  if (!btn) return;
  const next = btn.getAttribute("aria-expanded") !== "true";
  btn.setAttribute("aria-expanded", String(next));
  const label = btn.querySelector(".qa-toggle-label");
  if (label) label.textContent = next ? "Show less" : "Show more";
  const item = btn.closest(".question-item");
  item?.querySelector(".q-short")?.classList.toggle("hidden", next);
  item?.querySelector(".q-full")?.classList.toggle("hidden", !next);
}

function onFiltersClick(e) {
  const btn = e.target.closest(".qa-filter");
  if (!btn) return;
  activeCategory = btn.dataset.category || "All";
  renderFilters();
  renderFiltered();
}

/* --------------------------- INIT ------------------------------ */

export async function initQuestions() {
  const input = document.getElementById("question-input");
  const submit = document.getElementById("submit-question");

  populateCategoryOptions();

  input?.addEventListener("input", updateCharCount);
  submit?.addEventListener("click", handleSubmit);
  input?.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
  });

  document.getElementById("question-feed")?.addEventListener("click", onFeedClick);
  document.getElementById("qa-filters")?.addEventListener("click", onFiltersClick);

  // React to auth changes.
  onUserChange(applyAuthState);

  // Initial feed.
  const { db, enabled } = getFirebase();
  if (enabled && db) {
    await subscribeFirestore(db);
  } else {
    renderFeed([]);
  }

  updateCharCount();
}
