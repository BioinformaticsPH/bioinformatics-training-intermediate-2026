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
  REPLIES_SUBCOLLECTION,
  REPLY_MAX_LENGTH,
  QUESTION_MIN_LENGTH,
  QUESTION_MAX_LENGTH,
  QUESTION_COOLDOWN_MS,
  QUESTION_CATEGORIES,
  QUESTION_TRUNCATE_LENGTH,
  REPLY_NOTIFY_EMAIL,
  GAS_URL,
  gasEnabled
} from "./firebase-config.js";

const COOLDOWN_KEY = "bi_train_last_question";

let unsubscribeFeed = null;

/* Feed state — the full snapshot is cached so the topic filter can be
   applied client-side without re-fetching. */
let allItems = [];
let activeCategory = "All";

/* Thread state — replies for each question are subscribed lazily the
   first time its thread is expanded, then cached for the session. */
const threadSubs = new Map(); // questionId -> onSnapshot unsubscribe
const threadCache = new Map(); // questionId -> replies[]
const openThreads = new Set(); // questionId with an expanded thread
const editingReplies = new Set(); // replyId currently being edited

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
  const who = escapeHtml(q.answeredBy?.name || "Instructor");
  const when = q.answeredAt
    ? ` <span class="text-xs text-charcoal-soft/70">${escapeHtml(timeAgo(q.answeredAt))}</span>`
    : "";
  return `
    <div class="qa-answer">
      <span class="font-semibold text-forest"><i class="fa-solid fa-reply mr-1" aria-hidden="true"></i>${who}:</span>
      ${escapeHtml(q.answer)}${when}
    </div>`;
}

/* ------------------------- Reply threads ----------------------- */

function replyItem(r, qid) {
  const me = getCurrentUser();
  const mine = !!me && me.email && r.email === me.email;
  const name = r.user || "Participant";
  const avatar = r.avatar || initialsAvatar(name);
  const editing = editingReplies.has(r.id);

  const body = editing
    ? `
      <div class="qa-reply-edit">
        <label class="sr-only" for="edit-${escapeHtml(r.id)}">Edit reply</label>
        <textarea id="edit-${escapeHtml(r.id)}" rows="2" maxlength="${REPLY_MAX_LENGTH}"
          data-reply-edit-input data-qid="${escapeHtml(qid)}" data-reply-id="${escapeHtml(r.id)}">${escapeHtml(r.message || "")}</textarea>
        <div class="qa-reply-actions">
          <button type="button" data-reply-cancel data-qid="${escapeHtml(qid)}" data-reply-id="${escapeHtml(r.id)}" class="qa-reply-btn qa-reply-btn-ghost">Cancel</button>
          <button type="button" data-reply-save data-qid="${escapeHtml(qid)}" data-reply-id="${escapeHtml(r.id)}" class="qa-reply-btn qa-reply-btn-primary">Save</button>
        </div>
      </div>`
    : `<p class="qa-reply-body break-words">${escapeHtml(r.message || "")}</p>`;

  const actions = mine && !editing
    ? `
      <div class="qa-reply-editlinks">
        <button type="button" data-reply-edit data-qid="${escapeHtml(qid)}" data-reply-id="${escapeHtml(r.id)}" class="qa-reply-link">Edit</button>
        <button type="button" data-reply-delete data-qid="${escapeHtml(qid)}" data-reply-id="${escapeHtml(r.id)}" class="qa-reply-link qa-reply-link-danger">Delete</button>
      </div>`
    : "";

  return `
    <li class="qa-reply" data-reply-id="${escapeHtml(r.id)}">
      <img class="qa-reply-avatar" src="${avatar}" alt="" />
      <div class="min-w-0 flex-1">
        <p class="qa-reply-meta">
          <span class="font-semibold text-forest">${escapeHtml(name)}</span>
          <span class="qa-reply-time">${escapeHtml(timeAgo(r.timestamp))}</span>
          ${mine ? `<span class="qa-reply-you">You</span>` : ""}
        </p>
        ${body}
        ${actions}
      </div>
    </li>`;
}

