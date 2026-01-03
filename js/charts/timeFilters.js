/* =========================================================
   timeFilters.js
   Time-based score filtering
   ========================================================= */

function filterHistoryByRange(range) {
  const history = getScoreHistory();
  if (history.length === 0) return [];

  const now = new Date();

  return history.filter(entry => {
    const ts = new Date(entry.timestamp);
    const diffDays = (now - ts) / (1000 * 60 * 60 * 24);

    if (range === "today") return diffDays <= 1;
    if (range === "week") return diffDays <= 7;
    if (range === "month") return diffDays <= 30;
    return true; // all
  });
}

function getFilteredScores(range) {
  const history = filterHistoryByRange(range);
  if (history.length === 0) {
    return getCurrentScores();
  }
  return history[history.length - 1].scores;
}

/* Handle UI clicks */
function setTimeRange(range) {
  ChartCore.chartState.timeRange = range;
  ChartCore.render();

  document.querySelectorAll(".time-filters button")
    .forEach(btn => btn.classList.remove("active"));

  document.querySelector(`[data-range="${range}"]`)
    ?.classList.add("active");
}

/* Expose */
window.getFilteredScores = getFilteredScores;
window.setTimeRange = setTimeRange;
