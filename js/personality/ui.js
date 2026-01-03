import { QUESTIONS } from "./questions.js";
import { calculateScores, fillMissingScores, saveScoreSnapshot, validateAnswers } from "./scoring.js";
import { buildInsightReport, saveInsightSnapshot } from "./insights.js";

// Mapping of trait keywords to example public figures for motivational context
const CELEBRITY_MAP = {
  'Resilience': ['Oprah Winfrey'],
  'EmotionalRegulation': ['Barack Obama'],
  'Conscientiousness': ['Satya Nadella'],
  'Accountability': ['Jacinda Ardern'],
  'GrowthMindset': ['Elon Musk'],
  'SelfAwareness': ['Brené Brown'],
  'Adaptability': ['Reed Hastings'],
  'Creativity': ['Steve Jobs'],
  'Leadership': ['Nelson Mandela'],
  'Drive': ['Serena Williams'],
  'Ethics': ['Mahatma Gandhi'],
  'ProblemSolving': ['Marie Curie'],
  'DecisionMaking': ['Angela Merkel'],
  'Communication': ['Oprah Winfrey'],
  'Vision': ['Elon Musk']
};

const STORAGE_KEY = 'minddesk_personality_answers';

const APP_ID = "personalityApp";

function createQuestionEl(q, savedAnswers = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "form-group";

  const label = document.createElement("label");
  label.textContent = `${q.id}. ${q.text}`;
  label.style.fontWeight = "600";
  label.style.marginBottom = "6px";

  const opts = document.createElement("div");
  opts.className = "inline";

    const selectedValue = savedAnswers[q.id] ? Number(savedAnswers[q.id]) : null;

    for (let i = 1; i <= 5; i++) {
      const opt = document.createElement("button");
      opt.type = 'button';
      opt.className = 'option-btn';
      opt.dataset.qid = String(q.id);
      opt.dataset.value = String(i);
      opt.setAttribute('aria-pressed', selectedValue === i ? 'true' : 'false');
      opt.style.display = 'inline-flex';
      opt.style.alignItems = 'center';
      opt.style.gap = '6px';
      opt.style.border = 'none';
      opt.style.background = 'transparent';
      opt.style.color = 'inherit';
      opt.style.fontSize = '13px';
      opt.style.padding = '6px 10px';

      const dot = document.createElement('span');
      dot.className = 'fake-radio';
      dot.style.display = 'inline-block';
      dot.style.width = '16px';
      dot.style.height = '16px';
      dot.style.borderRadius = '50%';
      dot.style.border = '2px solid rgba(255,255,255,0.35)';
      dot.style.background = selectedValue === i ? 'var(--accent)' : 'transparent';
      dot.style.marginRight = '8px';

      const text = document.createElement("span");
      text.textContent = String(i);

      opt.appendChild(dot);
      opt.appendChild(text);

      // click handler
      opt.addEventListener('click', () => {
        // deselect siblings
        const group = opts.querySelectorAll('button.option-btn');
        group.forEach(b => {
          b.querySelector('.fake-radio').style.background = 'transparent';
          b.setAttribute('aria-pressed', 'false');
        });

        dot.style.background = 'var(--accent)';
        opt.setAttribute('aria-pressed', 'true');

        // save to localStorage immediately
        try {
          const raw = localStorage.getItem(STORAGE_KEY) || '{}';
          const map = JSON.parse(raw);
          map[q.id] = Number(opt.dataset.value);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
        } catch (e) { }

        // update progress bar if present
        const evt = new CustomEvent('minddesk_answers_changed');
        window.dispatchEvent(evt);
      });

      opts.appendChild(opt);
    }

  wrapper.appendChild(label);
  wrapper.appendChild(opts);

  return wrapper;
}