function replyComposer(qid) {
  const user = getCurrentUser();
  if (!user) {
    return `<p class="qa-reply-signin"><i class="fa-solid fa-circle-info mr-1 text-leaf-dark" aria-hidden="true"></i>Sign in with Google to join the discussion.</p>`;
  }
  return `
    <div class="qa-reply-composer" data-qid="${escapeHtml(qid)}">
      <label class="sr-only" for="reply-${escapeHtml(qid)}">Write a reply</label>
      <textarea id="reply-${escapeHtml(qid)}" rows="2" maxlength="${REPLY_MAX_LENGTH}"
        data-reply-input data-qid="${escapeHtml(qid)}" placeholder="Write a reply…"></textarea>
      <div class="qa-reply-actions">
        <span data-reply-counter class="qa-reply-counter">0 / ${REPLY_MAX_LENGTH}</span>
        <button type="button" data-reply-submit data-qid="${escapeHtml(qid)}" class="qa-reply-btn qa-reply-btn-primary">
          <i class="fa-solid fa-reply" aria-hidden="true"></i> Reply
        </button>
      </div>
    </div>`;
}

function renderThread(qid) {
  const root = document.querySelector(`.qa-thread[data-thread-for="${CSS.escape(qid)}"]`);
  if (!root) return;
  const list = root.querySelector("[data-thread-list]");
  const composer = root.querySelector("[data-thread-composer]");
  const replies = threadCache.get(qid) || [];

  if (list) {
    list.innerHTML = replies.length
      ? replies.map((r) => replyItem(r, qid)).join("")
      : `<li class="qa-reply-empty">No replies yet — be the first to respond.</li>`;
  }
  if (composer) composer.innerHTML = replyComposer(qid);
}

function repliesSection(q) {
  // GAS-fallback items have no Firestore id and cannot host a thread.
  if (!q.id) return "";
  const open = openThreads.has(q.id);
  return `
    <div class="qa-replies">
      <button type="button" class="qa-replies-toggle" data-reply-toggle data-qid="${escapeHtml(q.id)}" aria-expanded="${open}">
        <i class="fa-regular fa-comments" aria-hidden="true"></i>
        <span class="qa-replies-label">Replies</span>
        <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
      </button>
      <div class="qa-thread${open ? "" : " hidden"}" data-thread-for="${escapeHtml(q.id)}">
        <ul class="qa-thread-list" data-thread-list></ul>
        <div data-thread-composer></div>
      </div>
    </div>`;
}

function repaintOpenThreads() {
  openThreads.forEach((qid) => {
    const root = document.querySelector(`.qa-thread[data-thread-for="${CSS.escape(qid)}"]`);
    root?.classList.remove("hidden");
    markReplyToggle(qid, true);
    renderThread(qid);
  });
}

function markReplyToggle(qid, open) {
  const btn = document.querySelector(`.qa-replies-toggle[data-qid="${CSS.escape(qid)}"]`);
  if (btn) btn.setAttribute("aria-expanded", String(open));
}

