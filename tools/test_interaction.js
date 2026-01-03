const puppeteer = require('puppeteer');
(async () => {
  const url = process.argv[2] || 'http://localhost:8000/dashboard.html';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE_LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE_ERR:', err.toString()));
  const origin = new URL(url).origin;
  await page.goto(origin, { waitUntil: 'networkidle2' });
  // seed demo session
  await page.evaluate(() => {
    const demo = { id: 'user_demo', name: 'Demo User', email: 'demo@local', password: 'demopass', createdAt: new Date().toISOString() };
    localStorage.setItem('minddesk_users', JSON.stringify([demo]));
    localStorage.setItem('minddesk_session', JSON.stringify(demo));
  });

  await page.goto(url, { waitUntil: 'networkidle2' });

  // go to Personality tab
  await page.waitForSelector('button[data-target="personality"]', { timeout: 5000 });
  await page.click('button[data-target="personality"]');
  await page.waitForSelector('#personalityApp', { timeout: 5000 });

  // wait for option buttons to render
  await page.waitForSelector('#personalityApp button.option-btn[data-qid="1"]', { timeout: 5000 });

  const sel = '#personalityApp button.option-btn[data-qid="1"][data-value="4"]';
  const exists = await page.$(sel) !== null;
  console.log('option exists:', exists);
  if (!exists) { await browser.close(); process.exit(3); }

  try {
    await page.click(sel, { delay: 50 });
  } catch (e) {
    console.error('option click failed', e.toString());
  }

  // also answer the second question to ensure trait counts reach threshold
  const sel2 = '#personalityApp button.option-btn[data-qid="2"][data-value="4"]';
  if (await page.$(sel2) !== null) {
    try { await page.click(sel2, { delay: 50 }); } catch(e) { console.error('option2 click failed', e.toString()); }
  }

  // verify localStorage saved answer
  const saved = await page.evaluate(() => localStorage.getItem('minddesk_personality_answers'));
  console.log('savedAnswers:', saved ? JSON.parse(saved) : null);

  // Submit the test (submit button inside #personalityApp)
  try {
    const submitHtml = await page.$eval('#personalityApp form button[type="submit"]', el => el.outerHTML).catch(()=>null);
    console.log('submit button html:', submitHtml);
    await page.click('#personalityApp form button[type="submit"]', { delay: 50 });
  } catch (e) { console.error('submit click failed', e.toString()); }

  // also dispatch submit event directly as fallback
  try {
    await page.evaluate(() => {
      const f = document.querySelector('#personalityApp form');
      if (f) f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
  } catch (e) { console.error('dispatch submit failed', e.toString()); }

  // wait for scores to be stored
  await page.waitForFunction(() => !!localStorage.getItem('minddesk_scores'), { timeout: 5000 }).catch(()=>{});
  const scores = await page.evaluate(() => localStorage.getItem('minddesk_scores'));
  const history = await page.evaluate(() => localStorage.getItem('minddesk_scores_history'));
  const keys = await page.evaluate(() => Object.keys(localStorage));
  console.log('localStorage keys after submit:', keys);
  console.log('scoresSaved:', !!scores);
  console.log('scoresRaw:', scores);
  console.log('historyRaw:', history);

  // open Insights tab
  await page.click('button[data-target="insights"]');
  await page.waitForSelector('#traitChart', { timeout: 5000 }).catch(()=>{});

  // open side panel toggle and compare
  await page.waitForSelector('#sidePanelToggle', { timeout: 5000 }).catch(()=>{});
  try {
    await page.click('#sidePanelToggle');
  } catch (e) { /* ignore */ }

  await page.waitForSelector('#compareTraitA', { timeout: 5000 }).catch(()=>{});
  await page.waitForSelector('#compareTraitB', { timeout: 5000 }).catch(()=>{});

  // pick two traits (first two available)
  const opts = await page.$$eval('#compareTraitA option', o => o.map(x=>x.value));
  const a = opts[1] || '__average';
  const b = opts[2] || '__average';
  console.log('compare candidates:', a, b);

  await page.select('#compareTraitA', a);
  await page.select('#compareTraitB', b);

  // click compare
  await page.click('#compareBtn').catch(()=>{});

  // check that compare canvas exists and has size
  const dims = await page.$eval('#compareHistoryChart', c => ({ w: c.clientWidth, h: c.clientHeight } )).catch(()=>null);
  console.log('compare canvas dims:', dims);

  // Now exercise Games UI
  await page.click('button[data-target="games"]');
  await page.waitForSelector('#gameArea', { timeout: 5000 });

  // Suspicious Button (activate tab first)
  await page.click('.game-tab[data-game="suspicious"]').catch(()=>{});
  await page.waitForSelector('#suspiciousBtn');
  await page.click('#suspiciousBtn').catch(()=>{});
  const susp = await page.$eval('#suspiciousResult', el => el.textContent).catch(()=>null);
  console.log('suspicious result:', susp);
  await page.click('#suspiciousNext').catch(()=>{});

  // Random Pick (activate tab first)
  await page.click('.game-tab[data-game="randompick"]').catch(()=>{});
  await page.waitForSelector('.pick-img[data-pick="owl"]');
  await page.click('.pick-img[data-pick="owl"]').catch(()=>{});
  const pick = await page.$eval('#randompickResult', el => el.textContent).catch(()=>null);
  console.log('pick result:', pick);
  await page.click('#randompickNext').catch(()=>{});

  // Annoying Situation (activate tab first)
  await page.click('.game-tab[data-game="annoy"]').catch(()=>{});
  await page.waitForSelector('.annoy-choice[data-choice="callout"]');
  await page.click('.annoy-choice[data-choice="callout"]').catch(()=>{});
  const annoy = await page.$eval('#annoyResult', el => el.textContent).catch(()=>null);
  console.log('annoy result:', annoy);
  await page.click('#annoyNext').catch(()=>{});

  // What Would You Do (activate tab first)
  await page.click('.game-tab[data-game="wwd"]').catch(()=>{});
  await page.waitForSelector('.wwd-choice[data-choice="ask"]');
  await page.click('.wwd-choice[data-choice="ask"]').catch(()=>{});
  const wwd = await page.$eval('#wwdResult', el => el.textContent).catch(()=>null);
  console.log('wwd result:', wwd);
  await page.click('#wwdNext').catch(()=>{});

  // Quick Math: read question, compute, submit
  await page.click('.game-tab[data-game="quickmath"]').catch(()=>{});
  await page.waitForSelector('#mathQuestion');
  const q = await page.$eval('#mathQuestion', el => el.textContent).catch(()=>null);
  console.log('math question:', q);
  let computed = null;
  if (q) {
    const m = q.match(/What is (\d+) \+ (\d+)\?/);
    if (m) computed = Number(m[1]) + Number(m[2]);
  }
  if (computed !== null) {
    await page.type('#mathAnswer', String(computed));
    await page.click('#mathSubmit');
    const mathRes = await page.$eval('#mathResult', el => el.textContent).catch(()=>null);
    console.log('math result:', mathRes);
  }

  // Memory: start and ensure result text changes to watching
  await page.click('.game-tab[data-game="memory"]').catch(()=>{});
  await page.waitForSelector('#memStart');
  await page.click('#memStart').catch(()=>{});
  const memText = await page.$eval('#memResult', el => el.textContent).catch(()=>null);
  console.log('memory result after start:', memText);

  const ok = !!scores && dims && dims.w > 0;
  await browser.close();
  process.exit(ok ? 0 : 4);
})();
