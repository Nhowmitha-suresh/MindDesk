/* =========================================================
   MindDesk – App Bootstrap & UI Logic
   ========================================================= */

import { signUp, login, getCurrentUser, logout, requireAuth } from "./auth.js";
import { saveTheme, loadTheme } from "./storage/localStore.js";
import { initPersonality } from "./personality/ui.js";
import { initTraitChart, refreshTraitChart, initTraitHistory, refreshTraitHistory } from "./charts/traitChart.js";

/* =========================================================
   PAGE DETECTION
   ========================================================= */

const page = document.body.dataset.page;

/* =========================================================
   LOGIN / SIGNUP PAGE LOGIC
   ========================================================= */

if (page === "auth") {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const messageBox = document.getElementById("authMessage");

  /* Handle Login */
  loginForm?.addEventListener("submit", e => {
    e.preventDefault();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    const res = login({ email, password });

    if (!res.success) {
      messageBox.textContent = res.message;
      messageBox.className = "error";
      return;
    }

    window.location.href = "dashboard.html";
  });

  /* Handle Signup */
  signupForm?.addEventListener("submit", e => {
    e.preventDefault();

    const name = signupForm.name.value.trim();
    const email = signupForm.email.value.trim();
    const password = signupForm.password.value;

    const res = signUp({ name, email, password });

    if (!res.success) {
      messageBox.textContent = res.message;
      messageBox.className = "error";
      return;
    }

    window.location.href = "dashboard.html";
  });
}

/* =========================================================
   DASHBOARD PAGE LOGIC
   ========================================================= */

if (page === "dashboard") {
  const user = requireAuth();
  if (!user) {
    // not authenticated — requireAuth should redirect to login
  } else {
    /* Greeting */
    const greeting = document.getElementById("greeting");
    if (greeting) {
      const hour = new Date().getHours();
      const timeGreeting =
        hour < 12 ? "Good morning" :
        hour < 18 ? "Good afternoon" :
        "Good evening";

      greeting.textContent = `${timeGreeting}, ${user.name}`;
    }

    /* Logout */
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn?.addEventListener("click", logout);

    /* Theme handling */
    const themeButtons = document.querySelectorAll("[data-theme]");

    function removeExistingThemeClasses() {
      const classes = Array.from(document.body.classList);
      classes.forEach(c => {
        if (c.startsWith("theme-")) document.body.classList.remove(c);
      });
    }

    function applyTheme(theme) {
      if (!theme) return;
      removeExistingThemeClasses();
      document.body.classList.add(theme);
      try { saveTheme(theme); } catch (e) { console.error(e); }
    }

    // initialize theme from storage
    try {
      const current = loadTheme();
      if (current) applyTheme(current);
    } catch (e) {
      console.warn("Theme load failed", e);
    }

    themeButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const t = btn.dataset.theme;
        applyTheme(t);
      });
    });

    // initialize personality UI
    try { initPersonality(); } catch (e) { console.warn("Personality UI init failed", e); }

    // initialize trait chart (if present)
    try { initTraitChart(); } catch (e) { console.warn('Trait chart init failed', e); }

    try { initTraitHistory(); } catch (e) { console.warn('Trait history init failed', e); }

    // Theme detective: suggest a theme based on dominant trait
    try {
      const themesSection = document.querySelector('#themes');
      if (themesSection) {
        const btn = document.createElement('button');
        btn.textContent = 'Detect Best Theme';
        btn.className = 'secondary';
        btn.style.marginTop = '8px';
        themesSection.appendChild(btn);

        btn.addEventListener('click', () => {
          try {
            const scores = JSON.parse(localStorage.getItem('minddesk_scores') || '{}');
            const entries = Object.entries(scores || {});
            if (!entries.length) { alert('No score data available yet. Take the test first.'); return; }
            entries.sort((a,b)=>b[1]-a[1]);
            const top = entries[0][0];
            // simple mapping
            const map = {
              'Vision':'theme-city', 'Drive':'theme-forest', 'Creativity':'theme-ocean', 'Leadership':'theme-dark', 'Resilience':'theme-snow'
            };
            const suggested = map[top] || 'theme-dark';
            applyTheme(suggested);
            alert('Suggested theme applied based on your top trait: ' + top);
          } catch (e) { alert('Could not detect theme.'); }
        });
      }
    } catch (e) { /* ignore */ }

    // refresh chart when storage changes (scores saved)
    window.addEventListener('storage', (e) => {
      if (e.key === 'minddesk_scores' || e.key === 'minddesk_scores_history') {
        try { refreshTraitChart(); } catch (err) {}
        try { refreshTraitHistory(); } catch (err) {}
      }
    });
  }
}

/* =========================================================
   GLOBAL SAFETY NET
   ========================================================= */

window.addEventListener("storage", e => {
  if (e.key === "minddesk_session" && !e.newValue) {
    window.location.href = "index.html";
  }
});
