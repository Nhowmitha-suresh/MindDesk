/* =========================================================
   MindDesk – History Manager
   Handles time-series snapshots of personality scores
   ========================================================= */

/*
DATA SHAPE (localStorage key: minddesk_scores_history)
-----------------------------------------------------
[
  {
    timestamp: "2026-01-01T10:15:30.000Z",
    scores: {
      Logic: 78,
      Creativity: 55,
      Discipline: 82,
      Social: 48,
      EmotionalIntelligence: 71,
      ...
    }
  }
]
*/

const HISTORY_KEY = "minddesk_scores_history";

/* ---------------------------------------------------------
   INTERNAL HELPERS
---------------------------------------------------------- */
function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read history:", e);
    return [];
  }
}

function writeHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/* ---------------------------------------------------------
   PUBLIC API
---------------------------------------------------------- */

/* Save a new snapshot */
export function saveSnapshot(scores) {
  const history = readHistory();

  history.push({
    timestamp: new Date().toISOString(),
    scores
  });

  writeHistory(history);
}

/* Get full history */
export function getHistory() {
  return readHistory();
}

/* Get latest snapshot */
export function getLatestSnapshot() {
  const history = readHistory();
  if (history.length === 0) return null;
  return history[history.length - 1];
}

/* Filter history by time range */
export function filterHistoryByRange(range = "all") {
  const history = readHistory();
  if (history.length === 0) return [];

  const now = new Date();

  return history.filter(entry => {
    const ts = new Date(entry.timestamp);
    const diffDays = (now - ts) / (1000 * 60 * 60 * 24);

    if (range === "today") return diffDays <= 1;
    if (range === "week") return diffDays <= 7;
    if (range === "month") return diffDays <= 30;
    return true; // "all"
  });
}

/* Compute average scores for a range */
export function computeAverageScores(range = "all") {
  const filtered = filterHistoryByRange(range);
  if (filtered.length === 0) return null;

  const totals = {};
  const counts = {};

  filtered.forEach(entry => {
    for (const trait in entry.scores) {
      totals[trait] = (totals[trait] || 0) + entry.scores[trait];
      counts[trait] = (counts[trait] || 0) + 1;
    }
  });

  const averages = {};
  for (const trait in totals) {
    averages[trait] = Math.round(totals[trait] / counts[trait]);
  }

  return averages;
}

/* Get trend (difference between last two snapshots) */
export function computeTrend() {
  const history = readHistory();
  if (history.length < 2) return null;

  const latest = history[history.length - 1].scores;
  const previous = history[history.length - 2].scores;

  const trend = {};
  for (const trait in latest) {
    trend[trait] = latest[trait] - (previous[trait] || 0);
  }

  return trend;
}

/* Clear all history (dangerous – confirm in UI) */
export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
