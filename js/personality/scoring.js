/* =========================================================
   MindDesk – Psychometric Scoring Engine
   Converts user answers into normalized trait scores
   ========================================================= */

/*
EXPECTED INPUT
--------------
answers = [
  { id: 1, value: 4 },   // value typically 1–5 (Likert)
  { id: 2, value: 5 },
  ...
]

questions = imported from questions.js
Each question:
{
  id,
  text,
  traits: ["GrowthMindset", "Adaptability"],
  weight: 3
}
*/

/* =========================================================
   CONFIGURATION
   ========================================================= */

const LIKERT_SCALE = {
  min: 1,
  max: 5
};

/* Minimum questions per trait to be considered reliable */
const MIN_QUESTIONS_PER_TRAIT = 2;

/* =========================================================
   INTERNAL HELPERS
   ========================================================= */

/* Clamp value safely */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/* Initialize trait accumulator */
function initTraitMap() {
  return {
    total: 0,
    max: 0,
    count: 0
  };
}

/* =========================================================
   CORE SCORING FUNCTION
   ========================================================= */

export function calculateScores(answers, questions) {
  const traitBuckets = {};

  /* Map questions by ID for fast lookup */
  const questionMap = {};
  questions.forEach(q => {
    questionMap[q.id] = q;
  });

  /* Iterate over answers */
  answers.forEach(answer => {
    const q = questionMap[answer.id];
    if (!q) return;

    const value = clamp(answer.value, LIKERT_SCALE.min, LIKERT_SCALE.max);
    // default weight to 1 when question weight is missing
    const w = (q && typeof q.weight === 'number') ? q.weight : 1;

    q.traits.forEach(trait => {
      if (!traitBuckets[trait]) {
        traitBuckets[trait] = initTraitMap();
      }

      /* Weighted contribution (use default weight when missing) */
      traitBuckets[trait].total += value * w;
      traitBuckets[trait].max += LIKERT_SCALE.max * w;
      traitBuckets[trait].count += 1;
    });
  });

  /* Normalize scores */
  const normalizedScores = {};

  for (const trait in traitBuckets) {
    const bucket = traitBuckets[trait];

    /* Reliability check */
    if (bucket.count < MIN_QUESTIONS_PER_TRAIT) {
      normalizedScores[trait] = null; // insufficient data
      continue;
    }

    let percentage = (bucket.total / bucket.max) * 100;
    if (!Number.isFinite(percentage) || Number.isNaN(percentage)) {
      normalizedScores[trait] = null;
      continue;
    }

    percentage = clamp(Math.round(percentage), 0, 100);
    normalizedScores[trait] = percentage;
  }

  return normalizedScores;
}

/* =========================================================
   OPTIONAL: RAW SCORE DEBUGGING (FOR DEV / QA)
   ========================================================= */

export function calculateRawScores(answers, questions) {
  const raw = {};

  questions.forEach(q => {
    q.traits.forEach(trait => {
      raw[trait] = raw[trait] || [];
    });
  });

  answers.forEach(a => {
    const q = questions.find(q => q.id === a.id);
    if (!q) return;

    q.traits.forEach(trait => {
      raw[trait].push({
        questionId: q.id,
        value: a.value,
        weight: q.weight
      });
    });
  });

  return raw;
}

/* =========================================================
   SCORE POST-PROCESSING
   ========================================================= */

/* Replace null traits with neutral estimate */
export function fillMissingScores(scores, neutral = 50) {
  const filled = {};

  for (const trait in scores) {
    filled[trait] =
      scores[trait] === null ? neutral : scores[trait];
  }

  return filled;
}

/* =========================================================
   SNAPSHOT STORAGE (HISTORY)
   ========================================================= */

export function saveScoreSnapshot(scores) {
  const history =
    JSON.parse(localStorage.getItem("minddesk_scores_history")) || [];

  history.push({
    timestamp: new Date().toISOString(),
    scores
  });

  localStorage.setItem(
    "minddesk_scores_history",
    JSON.stringify(history)
  );

  /* Save latest snapshot */
  localStorage.setItem(
    "minddesk_scores",
    JSON.stringify(scores)
  );

  // Notify other modules in this window that scores updated
  try {
    window.dispatchEvent(new CustomEvent('minddesk_scores_updated', { detail: { timestamp: new Date().toISOString() } }));
  } catch (e) { /* ignore */ }
}

/* =========================================================
   VALIDATION UTILITIES
   ========================================================= */

export function validateAnswers(answers) {
  if (!Array.isArray(answers)) return false;

  return answers.every(a =>
    typeof a.id === "number" &&
    typeof a.value === "number" &&
    a.value >= LIKERT_SCALE.min &&
    a.value <= LIKERT_SCALE.max
  );
}

/* =========================================================
   FUTURE EXTENSION (PLACEHOLDERS)
   ========================================================= */

/*
NLP SCORING (OPEN-ENDED ANSWERS)
--------------------------------
export function scoreTextResponse(text, trait) {
  // Hook for sentiment / semantic scoring
}
*/

/*
ADAPTIVE QUESTIONING
--------------------
Adjust future questions based on current scores
*/

