/* =========================================================
   MindDesk – Analytics Engine
   Computes trends, KPIs, comparisons, and signals
   ========================================================= */

/*
EXPECTED DATA SOURCES
---------------------
- localStorage["minddesk_scores"]
- localStorage["minddesk_scores_history"]

Each history entry:
{
  timestamp: ISO_STRING,
  scores: { Trait: Number }
}
*/

/* =========================================================
   CONFIGURATION
   ========================================================= */

const TREND_WINDOW = {
  short: 3,   // last 3 snapshots
  medium: 7,  // last 7 snapshots
  long: 14    // last 14 snapshots
};

/* =========================================================
   INTERNAL HELPERS
   ========================================================= */

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("minddesk_scores_history")) || [];
  } catch {
    return [];
  }
}

function getLatestScores() {
  try {
    return JSON.parse(localStorage.getItem("minddesk_scores")) || {};
  } catch {
    return {};
  }
}

/* Average of numeric array */
function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/* =========================================================
   CORE ANALYTICS
   ========================================================= */

/* ---------------------------------------------------------
   TREND ANALYSIS (PER TRAIT)
---------------------------------------------------------- */
export function computeTrends(window = "short") {
  const history = getHistory();
  const count = TREND_WINDOW[window];

  if (history.length < 2) return null;

  const recent = history.slice(-count);
  const trends = {};

  recent.forEach(entry => {
    for (const trait in entry.scores) {
      trends[trait] = trends[trait] || [];
      trends[trait].push(entry.scores[trait]);
    }
  });

  const result = {};
  for (const trait in trends) {
    const values = trends[trait];
    result[trait] = Math.round(values[values.length - 1] - values[0]);
  }

  return result;
}

/* ---------------------------------------------------------
   MOMENTUM (DIRECTION + STRENGTH)
---------------------------------------------------------- */
export function computeMomentum() {
  const trends = computeTrends("short");
  if (!trends) return null;

  const momentum = {};

  for (const trait in trends) {
    const delta = trends[trait];
    momentum[trait] = {
      direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
      magnitude: Math.abs(delta)
    };
  }

  return momentum;
}

/* ---------------------------------------------------------
   STABILITY SCORE
   Measures consistency over time
---------------------------------------------------------- */
export function computeStability() {
  const history = getHistory();
  if (history.length < 3) return null;

  const stability = {};

  history.forEach(entry => {
    for (const trait in entry.scores) {
      stability[trait] = stability[trait] || [];
      stability[trait].push(entry.scores[trait]);
    }
  });

  const result = {};
  for (const trait in stability) {
    const values = stability[trait];
    const mean = average(values);
    const variance = average(
      values.map(v => Math.pow(v - mean, 2))
    );
    result[trait] = Math.max(0, Math.round(100 - Math.sqrt(variance)));
  }

  return result;
}

/* =========================================================
   KPI COMPUTATIONS
   ========================================================= */

/* Overall personality strength */
export function computeOverallScore() {
  const scores = getLatestScores();
  const values = Object.values(scores);
  if (!values.length) return 0;
  return Math.round(average(values));
}

/* Focus Index (discipline + drive weighted) */
export function computeFocusIndex() {
  const scores = getLatestScores();
  const discipline = scores.Discipline || 0;
  const drive = scores.Drive || 0;
  return Math.round((discipline * 0.6 + drive * 0.4));
}

/* Growth Index (learning velocity) */
export function computeGrowthIndex() {
  const trends = computeTrends("medium");
  if (!trends) return 0;

  const positive = Object.values(trends).filter(v => v > 0);
  return Math.min(100, positive.length * 12);
}

/* =========================================================
   COMPARATIVE ANALYTICS
   ========================================================= */

/* Compare user vs historical average */
export function compareToAverage() {
  const history = getHistory();
  const latest = getLatestScores();
  if (!history.length) return null;

  const totals = {};
  const counts = {};

  history.forEach(h => {
    for (const trait in h.scores) {
      totals[trait] = (totals[trait] || 0) + h.scores[trait];
      counts[trait] = (counts[trait] || 0) + 1;
    }
  });

  const comparison = {};
  for (const trait in latest) {
    const avg = Math.round(totals[trait] / counts[trait]);
    comparison[trait] = latest[trait] - avg;
  }

  return comparison;
}

/* =========================================================
   SIGNALS & FLAGS (FOR UI HIGHLIGHTS)
   ========================================================= */

/* Identify strong traits */
export function detectStrengths(threshold = 75) {
  const scores = getLatestScores();
  return Object.keys(scores).filter(t => scores[t] >= threshold);
}

/* Identify risk areas */
export function detectRiskAreas(threshold = 40) {
  const scores = getLatestScores();
  return Object.keys(scores).filter(t => scores[t] <= threshold);
}

/* Burnout signal (high drive + falling discipline) */
export function detectBurnoutRisk() {
  const trends = computeTrends("short");
  const scores = getLatestScores();

  if (!trends) return false;

  return (
    scores.Drive >= 75 &&
    trends.Discipline < -10
  );
}

/* =========================================================
   DASHBOARD SUMMARY (ONE CALL)
   ========================================================= */

export function buildAnalyticsSummary() {
  return {
    overallScore: computeOverallScore(),
    focusIndex: computeFocusIndex(),
    growthIndex: computeGrowthIndex(),
    momentum: computeMomentum(),
    stability: computeStability(),
    strengths: detectStrengths(),
    risks: detectRiskAreas(),
    burnoutRisk: detectBurnoutRisk(),
    comparison: compareToAverage()
  };
}