function renderForm(container) {
  container.innerHTML = "";

  // load saved answers
  let saved = {};
  try { const raw = localStorage.getItem(STORAGE_KEY); saved = raw ? JSON.parse(raw) : {}; } catch (e) { saved = {}; }

  const form = document.createElement("form");
  form.id = "personalityForm";
  form.style.display = "flex";
  form.style.flexDirection = "column";
  form.style.gap = "12px";

  const intro = document.createElement("p");
  intro.className = "subtitle";
  intro.textContent = "Answer on a scale: 1 (Low) — 5 (High). Use pagination to navigate.";
  form.appendChild(intro);

  // pagination
  const pageSize = 5;
  let page = 0;
  const totalPages = Math.ceil(QUESTIONS.length / pageSize);

  const progress = document.createElement('div');
  progress.id = 'personalityProgress';
  progress.style.height = '8px';
  progress.style.background = 'var(--surface-muted)';
  progress.style.borderRadius = '6px';
  progress.style.overflow = 'hidden';
  progress.style.marginBottom = '8px';
  const bar = document.createElement('div');
  bar.style.height = '100%';
  bar.style.width = '0%';
  bar.style.background = 'var(--accent)';
  progress.appendChild(bar);
  form.appendChild(progress);

  const pageContainer = document.createElement('div');
  pageContainer.id = 'personalityPageContainer';
  pageContainer.style.display = 'grid';
  pageContainer.style.gap = '10px';
  form.appendChild(pageContainer);

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.justifyContent = 'space-between';
  actions.style.alignItems = 'center';
  actions.style.gap = "8px";

  const navLeft = document.createElement('div');
  const prev = document.createElement("button");
  prev.type = 'button'; prev.className = 'secondary'; prev.textContent = 'Previous';
  prev.disabled = true;
  navLeft.appendChild(prev);

  const navRight = document.createElement('div');
  const next = document.createElement("button");
  next.type = 'button'; next.className = 'secondary'; next.textContent = 'Next';
  navRight.appendChild(next);

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "primary-btn";
  submit.textContent = "Submit Test";

  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "secondary";
  clear.textContent = "Clear Answers";

  navRight.appendChild(submit);
  navRight.appendChild(clear);

  actions.appendChild(navLeft);
  actions.appendChild(navRight);

  form.appendChild(actions);

  const resultBox = document.createElement("div");
  resultBox.id = "personalityResult";
  resultBox.style.marginTop = "12px";
  form.appendChild(resultBox);

  function saveAnswersAutosave() {
    // read saved map from localStorage (buttons write to storage on click)
    let data = {};
    try { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { data = {}; }
    // update progress
    const answered = Object.keys(data).length;
    const pct = Math.round((answered / QUESTIONS.length) * 100);
    bar.style.width = pct + '%';
  }

  function renderPage(p) {
    pageContainer.innerHTML = '';
    // refresh saved answers from storage so selections persist across pagination
    try { const raw = localStorage.getItem(STORAGE_KEY); saved = raw ? JSON.parse(raw) : {}; } catch (e) { saved = {}; }
    const start = p * pageSize;
    const slice = QUESTIONS.slice(start, start + pageSize);
    slice.forEach(q => {
      const el = createQuestionEl(q, saved);
      pageContainer.appendChild(el);
    });
    prev.disabled = p === 0;
    next.disabled = p >= totalPages - 1;
    // update progress bar from saved
    saveAnswersAutosave();
  }

  prev.addEventListener('click', () => { if (page>0) { page--; renderPage(page); } });
  next.addEventListener('click', () => { if (page<totalPages-1) { page++; renderPage(page); } });

  // Final submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const answersMap = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const answers = QUESTIONS.map(q => ({ id: q.id, value: answersMap[q.id] ? Number(answersMap[q.id]) : null }));

    // allow partial scoring: compute using answered items; warn if incomplete
    const answered = answers.filter(a => typeof a.value === 'number' && !Number.isNaN(a.value));
    if (answered.length === 0) {
      resultBox.innerHTML = `<div class="card" style="background:#fff6f6;color:#b91c1c">No answers found. Please answer at least one question.</div>`;
      return;
    }

    // inform user if not all answered
    const incompleteNotice = answered.length < QUESTIONS.length ? `<div class="card" style="background:#fffdef;color:#92400e">Partial responses detected — results computed from answered items (${answered.length}/${QUESTIONS.length}). For best accuracy, complete all items.</div>` : '';

    const scores = calculateScores(answered, QUESTIONS);
    const filled = fillMissingScores(scores, 50);

    // persist snapshot
    try { saveScoreSnapshot(filled); } catch (err) { /* ignore */ }
    try { saveInsightSnapshot(filled); } catch (err) { /* ignore */ }

    // build report
    const report = buildInsightReport(filled);

    // show top strengths
    resultBox.innerHTML = "";
    const title = document.createElement("h3");
    title.textContent = "Your Trait Summary";
    resultBox.appendChild(title);

    const summary = document.createElement("p");
    summary.textContent = report.summary;
    resultBox.appendChild(summary);

    const list = document.createElement("div");
    list.style.display = "grid";
    list.style.gridTemplateColumns = "repeat(2, 1fr)";
    list.style.gap = "8px";

    report.detailedInsights.forEach(d => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.padding = "10px";
      card.innerHTML = `<strong>${d.trait}</strong> — ${d.level} <div style="font-size:13px;color:var(--text-muted);margin-top:6px">${d.text}</div>`;
      list.appendChild(card);
    });

    resultBox.appendChild(list);
    if (incompleteNotice) {
      const noteWrap = document.createElement('div');
      noteWrap.innerHTML = incompleteNotice;
      resultBox.insertBefore(noteWrap, resultBox.firstChild);
    }
    // motivational summary
    const topTraits = Object.entries(filled).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const mot = document.createElement('div');
    mot.style.marginTop = '12px';
    mot.className = 'card';
    const traitNames = topTraits.map(t=>t[0]).join(', ');
    const celebExamples = topTraits.map(t => (CELEBRITY_MAP[t[0]] || []).slice(0,2).join(', ') || 'role models').join(' • ');
    mot.innerHTML = `<strong>Great progress.</strong> Your top traits are <em>${traitNames}</em>. Keep building on these strengths — many high performers, e.g. ${celebExamples}, display similar strengths.`;
    resultBox.appendChild(mot);

    // radar chart for visual appeal
    const canvasWrap = document.createElement('div');
    canvasWrap.style.height = '260px';
    canvasWrap.style.marginTop = '12px';
    canvasWrap.innerHTML = `<canvas id="resultRadar"></canvas>`;
    resultBox.appendChild(canvasWrap);
    try {
      const ChartLib = window.Chart;
      if (ChartLib) {
        const ctx = document.getElementById('resultRadar').getContext('2d');
        const labels = Object.keys(filled);
        const data = labels.map(l => filled[l] || 0);
        new ChartLib(ctx, {
          type: 'radar',
          data: { labels, datasets: [{ label: 'Trait profile', data, backgroundColor: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,1)', pointBackgroundColor: 'rgba(99,102,241,1)' }] },
          options: { scales: { r: { suggestedMin: 0, suggestedMax: 100 } }, plugins: { legend: { display: false } }, elements: { line: { tension: 0.2 } } }
        });
      }
    } catch (e) { console.warn('Radar render failed', e); }

    // feedback form
    const fb = document.createElement('div');
    fb.style.marginTop = '12px';
    fb.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px">
        <label style="font-weight:600">Share feedback about your results</label>
        <textarea id="minddesk_feedback_text" rows="3" style="width:100%;padding:8px" placeholder="What do you think about these insights?"></textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button id="minddesk_feedback_submit" class="primary-btn">Send feedback</button>
        </div>
      </div>
    `;
    resultBox.appendChild(fb);

    document.getElementById('minddesk_feedback_submit')?.addEventListener('click', () => {
      const text = document.getElementById('minddesk_feedback_text')?.value || '';
      const storageKey = 'minddesk_feedback';
      try {
        const arr = JSON.parse(localStorage.getItem(storageKey) || '[]');
        arr.push({ timestamp: new Date().toISOString(), topTraits: topTraits.map(t=>t[0]), text });
        localStorage.setItem(storageKey, JSON.stringify(arr));
        alert('Thanks for your feedback — it helps improve your experience.');
      } catch (e) { alert('Failed to save feedback locally.'); }
    });
    // clear autosave after submit
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  });

  clear.addEventListener("click", () => {
    // clear stored answers and visually reset option buttons
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    form.querySelectorAll("button.option-btn").forEach(b => {
      const dot = b.querySelector('.fake-radio');
      if (dot) dot.style.background = 'transparent';
      b.setAttribute('aria-pressed', 'false');
    });
    resultBox.innerHTML = "";
    bar.style.width = '0%';
  });

  container.appendChild(form);

  // initial render of first page
  renderPage(page);
  // listen for answer changes to update progress UI
  window.addEventListener('minddesk_answers_changed', saveAnswersAutosave);
}

export function initPersonality() {
  const container = document.getElementById(APP_ID);
  if (!container) return;

  // Render
  try {
    renderForm(container);
  } catch (e) {
    container.innerHTML = `<div class="card" style="background:#fff6f6;color:#b91c1c">Failed to load questions.</div>`;
    console.error(e);
  }
}

// local helper used by app.js
export default { initPersonality };
