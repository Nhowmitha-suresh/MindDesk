const puppeteer = require('puppeteer');
(async () => {
  const url = process.argv[2] || 'http://localhost:8000/dashboard.html';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  try {
    // optional seed: if third arg is 'seed', pre-populate a demo session
    const doSeed = process.argv[3] === 'seed';
    if (doSeed) {
      const origin = new URL(url).origin;
      await page.goto(origin, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.evaluate(() => {
        const demo = { id: 'user_demo', name: 'Demo User', email: 'demo@local', password: 'demopass', createdAt: new Date().toISOString() };
        localStorage.setItem('minddesk_users', JSON.stringify([demo]));
        localStorage.setItem('minddesk_session', JSON.stringify(demo));
      });
    }
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('body', { timeout: 10000 });
    await page.evaluate(() => new Promise(r => setTimeout(r, 800)));

    const sections = await page.$$eval('.section', nodes => nodes.map(n => ({ id: n.id, htmlLength: n.innerHTML ? n.innerHTML.length : 0 })));
    const personalityHtml = await page.$eval('#personalityApp', el => el.innerHTML).catch(() => null);
    const formExists = await page.$('#personalityForm') !== null;
    const pageContainerHtml = await page.$eval('#personalityPageContainer', el => el.innerHTML).catch(() => null);

    console.log('sections:', sections);
    console.log('personalityApp innerHTML length:', personalityHtml ? personalityHtml.length : 'null');
    console.log('personalityForm present:', !!formExists);
    console.log('page container innerHTML length:', pageContainerHtml ? pageContainerHtml.length : 'null');
    console.log('page container snippet:\n', pageContainerHtml ? pageContainerHtml.slice(0,800) : 'null');
    // report computed styles
    const comp = await page.evaluate(() => {
      const node = document.getElementById('personalityApp');
      function cs(sel, pseudo) { try { const el = document.querySelector(sel); return el ? window.getComputedStyle(el, pseudo) : null; } catch(e) { return null; } }
      const body = window.getComputedStyle(document.body);
      const app = cs('.app');
      const person = node ? window.getComputedStyle(node) : null;
      const appBefore = cs('.app', '::before');
      return {
        bodyPointer: body.pointerEvents,
        bodyZ: body.zIndex,
        appPointer: app ? app.pointerEvents : null,
        appZ: app ? app.zIndex : null,
        personPointer: person ? person.pointerEvents : null,
        personZ: person ? person.zIndex : null,
        appBeforePointer: appBefore ? appBefore.pointerEvents : null,
        appBeforeZ: appBefore ? appBefore.zIndex : null
      };
    });
    console.log('computed styles:', comp);
  } catch (e) {
    console.error('inspect failed', e.stack || e.toString());
  }
  // also print outerHTML length for debugging
  try {
    const docHtml = await (async () => {
      const browser2 = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
      const page2 = await browser2.newPage();
      await page2.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page2.waitForSelector('body', { timeout: 10000 });
      const outer = await page2.evaluate(() => document.documentElement.outerHTML.length);
      await browser2.close();
      return outer;
    })();
    const docSample = await (async () => {
      const browser3 = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
      const page3 = await browser3.newPage();
      await page3.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page3.waitForSelector('body', { timeout: 10000 });
      const outer = await page3.evaluate(() => document.documentElement.outerHTML);
      await browser3.close();
      return outer;
    })();
    console.log('document outerHTML (snippet):\n', docSample.slice(0, 2000));
  } catch (e) { console.error('outerHTML check failed', e.toString()); }
  await browser.close();
})();
