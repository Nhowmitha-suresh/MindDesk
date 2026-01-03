const puppeteer = require('puppeteer');

(async () => {
  const url = process.argv[2] || 'http://localhost:8000/dashboard.html';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    try {
      const text = msg.text();
      logs.push({ type: msg.type(), text });
      console.log(`[console:${msg.type()}] ${text}`);
    } catch (e) { }
  });

  page.on('pageerror', err => {
    console.error('[pageerror]', err.stack || err.toString());
  });

  page.on('error', err => {
    console.error('[error]', err.toString());
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    // wait a little for JS to initialize — support environments where waitForTimeout may not exist
    await page.waitForSelector('body', { timeout: 10000 });
    await page.evaluate(() => new Promise((res) => setTimeout(res, 1200)));
    // take screenshot
    await page.screenshot({ path: 'headless_dashboard.png', fullPage: true });
  } catch (e) {
    console.error('Navigation failed', e.toString());
  }

  await browser.close();
  // exit non-zero if errors logged
  const severe = logs.filter(l => l.type === 'error' || l.type === 'assert');
  if (severe.length) process.exit(2);
  process.exit(0);
})();
