/* =========================================================
   chart-core.js
   Central chart engine (one chart instance only)
   ========================================================= */

let traitChart = null;

/* Default chart state */
const chartState = {
  type: "radar",
  traits: ["Logic", "Creativity", "Discipline", "Social", "Emotional"],
  showAverage: false,
  timeRange: "all"
};

/* Get latest scores (fallback-safe) */
function getCurrentScores() {
  const stored = localStorage.getItem("minddesk_scores");
  if (!stored) {
    return {
      Logic: 70,
      Creativity: 65,
      Discipline: 75,
      Social: 55,
      Emotional: 60
    };
  }
  return JSON.parse(stored);
}

/* Build datasets based on state */
function buildDatasets() {
  const userScores = getFilteredScores(chartState.timeRange);
  const datasets = [
    {
      label: "You",
      data: chartState.traits.map(t => userScores[t]),
      backgroundColor: "rgba(99,102,241,0.25)",
      borderColor: "#6366f1",
      borderWidth: 2,
      tension: 0.4
    }
  ];

  if (chartState.showAverage) {
    const avg = getAverageScores(chartState.timeRange);
    datasets.push({
      label: "Average",
      data: chartState.traits.map(t => avg[t]),
      backgroundColor: "rgba(148,163,184,0.2)",
      borderColor: "#94a3b8",
      borderWidth: 2,
      borderDash: [5, 5],
      tension: 0.4
    });
  }

  return datasets;
}

/* Render or re-render chart */
function renderTraitChart() {
  const ctx = document.getElementById("traitChart");
  if (!ctx) return;

  if (traitChart) {
    traitChart.destroy();
  }

  traitChart = new Chart(ctx, {
    type: chartState.type,
    data: {
      labels: chartState.traits,
      datasets: buildDatasets()
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true }
      },
      scales: chartState.type !== "radar"
        ? { y: { beginAtZero: true, max: 100 } }
        : {}
    }
  });
}

/* Public API */
window.ChartCore = {
  chartState,
  render: renderTraitChart
};
