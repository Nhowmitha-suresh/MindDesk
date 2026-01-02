const rawScore = JSON.parse(localStorage.getItem('minddesk_scores')) || null;
const history = JSON.parse(localStorage.getItem('minddesk_scores_history')) || null;

let traitChartInstance = null;
let state = {
  chartType: 'radar',
  range: 'all',
  compare: false,
  selectedTraits: null,
};

function getAvailableTraits() {
  const src = rawScore || (history && history.length ? history[history.length-1].scores : null);
  return src ? Object.keys(src) : [];
}

function getScoresForRange(range = 'all') {
  if (!history || !history.length) {
    return rawScore || {};
  }

  const now = Date.now();
  const ranges = {
    today: 24 * 3600 * 1000,
    week: 7 * 24 * 3600 * 1000,
    month: 30 * 24 * 3600 * 1000,
    all: Infinity,
  };

  if (range === 'all') {
    // average across history
    const sums = {};
    let count = 0;
    history.forEach(entry => {
      const s = entry.scores || {};
      Object.keys(s).forEach(k => { sums[k] = (sums[k] || 0) + Number(s[k] || 0); });
      count++;
    });
    const avg = {};
    Object.keys(sums).forEach(k => { avg[k] = +(sums[k] / Math.max(1, count)).toFixed(2); });
    return avg;
  }

  const cutoff = now - (ranges[range] || ranges.week);
  const filtered = history.filter(e => new Date(e.timestamp).getTime() >= cutoff);
  if (!filtered.length) return rawScore || {};
  // average filtered
  const sums = {}; let count = 0;
  filtered.forEach(entry => {
    const s = entry.scores || {};
    Object.keys(s).forEach(k => { sums[k] = (sums[k] || 0) + Number(s[k] || 0); });
    count++;
  });
  const avg = {};
  Object.keys(sums).forEach(k => { avg[k] = +(sums[k] / Math.max(1, count)).toFixed(2); });
  return avg;
}

function computeAverageAcrossHistory() {
  return getScoresForRange('all');
}

function buildDatasets(baseScores) {
  const traits = Object.keys(baseScores);
  const selected = state.selectedTraits || traits.slice();
  const labels = selected;

  const yourValues = selected.map(t => Number(baseScores[t] || 0));
  const datasets = [{
    label: 'You',
    data: yourValues,
    backgroundColor: 'rgba(37,99,235,0.18)',
    borderColor: '#2563eb',
    fill: state.chartType === 'radar'
  }];

  if (state.compare) {
    const avg = computeAverageAcrossHistory();
    const avgValues = selected.map(t => Number(avg[t] || 0));
    datasets.push({
      label: 'Average',
      data: avgValues,
      backgroundColor: 'rgba(75,85,99,0.12)',
      borderColor: '#64748b',
      borderDash: [4,4],
      fill: state.chartType === 'radar'
    });
  }

  return { labels, datasets };
}

function createOrUpdateChart() {
  const base = getScoresForRange(state.range);
  if (!base || !Object.keys(base).length) return;
  const container = document.getElementById('traitChart');
  if (!container) return;

  const chartData = buildDatasets(base);

  if (traitChartInstance) {
    traitChartInstance.config.type = state.chartType;
    traitChartInstance.data.labels = chartData.labels;
    traitChartInstance.data.datasets = chartData.datasets;
    traitChartInstance.update();
    return;
  }

  traitChartInstance = new Chart(container, {
    type: state.chartType,
    data: chartData,
    options: {
      responsive: true,
      plugins: { tooltip: { enabled: true }, legend: { position: 'top' } },
      scales: state.chartType === 'radar' ? {} : { y: { beginAtZero: true } }
    }
  });
}

