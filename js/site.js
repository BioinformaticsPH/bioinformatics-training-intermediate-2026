/* =================================================================
   js/site.js
   -----------------------------------------------------------------
   Shared site shell used by every page (index.html, qa.html, …).
   Initialises Firebase, authentication, the presentation layer and
   the header profile dropdown, and wires the header sign-in/out
   controls. Page-specific engines (Q&A, announcements) are started
   by the individual entry modules after `initSiteShell()` resolves.
   ================================================================= */

import { initFirebase, firebaseEnabled } from "./firebase.js";
import { initAuth, onUserChange, signIn, signOutUser } from "./auth.js";
import { initUI, showToast } from "./ui.js";

/* ------------------------ Profile UI --------------------------- */

export function renderProfile(user) {
  const signinBtn = document.getElementById("header-signin");
  const profile = document.getElementById("header-profile");
  const avatar = document.getElementById("profile-avatar");
  const name = document.getElementById("profile-name");
  const menuName = document.getElementById("menu-name");
  const menuEmail = document.getElementById("menu-email");

  const dashOut = document.getElementById("dashboard-signedout");
  const dashIn = document.getElementById("dashboard-signedin");
  const dashAvatar = document.getElementById("dashboard-avatar");
  const dashName = document.getElementById("dashboard-name");
  const dashEmail = document.getElementById("dashboard-email");

  if (user) {
    signinBtn?.classList.add("hidden");
    signinBtn?.classList.remove("inline-flex");
    profile?.classList.remove("hidden");
    profile?.classList.add("block");
    if (avatar) avatar.src = user.photoURL || "";
    if (name) name.textContent = user.displayName || user.email;
    if (menuName) menuName.textContent = user.displayName || "Participant";
    if (menuEmail) menuEmail.textContent = user.email || "";

    dashOut?.classList.add("hidden");
    dashIn?.classList.remove("hidden");
    if (dashAvatar) dashAvatar.src = user.photoURL || "";
    if (dashName) dashName.textContent = `Welcome back, ${user.displayName || "Participant"}`;
    if (dashEmail) dashEmail.textContent = user.email || "";
  } else {
    signinBtn?.classList.remove("hidden");
    signinBtn?.classList.add("inline-flex");
    profile?.classList.add("hidden");
    closeProfileMenu();

    dashOut?.classList.remove("hidden");
    dashIn?.classList.add("hidden");
  }
}

function closeProfileMenu() {
  const menu = document.getElementById("profile-menu");
  const toggle = document.getElementById("profile-toggle");
  menu?.classList.add("hidden");
  toggle?.setAttribute("aria-expanded", "false");
}

export function initProfileDropdown() {
  const toggle = document.getElementById("profile-toggle");
  const menu = document.getElementById("profile-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !menu.classList.contains("hidden");
    menu.classList.toggle("hidden", open);
    toggle.setAttribute("aria-expanded", String(!open));
  });

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("hidden") && !menu.contains(e.target)) closeProfileMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProfileMenu();
  });
}

/* --------------------------- Sign in --------------------------- */

export const SIGN_IN_ERRORS = {
  "auth/unauthorized-domain":
    "This site's domain isn't authorised for sign-in. Add it in Firebase Authentication → Settings → Authorized domains.",
  "auth/operation-not-allowed":
    "Google sign-in is disabled. Enable it in Firebase Authentication → Sign-in method.",
  "auth/invalid-api-key": "The Firebase API key is invalid. Check js/firebase-config.js.",
  "auth/api-key-not-valid":
    "The Firebase API key was rejected. Check js/firebase-config.js and any API key restrictions.",
  "auth/network-request-failed": "Network error during sign-in. Check your connection and retry.",
};

export async function doSignIn() {
  try {
    await signIn();
    if (firebaseEnabled) showToast("Signed in successfully.", "success");
  } catch (err) {
    if (err?.code === "auth/popup-closed-by-user") return; // user cancelled
    if (err?.code === "auth/popup-blocked") {
      showToast("Sign-in popup was blocked. Please allow popups and retry.", "error");
      return;
    }
    if (err?.message === "Google sign-in is not configured.") {
      showToast("Google sign-in isn't configured yet.", "error");
      return;
    }
    console.error("[site] sign-in failed:", err);
    showToast(SIGN_IN_ERRORS[err?.code] ?? "Sign-in failed. Please try again.", "error");
  }
}

export async function doSignOut() {
  try {
    await signOutUser();
    showToast("You have been signed out.", "info");
  } catch (err) {
    console.error("[site] sign-out failed:", err);
  }
}

/* ---------------------------- INIT ----------------------------- */

export async function initSiteShell() {
  await initFirebase();
  await initAuth();

  initUI();

  initProfileDropdown();
  onUserChange(renderProfile);

  // Sign-in control lives in the header only.
  document.getElementById("header-signin")?.addEventListener("click", doSignIn);
  document.getElementById("logout-btn")?.addEventListener("click", doSignOut);

  if (!firebaseEnabled) {
    console.warn(
      "[site] Firebase is not configured — Google sign-in and Firestore are disabled. " +
        "Add your project config in js/firebase-config.js."
    );
  }
}
