// Contact sheet of chosen times. Usage: node src/contact.js out.png t1 t2 ...
'use strict';
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { frameHTML } = require('./render_lib');
(async () => {
  const [out, ...ts] = process.argv.slice(2);
  const times = ts.map(Number);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const imgs = [];
  for (const t of times) {
    const i = Math.round(t * 12);
    const { html, shot } = frameHTML(i / 12, i);
    await page.setContent(html);
    imgs.push({ t: i / 12, shot, b64: (await page.screenshot()).toString('base64') });
  }
  const cols = Math.min(5, imgs.length), W = 300, H = 533;
  await page.setViewportSize({ width: cols * (W + 10) + 10, height: Math.ceil(imgs.length / cols) * (H + 40) + 10 });
  await page.setContent(`<body style="margin:0;padding:5px;background:#222;font:600 16px Inter">${imgs.map((m) => `<div style="display:inline-block;margin:5px;color:#eee;vertical-align:top"><img src="data:image/png;base64,${m.b64}" width="${W}" height="${H}" style="display:block"/>${m.t.toFixed(2)}s · ${m.shot}</div>`).join('')}</body>`);
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
})();