function setupControls() {
  const chartType = document.getElementById('chartType');
  const compareToggle = document.getElementById('compareToggle');
  const timeFilters = document.querySelectorAll('.time-filter');
  const traitToggles = document.getElementById('traitToggles');

  // init traits
  const traits = getAvailableTraits();
  state.selectedTraits = traits.slice();
  if (traitToggles) {
    traitToggles.innerHTML = '';
    traits.forEach(t => {
      const id = `trait_toggle_${t}`;
      const label = document.createElement('label');
      label.style.display = 'inline-flex';
      label.style.alignItems = 'center';
      label.style.gap = '6px';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = true;
      input.dataset.trait = t;
      input.addEventListener('change', () => {
        const checked = Array.from(traitToggles.querySelectorAll('input')).filter(i => i.checked).map(i => i.dataset.trait);
        state.selectedTraits = checked.length ? checked : traits.slice();
        createOrUpdateChart();
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(t));
      traitToggles.appendChild(label);
    });
  }

  if (chartType) chartType.addEventListener('change', (e) => {
    state.chartType = e.target.value;
    createOrUpdateChart();
  });

  if (compareToggle) compareToggle.addEventListener('change', (e) => {
    state.compare = e.target.checked;
    createOrUpdateChart();
  });

  timeFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      timeFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.range = btn.dataset.range;
      createOrUpdateChart();
    });
  });
}

function exportChartData(format = 'csv') {
  const base = getScoresForRange(state.range);
  if (!base) return;
  const labels = Object.keys(base);
  const values = Object.values(base);

  if (format === 'json') {
    const blob = new Blob([JSON.stringify({ range: state.range, data: base }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'minddesk_insights.json'; a.click(); URL.revokeObjectURL(url);
    return;
  }

  const rows = [['trait', 'value']];
  for (let i = 0; i < labels.length; i++) rows.push([labels[i], values[i]]);
  const csv = rows.map(r => r.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'minddesk_insights.csv'; a.click(); URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
  setupControls();
  createOrUpdateChart();

  const csvBtn = document.getElementById('exportCsv');
  const jsonBtn = document.getElementById('exportJson');
  if (csvBtn) csvBtn.addEventListener('click', () => exportChartData('csv'));
  if (jsonBtn) jsonBtn.addEventListener('click', () => exportChartData('json'));
  // CSV import bindings
  const importBtn = document.getElementById('importBtn');
  const importInput = document.getElementById('importCsv');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (evt) => {
      const file = evt.target.files && evt.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          parseAndStoreCsv(String(e.target.result));
          setupControls();
          createOrUpdateChart();
          alert('CSV imported — charts updated.');
        } catch (err) {
          console.error(err);
          alert('Failed to import CSV: ' + err.message);
        }
      };
      reader.readAsText(file);
    });
  }
});

function parseAndStoreCsv(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) throw new Error('Empty CSV');
  const header = lines[0].split(',').map(h => h.replace(/^\s+|\s+$/g, '').replace(/^"|"$/g, ''));
  const lower0 = header[0].toLowerCase();
  const isTimeSeries = ['timestamp','time','date'].includes(lower0);

  const newEntries = [];
  if (isTimeSeries) {
    // header: timestamp, trait1, trait2, ...
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
      if (cols.length < 2) continue;
      const tsRaw = cols[0];
      const ts = tsRaw ? new Date(tsRaw).toISOString() : new Date().toISOString();
      const scores = {};
      for (let j = 1; j < header.length; j++) {
        const trait = header[j];
        const val = parseFloat(cols[j] || '0');
        scores[trait] = isNaN(val) ? 0 : val;
      }
      newEntries.push({ timestamp: ts, scores });
    }
  } else {
    // header: trait1, trait2, ... then each row is a snapshot
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
      if (!cols.length) continue;
      const scores = {};
      for (let j = 0; j < header.length; j++) {
        const trait = header[j];
        const val = parseFloat(cols[j] || '0');
        scores[trait] = isNaN(val) ? 0 : val;
      }
      newEntries.push({ timestamp: new Date().toISOString(), scores });
    }
  }

  if (!newEntries.length) throw new Error('No valid rows found');

  // merge with existing history
  const existing = JSON.parse(localStorage.getItem('minddesk_scores_history') || '[]');
  const merged = existing.concat(newEntries);
  localStorage.setItem('minddesk_scores_history', JSON.stringify(merged));

  // update latest snapshot
  const latest = newEntries[newEntries.length - 1].scores;
  localStorage.setItem('minddesk_scores', JSON.stringify(latest));
}