async function subscribeThread(qid) {
  if (threadSubs.has(qid)) return;
  const { db, enabled } = getFirebase();
  if (!enabled || !db) {
    threadCache.set(qid, threadCache.get(qid) || []);
    renderThread(qid);
    return;
  }
  // Reserve the slot before the async import so a double-click cannot
  // attach two listeners to the same thread.
  threadSubs.set(qid, null);
  try {
    const { collection, query, orderBy, onSnapshot } = await import("firebase/firestore");
    const col = collection(db, QUESTIONS_COLLECTION, qid, REPLIES_SUBCOLLECTION);
    const unsub = onSnapshot(
      query(col, orderBy("timestamp", "asc")),
      (snap) => {
        threadCache.set(qid, snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        renderThread(qid);
      },
      (err) => {
        console.error("[questions] reply snapshot error:", err);
        showToast("Could not load replies for this question.", "error");
      }
    );
    threadSubs.set(qid, unsub);
  } catch (err) {
    console.error("[questions] reply subscribe failed:", err);
    threadSubs.delete(qid);
  }
}

function toggleThread(qid) {
  const open = !openThreads.has(qid);
  const root = document.querySelector(`.qa-thread[data-thread-for="${CSS.escape(qid)}"]`);
  if (open) {
    openThreads.add(qid);
    root?.classList.remove("hidden");
    markReplyToggle(qid, true);
    subscribeThread(qid);
    renderThread(qid);
  } else {
    openThreads.delete(qid);
    root?.classList.add("hidden");
    markReplyToggle(qid, false);
  }
}

function updateReplyCounter(el) {
  const composer = el.closest(".qa-reply-composer");
  const counter = composer?.querySelector("[data-reply-counter]");
  if (counter) counter.textContent = `${el.value.length} / ${REPLY_MAX_LENGTH}`;
}

async function submitReply(qid, textarea) {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please sign in with your participant Google account to reply.", "error");
    return;
  }
  const text = (textarea?.value || "").trim();
  if (!text) {
    showToast("Please write a reply first.", "error");
    return;
  }
  if (text.length > REPLY_MAX_LENGTH) {
    showToast(`Replies must be under ${REPLY_MAX_LENGTH} characters.`, "error");
    return;
  }
  const wait = cooldownRemaining();
  if (wait > 0) {
    showToast(`Please wait ${Math.ceil(wait / 1000)}s before posting again.`, "error");
    return;
  }

  const { db, enabled } = getFirebase();
  if (!enabled || !db) {
    showToast("Replies are currently unavailable. Please try again later.", "error");
    return;
  }

  textarea.disabled = true;
  try {
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    await addDoc(collection(db, QUESTIONS_COLLECTION, qid, REPLIES_SUBCOLLECTION), {
      message: text,
      user: user.displayName || "Participant",
      email: user.email || "",
      avatar: user.photoURL || "",
      timestamp: serverTimestamp()
    });
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
    textarea.value = "";
    showToast("Reply posted.", "success");
  } catch (err) {
    console.error("[questions] reply submit failed:", err);
    showToast("Something went wrong posting your reply. Please try again.", "error");
  } finally {
    textarea.disabled = !getCurrentUser();
  }
}

async function saveReply(qid, replyId, textarea) {
  const text = (textarea?.value || "").trim();
  if (!text) {
    showToast("Reply cannot be empty.", "error");
    return;
  }
  if (text.length > REPLY_MAX_LENGTH) {
    showToast(`Replies must be under ${REPLY_MAX_LENGTH} characters.`, "error");
    return;
  }
  const { db, enabled } = getFirebase();
  if (!enabled || !db) return;
  try {
    const { doc, updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(db, QUESTIONS_COLLECTION, qid, REPLIES_SUBCOLLECTION, replyId), {
      message: text,
      editedAt: Date.now()
    });
    editingReplies.delete(replyId);
    showToast("Reply updated.", "success");
  } catch (err) {
    console.error("[questions] reply edit failed:", err);
    showToast("Could not update your reply. Please try again.", "error");
  }
}

async function deleteReply(qid, replyId) {
  const { db, enabled } = getFirebase();
  if (!enabled || !db) return;
  if (!window.confirm("Delete this reply? This cannot be undone.")) return;
  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, QUESTIONS_COLLECTION, qid, REPLIES_SUBCOLLECTION, replyId));
    showToast("Reply deleted.", "info");
  } catch (err) {
    console.error("[questions] reply delete failed:", err);
    showToast("Could not delete your reply. Please try again.", "error");
  }
}

