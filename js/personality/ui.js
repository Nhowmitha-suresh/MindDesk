/* ============================================================
   MindDesk – Personality Test UI Engine
   File: ui.js
   Author: Nhowmitha Suresh
============================================================ */

import { QUESTIONS } from "./questions.js";
import {
  calculateScores,
  fillMissingScores,
  saveScoreSnapshot
} from "./scoring.js";
import { buildInsightReport, saveInsightSnapshot } from "./insights.js";

/* ============================================================
   CONSTANTS
============================================================ */

const APP_ID = "personalityApp";
const STORAGE_KEY = "minddesk_personality_answers";
const PAGE_KEY = "minddesk_personality_page";
const PAGE_SIZE = 5;
const AUTO_ADVANCE = false;
const ANIMATE_PAGES = false;

/* ============================================================
   STATE
============================================================ */

let currentPage = 0;
let answersCache = {};

/* ============================================================
   STORAGE
============================================================ */

function loadAnswers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveAnswer(qid, value) {
  answersCache[String(qid)] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answersCache));
  window.dispatchEvent(new CustomEvent("minddesk_answers_changed"));
}

/* ============================================================
   PAGINATION
============================================================ */

function totalPages() {
  return Math.ceil(QUESTIONS.length / PAGE_SIZE);
}

function pageQuestions(page) {
  const start = page * PAGE_SIZE;
  return QUESTIONS.slice(start, start + PAGE_SIZE);
}

function pageCompleted(page) {
  return pageQuestions(page).every(
    q => typeof answersCache[String(q.id)] === "number"
  );
}

/* ============================================================
   PROGRESS
============================================================ */

function createProgressBar() {
  const wrap = document.createElement("div");
  wrap.style.height = "8px";
  wrap.style.background = "var(--surface-muted)";
  wrap.style.borderRadius = "6px";

  const bar = document.createElement("div");
  bar.id = "personalityProgressBar";
  bar.style.height = "100%";
  bar.style.width = "0%";
  bar.style.background = "var(--accent)";
  wrap.appendChild(bar);

  return wrap;
}

function updateProgress() {
  const answered = Object.keys(answersCache).length;
  const pct = Math.round((answered / QUESTIONS.length) * 100);
  const bar = document.getElementById("personalityProgressBar");
  if (bar) bar.style.width = pct + "%";
}

function createPageIndicator() {
  const el = document.createElement("div");
  el.id = "personalityPageIndicator";
  el.style.fontSize = "12px";
  el.style.color = "var(--text-muted)";
  el.style.marginBottom = "6px";
  return el;
}

/* ============================================================
   QUESTION UI (RADIO + AUTO-SCROLL)
============================================================ */

function createQuestion(q, indexInPage, container) {
  const wrap = document.createElement("fieldset");
  wrap.className = "form-group";
  wrap.style.border = "none";
  wrap.dataset.index = indexInPage;

  const legend = document.createElement("legend");
  legend.textContent = `${q.id}. ${q.text}`;
  legend.style.fontWeight = "600";

  const scale = document.createElement("div");
  scale.style.display = "flex";
  scale.style.gap = "14px";
  scale.style.marginTop = "8px";

  for (let i = 1; i <= 5; i++) {
    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "6px";
    label.style.cursor = "pointer";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = `q_${q.id}`;
    radio.value = i;

    if (answersCache[String(q.id)] === i) {
      radio.checked = true;
    }

    radio.addEventListener("change", () => {
      saveAnswer(q.id, i);
      if (AUTO_ADVANCE) {
        autoScrollNextQuestion(wrap, container);
      }
    });

    const text = document.createElement("span");
    text.textContent = i;

    label.appendChild(radio);
    label.appendChild(text);
    scale.appendChild(label);
  }

  wrap.appendChild(legend);
  wrap.appendChild(scale);
  return wrap;
}

/* ============================================================
   AUTO-SCROLL LOGIC
============================================================ */

function autoScrollNextQuestion(currentQuestion, container) {
  const next = currentQuestion.nextElementSibling;

  if (next) {
    next.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  } else {
    // End of page → move to next page if complete
    if (pageCompleted(currentPage)) {
      setTimeout(() => slideToNextPage(container), 300);
    }
  }
}

/* ============================================================
   SLIDE ANIMATION BETWEEN PAGES
============================================================ */

