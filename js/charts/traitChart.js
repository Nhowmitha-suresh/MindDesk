// Use the global Chart provided by the page script include
// dashboard.html already loads Chart.js via CDN so we rely on `window.Chart` here.

// Optional Ollama integration for AI-driven tips (lazy import)
let _generateAiTips = null;
async function ensureAiClient() {
  if (_generateAiTips) return _generateAiTips;
  try {
    const mod = await import('../ai/ollama.js');
    _generateAiTips = mod.generateAiTips;
    return _generateAiTips;
  } catch (e) {
    console.warn('AI tips module unavailable', e);
    return null;
  }
}

const SCORE_KEY = 'minddesk_scores';
const HISTORY_KEY = 'minddesk_scores_history';

let chartInstance = null;
let historyChart = null;
let compareChart = null;

const TRAIT_INFO = {
  'Resilience': { desc: 'Ability to recover from setbacks and maintain performance.', tips: 'Practice small, regular challenges and reflect on recoveries.', examples: ['Oprah Winfrey'] },
  'EmotionalRegulation': { desc: 'Managing emotions so they do not impair decisions or relationships.', tips: 'Pause before reacting; practice breathing and labeling feelings.', examples: ['Barack Obama'] },
  'Conscientiousness': { desc: 'Dependability, attention to detail, and follow-through.', tips: 'Use checklists and set clear deadlines.', examples: ['Satya Nadella'] },
  'Accountability': { desc: 'Taking responsibility for outcomes and learning from mistakes.', tips: 'Own small errors publicly and describe corrective steps.', examples: ['Jacinda Ardern'] },
  'GrowthMindset': { desc: 'Belief that abilities can improve through effort and learning.', tips: 'Seek feedback and view challenges as learning opportunities.', examples: ['Elon Musk'] },
  'SelfAwareness': { desc: 'Understanding your emotions, strengths, and blind spots.', tips: 'Journal reactions and ask trusted peers for feedback.', examples: ['Brené Brown'] },
  'Adaptability': { desc: 'Ability to adjust to new conditions quickly and effectively.', tips: 'Practice reframing problems and experimenting fast.', examples: ['Reed Hastings'] },
  'Creativity': { desc: 'Generating novel and useful ideas or solutions.', tips: 'Schedule time for brainstorming without constraints.', examples: ['Steve Jobs'] },
  'Leadership': { desc: 'Inspiring others and making tough calls responsibly.', tips: 'Lead by example and communicate a clear vision.', examples: ['Nelson Mandela'] },
  'Drive': { desc: 'Sustained motivation to pursue goals persistently.', tips: 'Break goals into micro-steps and celebrate progress.', examples: ['Serena Williams'] },
  'Ethics': { desc: 'Adherence to moral principles and fairness.', tips: 'Prioritize transparency and fairness in choices.', examples: ['Mahatma Gandhi'] },
  'ProblemSolving': { desc: 'Analyzing situations to find practical solutions.', tips: 'Use root-cause analysis and test small experiments.', examples: ['Marie Curie'] },
  'DecisionMaking': { desc: 'Choosing effectively under uncertainty.', tips: 'Clarify objectives and consider small tests for options.', examples: ['Angela Merkel'] }
};

function getLatestScores() {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

export function initTraitChart() {
  const canvas = document.getElementById('traitChart');
  if (!canvas) return;

  const scores = getLatestScores() || {};
  const labels = Object.keys(scores);
  const data = labels.map(l => scores[l] || 0);

  const history = getHistory();

  const ctx = canvas.getContext('2d');

  if (chartInstance) chartInstance.destroy();
  const ChartLib = window.Chart || null;
  if (!ChartLib) {
    console.warn('Chart.js not available on window.');
    return;
  }

  chartInstance = new ChartLib(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Trait scores',
        data,
        backgroundColor: labels.map(() => 'rgba(99,102,241,0.7)'),
        borderColor: labels.map(() => 'rgba(99,102,241,1)'),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100 }
      },
      plugins: {
        legend: { display: false }
      },
      onClick(evt, activeEls) {
        if (!activeEls || !activeEls.length) return;
        const idx = activeEls[0].index;
        const trait = chartInstance.data.labels[idx];
        const score = chartInstance.data.datasets[0].data[idx];
        showTraitExplanation(trait, score);
      },
      hover: { mode: 'nearest', intersect: true }
    }
  });

  // make canvas look clickable
  canvas.style.cursor = 'pointer';

  // initialize compare controls if side panel exists
  try { initCompareControls(); } catch (e) { /* ignore */ }
  // wire side-panel utilities (export/copy/recommendations + AI tips)
  try { wireSidePanelButtons(); } catch (e) { /* ignore */ }

  // Listen for programmatic score updates (same-window)
  try {
    window.addEventListener('minddesk_scores_updated', () => {
      try { refreshTraitChart(); } catch (e) {}
      try { refreshTraitHistory(); } catch (e) {}
    });
  } catch (e) { }

  // If history exists, offer a simple sparkline below chart (optional)
  // Not rendering full history here to keep implementation straightforward.
}

