/* =========================================================
   MindDesk – Personality Insights Engine
   Converts trait scores into human-readable insights
   ========================================================= */

/*
EXPECTED INPUT FORMAT
---------------------
scores = {
  GrowthMindset: 78,
  Adaptability: 64,
  EmotionalIntelligence: 71,
  SocialAwareness: 58,
  Accountability: 82,
  InternalLocus: 75,
  Logic: 80,
  Creativity: 55,
  DecisionMaking: 68,
  Ethics: 74,
  Drive: 79,
  Vision: 66,
  Leadership: 61,
  Discipline: 83
}
*/

/* =========================================================
   TRAIT INTERPRETATION RULES
   ========================================================= */

const TRAIT_THRESHOLDS = {
  high: 70,
  medium: 45
};

/* ---------------------------------------------------------
   INDIVIDUAL TRAIT INSIGHTS
---------------------------------------------------------- */
const TRAIT_INSIGHTS = {
  GrowthMindset: {
    high: "You actively seek learning opportunities and view challenges as chances to grow rather than obstacles.",
    medium: "You are open to learning, but may sometimes rely on familiar approaches instead of experimenting.",
    low: "You may prefer proven methods and could feel uncomfortable when facing unfamiliar challenges."
  },

  Adaptability: {
    high: "You adjust quickly to change and are comfortable pivoting strategies when circumstances shift.",
    medium: "You can adapt when required, though sudden change may initially feel disruptive.",
    low: "Frequent change may cause stress, and you may prefer stable, predictable environments."
  },

  EmotionalIntelligence: {
    high: "You are highly aware of emotions—both your own and others’—and use that awareness to guide your interactions.",
    medium: "You generally understand emotional dynamics but may occasionally miss subtle cues.",
    low: "Emotional signals may not always be obvious to you, especially in complex social situations."
  },

  SocialAwareness: {
    high: "You read social environments well and adjust your behavior to maintain trust and rapport.",
    medium: "You navigate social situations competently, though unfamiliar settings may require more effort.",
    low: "Social cues may be harder to interpret, particularly in group or unfamiliar contexts."
  },

  Accountability: {
    high: "You take ownership of outcomes and hold yourself responsible even under difficult circumstances.",
    medium: "You accept responsibility in most situations, though external factors may influence your reactions.",
    low: "You may attribute outcomes more to circumstances than personal actions."
  },

  InternalLocus: {
    high: "You believe your actions directly shape your outcomes and actively influence your path.",
    medium: "You see a balance between personal effort and external factors.",
    low: "You may feel that outcomes are largely determined by factors outside your control."
  },

  Logic: {
    high: "You rely heavily on structured thinking, data, and rational analysis when solving problems.",
    medium: "You balance logic with intuition depending on the situation.",
    low: "You may prefer intuitive or experiential decision-making over analytical reasoning."
  },

  Creativity: {
    high: "You enjoy exploring unconventional ideas and finding novel approaches to problems.",
    medium: "You are creative when needed, especially within familiar boundaries.",
    low: "You may prefer established methods over experimenting with new ideas."
  },

  DecisionMaking: {
    high: "You make decisions confidently, even with incomplete information.",
    medium: "You deliberate carefully before deciding, weighing pros and cons.",
    low: "You may hesitate when decisions involve uncertainty or risk."
  },

  Ethics: {
    high: "Strong moral principles guide your decisions, even when doing so is inconvenient.",
    medium: "You value ethical behavior but may face internal conflict in complex situations.",
    low: "Ethical considerations may take a back seat to practical outcomes."
  },

  Drive: {
    high: "You are highly motivated by long-term goals and sustained effort.",
    medium: "You are motivated when goals are clear and meaningful.",
    low: "Maintaining long-term motivation may be challenging without external structure."
  },

  Vision: {
    high: "You think long-term and are guided by a clear sense of purpose.",
    medium: "You consider the future but often focus on near-term goals.",
    low: "You may prioritize immediate concerns over long-term planning."
  },

  Leadership: {
    high: "You naturally influence others and take initiative in group settings.",
    medium: "You lead when required but do not always seek leadership roles.",
    low: "You may prefer contributing individually rather than guiding others."
  },

  Discipline: {
    high: "You maintain consistency and follow through on commitments even when motivation dips.",
    medium: "You are disciplined in structured environments but may struggle without routines.",
    low: "Consistency may be difficult without strong external accountability."
  }
};

/* =========================================================
   CORE INSIGHT GENERATION
   ========================================================= */

export function generateTraitInsights(scores) {
  const insights = [];

  for (const trait in scores) {
    const value = scores[trait];
    const rule = TRAIT_INSIGHTS[trait];
    if (!rule) continue;

    if (value >= TRAIT_THRESHOLDS.high) {
      insights.push({
        trait,
        level: "High",
        score: value,
        text: rule.high
      });
    } else if (value >= TRAIT_THRESHOLDS.medium) {
      insights.push({
        trait,
        level: "Moderate",
        score: value,
        text: rule.medium
      });
    } else {
      insights.push({
        trait,
        level: "Low",
        score: value,
        text: rule.low
      });
    }
  }

  return insights;
}

/* =========================================================
   STRENGTHS & DEVELOPMENT AREAS
   ========================================================= */

export function extractStrengths(scores) {
  return Object.keys(scores)
    .filter(trait => scores[trait] >= 75)
    .map(trait => ({
      trait,
      score: scores[trait]
    }));
}

export function extractGrowthAreas(scores) {
  return Object.keys(scores)
    .filter(trait => scores[trait] <= 45)
    .map(trait => ({
      trait,
      score: scores[trait]
    }));
}

/* =========================================================
   SUMMARY NARRATIVE
   ========================================================= */

export function generateSummary(scores) {
  const strengths = extractStrengths(scores);
  const growth = extractGrowthAreas(scores);

  let summary = "Your profile reflects a balanced personality with ";

  if (strengths.length > 0) {
    summary +=
      "notable strengths in " +
      strengths.map(s => s.trait).join(", ") +
      ". ";
  }

  if (growth.length > 0) {
    summary +=
      "Opportunities for growth appear in " +
      growth.map(g => g.trait).join(", ") +
      ".";
  }

  return summary;
}

/* =========================================================
   DASHBOARD-READY FORMAT
   ========================================================= */

export function buildInsightReport(scores) {
  return {
    summary: generateSummary(scores),
    strengths: extractStrengths(scores),
    growthAreas: extractGrowthAreas(scores),
    detailedInsights: generateTraitInsights(scores)
  };
}

/* =========================================================
   OPTIONAL: SAVE INSIGHT SNAPSHOT
   ========================================================= */

export function saveInsightSnapshot(scores) {
  const report = buildInsightReport(scores);

  const history =
    JSON.parse(localStorage.getItem("minddesk_insight_history")) || [];

  history.push({
    timestamp: new Date().toISOString(),
    report
  });

  localStorage.setItem(
    "minddesk_insight_history",
    JSON.stringify(history)
  );
}
