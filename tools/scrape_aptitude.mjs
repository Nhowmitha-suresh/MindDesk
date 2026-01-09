// Node.js scraper to build a local aptitude question bank for MindDesk
// Usage:
//   1) npm init -y
//   2) npm i axios cheerio
//   3) node tools/scrape_aptitude.mjs
// Output:
//   Writes JSON to data/aptitude_bank.json with shape compatible with MindDesk

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';

// IMPORTANT: This is for personal/educational use only. Respect site terms.
// To stay light, we scrape a small number of pages per section to gather >= 20 Qs/topic.

const OUT_PATH = path.resolve(process.cwd(), 'data', 'aptitude_bank.json');
const BASE = 'https://www.indiabix.com/aptitude';

// Map your app topics to site sections. You can add or adjust pages per section.
const SOURCES = [
  { topic: 'percentages', paths: ['/percentage/', '/percentage/009002'], pages: 2 },
  { topic: 'ratio', paths: ['/ratio-and-proportion/'], pages: 2 },
  { topic: 'time_work', paths: ['/time-and-work/'], pages: 2 },
  { topic: 'time_distance', paths: ['/problems-on-trains/', '/time-and-distance/'], pages: 2 },
  { topic: 'interest', paths: ['/simple-interest/', '/compound-interest/'], pages: 2 },
  { topic: 'algebra', paths: ['/partnership/'], pages: 2 },
  { topic: 'simplification', paths: ['/problems-on-numbers/'], pages: 2 },
  { topic: 'probability', paths: ['/probability/'], pages: 2 },
  { topic: 'mensuration', paths: ['/area/', '/volume-and-surface-area/'], pages: 2 },
  { topic: 'number_systems', paths: ['/numbers/'], pages: 2 },
  { topic: 'di', paths: ['/data-interpretation/'], pages: 2 },
];

async function fetchPage(url) {
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
  return res.data;
}

function parseQuestions(html) {
  const $ = cheerio.load(html);
  const items = [];
  // IndiBix puts Q&A in .bix-div-container blocks
  $('.bix-div-container').each((_, el) => {
    const container = $(el);
    const qText = container.find('.bix-td-qtxt').first().text().trim().replace(/\s+/g,' ');
    if (!qText) return;
    const opts = [];
    container.find('.bix-td-option .jq-hdnakqb').each((i,optEl) => {
      const t = $(optEl).text().trim().replace(/\s+/g,' ');
      if (t) opts.push(t);
    });
    // Some pages use different markup; fallback:
    if (opts.length === 0) {
      container.find('.bix-td-option').each((i,optEl) => {
        const t = $(optEl).text().trim().replace(/\s+/g,' ');
        // Remove leading labels like "A."
        const cleaned = t.replace(/^[A-D]\s*\.|^[A-D]\)/,'').trim();
        if (cleaned) opts.push(cleaned);
      });
    }
    let ansIndex = -1;
    const answerText = container.find('.jq-hdnakqb + .jq-hdnakqb').last().text().trim();
    // Fallback: parse answer block ("Answer: Option B")
    const answerBlock = container.find('.bix-td-miscell').text() || container.find('.bix-td-answer').text();
    const match = /Option\s*([A-D])/i.exec(answerText || answerBlock);
    if (match) ansIndex = 'ABCD'.indexOf(match[1].toUpperCase());

    if (qText && opts.length >= 2) {
      items.push({ q: qText, opts: opts.slice(0,4), ans: ansIndex >= 0 ? ansIndex : 0 });
    }
  });
  return items;
}

async function scrapeTopic(topic, paths, pages) {
  const results = [];
  for (const p of paths) {
    // Base page
    try {
      const html = await fetchPage(BASE + p);
      results.push(...parseQuestions(html));
    } catch(e) { console.warn('Failed base', topic, p, e.message); }

    // Try numbered pages like page-2, page-3 (site pattern varies)
    for (let i = 2; i <= pages; i++) {
      const variants = [
        `${BASE + p}page-${i}/`,
        `${BASE + p}${String(i).padStart(6,'0')}`,
      ];
      for (const url of variants) {
        try {
          const html = await fetchPage(url);
          const items = parseQuestions(html);
          if (items.length) results.push(...items);
          break;
        } catch(_) { /* try next variant */ }
      }
    }
  }
  // De-duplicate by question text
  const seen = new Set();
  const unique = [];
  for (const it of results) {
    if (!seen.has(it.q)) { seen.add(it.q); unique.push(it); }
  }
  return unique;
}

async function main() {
  const out = {};
  for (const s of SOURCES) {
    console.log('Scraping', s.topic);
    const items = await scrapeTopic(s.topic, s.paths, s.pages);
    // Keep up to ~200 per topic (adjust as needed)
    out[s.topic] = items.slice(0, 200);
    console.log(' →', s.topic, items.length, 'items');
  }
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2), 'utf8');
  console.log('Saved to', OUT_PATH);
}

main().catch(err => { console.error(err); process.exit(1); });
