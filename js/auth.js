/* =================================================================
   js/auth.js
   -----------------------------------------------------------------
   Google SSO via Firebase Authentication with a reactive user store.
   Other modules subscribe with onUserChange(fn) and re-render.
   Sign-in requires a valid Firebase config (js/firebase-config.js);
   without it, signIn() reports a clear error.
   ================================================================= */

import { getFirebase } from "./firebase.js";

let currentUser = null;
const listeners = new Set();

/* ---- Reactive store ------------------------------------------- */

function emit(user) {
  currentUser = user;
  listeners.forEach((fn) => {
    try {
      fn(user);
    } catch (err) {
      console.error("[auth] listener error:", err);
    }
  });
}

/**
 * Subscribe to auth-state changes. Fires immediately with the current
 * value, then again on every change. Returns an unsubscribe function.
 */
export function onUserChange(fn) {
  listeners.add(fn);
  fn(currentUser);
  return () => listeners.delete(fn);
}

export function getCurrentUser() {
  return currentUser;
}

/* ---- Initialisation ------------------------------------------- */

/** Wire Firebase's onAuthStateChanged into the local store. */
export async function initAuth() {
  const { auth, enabled } = getFirebase();
  if (!enabled || !auth) return;

  const { onAuthStateChanged } = await import("firebase/auth");

  onAuthStateChanged(auth, (user) => {
    emit(
      user
        ? {
            uid: user.uid,
            displayName: user.displayName || "Participant",
            email: user.email || "",
            photoURL: user.photoURL || ""
          }
        : null
    );
  });
}

/* ---- Sign in / out -------------------------------------------- */

export async function signIn() {
  const { auth, enabled } = getFirebase();
  if (!enabled || !auth) {
    throw new Error("Google sign-in is not configured.");
  }

  const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser() {
  const { auth, enabled } = getFirebase();
  if (!enabled || !auth) return;

  const { signOut } = await import("firebase/auth");
  await signOut(auth);
}
