// js/navigation.js — enhanced navigation, sidebar, and search

function showSection(id) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(sec => sec.classList.add('hidden'));

  // update active link state in sidebar
  const links = document.querySelectorAll('.sidebar nav a');
  links.forEach(l => l.classList.toggle('active', l.dataset.target === id));

  const target = document.getElementById(id);
  if (target) {
    target.classList.remove('hidden');
    const focusable = target.querySelector('button, a, input, textarea');
    if (focusable) focusable.focus();
  } else {
    console.error('Section not found:', id);
  }
}

// Sidebar collapse + persistence
function setSidebarCollapsed(collapsed) {
  const sb = document.querySelector('.sidebar');
  if (!sb) return;
  sb.classList.toggle('collapsed', collapsed);
  const btn = document.getElementById('collapseBtn');
  if (btn) btn.setAttribute('aria-expanded', String(!collapsed));
  localStorage.setItem('minddesk_sidebar_collapsed', String(collapsed));
}

function toggleSidebar() {
  const collapsed = localStorage.getItem('minddesk_sidebar_collapsed') === 'true';
  setSidebarCollapsed(!collapsed);
}

document.addEventListener('DOMContentLoaded', () => {
  const defaultSection = localStorage.getItem('minddesk_section') || 'home';
  showSection(defaultSection);

  // persist last section when nav links clicked
  const links = document.querySelectorAll('.sidebar nav a');
  links.forEach(l => {
    l.addEventListener('click', () => {
      const t = l.dataset.target;
      if (t) localStorage.setItem('minddesk_section', t);
    });

    // keyboard support
    l.setAttribute('tabindex', '0');
    l.addEventListener('keydown', (e) => {
      const idx = Array.from(links).indexOf(l);
      if (e.key === 'ArrowDown') links[(idx + 1) % links.length].focus();
      if (e.key === 'ArrowUp') links[(idx - 1 + links.length) % links.length].focus();
      if (e.key === 'Enter' || e.key === ' ') l.click();
    });
  });

  // initialize collapsed state
  const collapsed = localStorage.getItem('minddesk_sidebar_collapsed') === 'true';
  setSidebarCollapsed(collapsed);
  const collapseBtn = document.getElementById('collapseBtn');
  if (collapseBtn) collapseBtn.addEventListener('click', toggleSidebar);

  // global search
  const search = document.getElementById('globalSearch');
  if (search) search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = q === '' || text.includes(q) ? '' : 'none';
    });
  });

  // profile modal handling
  const openProfile = document.getElementById('openProfile');
  const profileModal = document.getElementById('profileModal');
  const profileName = document.getElementById('profileName');
  const profileAvatar = document.getElementById('profileAvatar');
  const saveProfile = document.getElementById('saveProfile');
  const cancelProfile = document.getElementById('cancelProfile');

  function openProfileModal() {
    const p = JSON.parse(localStorage.getItem('minddesk_profile') || '{}');
    if (profileName) profileName.value = p.name || '';
    if (profileAvatar) profileAvatar.value = p.avatar || '';
    if (profileModal) profileModal.classList.remove('hidden');
  }

  function closeProfileModal() {
    if (profileModal) profileModal.classList.add('hidden');
  }

  if (openProfile) openProfile.addEventListener('click', openProfileModal);
  if (cancelProfile) cancelProfile.addEventListener('click', closeProfileModal);
  if (saveProfile) saveProfile.addEventListener('click', () => {
    const p = { name: profileName ? profileName.value.trim() : '', avatar: profileAvatar ? profileAvatar.value.trim() : '' };
    localStorage.setItem('minddesk_profile', JSON.stringify(p));
    updateGreeting();
    closeProfileModal();
  });

  // onboarding
  const onboarding = document.getElementById('onboarding');
  const onboardingNext = document.getElementById('onboardingNext');
  const onboardingSkip = document.getElementById('onboardingSkip');

  function startOnboarding() {
    if (!onboarding) return;
    onboarding.classList.remove('hidden');
    onboarding.setAttribute('aria-hidden', 'false');
  }

  function endOnboarding() {
    if (!onboarding) return;
    onboarding.classList.add('hidden');
    onboarding.setAttribute('aria-hidden', 'true');
    localStorage.setItem('minddesk_onboarded', 'true');
  }

  if (!localStorage.getItem('minddesk_onboarded')) {
    setTimeout(startOnboarding, 600);
  }

  if (onboardingNext) onboardingNext.addEventListener('click', endOnboarding);
  if (onboardingSkip) onboardingSkip.addEventListener('click', endOnboarding);

  // keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 's') {
      const s = document.getElementById('globalSearch');
      if (s) { s.focus(); e.preventDefault(); }
    }
    if (e.key === 't') {
      if (typeof toggleTheme === 'function') toggleTheme();
    }
    if (e.key === 'g') {
      const first = document.querySelector('.sidebar nav a');
      if (first) { first.focus(); }
    }
  });

  // update greeting from session/profile
  function updateGreeting() {
    const greeting = document.getElementById('greeting');
    if (!greeting) return;
    const session = JSON.parse(localStorage.getItem('minddesk_session') || 'null');
    const profile = JSON.parse(localStorage.getItem('minddesk_profile') || 'null');
    let name = null;
    if (profile && profile.name) name = profile.name;
    else if (session && session.user) name = session.user;
    greeting.innerText = name ? `Hello, ${name}` : 'Welcome to MindDesk';
  }

  updateGreeting();
});