function showTraitExplanation(trait, score) {
  const expl = document.getElementById('traitExplanationText');
  const examples = document.getElementById('traitExamplesList');
  if (!expl || !examples) return;
  const info = TRAIT_INFO[trait] || { desc: 'A measured trait.', tips: 'Reflect and consider small experiments.', examples: [] };
  expl.innerHTML = `<div style="font-weight:600">${trait} — ${score}%</div><div style="margin-top:6px">${info.desc}</div><div style="margin-top:8px;font-size:13px;color:var(--text-muted)"><strong>Tip:</strong> ${info.tips}</div>`;
  examples.innerHTML = (info.examples && info.examples.length) ? info.examples.map(e=>`<div>• ${e}</div>`).join('') : 'No examples available';

  // Open the rich side panel and preselect this trait for comparison
  try {
    const panel = document.getElementById('sidePanel');
    const toggle = document.getElementById('sidePanelToggle');
    const selA = document.getElementById('compareTraitA');
    if (panel) panel.classList.add('open');
    if (toggle) toggle.style.display = 'none';
    if (selA) {
      if (!Array.from(selA.options).some(o => o.value === trait)) {
        const opt = document.createElement('option'); opt.value = trait; opt.textContent = trait; selA.appendChild(opt);
      }
      selA.value = trait;
    }
  } catch (e) { /* ignore */ }
}

function buildTraitOptions() {
  const scores = getLatestScores() || {};
  return Object.keys(scores);
}

function buildSeriesForTrait(trait) {
  const history = getHistory();
  // history entries: { timestamp, scores }
  const labels = history.map(h => new Date(h.timestamp).toLocaleString());
  const data = history.map(h => {
    if (trait === '__average') {
      const vals = Object.values(h.scores || {}).filter(v => typeof v === 'number');
      if (!vals.length) return 0;
      const sum = vals.reduce((a,b)=>a+b,0);
      return Math.round(sum/vals.length);
    }
    return h.scores ? (h.scores[trait] || 0) : 0;
  });
  return { labels, data };
}

export function initTraitHistory() {
  const canvas = document.getElementById('traitHistoryChart');
  const sel = document.getElementById('historyTraitSelect');
  if (!canvas || !sel) return;

  // populate select
  const opts = buildTraitOptions();
  opts.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o;
    opt.textContent = o;
    sel.appendChild(opt);
  });

  const ctx = canvas.getContext('2d');
  const series = buildSeriesForTrait('__average');

  historyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: series.labels,
      datasets: [{
        label: 'Average score over time',
        data: series.data,
        borderColor: 'rgba(99,102,241,1)',
        backgroundColor: 'rgba(99,102,241,0.15)',
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });

  sel.addEventListener('change', () => {
    const t = sel.value;
    const s = buildSeriesForTrait(t);
    historyChart.data.labels = s.labels;
    historyChart.data.datasets[0].data = s.data;
    historyChart.data.datasets[0].label = t === '__average' ? 'Average score over time' : `${t} over time`;
    historyChart.update();
  });
}

export function refreshTraitHistory() {
  if (!historyChart) return initTraitHistory();
  const sel = document.getElementById('historyTraitSelect');
  const t = sel ? sel.value : '__average';
  const s = buildSeriesForTrait(t);
  historyChart.data.labels = s.labels;
  historyChart.data.datasets[0].data = s.data;
  historyChart.update();
}