function feedItem(q) {
  const name = q.user || "Participant";
  const avatar = q.avatar || initialsAvatar(name);
  return `
    <li class="question-item"${q.id ? ` data-qid="${escapeHtml(q.id)}"` : ""}>
      <img class="question-avatar" src="${avatar}" alt="" />
      <div class="min-w-0 flex-1">
        <p class="flex items-center gap-2 text-sm">
          <span class="truncate font-semibold text-forest">${escapeHtml(name)}</span>
          <span class="shrink-0 text-xs text-charcoal-soft/70">${escapeHtml(timeAgo(q.timestamp))}</span>
        </p>
        <p class="mt-1 flex flex-wrap items-center gap-1.5">${categoryBadge(q)}</p>
        ${questionBody(q)}
        ${answerBlock(q)}
        ${repliesSection(q)}
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
  repaintOpenThreads();
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
    (snap) => renderFeed(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
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
  const notify = document.getElementById("question-notify");

  toggles.forEach(({ el, show }) => el?.classList.toggle("hidden", !show));
  if (signedOut) signedOut.classList.toggle("flex", !user);

  if (user) {
    chip?.classList.remove("hidden");
    chip?.classList.add("flex");
    if (input) input.disabled = false;
    if (select) select.disabled = false;
    if (submit) submit.disabled = false;
    if (notify) notify.disabled = false;
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
    if (notify) {
      notify.disabled = true;
      notify.checked = false;
    }
    if (hint) hint.textContent = "Sign in to post";
    updateCharCount();
  }
  void composer;
  // Re-render so reply composers / "You" affordances track auth state.
  renderFiltered();
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
    notifyByEmail: document.getElementById("question-notify")?.checked === true
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

/* Delegated handler so toggles and reply controls keep working after
   innerHTML re-renders. */
function onFeedClick(e) {
  const replyToggle = e.target.closest("[data-reply-toggle]");
  if (replyToggle) {
    toggleThread(replyToggle.dataset.qid);
    return;
  }

  const replySubmit = e.target.closest("[data-reply-submit]");
  if (replySubmit) {
    const ta = replySubmit.closest(".qa-reply-composer")?.querySelector("[data-reply-input]");
    submitReply(replySubmit.dataset.qid, ta);
    return;
  }

  const replySave = e.target.closest("[data-reply-save]");
  if (replySave) {
    const ta = replySave.closest(".qa-reply-edit")?.querySelector("[data-reply-edit-input]");
    saveReply(replySave.dataset.qid, replySave.dataset.replyId, ta);
    return;
  }

  const replyEdit = e.target.closest("[data-reply-edit]");
  if (replyEdit) {
    editingReplies.add(replyEdit.dataset.replyId);
    renderThread(replyEdit.dataset.qid);
    return;
  }

  const replyCancel = e.target.closest("[data-reply-cancel]");
  if (replyCancel) {
    editingReplies.delete(replyCancel.dataset.replyId);
    renderThread(replyCancel.dataset.qid);
    return;
  }

  const replyDelete = e.target.closest("[data-reply-delete]");
  if (replyDelete) {
    deleteReply(replyDelete.dataset.qid, replyDelete.dataset.replyId);
    return;
  }

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

function onFeedInput(e) {
  const replyInput = e.target.closest("[data-reply-input]");
  if (replyInput) updateReplyCounter(replyInput);
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

  // Hide the notification tick when the Apps Script poller is not set up.
  if (!REPLY_NOTIFY_EMAIL) {
    document.getElementById("question-notify-wrap")?.classList.add("hidden");
  }

  input?.addEventListener("input", updateCharCount);
  submit?.addEventListener("click", handleSubmit);
  input?.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
  });

  document.getElementById("question-feed")?.addEventListener("click", onFeedClick);
  document.getElementById("question-feed")?.addEventListener("input", onFeedInput);
  document.getElementById("qa-filters")?.addEventListener("click", onFiltersClick);

  // React to auth changes.
  onUserChange(applyAuthState);

  // Initial empty state: renders the "no questions yet" copy and hides
  // the topic filter pills until the first snapshot arrives.
  renderFeed([]);

  const { db, enabled } = getFirebase();
  if (enabled && db) {
    await subscribeFirestore(db);
  }

  updateCharCount();
}
