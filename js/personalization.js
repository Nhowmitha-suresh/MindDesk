function setTheme(theme) {
  document.body.className = theme;
  localStorage.setItem("minddesk_theme", theme);
}

function getTheme() {
  return localStorage.getItem("minddesk_theme") || 'sunrise';
}

function toggleTheme() {
  const current = getTheme();
  const next = (current === 'midnight' || current === 'mono' || current === 'dark') ? 'sunrise' : 'midnight';
  setTheme(next);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.setAttribute('aria-pressed', String(next !== 'sunrise'));
}

// initialize
document.addEventListener('DOMContentLoaded', () => {
  const theme = getTheme();
  setTheme(theme);
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.setAttribute('aria-pressed', String(theme !== 'sunrise'));
    btn.addEventListener('click', toggleTheme);
  }
});
