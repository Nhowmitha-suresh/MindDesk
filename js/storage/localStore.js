/* =========================================================
   MindDesk – Local Storage Utility
   Safe, namespaced wrapper around localStorage
   ========================================================= */

/*
WHY THIS EXISTS
---------------
- Prevents key collisions
- Handles JSON safely
- Central place for storage logic
*/

const PREFIX = "minddesk_";

/* ---------------------------------------------------------
   CORE HELPERS
---------------------------------------------------------- */
function buildKey(key) {
  return `${PREFIX}${key}`;
}

/* ---------------------------------------------------------
   BASIC GET / SET
---------------------------------------------------------- */

export function setItem(key, value) {
  try {
    localStorage.setItem(buildKey(key), JSON.stringify(value));
  } catch (e) {
    console.error("Storage set failed:", e);
  }
}

export function getItem(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(buildKey(key));
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error("Storage get failed:", e);
    return defaultValue;
  }
}

export function removeItem(key) {
  localStorage.removeItem(buildKey(key));
}

/* ---------------------------------------------------------
   COMMON APP SHORTCUTS
---------------------------------------------------------- */

/* Latest scores */
export function saveCurrentScores(scores) {
  setItem("scores", scores);
}

export function loadCurrentScores() {
  return getItem("scores", null);
}

/* Theme */
export function saveTheme(theme) {
  setItem("theme", theme);
}

export function loadTheme() {
  return getItem("theme", "theme-city");
}

/* User session */
export function saveUser(user) {
  setItem("user", user);
}

export function loadUser() {
  return getItem("user", null);
}

export function clearUser() {
  removeItem("user");
}

/* ---------------------------------------------------------
   BULK / DEBUG UTILITIES
---------------------------------------------------------- */

/* Remove all MindDesk keys */
export function clearAll() {
  Object.keys(localStorage)
    .filter(key => key.startsWith(PREFIX))
    .forEach(key => localStorage.removeItem(key));
}

/* Inspect all MindDesk data (debug only) */
export function dumpAll() {
  const dump = {};
  Object.keys(localStorage)
    .filter(key => key.startsWith(PREFIX))
    .forEach(key => {
      dump[key] = JSON.parse(localStorage.getItem(key));
    });
  return dump;
}
