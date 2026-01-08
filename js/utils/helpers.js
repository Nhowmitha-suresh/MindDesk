/* =========================================================
   MindDesk – Helper Utilities
   Shared, reusable helper functions across the app
   ========================================================= */

/* =========================================================
   TYPE & VALUE HELPERS
   ========================================================= */

/* Check if value is a number */
export function isNumber(value) {
  return typeof value === "number" && !Number.isNaN(value);
}

/* Clamp number within range */
export function clamp(value, min, max) {
  if (!isNumber(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/* Round to given decimals */
export function round(value, decimals = 0) {
  if (!isNumber(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/* =========================================================
   ARRAY HELPERS
   ========================================================= */

/* Average of numeric array */
export function average(arr = []) {
  const nums = arr.filter(isNumber);
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/* Sum of numeric array */
export function sum(arr = []) {
  return arr.filter(isNumber).reduce((a, b) => a + b, 0);
}

/* Get unique values */
export function unique(arr = []) {
  return [...new Set(arr)];
}

/* =========================================================
   OBJECT HELPERS
   ========================================================= */

/* Deep clone (JSON-safe objects) */
export function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return null;
  }
}

/* Merge numeric objects by averaging values */
export function mergeAverage(objects = []) {
  const totals = {};
  const counts = {};

  objects.forEach(obj => {
    for (const key in obj) {
      if (!isNumber(obj[key])) continue;
      totals[key] = (totals[key] || 0) + obj[key];
      counts[key] = (counts[key] || 0) + 1;
    }
  });

  const result = {};
  for (const key in totals) {
    result[key] = Math.round(totals[key] / counts[key]);
  }

  return result;
}

/* =========================================================
   DATE & TIME HELPERS
   ========================================================= */

/* ISO string from Date */
export function toISO(date = new Date()) {
  return date.toISOString();
}

/* Days difference between dates */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(
    (d2 - d1) / (1000 * 60 * 60 * 24)
  );
}

/* Check if date is within last N days */
export function isWithinDays(date, days) {
  return daysBetween(date, new Date()) <= days;
}

/* =========================================================
   STRING HELPERS
   ========================================================= */

/* Capitalize first letter */
export function capitalize(str = "") {
  if (typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* Convert camelCase to readable label */
export function camelToLabel(str = "") {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, s => s.toUpperCase());
}

/* =========================================================
   RANDOM & ID HELPERS
   ========================================================= */

/* Generate random ID */
export function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/* Shuffle array (Fisher–Yates) */
export function shuffle(arr = []) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* =========================================================
   SAFE EXECUTION HELPERS
   ========================================================= */

/* Try-catch wrapper */
export function safeExecute(fn, fallback = null) {
  try {
    return fn();
  } catch (e) {
    console.error("Safe execute error:", e);
    return fallback;
  }
}

/* =========================================================
   UI HELPERS (LOGIC ONLY, NO DOM)
   ========================================================= */

/* Score → qualitative label */
export function scoreLabel(score) {
  if (!isNumber(score)) return "Unknown";
  if (score >= 75) return "High";
  if (score >= 45) return "Moderate";
  return "Low";
}

/* Score → color category (for charts) */
export function scoreColor(score) {
  if (!isNumber(score)) return "neutral";
  if (score >= 75) return "success";
  if (score >= 45) return "warning";
  return "danger";
}

/* =========================================================
   VALIDATION HELPERS
   ========================================================= */

/* Validate Likert response */
export function isValidLikert(value, min = 1, max = 5) {
  return isNumber(value) && value >= min && value <= max;
}

/* Validate score object */
export function validateScoreObject(scores = {}) {
  return Object.values(scores).every(isNumber);
}

/* =========================================================
   DEBUG HELPERS (DEV ONLY)
   ========================================================= */

/* Pretty log */
export function log(label, data) {
  console.log(`[${label}]`, data);
}

/* Measure execution time */
export function timeExecution(fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return {
    result,
    timeMs: round(end - start, 2)
  };
}