function slideToNextPage(container) {
  const pageWrap = container.querySelector("#pageWrap");

  // If animations disabled, advance instantly
  if (!ANIMATE_PAGES) {
    if (currentPage < totalPages() - 1) {
      currentPage++;
      sessionStorage.setItem(PAGE_KEY, currentPage);
      renderPage(container, "right");
    } else {
      submitTest(container);
    }
    try { container.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
    return;
  }

  // If the animated wrapper exists, play the slide animation
  if (pageWrap) {
    pageWrap.style.transition = "transform 0.35s ease, opacity 0.35s ease";
    pageWrap.style.transform = "translateX(-40px)";
    pageWrap.style.opacity = "0";

    setTimeout(() => {
      if (currentPage < totalPages() - 1) {
        currentPage++;
        sessionStorage.setItem(PAGE_KEY, currentPage);
        renderPage(container, "right");
      } else {
        submitTest(container);
      }
      try { container.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
    }, 350);
    return;
  }

  // Fallback: no wrapper found — just advance
  if (currentPage < totalPages() - 1) {
    currentPage++;
    sessionStorage.setItem(PAGE_KEY, currentPage);
    renderPage(container, "right");
  } else {
    submitTest(container);
  }
  try { container.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) {}
}

/* ============================================================
   RENDER PAGE (SLIDE IN)
============================================================ */

function renderPage(container, direction = "right") {
  const pageWrap = container.querySelector("#pageWrap");

  pageWrap.innerHTML = "";
  if (ANIMATE_PAGES) {
    pageWrap.style.transition = "none";
    pageWrap.style.opacity = "0";
    pageWrap.style.transform =
      direction === "right" ? "translateX(40px)" : "translateX(-40px)";
  }

  pageQuestions(currentPage).forEach((q, idx) => {
    pageWrap.appendChild(createQuestion(q, idx, container));
  });

  document.getElementById("personalityPageIndicator").textContent =
    `Page ${currentPage + 1} of ${totalPages()}`;

  const prev = container.querySelector("#btnPrev");
  const next = container.querySelector("#btnNext");
  const submit = container.querySelector("#btnSubmit");

  prev.disabled = currentPage === 0;

  if (currentPage < totalPages() - 1) {
    next.style.display = "inline-flex";
    submit.style.display = "none";
  } else {
    next.style.display = "none";
    submit.style.display = "inline-flex";
  }

  if (ANIMATE_PAGES) {
    requestAnimationFrame(() => {
      pageWrap.style.transition = "transform 0.35s ease, opacity 0.35s ease";
      pageWrap.style.opacity = "1";
      pageWrap.style.transform = "translateX(0)";
    });
  }

  updateProgress();
}

/* ============================================================
   FINAL SUBMIT
============================================================ */

function submitTest(container) {
  const result = container.querySelector("#personalityResult");

  const answered = Object.entries(answersCache).map(([id, value]) => ({
    id: Number(id),
    value
  }));

  const scores = calculateScores(answered, QUESTIONS);
  const filled = fillMissingScores(scores, 50);

  saveScoreSnapshot(filled);
  saveInsightSnapshot(filled);

  const report = buildInsightReport(filled);

  result.innerHTML = `
    <h3>Your Personality Summary</h3>
    <p>${report.summary}</p>
  `;

  report.detailedInsights.forEach(d => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.marginTop = "8px";
    card.innerHTML =
      `<strong>${d.trait}</strong> — ${d.level}<br/><small>${d.text}</small>`;
    result.appendChild(card);
  });

  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(PAGE_KEY);
}

/* ============================================================
   INIT
============================================================ */

export function initPersonality() {
  const container = document.getElementById(APP_ID);
  if (!container) return;

  answersCache = loadAnswers();
  currentPage = Number(sessionStorage.getItem(PAGE_KEY)) || 0;

  container.innerHTML = "";

  const intro = document.createElement("p");
  intro.className = "subtitle";
  intro.textContent = "Rate each statement from 1 (Low) to 5 (High).";

  const progress = createProgressBar();
  const indicator = createPageIndicator();

  const pageWrap = document.createElement("div");
  pageWrap.id = "pageWrap";
  pageWrap.style.display = "grid";
  pageWrap.style.gap = "20px";
  pageWrap.style.overflow = "visible";
  pageWrap.style.paddingBottom = "96px"; // space so last question clears sticky buttons

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.justifyContent = "space-between";
  actions.style.marginTop = "12px";
  // Keep controls visible
  actions.style.position = "sticky";
  actions.style.bottom = "0";
  actions.style.padding = "10px 0 0 0";
  actions.style.background = "linear-gradient(to bottom, transparent, var(--surface))";
  actions.style.borderTop = "1px solid var(--border)";
  actions.style.zIndex = "10001";
  actions.style.pointerEvents = "auto";

  const btnPrev = document.createElement("button");
  btnPrev.id = "btnPrev";
  btnPrev.textContent = "Previous";
  btnPrev.type = "button";

  const btnNext = document.createElement("button");
  btnNext.id = "btnNext";
  btnNext.textContent = "Next";
  btnNext.type = "button";

  const btnSubmit = document.createElement("button");
  btnSubmit.id = "btnSubmit";
  btnSubmit.textContent = "Submit Test";
  btnSubmit.style.display = "none";
  btnSubmit.type = "button";

  btnPrev.addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      sessionStorage.setItem(PAGE_KEY, currentPage);
      renderPage(container, "left");
    }
  });

  btnNext.addEventListener("click", () => {
    // Proceed even if the page isn't fully completed
    slideToNextPage(container);
  });

  btnSubmit.addEventListener("click", () => submitTest(container));

  actions.append(btnPrev, btnNext, btnSubmit);

  const result = document.createElement("div");
  result.id = "personalityResult";
  result.style.marginTop = "16px";

  container.append(
    intro,
    progress,
    indicator,
    pageWrap,
    actions,
    result
  );

  renderPage(container);
  updateProgress();

  // Keyboard shortcut: Enter to go Next
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      btnNext.click();
    }
  });

  // Safety net: event delegation if direct handlers are ever lost
  container.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const id = t.id;
    if (id === 'btnNext') { e.preventDefault(); slideToNextPage(container); }
    if (id === 'btnPrev') { e.preventDefault(); if (currentPage>0){ currentPage--; sessionStorage.setItem(PAGE_KEY, currentPage); renderPage(container, 'left'); } }
    if (id === 'btnSubmit') { e.preventDefault(); submitTest(container); }
  });
}

export default { initPersonality };
