const puppeteer = require('puppeteer');
(async () => {
  const url = process.argv[2] || 'http://localhost:8000/dashboard.html';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const origin = new URL(url).origin;
  await page.goto(origin, { waitUntil: 'networkidle2' });
  // seed demo session
  await page.evaluate(() => {
    const demo = { id: 'user_demo', name: 'Demo User', email: 'demo@local', password: 'demopass', createdAt: new Date().toISOString() };
    localStorage.setItem('minddesk_users', JSON.stringify([demo]));
    localStorage.setItem('minddesk_session', JSON.stringify(demo));
  });
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#personalityApp');
  // ensure first page rendered
  await page.waitForSelector('input[name="q_1"]', { timeout: 5000 });
  const inputSel = 'input[name="q_1"][value="1"]';
  const exists = await page.$(inputSel) !== null;
  console.log('input exists:', exists);
  try {
    await page.click(inputSel, { delay: 50 });
  } catch (e) {
    console.error('click failed', e.toString());
  }
  const checked = await page.$eval(inputSel, el => el.checked).catch(() => null);
  console.log('after click checked:', checked);
  // debug: bounding rect and element at center
  const info = await page.$eval(inputSel, el => {
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    const cx = Math.round(r.left + r.width/2);
    const cy = Math.round(r.top + r.height/2);
    return {
      rect: r.toJSON(),
      offsetW: el.offsetWidth,
      offsetH: el.offsetHeight,
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      pointerEvents: cs.pointerEvents,
      widthCss: cs.width,
      heightCss: cs.height,
      position: cs.position,
      center: { x: cx, y: cy },
      elAtCenter: document.elementFromPoint(cx, cy)?.outerHTML.slice(0,200)
    };
  }).catch(() => null);
  console.log('debug info:', info);
  await browser.close();
  process.exit(checked ? 0 : 2);
})();