export function refreshTraitChart() {
  if (!chartInstance) return initTraitChart();
  const scores = getLatestScores() || {};
  const labels = Object.keys(scores);
  const data = labels.map(l => scores[l] || 0);
  chartInstance.data.labels = labels;
  chartInstance.data.datasets[0].data = data;
  chartInstance.update();
}

// -- Compare helpers
function populateCompareSelects() {
  const scores = getLatestScores() || {};
  const keys = Object.keys(scores);
  const a = document.getElementById('compareTraitA');
  const b = document.getElementById('compareTraitB');
  if (!a || !b) return;
  a.innerHTML = '';
  b.innerHTML = '';
  const ph = document.createElement('option'); ph.value='__average'; ph.textContent='Average';
  a.appendChild(ph.cloneNode(true)); b.appendChild(ph.cloneNode(true));
  keys.forEach(k=>{
    const o1 = document.createElement('option'); o1.value = k; o1.textContent = k; a.appendChild(o1);
    const o2 = document.createElement('option'); o2.value = k; o2.textContent = k; b.appendChild(o2);
  });
}

function buildSeriesForTraitCompare(trait) {
  const history = getHistory();
  const labels = history.map(h => new Date(h.timestamp).toLocaleString());
  const data = history.map(h => h.scores ? (trait === '__average' ? (()=>{const vals=Object.values(h.scores||{}).filter(v=>typeof v==='number'); if(!vals.length) return 0; return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)})() : (h.scores[trait]||0)) : 0);
  return { labels, data };
}

function renderCompareChart(traitA, traitB) {
  const canvas = document.getElementById('compareHistoryChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const sA = buildSeriesForTraitCompare(traitA || '__average');
  const sB = buildSeriesForTraitCompare(traitB || '__average');
  if (compareChart) compareChart.destroy();
  compareChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sA.labels,
      datasets: [
        { label: traitA || 'A', data: sA.data, borderColor: 'rgba(99,102,241,1)', backgroundColor: 'rgba(99,102,241,0.12)', tension:0.2 },
        { label: traitB || 'B', data: sB.data, borderColor: 'rgba(16,185,129,1)', backgroundColor: 'rgba(16,185,129,0.08)', tension:0.2 }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false, scales:{ y:{ beginAtZero:true, max:100 } } }
  });
}

function initCompareControls() {
  try {
    const toggle = document.getElementById('sidePanelToggle');
    const panel = document.getElementById('sidePanel');
    const close = document.getElementById('sidePanelClose');
    const btn = document.getElementById('compareBtn');
    const selA = document.getElementById('compareTraitA');
    const selB = document.getElementById('compareTraitB');
    if (toggle && panel) {
      toggle.addEventListener('click', () => { panel.classList.toggle('open'); toggle.style.display = panel.classList.contains('open') ? 'none' : 'inline-block'; populateCompareSelects(); });
    }
    if (close && panel && toggle) {
      close.addEventListener('click', () => { panel.classList.remove('open'); toggle.style.display = 'inline-block'; });
    }
    if (btn && selA && selB) {
      populateCompareSelects();
      btn.addEventListener('click', () => {
        const a = selA.value || '__average';
        const b = selB.value || '__average';
        renderCompareChart(a,b);
      });
    }
    window.addEventListener('minddesk_scores_updated', () => { populateCompareSelects(); });
  } catch (e) { console.warn('Compare controls init failed', e); }
}

try { window.initCompareControls = initCompareControls; } catch(e) {}

