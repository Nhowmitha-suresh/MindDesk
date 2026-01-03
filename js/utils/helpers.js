/* =========================================================
   MINDDESK – PROFESSIONAL ANIMATIONS
   Subtle | Purposeful | Analytics-grade
   ========================================================= */

/* -------------------------------
   GLOBAL TRANSITIONS
-------------------------------- */
* {
  transition-property: background-color, color, border-color, box-shadow, transform;
  transition-duration: 180ms;
  transition-timing-function: ease;
}

/* Disable motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

/* -------------------------------
   PAGE LOAD ANIMATION
-------------------------------- */
.app {
  animation: appFadeIn 0.4s ease forwards;
}

@keyframes appFadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* -------------------------------
   CARD MICRO INTERACTIONS
-------------------------------- */
.card {
  position: relative;
  overflow: hidden;
}

.card::after {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  background: radial-gradient(
    circle at top left,
    rgba(255,255,255,0.06),
    transparent 60%
  );
  transition: opacity 200ms ease;
}

.card:hover::after {
  opacity: 1;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
}

/* -------------------------------
   KPI CARD EMPHASIS
-------------------------------- */
.kpi-card {
  animation: scaleIn 0.35s ease forwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* -------------------------------
   SIDEBAR NAV INTERACTIONS
-------------------------------- */
.sidebar nav a {
  position: relative;
}

.sidebar nav a::before {
  content: "";
  position: absolute;
  left: -8px;
  top: 50%;
  width: 4px;
  height: 0;
  background: var(--accent);
  border-radius: 4px;
  transform: translateY(-50%);
  transition: height 160ms ease;
}

.sidebar nav a.active::before,
.sidebar nav a:hover::before {
  height: 60%;
}

.sidebar nav a:hover {
  transform: translateX(2px);
}

/* -------------------------------
   BUTTON INTERACTIONS
-------------------------------- */
button {
  cursor: pointer;
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* -------------------------------
   CHART CONTAINER ANIMATION
-------------------------------- */
.chart-card {
  animation: chartReveal 0.4s ease forwards;
}

@keyframes chartReveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* -------------------------------
   TABLE ROW HOVER
-------------------------------- */
table tbody tr {
  transition: background-color 120ms ease;
}

table tbody tr:hover {
  background-color: rgba(99,102,241,0.04);
}

/* -------------------------------
   FADE BETWEEN SECTIONS
-------------------------------- */
.section {
  animation: sectionFade 0.25s ease forwards;
}

@keyframes sectionFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* -------------------------------
   THEME SWITCH ANIMATION
-------------------------------- */
body {
  transition: background-color 300ms ease, color 300ms ease;
}

/* -------------------------------
   TOOLTIP (OPTIONAL)
-------------------------------- */
.tooltip {
  position: absolute;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition: opacity 120ms ease, transform 120ms ease;
}

.tooltip.show {
  opacity: 1;
  transform: translateY(0);
}

/* -------------------------------
   LOADING SKELETONS
-------------------------------- */
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.05) 25%,
    rgba(255,255,255,0.12) 37%,
    rgba(255,255,255,0.05) 63%
  );
  background-size: 400% 100%;
  animation: skeletonLoad 1.4s ease infinite;
}

@keyframes skeletonLoad {
  from {
    background-position: 100% 0;
  }
  to {
    background-position: 0 0;
  }
}

/* -------------------------------
   MODAL APPEARANCE
-------------------------------- */
.modal {
  animation: modalScale 0.25s ease forwards;
}

@keyframes modalScale {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* -------------------------------
   NOTIFICATION SLIDE-IN
-------------------------------- */
.toast {
  animation: toastIn 0.35s ease forwards;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* -------------------------------
   FOCUS STATES (ACCESSIBILITY)
-------------------------------- */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* -------------------------------
   SMOOTH SCROLL
-------------------------------- */
html {
  scroll-behavior: smooth;
}

/* -------------------------------
   ICON HOVER ROTATION (SUBTLE)
-------------------------------- */
.icon-hover {
  display: inline-block;
  transition: transform 200ms ease;
}

.icon-hover:hover {
  transform: rotate(-4deg);
}

/* -------------------------------
   SECTION HEADER SEPARATOR
-------------------------------- */
.section h2::after {
  content: "";
  display: block;
  width: 36px;
  height: 3px;
  margin-top: 6px;
  background: var(--accent);
  border-radius: 2px;
}

/* -------------------------------
   END OF FILE
-------------------------------- */
