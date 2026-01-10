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

    function ensureBgEffects() {
      let bg = document.querySelector('.bg-effects');
      if (!bg) {
        bg = document.createElement('div');
        bg.className = 'bg-effects';
        // keep it visually behind and non-interactive
        bg.style.position = 'fixed';
        bg.style.inset = '0';
        bg.style.zIndex = '0';
        bg.style.pointerEvents = 'none';
        document.body.appendChild(bg);
      } else {
        // enforce safety on existing node as well
        bg.style.pointerEvents = 'none';
      }
      return bg;
    }

    function applyBlings(theme) {
      try {
        const container = ensureBgEffects();
        // Do not render any blings on the dashboard Games page
        if (document.getElementById('games')) {
          container.querySelectorAll('.bling')?.forEach(n=>n.remove());
          return;
        }
        // respect user preference
        const enabled = localStorage.getItem('minddesk_blings_enabled');
        if (enabled === '0') {
          // remove blings if present
          container.querySelectorAll('.bling')?.forEach(n=>n.remove());
          return;
        }
        // remove existing blings
        container.querySelectorAll('.bling')?.forEach(n=>n.remove());

        // create tasteful blings depending on theme
        const count = 8;
        for (let i=0;i<count;i++){
          const b = document.createElement('div');
          b.className = 'bling';
          b.style.pointerEvents = 'none';
          // size classes
          const sz = i % 3 === 0 ? 'medium' : (i % 2 === 0 ? 'small' : 'floaty');
          b.classList.add(sz);
          // random position across the viewport
          const left = Math.floor(Math.random()*90) + '%';
          const top = Math.floor(Math.random()*75) + '%';
          b.style.left = left;
          b.style.top = top;
          // slow variation in animation delay
          b.style.animationDelay = (Math.random()*2)+'s';
          container.appendChild(b);
        }
      } catch(e) { console.warn('applyBlings failed', e); }
    }

    // Expose a refresh function for other modules (e.g., side panel toggle)
    try { window.minddesk_refreshBlings = function(){ const t = Array.from(document.body.classList).find(c=>c.startsWith('theme-')); try { applyBlings(t); } catch(e){} }; } catch(e) {}

    function applyTheme(theme) {
      if (!theme) return;
      removeExistingThemeClasses();
      document.body.classList.add(theme);
      try { saveTheme(theme); } catch (e) { console.error(e); }
      // ensure background effect element exists and add blings
      ensureBgEffects();
      applyBlings(theme);
      // update active state on buttons
      themeButtons.forEach(btn => {
        if (btn.dataset.theme === theme) btn.classList.add('active'); else btn.classList.remove('active');
      });
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

    // Ensure side panel is inside body and wired correctly
    try {
      const panel = document.getElementById('sidePanel');
      if (panel && panel.parentElement !== document.body) {
        document.body.appendChild(panel);
      }
      const toggleBtn = document.getElementById('sidePanelToggle');
      const closeBtn = document.getElementById('sidePanelClose');
      const openPanel = () => { if (panel){ panel.classList.add('open'); if (toggleBtn) toggleBtn.style.display = 'none'; } };
      const closePanel = () => { if (panel){ panel.classList.remove('open'); if (toggleBtn) toggleBtn.style.display = ''; } };
      toggleBtn && toggleBtn.addEventListener('click', openPanel);
      closeBtn && closeBtn.addEventListener('click', closePanel);
    } catch (e) { /* ignore wiring errors */ }

    // Add a quick "View Score Details" CTA in the dashboard cards
    try {
      const overallCard = document.querySelector('.cards .card');
      if (overallCard) {
        const btn = document.createElement('button');
        btn.className = 'secondary';
        btn.style.marginTop = '8px';
        btn.textContent = 'View Score Details';
        overallCard.appendChild(btn);
        btn.addEventListener('click', () => {
          try {
            const panel = document.getElementById('sidePanel');
            const toggle = document.getElementById('sidePanelToggle');
            if (panel) panel.classList.add('open');
            if (toggle) toggle.style.display = 'none';
            try { window.minddesk_generateRecommendations && window.minddesk_generateRecommendations(); } catch(e){}
            try { window.wireSidePanelButtons && window.wireSidePanelButtons(); } catch(e){}
            try { window.refreshTraitChart && window.refreshTraitChart(); } catch(e){}
          } catch(e) { /* ignore */ }
        });
      }
    } catch (e) { /* ignore */ }

    // Ensure no floating characters appear on dashboard (prevents flicker over buttons)
    try {
      const fc = document.getElementById('floatingChars');
      if (fc) { fc.style.display = 'none'; while (fc.firstChild) fc.removeChild(fc.firstChild); }
    } catch(e) { /* ignore */ }

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