// wire side-panel buttons if present (safe to call multiple times)
function wireSidePanelButtons() {
  try {
    const exp = document.getElementById('exportCsvBtn');
    const copy = document.getElementById('copyJsonBtn');
    const recBtn = document.getElementById('sidePanelClose'); // reuse close click to refresh recs when closing
    if (exp) exp.addEventListener('click', () => { const ok = downloadCSV(); if (!ok) alert('No history to export yet.'); });
    if (copy) copy.addEventListener('click', async () => { const p = copyScoresJSON(); if (p) { try { await navigator.clipboard.writeText(JSON.stringify(p, null, 2)); alert('Scores copied to clipboard'); } catch(e){ alert('Copied (fallback)'); } } else alert('Nothing to copy'); });
    // refresh recommendations when panel opens or closes
    const panel = document.getElementById('sidePanel');
    if (panel) {
      const obs = new MutationObserver(() => { if (panel.classList.contains('open')) generateRecommendations(); });
      obs.observe(panel, { attributes: true, attributeFilter: ['class'] });
    }
    // AI tips area: add a button and container if missing
    try {
      const body = document.querySelector('.side-panel-body');
      if (body && !document.getElementById('aiTipsContainer')) {
        const sec = document.createElement('section'); sec.className = 'panel-section';
        sec.innerHTML = `<h4>AI Recommendations</h4><div style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><button id="generateAiTipsBtn" class="primary-btn">Generate AI Tips</button><button id="refreshAiBtn" class="secondary">Refresh</button></div><div id="aiTipsContainer" style="min-height:80px;color:var(--text-muted)">AI tips will appear here.</div>`;
        body.appendChild(sec);

        const gen = document.getElementById('generateAiTipsBtn');
        const ref = document.getElementById('refreshAiBtn');
        const container = document.getElementById('aiTipsContainer');
        async function runAi() {
          const genFn = await ensureAiClient();
          if (!genFn) { container.textContent = 'AI module not available. Ensure Ollama client file exists.'; return; }
          container.textContent = 'Generating tips…';
          try {
            const payload = genFn(getLatestScores());
            const text = typeof payload === 'string' ? payload : await Promise.resolve(payload);
            container.textContent = text;
          } catch (e) { container.textContent = 'AI generation failed: ' + (e.message || e); }
        }
        gen?.addEventListener('click', runAi);
        ref?.addEventListener('click', runAi);

        // Scoreboard details section (exportable, table view)
        try {
          if (!document.getElementById('scoreboardDetails')) {
            const sc = document.createElement('section'); sc.className = 'panel-section'; sc.id = 'scoreboardDetails';
            sc.innerHTML = `<h4>Scoreboard Details</h4><div style="margin-bottom:8px;display:flex;gap:8px;align-items:center"><button id="exportHistoryBtn" class="secondary">Export History (CSV)</button><button id="copyScoresBtn" class="secondary">Copy Current Scores</button></div><div style="overflow:auto"><table id="scoreboardTable" style="width:100%;border-collapse:collapse"><thead><tr><th style="text-align:left;padding:6px">Trait</th><th style="text-align:right;padding:6px">Score</th></tr></thead><tbody></tbody></table></div>`;
            body.appendChild(sc);
          }
          const exportBtn = document.getElementById('exportHistoryBtn');
          const copyBtn = document.getElementById('copyScoresBtn');
          const tableBody = document.querySelector('#scoreboardTable tbody');
          function populateScoreboard() {
            const scores = getLatestScores() || {};
            tableBody.innerHTML = '';
            const keys = Object.keys(scores).sort();
            keys.forEach(k=>{
              const tr = document.createElement('tr');
              tr.innerHTML = `<td style="padding:6px;border-bottom:1px solid rgba(0,0,0,0.04)">${k}</td><td style="padding:6px;border-bottom:1px solid rgba(0,0,0,0.04);text-align:right">${(typeof scores[k]==='number')?scores[k]+'%':'--'}</td>`;
              tableBody.appendChild(tr);
            });
          }
          exportBtn?.addEventListener('click', ()=>{ const ok = downloadCSV(); if (!ok) alert('No history to export yet.'); });
          copyBtn?.addEventListener('click', ()=>{ const p = copyScoresJSON(); if (p) { try { navigator.clipboard.writeText(JSON.stringify(p.scores || {}, null, 2)); alert('Scores copied'); } catch(e){ alert('Copy failed'); } } else alert('Nothing to copy'); });
          // refresh on open
          populateScoreboard();
          window.addEventListener('minddesk_scores_updated', populateScoreboard);
        } catch(e){ console.warn('scoreboard details init failed', e); }

        // Bling toggle (store in localStorage)
        try {
          if (!document.getElementById('blingToggleWrap')) {
            const sw = document.createElement('section'); sw.className='panel-section'; sw.id='blingToggleWrap';
            sw.innerHTML = `<h4>Decorative Accents</h4><label style="display:flex;gap:8px;align-items:center"><input id="blingToggle" type="checkbox" /> Enable blings (animated accents)</label>`;
            body.appendChild(sw);
            const ch = document.getElementById('blingToggle');
            const stored = localStorage.getItem('minddesk_blings_enabled');
            ch.checked = stored === null ? true : stored === '1';
            ch.addEventListener('change', ()=>{
              localStorage.setItem('minddesk_blings_enabled', ch.checked ? '1' : '0');
              try { window.minddesk_refreshBlings && window.minddesk_refreshBlings(); } catch(e){}
            });
          }
        } catch(e){ console.warn('bling toggle init failed', e); }

        // When panel opens, auto-run recommendations and AI tips and refresh scoreboard
        if (panel) {
          const obs2 = new MutationObserver(() => {
            if (panel.classList.contains('open')) {
              try { generateRecommendations(); } catch(e){}
              try { runAi(); } catch(e){}
              try { const pop = document.querySelector('#scoreboardTable tbody'); if (pop) { const ev = new Event('refreshScoreboard'); pop.dispatchEvent(ev); } } catch(e){}
            }
          });
          obs2.observe(panel, { attributes:true, attributeFilter:['class'] });
        }
      }
    } catch (e) { console.warn('Failed to create AI tips UI', e); }
  } catch(e) { /* ignore */ }
}

