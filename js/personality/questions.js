/* =========================================================
   MindDesk – Curated 30-Item Psychometric Rating Statements
   Each item is a statement to be rated on a 1–5 scale:
     1 — Strongly Disagree
     2 — Disagree
     3 — Neutral
     4 — Agree
     5 — Strongly Agree

   These 30 items are concise, high-impact statements covering
   resilience, self-regulation, collaboration, leadership,
   creativity, and decision-making. They are crafted for
   professional diagnostic use and presentation in large-box
   format with prominent typography.
   ========================================================= */

export const SCALE = [
  '1 - Strongly Disagree',
  '2 - Disagree',
  '3 - Neutral',
  '4 - Agree',
  '5 - Strongly Agree'
];

export const QUESTIONS = [
  { id: 1, text: 'I remain calm and clear-headed when under pressure.', traits: ['Resilience','EmotionalRegulation'] },
  { id: 2, text: 'I follow through on commitments, even when obstacles arise.', traits: ['Conscientiousness','Accountability'] },
  { id: 3, text: 'I seek feedback and use it to improve my performance.', traits: ['GrowthMindset','SelfAwareness'] },
  { id: 4, text: 'I adapt my approach quickly when circumstances change.', traits: ['Adaptability','CognitiveFlexibility'] },
  { id: 5, text: 'I prioritize tasks effectively to meet important deadlines.', traits: ['TimeManagement','Discipline'] },
  { id: 6, text: 'I take responsibility for outcomes, not just intentions.', traits: ['Accountability','InternalLocus'] },
  { id: 7, text: 'I listen carefully to understand others before responding.', traits: ['Empathy','SocialAwareness'] },
  { id: 8, text: 'I remain composed and constructive when receiving criticism.', traits: ['EmotionalRegulation','Professionalism'] },
  { id: 9, text: 'I generate multiple solutions before choosing a path.', traits: ['ProblemSolving','Creativity'] },
  { id: 10, text: 'I take initiative to improve processes without being asked.', traits: ['Initiative','Drive'] },
  { id: 11, text: 'I can explain complex ideas in a simple, persuasive way.', traits: ['Communication','Leadership'] },
  { id: 12, text: 'I remain curious and actively seek new learning opportunities.', traits: ['Curiosity','GrowthMindset'] },
  { id: 13, text: 'I balance confidence with humility when making decisions.', traits: ['Confidence','Humility'] },
  { id: 14, text: 'I evaluate risks thoughtfully and act decisively when needed.', traits: ['DecisionMaking','RiskTolerance'] },
  { id: 15, text: 'I collaborate openly and share credit with my team.', traits: ['Collaboration','Leadership'] },
  { id: 16, text: 'I maintain energy and focus throughout long or difficult projects.', traits: ['Persistence','Discipline'] },
  { id: 17, text: 'I acknowledge mistakes quickly and take corrective action.', traits: ['Accountability','Ethics'] },
  { id: 18, text: 'I generate creative approaches when conventional methods fail.', traits: ['Creativity','CognitiveFlexibility'] },
  { id: 19, text: 'I set clear priorities and say no to distractions.', traits: ['Focus','TimeManagement'] },
  { id: 20, text: 'I can manage stress without letting it affect my judgment.', traits: ['StressTolerance','EmotionalRegulation'] },
  { id: 21, text: 'I build trust quickly by being reliable and transparent.', traits: ['Trustworthiness','SocialAwareness'] },
  { id: 22, text: 'I synthesize differing perspectives to make better decisions.', traits: ['IntegrativeThinking','DecisionMaking'] },
  { id: 23, text: 'I hold myself accountable to high ethical standards.', traits: ['Ethics','Integrity'] },
  { id: 24, text: 'I seek to understand the root cause of problems, not just symptoms.', traits: ['Analytical','ProblemSolving'] },
  { id: 25, text: 'I remain optimistic and proactive when facing setbacks.', traits: ['Resilience','Drive'] },
  { id: 26, text: 'I adjust my communication style to connect with different audiences.', traits: ['Communication','SocialAwareness'] },
  { id: 27, text: 'I prioritize long-term impact over short-term convenience.', traits: ['StrategicThinking','Vision'] },
  { id: 28, text: 'I ask thoughtful questions to clarify ambiguous situations.', traits: ['Curiosity','CriticalThinking'] },
  { id: 29, text: 'I remain open to changing my view when presented with strong evidence.', traits: ['CognitiveFlexibility','OpenMindedness'] },
  { id: 30, text: 'I lead by example and inspire others through my actions.', traits: ['Leadership','Influence'] }
];