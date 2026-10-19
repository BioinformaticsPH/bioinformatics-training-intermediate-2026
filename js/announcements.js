/* =================================================================
   js/announcements.js
   -----------------------------------------------------------------
   Live "Organizer Announcements" broadcast widget:
     • pinned banner for the active (newest pinned) notice
     • reverse-chronological history of past notices
     • organizer composer, gated by an email allowlist (UX only —
       the real restriction lives in the Firestore rules)
     • falls back to a config-driven sample when Firestore is off
   ================================================================= */

import { getFirebase } from "./firebase.js";
import { getCurrentUser, onUserChange } from "./auth.js";
import { showToast, escapeHtml } from "./ui.js";
import {
  ANNOUNCEMENTS_COLLECTION,
  ANNOUNCEMENT_MAX_LENGTH,
  ANNOUNCEMENTS_LIMIT,
  INSTRUCTOR_EMAILS,
  ANNOUNCEMENT_FALLBACK
} from "./firebase-config.js";

const DISMISS_KEY = "bi:announce_dismissed";
const COLLAPSE_KEY = "bi:announce_collapsed";

let allItems = [];
let dismissedId = null;
let collapsed = false;

/* ----------------------------- Helpers ------------------------- */

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

function isOrganizer() {
  const user = getCurrentUser();
  return !!user && INSTRUCTOR_EMAILS.includes((user.email || "").toLowerCase());
}

/* The active notice is the newest pinned item, else the newest item. */
function activeItem() {
  return allItems.find((a) => a.pinned) || allItems[0] || null;
}

/* --------------------------- Rendering ------------------------- */

function renderBanner() {
  const banner = document.getElementById("announce-banner");
  const message = document.getElementById("announce-message");
  const time = document.getElementById("announce-time");
  if (!banner) return;

  const active = activeItem();
  if (!active || (active.id && active.id === dismissedId)) {
    banner.classList.add("hidden");
    return;
  }

  if (message) message.textContent = active.message || "";
  if (time) time.textContent = `${active.author || "Organizers"} · ${timeAgo(active.timestamp)}`;
  banner.classList.remove("hidden");

  const body = document.getElementById("announce-banner-body");
  const btn = document.getElementById("announce-collapse");
  if (body) body.classList.toggle("hidden", collapsed);
  if (btn) {
    btn.setAttribute("aria-expanded", String(!collapsed));
    const icon = btn.querySelector("i");
    if (icon) icon.className = collapsed ? "fa-solid fa-chevron-down" : "fa-solid fa-chevron-up";
  }
}

function historyItem(a) {
  return `
    <li class="announce-item">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span class="inline-flex items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-wide text-amber-700">
          <i class="fa-solid fa-bullhorn" aria-hidden="true"></i>${escapeHtml(a.author || "Organizers")}
        </span>
        <span class="text-xs text-charcoal-soft/70">${escapeHtml(timeAgo(a.timestamp))}</span>
      </div>
      <p class="mt-1 break-words text-sm text-charcoal-soft">${escapeHtml(a.message || "")}</p>
    </li>`;
}

function renderHistory() {
  const list = document.getElementById("announce-list");
  if (!list) return;

  const active = activeItem();
  const past = allItems.filter((a) => a !== active);

  if (!past.length) {
    list.innerHTML = `
      <li id="announce-empty" class="rounded-xl border border-dashed border-sage-100 bg-white px-4 py-5 text-center text-xs text-charcoal-soft">
        No past announcements yet.
      </li>`;
    return;
  }

  list.innerHTML = past.map(historyItem).join("");
}

function renderAll() {
  renderBanner();
  renderHistory();
}

/* ------------------------- Organizer UI ------------------------ */

function applyOrganizerState() {
  const compose = document.getElementById("announce-compose");
  if (!compose) return;
  compose.classList.toggle("hidden", !isOrganizer());
}

function updateCount() {
  const input = document.getElementById("announce-input");
  const counter = document.getElementById("announce-count");
  if (input && counter) counter.textContent = `${input.value.length} / ${ANNOUNCEMENT_MAX_LENGTH}`;
}

async function handlePost() {
  const input = document.getElementById("announce-input");
  const btn = document.getElementById("announce-submit");
  const pin = document.getElementById("announce-pin");
  if (!input || !btn) return;

  const user = getCurrentUser();
  if (!isOrganizer() || !user) {
    showToast("Only organizers can post announcements.", "error");
    return;
  }

  const text = input.value.trim();
  if (!text) {
    showToast("Please type an announcement first.", "error");
    return;
  }
  if (text.length > ANNOUNCEMENT_MAX_LENGTH) {
    showToast(`Announcements must be under ${ANNOUNCEMENT_MAX_LENGTH} characters.`, "error");
    return;
  }

  const { db, enabled } = getFirebase();
  if (!enabled || !db) {
    showToast("Announcements require a live connection. Try again later.", "error");
    return;
  }

  btn.disabled = true;
  const original = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i><span>Posting…</span>`;
  try {
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), {
      message: text,
      author: user.displayName || "Organizer",
      email: user.email || "",
      pinned: !!pin?.checked,
      createdAt: serverTimestamp()
    });
    input.value = "";
    updateCount();
    showToast("Announcement posted.", "success");
  } catch (err) {
    console.error("[announcements] post failed:", err);
    showToast("Could not post the announcement. Please try again.", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = original;
  }
}

/* ----------------------- Firestore / init ---------------------- */

async function subscribeFirestore(db) {
  const { collection, query, orderBy, limit, onSnapshot } = await import("firebase/firestore");
  const q = query(
    collection(db, ANNOUNCEMENTS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(ANNOUNCEMENTS_LIMIT)
  );

  onSnapshot(
    q,
    (snap) => {
      allItems = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          message: data.message,
          author: data.author,
          email: data.email,
          pinned: data.pinned === true,
          timestamp: data.createdAt
        };
      });
      renderAll();
    },
    (err) => {
      console.error("[announcements] snapshot error:", err);
      showToast("Could not load announcements.", "error");
    }
  );
}

function renderFallback() {
  allItems = [
    {
      id: "fallback",
      message: ANNOUNCEMENT_FALLBACK.message,
      author: ANNOUNCEMENT_FALLBACK.author,
      pinned: true,
      timestamp: Date.now()
    }
  ];
  renderAll();
  const history = document.getElementById("announce-history");
  if (history) history.classList.add("hidden");
}

function initControls() {
  try {
    dismissedId = localStorage.getItem(DISMISS_KEY);
    collapsed = localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    dismissedId = null;
    collapsed = false;
  }

  document.getElementById("announce-dismiss")?.addEventListener("click", () => {
    const active = activeItem();
    if (!active) return;
    dismissedId = active.id || null;
    try {
      localStorage.setItem(DISMISS_KEY, dismissedId || "");
    } catch {
      /* ignore */
    }
    renderBanner();
  });

  document.getElementById("announce-collapse")?.addEventListener("click", () => {
    collapsed = !collapsed;
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
    renderBanner();
  });

  const input = document.getElementById("announce-input");
  input?.addEventListener("input", updateCount);
  document.getElementById("announce-submit")?.addEventListener("click", handlePost);
  input?.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handlePost();
  });
}

export async function initAnnouncements() {
  initControls();
  updateCount();

  onUserChange(() => applyOrganizerState());

  const { db, enabled } = getFirebase();
  if (enabled && db) {
    await subscribeFirestore(db);
  } else {
    renderFallback();
  }
}