try { window.wireSidePanelButtons = wireSidePanelButtons; } catch(e) {}

/* =========================================================
   Export / Share / Recommendations
   ========================================================= */
function exportScoresCSV() {
  const history = getHistory();
  if (!history || !history.length) return null;
  // Build CSV with header: timestamp, trait1, trait2, ...
  const traits = Object.keys(history[history.length-1].scores || {});
  const header = ['timestamp', ...traits];
  const rows = history.map(entry => {
    const vals = traits.map(t => (entry.scores && typeof entry.scores[t] === 'number') ? entry.scores[t] : '');
    return [entry.timestamp, ...vals].join(',');
  });
  return [header.join(','), ...rows].join('\n');
}

function downloadCSV(filename='minddesk_scores_history.csv') {
  const csv = exportScoresCSV();
  if (!csv) return false;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  return true;
}

function copyScoresJSON() {
  try {
    const scores = getLatestScores() || {};
    const history = getHistory() || [];
    const payload = { scores, history, exportedAt: new Date().toISOString() };
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    return payload;
  } catch (e) { return null; }
}

function generateRecommendations() {
  const scores = getLatestScores() || {};
  const list = document.getElementById('recommendedExercises');
  if (!list) return;
  list.innerHTML = '';
  const entries = Object.entries(scores).filter(([,v])=>typeof v==='number');
  if (!entries.length) {
    list.innerHTML = '<li>No score data yet. Take the test to get tailored exercises.</li>';
    return;
  }
  entries.sort((a,b)=>a[1]-b[1]); // ascending => lowest traits first
  const topLow = entries.slice(0,3);
  topLow.forEach(([trait,score])=>{
    const li = document.createElement('li');
    li.innerHTML = `<strong>${trait}</strong>: ${score}% — Suggested exercise: ${pickExerciseForTrait(trait)}`;
    list.appendChild(li);
  });
}

function pickExerciseForTrait(trait) {
  const map = {
    'Resilience':'Journal a recent setback and list 3 concrete next steps',
    'EmotionalRegulation':'Practice a 4-4 breathing set when stressed',
    'Conscientiousness':'Use a 2-minute daily planning routine each morning',
    'Accountability':'Write one short post-mortem for a recent task',
    'GrowthMindset':'Try a new micro-skill for 10 minutes daily',
    'SelfAwareness':'Record one reflection in a short voice note',
    'Adaptability':'Try a 30-minute unfamiliar task and note learnings',
    'Creativity':'Spend 10 minutes free-writing ideas without judgment',
    'Leadership':'Give one public, specific praise to a teammate',
    'Drive':'Set a 3-day mini-goal and track progress',
    'Ethics':'Review a choice and write one reason that supports fairness',
    'ProblemSolving':'Take a 5-whys approach to a small recurring issue',
    'DecisionMaking':'Make a small decision with pros/cons listed in 5 minutes'
  };
  return map[trait] || 'Short reflection: note one action for improvement this week.';
}

// expose utilities for UI wiring
try { window.minddesk_exportCSV = downloadCSV; window.minddesk_copyJSON = copyScoresJSON; window.minddesk_generateRecommendations = generateRecommendations; } catch(e) {}

export default { initTraitChart, refreshTraitChart };
