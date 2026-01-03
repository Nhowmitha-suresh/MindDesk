/* =========================================================
   toggles.js
   Chart type + comparison toggles
   ========================================================= */

function setChartType(type) {
  ChartCore.chartState.type = type;
  ChartCore.render();

  document.querySelectorAll(".chart-toggle button")
    .forEach(btn => btn.classList.remove("active"));

  document.querySelector(`[data-chart="${type}"]`)
    ?.classList.add("active");
}

function toggleAverage(checked) {
  ChartCore.chartState.showAverage = checked;
  ChartCore.render();
}

/* Init on load */
document.addEventListener("DOMContentLoaded", () => {
  ChartCore.render();
});
