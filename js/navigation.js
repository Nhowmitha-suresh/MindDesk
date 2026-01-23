console.log("✅ navigation.js loaded");

/* Get all nav buttons and sections */
const navItems = document.querySelectorAll("[data-target]");
const sections = document.querySelectorAll(".section");

/* Hide all sections */
function hideAll() {
  sections.forEach(sec => {
    sec.style.display = "none";
  });
}

/* Show one section */
function show(id) {
  hideAll();
  const el = document.getElementById(id);
  if (el) {
    el.style.display = "block";
    console.log("➡ showing section:", id);
    // show floating characters only on games page
    const float = document.getElementById('floatingChars');
    if (float) float.style.display = (id === 'games') ? 'block' : 'none';
  } else {
    console.error("❌ section not found:", id);
  }
}

/* Attach click handlers */
navItems.forEach(item => {
  item.addEventListener("click", () => {
    const target = item.dataset.target;
    // update active state
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    show(target);
  });
});

/* Initial load */
document.addEventListener("DOMContentLoaded", () => {
  hideAll();
  // Check URL param `start` to show a specific section after login
  const params = new URLSearchParams(window.location.search);
  const start = params.get('start') || 'home';
  show(start);
  // hide floating characters initially
  const float = document.getElementById('floatingChars'); if (float) float.style.display = 'none';
  // mark active nav for the start section
  navItems.forEach(i => i.classList.remove('active'));
  const first = document.querySelector('[data-target="' + start + '"]') || document.querySelector('[data-target="home"]');
  if (first) first.classList.add('active');
});
